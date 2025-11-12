# Tekton CI Pipeline for nxtcm-components

Complete CI/CD pipeline for running tests and builds using Tekton Pipelines or standalone Podman containers.

## Table of Contents

- [Quick Start](#quick-start)
- [Pipeline Overview](#pipeline-overview)
- [Container Images](#container-images)
- [Running Options](#running-options)
  - [Option 1: Standalone Podman (Fastest)](#option-1-standalone-podman-fastest)
  - [Option 2: Kubernetes with Tekton](#option-2-kubernetes-with-tekton)
  - [Option 3: Kind with Podman](#option-3-kind-with-podman)
  - [Option 4: Minikube with Podman](#option-4-minikube-with-podman)
- [Registry Configuration](#registry-configuration)
- [Advanced Topics](#advanced-topics)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Run locally with Podman (No Kubernetes required)

```bash
# Run all tests in parallel (recommended)
./tekton/podman-runner-parallel.sh

# Or run sequentially
./tekton/podman-runner.sh
```

### Run on Kubernetes cluster

```bash
# Install once
./tekton/install.sh

# Run the pipeline
kubectl create -f tekton/pipelinerun.yaml
```

### Run with Kind + Podman

```bash
# Setup once
./tekton/podman-kind-setup.sh

# Run the pipeline
kubectl create -f tekton/pipelinerun.yaml
```

---

## Pipeline Overview

The pipeline runs the following stages:

1. **Fetch Repository** - Clones the Git repository
2. **Install Dependencies** - Installs npm dependencies for root and subpackages
3. **Lint** - Runs ESLint and Prettier checks
4. **Type Check** - Runs TypeScript type checking
5. **Build** - Builds the library
6. **Component Tests** - Runs Playwright component tests
7. **E2E Tests** - Runs Playwright E2E tests
8. **Build Storybook** - Builds Storybook static site

---

## Container Images

By default, the pipeline uses container images from Docker Hub:

- **Node.js tasks**: `docker.io/library/node:20-alpine` (Official Node.js Alpine)
- **Playwright tests**: `mcr.microsoft.com/playwright:v1.56.1-noble`

### Why Quay.io?

- ✅ Open source friendly (free for public repos)
- ✅ Red Hat supported
- ✅ Built-in security scanning
- ✅ Robot accounts for CI/CD
- ✅ Better for air-gapped environments

### Using Different Registries

```bash
# Docker Hub
NODE_IMAGE=docker.io/library/node:20 ./tekton/podman-runner.sh

# Red Hat UBI
NODE_IMAGE=registry.access.redhat.com/ubi9/nodejs-20 ./tekton/podman-runner.sh

# Private registry
NODE_IMAGE=registry.example.com/node:20 \
PLAYWRIGHT_IMAGE=registry.example.com/playwright:latest \
./tekton/podman-runner.sh

# Or source the config file
source tekton/.podmanrc
./tekton/podman-runner-parallel.sh
```

---

## Running Options

### Comparison Matrix

| Method                | Pros                                  | Cons                           | Use Case                 |
| --------------------- | ------------------------------------- | ------------------------------ | ------------------------ |
| **Standalone Podman** | Simple, Fast, No K8s overhead         | Not true Tekton environment    | Quick local testing      |
| **Kind + Podman**     | True Tekton environment, Reproducible | More setup, Resource intensive | Testing actual pipeline  |
| **Kubernetes**        | Production-ready, Scalable            | Requires cluster               | CI/CD in production      |
| **Minikube + Podman** | True K8s environment, Well documented | Slowest startup                | Full integration testing |

---

### Option 1: Standalone Podman (Fastest)

**No Kubernetes required!** Runs tests directly in Podman containers.

#### Prerequisites

- Podman installed

#### Quick Start

```bash
# Parallel execution (faster)
./tekton/podman-runner-parallel.sh

# Sequential execution (easier to debug)
./tekton/podman-runner.sh

# Use specific Node version
NODE_VERSION=22 ./tekton/podman-runner.sh
```

#### Parallel Runner Phases

1. **Phase 1**: Install dependencies (sequential)
2. **Phase 2**: ESLint, Prettier, Type checking (parallel)
3. **Phase 3**: Build, Component tests, Storybook (parallel)
4. **Phase 4**: E2E tests (sequential)

Logs are saved to `.tekton-logs/` directory.

#### CI/CD Integration

**GitHub Actions:**

```yaml
name: CI with Podman
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Podman
        run: sudo apt-get update && sudo apt-get install -y podman
      - name: Run tests
        run: ./tekton/podman-runner-parallel.sh
```

**GitLab CI:**

```yaml
test:
  image: quay.io/podman/stable
  script:
    - ./tekton/podman-runner-parallel.sh
```

---

### Option 2: Kubernetes with Tekton

Run the pipeline on any Kubernetes cluster with Tekton installed.

#### Prerequisites

- Kubernetes cluster
- Tekton Pipelines installed
- `kubectl` CLI
- `tkn` CLI (optional)

#### Installation

```bash
# Automated installation
./tekton/install.sh

# Or manual installation
kubectl apply -f https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml
kubectl apply -f https://raw.githubusercontent.com/tektoncd/catalog/main/task/git-clone/0.9/git-clone.yaml
kubectl apply -f tekton/tasks.yaml
kubectl apply -f tekton/pipeline.yaml
```

#### Running the Pipeline

```bash
# Create a pipeline run
kubectl create -f tekton/pipelinerun.yaml

# Watch logs with tkn
tkn pipelinerun logs -f --last

# Or with kubectl
kubectl get pipelineruns
kubectl logs -f <pod-name>
```

#### Run Specific Branch/PR

```bash
kubectl create -f - <<EOF
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  generateName: nxtcm-components-ci-pr-
spec:
  pipelineRef:
    name: nxtcm-components-ci
  params:
    - name: repo-url
      value: https://github.com/RedHatInsights/nxtcm-components.git
    - name: revision
      value: feature-branch-name
    - name: node-version
      value: "20"
  workspaces:
    - name: shared-workspace
      volumeClaimTemplate:
        spec:
          accessModes: [ReadWriteOnce]
          resources:
            requests:
              storage: 5Gi
    - name: npm-cache
      volumeClaimTemplate:
        spec:
          accessModes: [ReadWriteOnce]
          resources:
            requests:
              storage: 2Gi
EOF
```

#### Monitoring

```bash
# List all pipeline runs
kubectl get pipelineruns

# Describe a specific run
tkn pipelinerun describe <pipelinerun-name>

# View logs
tkn pipelinerun logs <pipelinerun-name> -f
```

#### Git Webhook Integration

1. Install Tekton Triggers:

   ```bash
   kubectl apply -f https://storage.googleapis.com/tekton-releases/triggers/latest/release.yaml
   kubectl apply -f https://storage.googleapis.com/tekton-releases/triggers/latest/interceptors.yaml
   ```

2. Apply triggers configuration:

   ```bash
   # Update webhook secret in tekton/triggers.yaml first
   kubectl apply -f tekton/triggers.yaml
   ```

3. Expose EventListener service and configure GitHub webhook

#### Cleanup

```bash
# Remove pipeline runs
kubectl delete pipelinerun --all

# Uninstall everything
./tekton/uninstall.sh
```

---

### Option 3: Kind with Podman

Run Tekton in a local Kubernetes cluster using Kind with Podman runtime.

#### Prerequisites

- Podman installed
- Kind CLI tool

#### Installation

```bash
# Install Kind (if needed)
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Create cluster and install Tekton
./tekton/podman-kind-setup.sh
```

#### Run Pipeline

```bash
kubectl create -f tekton/pipelinerun.yaml
tkn pipelinerun logs -f --last
```

#### Cleanup

```bash
kind delete cluster --name nxtcm-tekton
```

---

### Option 4: Minikube with Podman

Use Minikube with Podman as the container driver.

#### Setup

```bash
# Set Podman as driver
minikube config set driver podman

# Start Minikube
minikube start --memory=4096 --cpus=2

# Install Tekton and pipeline
kubectl apply -f https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml
kubectl wait --for=condition=ready pod -l app=tekton-pipelines-controller -n tekton-pipelines --timeout=300s
kubectl apply -f https://raw.githubusercontent.com/tektoncd/catalog/main/task/git-clone/0.9/git-clone.yaml
kubectl apply -f tekton/tasks.yaml
kubectl apply -f tekton/pipeline.yaml
```

#### Run Pipeline

```bash
kubectl create -f tekton/pipelinerun.yaml
```

#### Cleanup

```bash
minikube delete
```

---

## Registry Configuration

### Using Public Quay.io (Default)

No authentication needed:

```bash
./tekton/podman-runner.sh
# or
kubectl create -f tekton/pipelinerun.yaml
```

### Using Private Quay.io

#### 1. Create Robot Account

1. Go to https://quay.io/organization/YOUR_ORG
2. Navigate to "Robot Accounts" → "Create Robot Account"
3. Name it (e.g., `tekton_runner`)
4. Grant read permissions
5. Download credentials

#### 2. For Podman

```bash
# Login with robot account
podman login quay.io -u YOUR_ORG+tekton_runner -p ROBOT_TOKEN

# Run normally
./tekton/podman-runner.sh
```

#### 3. For Kubernetes

```bash
# Create secret
kubectl create secret docker-registry quay-pull-secret \
  --docker-server=quay.io \
  --docker-username=YOUR_ORG+tekton_runner \
  --docker-password=ROBOT_TOKEN

# Create service account
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: tekton-quay-sa
imagePullSecrets:
  - name: quay-pull-secret
EOF

# Run pipeline with service account
kubectl create -f - <<EOF
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  generateName: nxtcm-components-ci-
spec:
  serviceAccountName: tekton-quay-sa
  pipelineRef:
    name: nxtcm-components-ci
  # ... rest of spec
EOF
```

See `tekton/registry-auth.yaml` for more examples.

### Mirroring Images

For air-gapped environments or private registries:

```bash
# Using Podman
podman pull quay.io/nodejs/node:20
podman tag quay.io/nodejs/node:20 quay.example.com/your-org/node:20
podman login quay.example.com
podman push quay.example.com/your-org/node:20

# Using Skopeo (automated)
skopeo copy \
  docker://quay.io/nodejs/node:20 \
  docker://quay.example.com/your-org/node:20 \
  --dest-creds USERNAME:PASSWORD
```

Update configuration:

```bash
# Edit tekton/.podmanrc
export NODE_IMAGE="quay.example.com/your-org/node:20"
export PLAYWRIGHT_IMAGE="quay.example.com/your-org/playwright:v1.56.1-noble"

source tekton/.podmanrc
./tekton/podman-runner.sh
```

---

## Advanced Topics

### Customizing Resources

Edit `tekton/tasks.yaml` to adjust memory and CPU:

```yaml
resources:
  requests:
    memory: 2Gi
    cpu: 1000m
  limits:
    memory: 4Gi
    cpu: 2000m
```

### Using Different Node Versions

```bash
# Podman
NODE_VERSION=22 ./tekton/podman-runner.sh

# Kubernetes
kubectl create -f - <<EOF
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  generateName: nxtcm-components-ci-
spec:
  pipelineRef:
    name: nxtcm-components-ci
  params:
    - name: node-version
      value: "22"
  # ... rest of spec
EOF
```

### Custom Images

See `tekton/example-custom-images.yaml` for overriding images in PipelineRuns.

### Adding Tasks

1. Define task in `tekton/tasks.yaml`
2. Add task reference in `tekton/pipeline.yaml` under `spec.tasks`
3. Set `runAfter` dependencies

### Performance Tuning

**Podman with npm cache:**

```bash
# Create cache volume
podman volume create npm-cache

# Modify runner script to mount it
-v npm-cache:/root/.npm:Z
```

**Parallel execution:**

```bash
# Adjust parallelism
PARALLEL_JOBS=8 ./tekton/podman-runner-parallel.sh
```

---

## Troubleshooting

### Podman Issues

**Socket errors:**

```bash
systemctl --user enable --now podman.socket
# or
podman system service --time=0 unix:///run/user/$UID/podman/podman.sock &
```

**Permission/SELinux errors:**

```bash
# The :Z flag should handle this, but if issues persist:
sudo setenforce 0
```

**Memory issues:**

```bash
# Edit /etc/containers/containers.conf
# or for Kind:
kind create cluster --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        system-reserved: memory=1Gi
        kube-reserved: memory=1Gi
EOF
```

### Playwright Issues

**Browser installation fails:**

```bash
# Pre-pull image
podman pull mcr.microsoft.com/playwright:v1.56.1-noble

# Or use different version
PLAYWRIGHT_VERSION=v1.45.0-focal ./tekton/podman-runner.sh
```

### Registry Issues

**Authentication errors:**

```bash
# Test credentials
podman login quay.io

# For Kubernetes
kubectl get secret quay-pull-secret -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d
```

**Image pull errors:**

```bash
# Verify image exists
podman pull quay.io/your-org/your-image:tag

# Check service account
kubectl get sa tekton-quay-sa -o yaml
```

**Rate limiting:**

1. Use authentication (increases limits)
2. Mirror images to private registry
3. Use private Quay instance

### Kubernetes Issues

**Out of memory:**

Increase memory limits in task definitions or on nodes.

**Permission errors:**

Ensure service account has permissions to create PVCs and run pods.

---

## Files Reference

- `pipeline.yaml` - Main Tekton pipeline definition
- `tasks.yaml` - Individual task definitions
- `pipelinerun.yaml` - Example pipeline run template
- `triggers.yaml` - Git webhook integration
- `podman-runner.sh` - Sequential Podman test runner
- `podman-runner-parallel.sh` - Parallel Podman test runner
- `podman-kind-setup.sh` - Setup Kind cluster with Podman
- `install.sh` - Install Tekton on existing cluster
- `uninstall.sh` - Remove all Tekton resources
- `.podmanrc` - Registry configuration
- `registry-auth.yaml` - Authentication examples
- `example-custom-images.yaml` - Custom image override examples

## Best Practices

1. **Use robot accounts** for CI/CD instead of personal credentials
2. **Pin image versions** with specific tags, not `latest`
3. **Scan images** using Quay's built-in security scanning
4. **Mirror critical images** to your own registry for reliability
5. **Use rootless Podman** for better security
6. **Enable parallel execution** for faster local testing
7. **Use image digests** for maximum reproducibility

## Additional Resources

- [Tekton Documentation](https://tekton.dev/docs/)
- [Quay.io Documentation](https://docs.quay.io/)
- [Podman Documentation](https://docs.podman.io/)
- [Kind Documentation](https://kind.sigs.k8s.io/)
- [Playwright Documentation](https://playwright.dev/)
