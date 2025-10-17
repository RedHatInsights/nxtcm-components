export interface IHypershiftDeployment {
    apiVersion: 'cluster.open-cluster-management.io/v1alpha1';
    kind: 'HypershiftDeployment';
    metadata?: {
        [k: string]: unknown;
    };
    spec?: {
        credentials?: {
            aws?: {
                controlPlaneOperatorARN: string;
                kubeCloudControllerARN: string;
                nodePoolManagementARN: string;
                [k: string]: unknown;
            };
            [k: string]: unknown;
        };
        hostedClusterReference?: {
            name?: string;
            [k: string]: unknown;
        };
        hostedClusterSpec?: {
            additionalTrustBundle?: {
                name?: string;
                [k: string]: unknown;
            };
            auditWebhook?: {
                name?: string;
                [k: string]: unknown;
            };
            autoscaling?: {
                maxNodeProvisionTime?: string;
                maxNodesTotal?: number;
                maxPodGracePeriod?: number;
                podPriorityThreshold?: number;
                [k: string]: unknown;
            };
            clusterID?: string;
            configuration?: {
                configMapRefs?: {
                    name?: string;
                    [k: string]: unknown;
                }[];
                items?: {
                    [k: string]: unknown;
                }[];
                secretRefs?: {
                    name?: string;
                    [k: string]: unknown;
                }[];
                [k: string]: unknown;
            };
            controllerAvailabilityPolicy?: string;
            dns?: {
                baseDomain: string;
                privateZoneID?: string;
                publicZoneID?: string;
                [k: string]: unknown;
            };
            etcd?: {
                managed?: {
                    storage: {
                        persistentVolume?: {
                            size?: number | string;
                            storageClassName?: string;
                            [k: string]: unknown;
                        };
                        type: 'PersistentVolume';
                        [k: string]: unknown;
                    };
                    [k: string]: unknown;
                };
                managementType: 'Managed' | 'Unmanaged';
                unmanaged?: {
                    endpoint: string;
                    tls: {
                        clientSecret: {
                            name?: string;
                            [k: string]: unknown;
                        };
                        [k: string]: unknown;
                    };
                    [k: string]: unknown;
                };
                [k: string]: unknown;
            };
            fips?: boolean;
            imageContentSources?: {
                mirrors?: string[];
                source: string;
                [k: string]: unknown;
            }[];
            infraID?: string;
            infrastructureAvailabilityPolicy?: string;
            issuerURL?: string;
            networking: {
                apiServer?: {
                    advertiseAddress?: string;
                    port?: number;
                    [k: string]: unknown;
                };
                machineCIDR: string;
                networkType: 'OpenShiftSDN' | 'Calico' | 'OVNKubernetes' | 'Other';
                podCIDR: string;
                serviceCIDR: string;
                [k: string]: unknown;
            };
            olmCatalogPlacement?: 'management' | 'guest';
            pausedUntil?: string;
            platform: {
                agent?: {
                    agentNamespace: string;
                    [k: string]: unknown;
                };
                aws?: {
                    cloudProviderConfig?: {
                        subnet?: {
                            arn?: string;
                            filters?: {
                                name: string;
                                values: string[];
                                [k: string]: unknown;
                            }[];
                            id?: string;
                            [k: string]: unknown;
                        };
                        vpc: string;
                        zone?: string;
                        [k: string]: unknown;
                    };
                    controlPlaneOperatorCreds: {
                        name?: string;
                        [k: string]: unknown;
                    };
                    endpointAccess?: 'Public' | 'PublicAndPrivate' | 'Private';
                    kubeCloudControllerCreds: {
                        name?: string;
                        [k: string]: unknown;
                    };
                    nodePoolManagementCreds: {
                        name?: string;
                        [k: string]: unknown;
                    };
                    region: string;
                    resourceTags?: {
                        key: string;
                        value: string;
                        [k: string]: unknown;
                    }[];
                    roles?: {
                        arn: string;
                        name: string;
                        namespace: string;
                        [k: string]: unknown;
                    }[];
                    serviceEndpoints?: {
                        name: string;
                        url: string;
                        [k: string]: unknown;
                    }[];
                    [k: string]: unknown;
                };
                azure?: {
                    credentials: {
                        name?: string;
                        [k: string]: unknown;
                    };
                    location: string;
                    machineIdentityID: string;
                    resourceGroup: string;
                    securityGroupName: string;
                    subnetName: string;
                    subscriptionID: string;
                    vnetID: string;
                    vnetName: string;
                    [k: string]: unknown;
                };
                ibmcloud?: {
                    providerType?: string;
                    [k: string]: unknown;
                };
                powervs?: {
                    controlPlaneOperatorCreds: {
                        name?: string;
                        [k: string]: unknown;
                    };
                    kubeCloudControllerCreds: {
                        name?: string;
                        [k: string]: unknown;
                    };
                    nodePoolManagementCreds: {
                        name?: string;
                        [k: string]: unknown;
                    };
                    region: string;
                    resourceGroup: string;
                    serviceInstanceID: string;
                    subnet: {
                        id?: string;
                        name?: string;
                        [k: string]: unknown;
                    };
                    vpc: {
                        name: string;
                        region: string;
                        subnet?: string;
                        zone?: string;
                        [k: string]: unknown;
                    };
                    zone: string;
                    [k: string]: unknown;
                };
                type: 'AWS' | 'None' | 'IBMCloud' | 'Agent' | 'KubeVirt' | 'Azure' | 'PowerVS';
                [k: string]: unknown;
            };
            pullSecret: {
                name?: string;
                [k: string]: unknown;
            };
            release: {
                image: string;
                [k: string]: unknown;
            };
            secretEncryption?: {
                aescbc?: {
                    activeKey: {
                        name?: string;
                        [k: string]: unknown;
                    };
                    backupKey?: {
                        name?: string;
                        [k: string]: unknown;
                    };
                    [k: string]: unknown;
                };
                kms?: {
                    aws?: {
                        activeKey: {
                            arn: string;
                            [k: string]: unknown;
                        };
                        auth: {
                            credentials: {
                                name?: string;
                                [k: string]: unknown;
                            };
                            [k: string]: unknown;
                        };
                        backupKey?: {
                            arn: string;
                            [k: string]: unknown;
                        };
                        region: string;
                        [k: string]: unknown;
                    };
                    ibmcloud?: {
                        auth: {
                            managed?: {
                                [k: string]: unknown;
                            };
                            type: 'Managed' | 'Unmanaged';
                            unmanaged?: {
                                credentials: {
                                    name?: string;
                                    [k: string]: unknown;
                                };
                                [k: string]: unknown;
                            };
                            [k: string]: unknown;
                        };
                        keyList: {
                            correlationID: string;
                            crkID: string;
                            instanceID: string;
                            keyVersion: number;
                            url: string;
                            [k: string]: unknown;
                        }[];
                        region: string;
                        [k: string]: unknown;
                    };
                    provider: 'IBMCloud' | 'AWS';
                    [k: string]: unknown;
                };
                type: 'kms' | 'aescbc';
                [k: string]: unknown;
            };
            serviceAccountSigningKey?: {
                name?: string;
                [k: string]: unknown;
            };
            services: {
                service: 'APIServer' | 'OAuthServer' | 'OIDC' | 'Konnectivity' | 'Ignition' | 'OVNSbDb';
                servicePublishingStrategy: {
                    loadBalancer?: {
                        hostname?: string;
                        [k: string]: unknown;
                    };
                    nodePort?: {
                        address: string;
                        port?: number;
                        [k: string]: unknown;
                    };
                    route?: {
                        hostname?: string;
                        [k: string]: unknown;
                    };
                    type: 'LoadBalancer' | 'NodePort' | 'Route' | 'None' | 'S3';
                    [k: string]: unknown;
                };
                [k: string]: unknown;
            }[];
            sshKey: {
                name?: string;
                [k: string]: unknown;
            };
            [k: string]: unknown;
        };
        hostingCluster: string;
        hostingNamespace?: string;
        'infra-id'?: string;
        infrastructure: {
            cloudProvider?: {
                name?: string;
                [k: string]: unknown;
            };
            configure: boolean;
            platform?: {
                aws?: {
                    region: string;
                    zones?: string[];
                    [k: string]: unknown;
                };
                azure?: {
                    location: string;
                    [k: string]: unknown;
                };
                [k: string]: unknown;
            };
            [k: string]: unknown;
        };
        nodePoolReferences?: {
            name?: string;
            [k: string]: unknown;
        }[];
        nodePools?: {
            name: string;
            spec: {
                autoScaling?: {
                    max: number;
                    min: number;
                    [k: string]: unknown;
                };
                clusterName: string;
                config?: {
                    name?: string;
                    [k: string]: unknown;
                }[];
                management: {
                    autoRepair?: boolean;
                    inPlace?: {
                        [k: string]: unknown;
                    };
                    replace?: {
                        rollingUpdate?: {
                            maxSurge?: number | string;
                            maxUnavailable?: number | string;
                            [k: string]: unknown;
                        };
                        strategy?: 'RollingUpdate' | 'OnDelete';
                        [k: string]: unknown;
                    };
                    upgradeType: 'Replace' | 'InPlace';
                    [k: string]: unknown;
                };
                nodeCount?: number;
                nodeDrainTimeout?: string;
                platform: {
                    agent?: {
                        agentLabelSelector?: {
                            matchExpressions?: {
                                key: string;
                                operator: string;
                                values?: string[];
                                [k: string]: unknown;
                            }[];
                            matchLabels?: {
                                [k: string]: string;
                            };
                            [k: string]: unknown;
                        };
                        [k: string]: unknown;
                    };
                    aws?: {
                        ami?: string;
                        instanceProfile?: string;
                        instanceType: string;
                        resourceTags?: {
                            key: string;
                            value: string;
                            [k: string]: unknown;
                        }[];
                        rootVolume?: {
                            iops?: number;
                            size: number;
                            type: string;
                            [k: string]: unknown;
                        };
                        securityGroups?: {
                            arn?: string;
                            filters?: {
                                name: string;
                                values: string[];
                                [k: string]: unknown;
                            }[];
                            id?: string;
                            [k: string]: unknown;
                        }[];
                        subnet?: {
                            arn?: string;
                            filters?: {
                                name: string;
                                values: string[];
                                [k: string]: unknown;
                            }[];
                            id?: string;
                            [k: string]: unknown;
                        };
                        [k: string]: unknown;
                    };
                    azure?: {
                        availabilityZone?: string;
                        diskSizeGB?: number;
                        imageID?: string;
                        vmsize: string;
                        [k: string]: unknown;
                    };
                    ibmcloud?: {
                        providerType?: string;
                        [k: string]: unknown;
                    };
                    kubevirt?: {
                        compute?: {
                            cores?: number;
                            memory?: number | string;
                            [k: string]: unknown;
                        };
                        rootVolume: {
                            diskImage?: {
                                containerDiskImage?: string;
                                [k: string]: unknown;
                            };
                            persistent?: {
                                size?: number | string;
                                storageClass?: string;
                                [k: string]: unknown;
                            };
                            type?: 'Persistent';
                            [k: string]: unknown;
                        };
                        [k: string]: unknown;
                    };
                    powervs?: {
                        image?: {
                            id?: string;
                            name?: string;
                            [k: string]: unknown;
                        };
                        imageDeletePolicy?: 'delete' | 'retain';
                        memoryGiB?: number;
                        processorType?: 'dedicated' | 'shared' | 'capped';
                        processors?: number | string;
                        storageType?: 'tier1' | 'tier3';
                        systemType?: string;
                        [k: string]: unknown;
                    };
                    type: 'AWS' | 'None' | 'IBMCloud' | 'Agent' | 'KubeVirt' | 'Azure' | 'PowerVS';
                    [k: string]: unknown;
                };
                release: {
                    image: string;
                    [k: string]: unknown;
                };
                replicas?: number;
                [k: string]: unknown;
            };
            [k: string]: unknown;
        }[];
        override?: 'ORPHAN' | 'INFRA-ONLY' | 'DELETE-HOSTING-NAMESPACE';
        [k: string]: unknown;
    };
    status?: {
        conditions?: {
            lastTransitionTime: string;
            message: string;
            observedGeneration?: number;
            reason: string;
            status: 'True' | 'False' | 'Unknown';
            type: string;
            [k: string]: unknown;
        }[];
        phase?: string;
        [k: string]: unknown;
    };
    [k: string]: unknown;
}
