import {
  Card,
  CardBody,
  CardHeader,
  Content,
  ContentVariants,
  Form,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { PrerequisitesInfoBox } from './components/PrerequisitesInfoBox/PrerequisitesInfoBox';
import { RosaArchitectureRenamingAlert } from './components/RosaArchitectureRenamingAlert/RosaArchitectureRenamingAlert';
import { ControlPlaneField } from './components/ControlPlaneField/ControlPlaneField';

type ControlPlaneStepPropsDetails = {
  AwsControlPlaneLink: React.ReactNode;
  allowAlertFeatureFlag: boolean;
  rosaArchitectureRenaimingAlertLink: React.ReactNode;
  showRosaCliRequirement: boolean;
  rosaHostedCliMinVersion: string;
  productName: string;
  virtualPrivateCloudLink: React.ReactNode;
  isTileSelected: string;
  isHCPDisabled: boolean;
  linkToGetStarted: React.ReactNode;
  rosaHomeGetStartedLink: React.ReactNode;
  hasHostedProductQuota: boolean;
};
type ControlPlaneStepProps = {
  controlPlaneStepProps: ControlPlaneStepPropsDetails;
};

export const ControlPlaneStep: React.FunctionComponent<ControlPlaneStepProps> = ({
  controlPlaneStepProps,
}) => {
  const {
    productName,
    rosaHostedCliMinVersion,
    showRosaCliRequirement,
    AwsControlPlaneLink,
    rosaArchitectureRenaimingAlertLink,
    allowAlertFeatureFlag,
    virtualPrivateCloudLink,
    isTileSelected,
    isHCPDisabled,
    linkToGetStarted,
    rosaHomeGetStartedLink,
    hasHostedProductQuota: _hasHostedProductQuota,
  } = controlPlaneStepProps;
  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        return false;
      }}
    >
      <Grid hasGutter className="pf-v6-u-mt-md">
        <GridItem span={10}>
          <Content>
            <Content component={ContentVariants.h2}>
              Welcome to Red Hat OpenShift Service on AWS (ROSA)
            </Content>
            <Content component={ContentVariants.p}>
              Create a managed OpenShift cluster on an existing Amazon Web Services (AWS) account.
            </Content>
          </Content>
        </GridItem>
        <GridItem span={10}>
          <PrerequisitesInfoBox
            showRosaCliRequirement={showRosaCliRequirement}
            rosaHostedCliMinVersion={rosaHostedCliMinVersion}
            productName={productName}
            linkToGetStarted={linkToGetStarted}
          />
        </GridItem>
        <GridItem span={10}>
          <Title headingLevel="h3" className="pf-v6-u-mb-sm">
            Select the ROSA architecture based on your control plane requirements
          </Title>
          <Stack hasGutter>
            <StackItem>
              <RosaArchitectureRenamingAlert
                rosaArchitectureRenaimingAlertLink={rosaArchitectureRenaimingAlertLink}
                allowAlertFeatureFlag={allowAlertFeatureFlag}
              />
            </StackItem>
            <StackItem>
              <Content component={ContentVariants.p}>
                Not sure what to choose?{' '}
                {/* <ExternalLink href={links.AWS_CONTROL_PLANE_URL}>
                  Learn more about control plane architecture
                </ExternalLink> */}
                {AwsControlPlaneLink}
              </Content>
            </StackItem>
          </Stack>
        </GridItem>
      </Grid>

      <ControlPlaneField
        virtualPrivateCloudLink={virtualPrivateCloudLink}
        isTileSelected={isTileSelected}
        isHCPDisabled={isHCPDisabled}
        rosaHomeGetStartedLink={rosaHomeGetStartedLink}
      />

      <Grid hasGutter span={12}>
        <GridItem span={6}>
          <Card>
            <CardHeader>HELLO</CardHeader>
            <CardBody>TEST</CardBody>
          </Card>
        </GridItem>

        <GridItem span={6}>
          <Card>
            <CardHeader>HELLO2</CardHeader>
            <CardBody>TEST2</CardBody>
          </Card>
        </GridItem>
        <Card>
          <CardHeader>HELLO</CardHeader>
          <CardBody>TEST</CardBody>
        </Card>
      </Grid>
    </Form>
  );
};
