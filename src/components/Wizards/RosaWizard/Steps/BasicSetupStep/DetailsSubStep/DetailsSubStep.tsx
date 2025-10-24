import {
  Section,
  Step,
  WizSelect,
  WizTextInput,
} from "@patternfly-labs/react-form-wizard";
import { Button, Content, ContentVariants, Drawer, DrawerActions, DrawerCloseButton, DrawerContent, DrawerHead, DrawerPanelContent, useWizardContext } from "@patternfly/react-core";
import React from "react";
import { StepDrawer } from "../../../common/StepDrawer";

type DetailsSubStepProps = {
  openShiftVersions: any;
  awsInfrastructureAccounts: any;
  awsBillingAccounts: any;
};

export const DetailsSubStep: React.FunctionComponent<DetailsSubStepProps> = ({
  openShiftVersions,
  awsInfrastructureAccounts,
  awsBillingAccounts,
}) => {

  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState<boolean>(false)
  const { activeStep } = useWizardContext();
  const drawerRef = React.useRef<HTMLSpanElement>(null);

  const onWizardExpand = () => drawerRef.current && drawerRef.current.focus();

  return (
    <Section label="Details">
      <StepDrawer isDrawerExpanded={isDrawerExpanded} setIsDrawerExpanded={setIsDrawerExpanded} onWizardExpand={onWizardExpand}>
      <WizTextInput
        path="metadata.name"
        label="Cluster name"
        placeholder="Enter the cluster name"
        required
        labelHelp="This will be how we refer to your cluster in the OpenShift cluster list and will form part of the cluster console subdomain."
      />

      <WizSelect
        path="metadata.openshiftversion"
        label="OpenShift version"
        placeholder="Select an OpenShift version"
        options={openShiftVersions}
        required
      />

      <WizSelect
        path="metadata.awsinfrastructureaccount"
        label="Associaated AWS infrastructure account"
        placeholder="Select an AWS infrastructure account"
        labelHelp="Your cluster's cloud resources will be created in the associated AWS infrastructure account. To continue, you must associate at least 1 account."
        options={awsInfrastructureAccounts}
        required
      />
      {!isDrawerExpanded && (
            <Button isInline variant="link" onClick={() => setIsDrawerExpanded((prevExpanded) => !prevExpanded)}>
              Associate a new AWS account
            </Button>
          )}
      {/* 
                    TODO: HERE GOES LINK WITH ASSOCIATE A NEW AWS ACCOUNT
                */}
      <WizSelect
        path="metadata.awsbilling"
        label="Associaated AWS billing account"
        placeholder="Select an AWS billing account"
        labelHelp="The AWS billing account is often the same as your Associated AWS infrastructure account, but does not have to be."
        options={awsBillingAccounts}
        required
      />
      {/* 
                    TODO: HERE GOES LINK WITH CONNECT A NEW AWS BILLING ACCOUNT
                */}

      <WizSelect
        path="metadata.region"
        label="Region"
        placeholder="Select a region"
        labelHelp="The AWS Region where your compute nodes and control plane will be located. (should be link: Learn more abut AWS Regions.)"
        options={openShiftVersions}
        required
      />
      </StepDrawer>
    </Section>
  );
};




