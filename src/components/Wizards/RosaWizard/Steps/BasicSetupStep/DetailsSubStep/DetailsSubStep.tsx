import {
  Section,
  useData,
  useItem,
  WizSelect,
  WizTextInput,
} from '@patternfly-labs/react-form-wizard';
import { Button, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import React from 'react';
import semver from 'semver';
import { StepDrawer } from '../../../common/StepDrawer';
import {
  OpenShiftVersionsData,
  Resource,
  Role,
  SelectDropdownType,
  ValidationResource,
} from '../../../../types';
import { buildOpenShiftVersionGroups } from '../../../buildOpenShiftVersionGroups';
import { useTranslation } from '../../../../../../context/TranslationContext';
import { validateClusterName } from '../../../validators';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';

type DetailsSubStepProps = {
  clusterNameValidation: ValidationResource;
  versions: Resource<OpenShiftVersionsData, []> & { fetch: () => Promise<void> };
  roles: Resource<Role[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  awsInfrastructureAccounts: Resource<SelectDropdownType[]>;
  awsBillingAccounts: Resource<SelectDropdownType[]>;
  regions: Resource<SelectDropdownType[]>;
};

export const DetailsSubStep: React.FunctionComponent<DetailsSubStepProps> = ({
  clusterNameValidation,
  versions,
  roles,
  awsInfrastructureAccounts,
  awsBillingAccounts,
  regions,
}) => {
  const { t } = useTranslation();
  const { cluster } = useItem();
  const { update } = useData();
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState<boolean>(false);
  const drawerRef = React.useRef<HTMLSpanElement>(null);
  const onWizardExpand = () => drawerRef.current && drawerRef.current.focus();

  const selectedInstallerRoleVersion = React.useMemo(() => {
    const role = roles.data.find((r) => r.installerRole.value === cluster?.installer_role_arn);
    return role?.installerRole.roleVersion;
  }, [roles.data, cluster?.installer_role_arn]);

  const openShiftVersionGroups = React.useMemo(
    () => (versions.data ? buildOpenShiftVersionGroups(versions.data) : undefined),
    [versions.data]
  );

  const versionGroupsWithDisabled = React.useMemo(() => {
    if (!openShiftVersionGroups) return undefined;
    const roleVer =
      selectedInstallerRoleVersion && semver.valid(semver.coerce(selectedInstallerRoleVersion));
    if (!roleVer) return openShiftVersionGroups;
    return openShiftVersionGroups.map((group) => ({
      ...group,
      options: group.options.map((opt) => {
        const coerced = typeof opt.value === 'string' ? semver.coerce(opt.value) : null;
        const versionVal = coerced ? semver.valid(coerced) : null;
        const disabled = versionVal != null && roleVer != null && semver.gt(versionVal, roleVer);
        return disabled
          ? {
              ...opt,
              disabled: true,
              description: t('Your current account roles do not support the version of OpenShift.'),
            }
          : opt;
      }),
    }));
  }, [openShiftVersionGroups, selectedInstallerRoleVersion, t]);

  const selectedVersionIsDisabled = React.useMemo(() => {
    if (!cluster?.cluster_version || !versionGroupsWithDisabled) return false;
    const versionStr = String(cluster.cluster_version);
    for (const group of versionGroupsWithDisabled) {
      const opt = group.options.find((o) => String(o.value) === versionStr);
      if (opt && (opt as SelectDropdownType & { disabled?: boolean }).disabled) return true;
    }
    return false;
  }, [cluster?.cluster_version, versionGroupsWithDisabled]);

  React.useEffect(() => {
    if (selectedVersionIsDisabled && cluster) {
      cluster.cluster_version = undefined;
      update();
    }
  }, [selectedVersionIsDisabled, cluster, update]);

  return (
    <Section label={t('Details')}>
      <StepDrawer
        isDrawerExpanded={isDrawerExpanded}
        setIsDrawerExpanded={setIsDrawerExpanded}
        onWizardExpand={onWizardExpand}
      >
        <Stack hasGutter>
          <StackItem>
            <Grid>
              <GridItem span={4}>
                <WizTextInput
                  validation={(name: string, item: unknown) =>
                    validateClusterName(name, item) || clusterNameValidation.error || undefined
                  }
                  path="cluster.name"
                  label={t('Cluster name')}
                  validateOnBlur
                  placeholder={t('Enter the cluster name')}
                  required
                  labelHelp={t(
                    'This will be how we refer to your cluster in the OpenShift cluster list and will form part of the cluster console subdomain.'
                  )}
                />
              </GridItem>
            </Grid>
          </StackItem>

          <StackItem>
            <Grid>
              <GridItem span={4}>
                <WizSelect
                  isFill
                  path="cluster.cluster_version"
                  label={t('OpenShift version')}
                  placeholder={t('Select an OpenShift version')}
                  options={openShiftVersionGroups ? undefined : []}
                  optionGroups={
                    openShiftVersionGroups
                      ? (versionGroupsWithDisabled ?? openShiftVersionGroups)
                      : undefined
                  }
                  isPending={versions.isFetching}
                  required
                />
              </GridItem>
            </Grid>
          </StackItem>

          <StackItem>
            <Grid hasGutter>
              <GridItem span={4}>
                <WizSelect
                  isFill
                  path="cluster.associated_aws_id"
                  label={t('Associated AWS infrastructure account')}
                  placeholder={t('Select an AWS infrastructure account')}
                  labelHelp={t(
                    "Your cluster's cloud resources will be created in the associated AWS infrastructure account. To continue, you must associate at least 1 account."
                  )}
                  options={awsInfrastructureAccounts.data}
                  disabled={awsInfrastructureAccounts.isFetching}
                  onValueChange={(_newAccountId, item) => {
                    item.cluster.installer_role_arn = undefined;
                    item.cluster.worker_role_arn = undefined;
                    item.cluster.support_role_arn = undefined;

                    if (_newAccountId) {
                      void roles.fetch(_newAccountId as string);
                    }
                  }}
                  required
                  refreshCallback={
                    awsInfrastructureAccounts.fetch
                      ? () => void awsInfrastructureAccounts.fetch?.()
                      : undefined
                  }
                />
              </GridItem>
            </Grid>
            {!isDrawerExpanded && (
              <Button
                isInline
                variant="link"
                onClick={() => setIsDrawerExpanded((prevExpanded) => !prevExpanded)}
              >
                {t('Associate a new AWS account')}
              </Button>
            )}
          </StackItem>

          <StackItem>
            <Grid hasGutter>
              <GridItem span={4}>
                <WizSelect
                  isFill
                  path="cluster.billing_account_id"
                  label={t('Associated AWS billing account')}
                  placeholder={t('Select an AWS billing account')}
                  labelHelp={t(
                    'The AWS billing account is often the same as your Associated AWS infrastructure account, but does not have to be.'
                  )}
                  options={awsBillingAccounts.data}
                  disabled={awsBillingAccounts.isFetching}
                  required
                  refreshCallback={
                    awsBillingAccounts.fetch ? () => void awsBillingAccounts.fetch?.() : undefined
                  }
                />
              </GridItem>
            </Grid>
            <ExternalLink
              variant="secondary"
              className="pf-v6-u-mt-md"
              href={links.AWS_CONSOLE_ROSA_HOME}
            >
              Connect ROSA to a new AWS billing account
            </ExternalLink>
          </StackItem>
          <StackItem>
            <Grid>
              <GridItem span={4}>
                <WizSelect
                  isFill
                  path="cluster.region"
                  label={t('Region')}
                  placeholder={t('Select a region')}
                  labelHelp={t(
                    'The AWS Region where your compute nodes and control plane will be located. (should be link: Learn more abut AWS Regions.)'
                  )}
                  options={regions.data}
                  disabled={regions.isFetching}
                  required
                />
              </GridItem>
            </Grid>
          </StackItem>
        </Stack>
      </StepDrawer>
    </Section>
  );
};
