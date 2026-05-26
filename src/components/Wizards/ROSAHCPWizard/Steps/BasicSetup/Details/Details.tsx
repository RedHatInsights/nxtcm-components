import React, { useEffect, useRef } from 'react';
import { Button, Stack } from '@patternfly/react-core';
import semver from 'semver';
import { useFormContext, useWatch } from 'react-hook-form';

import { clusterValidationSchema } from '../../../yupSchemas';
import { buildOpenShiftVersionGroups } from '../../../buildOpenShiftVersionGroups';
import { DetailsStepDrawer } from '../../../components/DetailsStepDrawer/DetailsStepDrawer';
import { Section } from '../../../components/Section';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../links';
import { ROSAHCPWizardData, type ROSAHCPCluster } from '../../../types';
import { WizSelect } from '../../../components/WizFields/WizSelect';
import { WizTextInput } from '../../../components/WizFields/WizTextInput';
import { FieldWrapper } from '../../../components/FieldWrapper';

import type { ClusterFormData } from '../../../../types';
import { resetMachinePoolVpcDependentFields } from '../../../resetMachinePoolVpcDependentFields';

type DetailsStepProps = Pick<
  ROSAHCPWizardData,
  'awsInfrastructureAccounts' | 'awsBillingAccounts' | 'regions' | 'versions' | 'roles' | 'vpcList'
>;

type AssociateNewAccountLinkProps = {
  label: string;
  isDrawerExpanded: boolean;
  setIsDrawerExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

function AssociateNewAccountLink({
  label,
  isDrawerExpanded,
  setIsDrawerExpanded,
}: AssociateNewAccountLinkProps) {
  if (isDrawerExpanded) {
    return null;
  }
  return (
    <Button
      isInline
      variant="link"
      onClick={() => setIsDrawerExpanded((prevExpanded) => !prevExpanded)}
    >
      {label}
    </Button>
  );
}

export const Details = ({
  awsInfrastructureAccounts,
  awsBillingAccounts,
  regions,
  versions,
  roles,
  vpcList,
}: DetailsStepProps) => {
  const d = useRosaHcpWizardStrings().details;
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState<boolean>(false);
  const drawerRef = React.useRef<HTMLSpanElement>(null);
  const onWizardExpand = () => drawerRef.current && drawerRef.current.focus();

  const { control, setValue } = useFormContext<Partial<ClusterFormData>>();
  const region = useWatch({ control, name: 'region' });
  const prevRegionRef = useRef<string | undefined>(undefined);

  /** Region lives on this step; when it changes, machine-pool VPC data must reload and prior VPC/subnet choices are invalid. */
  useEffect(() => {
    const prev = prevRegionRef.current;

    if (region && (prev === undefined || prev !== region)) {
      void vpcList.fetch?.();
    }

    if (prev !== undefined && prev !== region) {
      resetMachinePoolVpcDependentFields(setValue);
    }

    prevRegionRef.current = region;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, setValue, vpcList.fetch]);

  const installerRoleArn = useWatch({ control, name: 'installer_role_arn' });
  const associatedAwsIdRaw = useWatch({ control, name: 'associated_aws_id' });
  const associatedAwsIdForRegions =
    typeof associatedAwsIdRaw === 'string' && associatedAwsIdRaw !== ''
      ? associatedAwsIdRaw
      : undefined;

  const selectedInstallerRoleVersion = React.useMemo(() => {
    const role = roles.data.find((r) => r.installerRole.value === installerRoleArn);
    return role?.installerRole.roleVersion;
  }, [roles.data, installerRoleArn]);

  const openShiftVersionGroups = React.useMemo(
    () =>
      versions.data ? buildOpenShiftVersionGroups(versions.data, d.openShiftVersionGroups) : [],
    [versions.data, d.openShiftVersionGroups]
  );

  const versionGroupsWithDisabled = React.useMemo(() => {
    if (openShiftVersionGroups.length === 0) return [];
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
              ariaDisabled: true,
              tooltipProps: { content: d.openShiftVersionOptionDisabledDescription },
            }
          : opt;
      }),
    }));
  }, [
    d.openShiftVersionOptionDisabledDescription,
    openShiftVersionGroups,
    selectedInstallerRoleVersion,
  ]);

  return (
    <Section label={d.sectionLabel}>
      <DetailsStepDrawer
        isDrawerExpanded={isDrawerExpanded}
        setIsDrawerExpanded={setIsDrawerExpanded}
        onWizardExpand={onWizardExpand}
      >
        <Stack hasGutter>
          <FieldWrapper
            AdditionalContent={
              <AssociateNewAccountLink
                label={d.associateNewAccount}
                isDrawerExpanded={isDrawerExpanded}
                setIsDrawerExpanded={setIsDrawerExpanded}
              />
            }
          >
            <WizSelect<ROSAHCPCluster>
              isFill
              isTypeAhead
              name="associated_aws_id"
              schema={clusterValidationSchema}
              isLoading={awsInfrastructureAccounts.isFetching}
              options={awsInfrastructureAccounts.data}
              apiError={awsInfrastructureAccounts.error}
              onRefresh={
                awsInfrastructureAccounts.fetch
                  ? () => void awsInfrastructureAccounts.fetch?.()
                  : undefined
              }
            />
          </FieldWrapper>

          <FieldWrapper
            AdditionalContent={
              <ExternalLink
                variant="secondary"
                className="pf-v6-u-mt-md"
                href={links.AWS_CONSOLE_ROSA_HOME}
              >
                {d.connectBillingLink}
              </ExternalLink>
            }
          >
            <WizSelect<ROSAHCPCluster>
              isFill
              isTypeAhead
              name="billing_account_id"
              schema={clusterValidationSchema}
              isLoading={awsBillingAccounts.isFetching}
              options={awsBillingAccounts.data}
              apiError={awsBillingAccounts.error}
              onRefresh={
                awsBillingAccounts.fetch ? () => void awsBillingAccounts.fetch?.() : undefined
              }
            />
          </FieldWrapper>

          <FieldWrapper>
            <WizSelect<ROSAHCPCluster>
              isFill
              isTypeAhead
              name="region"
              schema={clusterValidationSchema}
              options={regions.data}
              isLoading={regions.isFetching}
              apiError={regions.error}
              onRefresh={
                associatedAwsIdForRegions
                  ? () => void regions.fetch(associatedAwsIdForRegions)
                  : undefined
              }
            />
          </FieldWrapper>
          <FieldWrapper>
            <WizTextInput<ROSAHCPCluster> name="name" schema={clusterValidationSchema} />
          </FieldWrapper>

          <FieldWrapper>
            <WizSelect<ROSAHCPCluster>
              isFill
              isTypeAhead
              name="cluster_version"
              schema={clusterValidationSchema}
              optionGroups={versionGroupsWithDisabled}
              isLoading={versions.isFetching}
              onRefresh={() => void versions.fetch()}
              apiError={versions.error}
            />
          </FieldWrapper>
        </Stack>
      </DetailsStepDrawer>
    </Section>
  );
};
