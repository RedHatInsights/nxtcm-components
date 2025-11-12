#!/bin/bash

set -e

echo "Setting up local Kubernetes cluster with Kind and Podman..."
echo ""

if ! command -v podman &> /dev/null; then
    echo "Error: podman is not installed or not in PATH"
    exit 1
fi

if ! command -v kind &> /dev/null; then
    echo "Error: kind is not installed or not in PATH"
    echo "Install with: curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64 && chmod +x ./kind && sudo mv ./kind /usr/local/bin/kind"
    exit 1
fi

export KIND_EXPERIMENTAL_PROVIDER=podman

CLUSTER_NAME="${CLUSTER_NAME:-nxtcm-tekton}"

echo "Checking if cluster already exists..."
if kind get clusters | grep -q "^${CLUSTER_NAME}$"; then
    echo "Cluster '${CLUSTER_NAME}' already exists."
    read -p "Do you want to delete and recreate it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Deleting existing cluster..."
        kind delete cluster --name "${CLUSTER_NAME}"
    else
        echo "Using existing cluster."
        kubectl cluster-info --context "kind-${CLUSTER_NAME}"
        exit 0
    fi
fi

echo ""
echo "Creating Kind cluster with Podman..."
cat <<EOF | kind create cluster --name "${CLUSTER_NAME}" --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraMounts:
  - hostPath: /var/run/podman/podman.sock
    containerPath: /var/run/docker.sock
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
EOF

echo ""
echo "Cluster created successfully!"
echo "Setting kubectl context..."
kubectl cluster-info --context "kind-${CLUSTER_NAME}"

echo ""
echo "Installing Tekton Pipelines..."
kubectl apply -f https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml

echo "Waiting for Tekton Pipelines to be ready..."
kubectl wait --for=condition=ready pod -l app=tekton-pipelines-controller -n tekton-pipelines --timeout=300s

echo ""
echo "Installing git-clone ClusterTask..."
kubectl apply -f https://raw.githubusercontent.com/tektoncd/catalog/main/task/git-clone/0.9/git-clone.yaml

echo ""
echo "Installing nxtcm-components pipeline tasks and pipeline..."
kubectl apply -f tekton/tasks.yaml
kubectl apply -f tekton/pipeline.yaml

echo ""
echo "Setup complete!"
echo ""
echo "To run the pipeline:"
echo "  kubectl create -f tekton/pipelinerun.yaml"
echo ""
echo "To view pipeline runs:"
echo "  kubectl get pipelineruns"
echo ""
echo "To delete the cluster when done:"
echo "  kind delete cluster --name ${CLUSTER_NAME}"

