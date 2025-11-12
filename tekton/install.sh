#!/bin/bash

set -e

echo "Installing Tekton CI Pipeline for nxtcm-components..."
echo ""

if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed or not in PATH"
    exit 1
fi

echo "Checking if Tekton Pipelines is installed..."
if ! kubectl get namespace tekton-pipelines &> /dev/null; then
    echo "Tekton Pipelines not found. Installing..."
    kubectl apply -f https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml
    echo "Waiting for Tekton Pipelines to be ready..."
    kubectl wait --for=condition=ready pod -l app=tekton-pipelines-controller -n tekton-pipelines --timeout=300s
    echo "Tekton Pipelines installed successfully!"
else
    echo "Tekton Pipelines is already installed."
fi

echo ""
echo "Checking if git-clone ClusterTask exists..."
if ! kubectl get clustertask git-clone &> /dev/null; then
    echo "Installing git-clone ClusterTask..."
    kubectl apply -f https://raw.githubusercontent.com/tektoncd/catalog/main/task/git-clone/0.9/git-clone.yaml
    echo "git-clone ClusterTask installed successfully!"
else
    echo "git-clone ClusterTask already exists."
fi

echo ""
echo "Installing pipeline tasks..."
kubectl apply -f tekton/tasks.yaml

echo ""
echo "Installing pipeline..."
kubectl apply -f tekton/pipeline.yaml

echo ""
read -p "Do you want to install Tekton Triggers for webhook support? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing Tekton Triggers..."
    kubectl apply -f https://storage.googleapis.com/tekton-releases/triggers/latest/release.yaml
    kubectl apply -f https://storage.googleapis.com/tekton-releases/triggers/latest/interceptors.yaml
    
    echo "Waiting for Tekton Triggers to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/part-of=tekton-triggers -n tekton-pipelines --timeout=300s
    
    echo ""
    echo "Before applying triggers, please update the webhook secret in tekton/triggers.yaml"
    read -p "Have you updated the webhook secret? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Installing triggers..."
        kubectl apply -f tekton/triggers.yaml
        echo "Triggers installed successfully!"
        
        echo ""
        echo "Exposing EventListener service..."
        kubectl expose service el-nxtcm-components-ci-listener --type=LoadBalancer --name=tekton-webhook-lb || true
        
        echo ""
        echo "To get the webhook URL, run:"
        echo "  kubectl get service tekton-webhook-lb -o jsonpath='{.status.loadBalancer.ingress[0].ip}'"
    else
        echo "Skipping triggers installation. You can install later with:"
        echo "  kubectl apply -f tekton/triggers.yaml"
    fi
fi

echo ""
echo "Installation complete!"
echo ""
echo "To run the pipeline, execute:"
echo "  kubectl create -f tekton/pipelinerun.yaml"
echo ""
echo "To view pipeline runs:"
echo "  kubectl get pipelineruns"
echo ""
echo "To watch logs:"
echo "  tkn pipelinerun logs <pipelinerun-name> -f"

