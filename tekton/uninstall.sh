#!/bin/bash

set -e

echo "Uninstalling Tekton CI Pipeline for nxtcm-components..."
echo ""

if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed or not in PATH"
    exit 1
fi

read -p "This will delete all pipeline runs, triggers, and resources. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Uninstall cancelled."
    exit 0
fi

echo "Deleting triggers (if installed)..."
kubectl delete -f tekton/triggers.yaml --ignore-not-found=true

echo ""
echo "Deleting exposed webhook service (if exists)..."
kubectl delete service tekton-webhook-lb --ignore-not-found=true

echo ""
echo "Deleting pipeline..."
kubectl delete -f tekton/pipeline.yaml --ignore-not-found=true

echo ""
echo "Deleting tasks..."
kubectl delete -f tekton/tasks.yaml --ignore-not-found=true

echo ""
echo "Deleting all nxtcm-components pipeline runs..."
kubectl delete pipelinerun -l app=nxtcm-components --ignore-not-found=true

echo ""
read -p "Do you want to uninstall Tekton Pipelines and Triggers completely? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Uninstalling Tekton Triggers..."
    kubectl delete -f https://storage.googleapis.com/tekton-releases/triggers/latest/interceptors.yaml --ignore-not-found=true
    kubectl delete -f https://storage.googleapis.com/tekton-releases/triggers/latest/release.yaml --ignore-not-found=true
    
    echo ""
    echo "Uninstalling Tekton Pipelines..."
    kubectl delete -f https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml --ignore-not-found=true
    
    echo "Tekton completely uninstalled."
else
    echo "Keeping Tekton Pipelines and Triggers installed."
fi

echo ""
echo "Uninstall complete!"

