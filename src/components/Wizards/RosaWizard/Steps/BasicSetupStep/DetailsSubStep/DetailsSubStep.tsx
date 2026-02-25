import { Section, WizSelect, WizTextInput } from '@patternfly-labs/react-form-wizard';
import { Button, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import React from 'react';
import { StepDrawer } from '../../../common/StepDrawer';
import { SelectDropdownType } from '../../../../types';
import { useTranslation } from '../../../../../../context/TranslationContext';
import { validateClusterName } from '../../../validators';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';

type DetailsSubStepProps = {
  openShiftVersions: SelectDropdownType[];
  awsInfrastructureAccounts: SelectDropdownType[];
  awsBillingAccounts: SelectDropdownType[];
  regions: SelectDropdownType[];
  awsAccountDataCallback: any;
  refreshAwsAccountDataCallback: () => void;
  refreshAwsBillingAccountCallback: () => void;
};

export const DetailsSubStep: React.FunctionComponent<DetailsSubStepProps> = ({
  openShiftVersions,
  awsInfrastructureAccounts,
  awsBillingAccounts,
  regions,
  awsAccountDataCallback,
  refreshAwsAccountDataCallback,
  refreshAwsBillingAccountCallback,
}) => {
  const { t } = useTranslation();
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState<boolean>(false);
  const drawerRef = React.useRef<HTMLSpanElement>(null);
  const onWizardExpand = () => drawerRef.current && drawerRef.current.focus();

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
                  validation={validateClusterName}
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
                  options={openShiftVersions}
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
                  options={awsInfrastructureAccounts}
                  callbackFunction={awsAccountDataCallback}
                  onValueChange={(_value, item) => {
                    item.cluster.installer_role_arn = undefined;
                    item.cluster.worker_role_arn = undefined;
                    item.cluster.support_role_arn = undefined;
                  }}
                  required
                  refreshCallback={refreshAwsAccountDataCallback}
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
                  options={awsBillingAccounts}
                  required
                  refreshCallback={refreshAwsBillingAccountCallback}
                />
              </GridItem>
            </Grid>
            <ExternalLink
              variant="secondary"
              className="pf-v6-u-mt-md"
              href={links.AWS_CONSOLE_ROSA_HOME}
              noIcon
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
                  options={regions}
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
