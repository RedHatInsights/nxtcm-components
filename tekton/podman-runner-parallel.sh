#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_VERSION="${NODE_VERSION:-20}"
PLAYWRIGHT_VERSION="v1.56.1-noble"
PARALLEL_JOBS="${PARALLEL_JOBS:-4}"
# Use official Node.js images from Docker Hub (via Quay.io mirror or Docker Hub)
NODE_IMAGE="${NODE_IMAGE:-docker.io/library/node:${NODE_VERSION}-alpine}"
PLAYWRIGHT_IMAGE="${PLAYWRIGHT_IMAGE:-mcr.microsoft.com/playwright:${PLAYWRIGHT_VERSION}}"

# SELinux volume label option
# :z = shared label (multiple containers can use it) - RECOMMENDED
# :Z = private label (exclusive to this container) - can cause permission errors
# disable = no SELinux labeling
SELINUX_LABEL="${SELINUX_LABEL:-z}"

echo "=========================================="
echo "Running nxtcm-components tests with Podman (Parallel)"
echo "=========================================="
echo "Project directory: ${PROJECT_DIR}"
echo "Node version: ${NODE_VERSION}"
echo "Parallel jobs: ${PARALLEL_JOBS}"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

LOG_DIR="${PROJECT_DIR}/.tekton-logs"
mkdir -p "${LOG_DIR}"

check_podman() {
    if ! command -v podman &> /dev/null; then
        echo -e "${RED}Error: podman is not installed or not in PATH${NC}"
        exit 1
    fi
}

run_step() {
    local step_name=$1
    local image=$2
    local command=$3
    local log_file="${LOG_DIR}/${step_name// /_}.log"
    
    echo -e "${BLUE}[${step_name}]${NC} Starting..." | tee "${log_file}"
    
    local volume_opts
    if [ "$SELINUX_LABEL" = "disable" ]; then
        volume_opts="-v ${PROJECT_DIR}:/workspace --security-opt label=disable"
    else
        volume_opts="-v ${PROJECT_DIR}:/workspace:${SELINUX_LABEL}"
    fi
    
    # Run as current user to avoid permission issues
    # Use --userns=keep-id for rootless Podman
    local user_opts="--userns=keep-id"
    
    # Set CI environment variables for non-interactive mode
    local ci_env="-e CI=true -e PWTEST_SKIP_TEST_OUTPUT=1"
    
    if podman run --rm \
        ${volume_opts} \
        ${user_opts} \
        ${ci_env} \
        -w /workspace \
        "${image}" \
        /bin/sh -c "${command}" &>> "${log_file}"; then
        echo -e "${GREEN}[${step_name}]${NC} ✓ Passed" | tee -a "${log_file}"
        return 0
    else
        echo -e "${RED}[${step_name}]${NC} ✗ Failed" | tee -a "${log_file}"
        echo -e "${RED}[${step_name}]${NC} See log: ${log_file}"
        return 1
    fi
}

check_podman

echo "Cleaning previous logs..."
rm -f "${LOG_DIR}"/*.log

PIDS=()
STEP_NAMES=()
STEP_STATUS=()

run_background() {
    local step_name=$1
    shift
    run_step "${step_name}" "$@" &
    PIDS+=($!)
    STEP_NAMES+=("${step_name}")
}

echo ""
echo "=========================================="
echo "Phase 1: Install Dependencies"
echo "=========================================="

run_step "Install root dependencies" \
    "${NODE_IMAGE}" \
    "npm ci"

run_step "Install subpackage dependencies" \
    "${NODE_IMAGE}" \
    "cd packages/react-form-wizard && npm ci"

echo ""
echo "=========================================="
echo "Phase 2: Parallel Quality Checks"
echo "=========================================="

run_background "ESLint" \
    "${NODE_IMAGE}" \
    "npm run lint"

run_background "Prettier check" \
    "${NODE_IMAGE}" \
    "npm run prettier:check"

run_background "Type check" \
    "${NODE_IMAGE}" \
    "npm run type-check"

echo "Waiting for quality checks to complete..."
for i in "${!PIDS[@]}"; do
    if wait "${PIDS[$i]}"; then
        STEP_STATUS+=("pass")
    else
        STEP_STATUS+=("fail")
    fi
done

PIDS=()
failed_phase2=false
for i in "${!STEP_STATUS[@]}"; do
    if [ "${STEP_STATUS[$i]}" = "fail" ]; then
        echo -e "${RED}✗ ${STEP_NAMES[$i]} failed${NC}"
        failed_phase2=true
    fi
done

if [ "$failed_phase2" = true ]; then
    echo -e "${RED}Phase 2 failed. Stopping pipeline.${NC}"
    exit 1
fi

STEP_NAMES=()
STEP_STATUS=()

echo ""
echo "=========================================="
echo "Phase 3: Parallel Builds and Tests"
echo "=========================================="

run_background "Build library" \
    "${NODE_IMAGE}" \
    "npm run build"

run_background "Component tests" \
    "${PLAYWRIGHT_IMAGE}" \
    "npm run test:ct -- --reporter=list"

run_background "Build Storybook" \
    "${NODE_IMAGE}" \
    "npm run build-storybook"

echo "Waiting for builds and tests to complete..."
for i in "${!PIDS[@]}"; do
    if wait "${PIDS[$i]}"; then
        STEP_STATUS+=("pass")
    else
        STEP_STATUS+=("fail")
    fi
done

PIDS=()
failed_phase3=false
for i in "${!STEP_STATUS[@]}"; do
    if [ "${STEP_STATUS[$i]}" = "fail" ]; then
        echo -e "${RED}✗ ${STEP_NAMES[$i]} failed${NC}"
        failed_phase3=true
    fi
done

if [ "$failed_phase3" = true ]; then
    echo -e "${RED}Phase 3 failed. Stopping pipeline.${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "Phase 4: E2E Tests"
echo "=========================================="

run_step "E2E tests" \
    "${PLAYWRIGHT_IMAGE}" \
    "npm run test:e2e -- --reporter=list"

echo ""
echo "=========================================="
echo "Pipeline Summary"
echo "=========================================="
echo -e "${GREEN}✓ All phases completed successfully!${NC}"
echo ""
echo "Logs are available in: ${LOG_DIR}"
exit 0

