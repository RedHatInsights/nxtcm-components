#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_VERSION="${NODE_VERSION:-20}"
PLAYWRIGHT_VERSION="v1.56.1-noble"
# Use official Node.js images from Docker Hub (via Quay.io mirror or Docker Hub)
NODE_IMAGE="${NODE_IMAGE:-docker.io/library/node:${NODE_VERSION}-alpine}"
PLAYWRIGHT_IMAGE="${PLAYWRIGHT_IMAGE:-mcr.microsoft.com/playwright:${PLAYWRIGHT_VERSION}}"

# SELinux volume label option  
# :z = shared label (multiple containers can use it) - RECOMMENDED
# :Z = private label (exclusive to this container) - can cause permission errors
# disable = no SELinux labeling
SELINUX_LABEL="${SELINUX_LABEL:-z}"

echo "=========================================="
echo "Running nxtcm-components tests with Podman"
echo "=========================================="
echo "Project directory: ${PROJECT_DIR}"
echo "Node version: ${NODE_VERSION}"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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
    local workdir=${4:-/workspace}
    
    echo ""
    echo "=========================================="
    echo -e "${YELLOW}Running: ${step_name}${NC}"
    echo "=========================================="
    
    local volume_opts
    if [ "$SELINUX_LABEL" = "disable" ]; then
        volume_opts="-v ${PROJECT_DIR}:${workdir} --security-opt label=disable"
    else
        volume_opts="-v ${PROJECT_DIR}:${workdir}:${SELINUX_LABEL}"
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
        -w "${workdir}" \
        "${image}" \
        /bin/sh -c "${command}"; then
        echo -e "${GREEN}✓ ${step_name} passed${NC}"
        return 0
    else
        echo -e "${RED}✗ ${step_name} failed${NC}"
        return 1
    fi
}

check_podman

FAILED_STEPS=()

echo "Step 1: Install Dependencies"
if run_step "Install root dependencies" \
    "${NODE_IMAGE}" \
    "npm ci"; then
    :
else
    FAILED_STEPS+=("Install root dependencies")
fi

if run_step "Install subpackage dependencies" \
    "${NODE_IMAGE}" \
    "cd packages/react-form-wizard && npm ci"; then
    :
else
    FAILED_STEPS+=("Install subpackage dependencies")
fi

echo ""
echo "Step 2: Linting"
if run_step "ESLint" \
    "${NODE_IMAGE}" \
    "npm run lint"; then
    :
else
    FAILED_STEPS+=("ESLint")
fi

if run_step "Prettier check" \
    "${NODE_IMAGE}" \
    "npm run prettier:check"; then
    :
else
    FAILED_STEPS+=("Prettier check")
fi

echo ""
echo "Step 3: Type Check"
if run_step "TypeScript type check" \
    "${NODE_IMAGE}" \
    "npm run type-check"; then
    :
else
    FAILED_STEPS+=("Type check")
fi

echo ""
echo "Step 4: Build"
if run_step "Build library" \
    "${NODE_IMAGE}" \
    "npm run build"; then
    :
else
    FAILED_STEPS+=("Build")
fi

echo ""
echo "Step 5: Component Tests"
if run_step "Playwright component tests" \
    "${PLAYWRIGHT_IMAGE}" \
    "npm run test:ct -- --reporter=list"; then
    :
else
    FAILED_STEPS+=("Component tests")
fi

echo ""
echo "Step 6: E2E Tests"
if run_step "Playwright E2E tests" \
    "${PLAYWRIGHT_IMAGE}" \
    "npm run test:e2e -- --reporter=list"; then
    :
else
    FAILED_STEPS+=("E2E tests")
fi

echo ""
echo "Step 7: Build Storybook"
if run_step "Build Storybook" \
    "${NODE_IMAGE}" \
    "npm run build-storybook"; then
    :
else
    FAILED_STEPS+=("Build Storybook")
fi

echo ""
echo "=========================================="
echo "Pipeline Summary"
echo "=========================================="

if [ ${#FAILED_STEPS[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All steps passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ ${#FAILED_STEPS[@]} step(s) failed:${NC}"
    for step in "${FAILED_STEPS[@]}"; do
        echo -e "  ${RED}✗ ${step}${NC}"
    done
    exit 1
fi

