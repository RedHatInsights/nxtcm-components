import React from 'react';
import { useFormContext } from 'react-hook-form';

import type { ClusterFormData } from '../types';
import { Wizard, WizardStep } from '@patternfly/react-core';
import { Details } from './Steps/BasicSetup/Details/Details';
import { RolesAndPolicies } from './Steps/BasicSetup/RolesAndPolicies/RolesAndPolicies';
import { MachinePools } from './Steps/BasicSetup/MachinePools/MachinePools';
import { Networking } from './Steps/BasicSetup/Networking/Networking';
import { Encryption } from './Steps/OptionalSetup/Encryption/Encryption';
import { ClusterUpdates } from './Steps/OptionalSetup/ClusterUpdates/ClusterUpdates';
import { ClusterWideProxy } from './Steps/BasicSetup/ClusterWideProxy/ClusterWideProxy';
import { Review } from './Steps/Review/Review';
import { useRosaHcpWizardStrings } from './stringsProvider/RosaHcpWizardStringsContext';
import { STEP_IDS } from './constants';
import type { RosaHCPWizardProps } from './types';

export const ROSAHCPWizardBody = (props: RosaHCPWizardProps) => {
  const { wizardData } = props;
  const { getValues } = useFormContext<Partial<ClusterFormData>>();
  //setShowClusterWideProxy is needed to be passed into Networking step
  const [showClusterWideProxy, _] = React.useState<boolean>(false);

  // eslint-disable-next-line no-console -- intentional step-change debug logging
  const onStepChange = () => console.log('ROSA HCP wizard data', getValues());

  const rosaStrings = useRosaHcpWizardStrings();
  const { wizard } = rosaStrings;
  const sl = wizard.stepLabels;

  return (
    <div>
      <Wizard height="100vh" onStepChange={onStepChange}>
        <WizardStep
          isExpandable
          name={sl.basicSetup}
          id={STEP_IDS.BASIC_SETUP}
          steps={[
            <WizardStep name={sl.details} id={STEP_IDS.DETAILS} key={STEP_IDS.DETAILS}>
              <Details {...wizardData} />
            </WizardStep>,
            <WizardStep
              name={sl.rolesAndPolicies}
              id={STEP_IDS.ROLES_AND_POLICIES}
              key={STEP_IDS.ROLES_AND_POLICIES}
            >
              <RolesAndPolicies {...wizardData} />
            </WizardStep>,
            <WizardStep
              name={sl.machinePools}
              id={STEP_IDS.MACHINE_POOLS}
              key={STEP_IDS.MACHINE_POOLS}
            >
              <MachinePools {...wizardData} />
            </WizardStep>,
            <WizardStep name={sl.networking} id={STEP_IDS.NETWORKING} key={STEP_IDS.NETWORKING}>
              <Networking {...wizardData} />
            </WizardStep>,
          ]}
        />

        <WizardStep
          isExpandable
          name={sl.additionalSetup}
          id={STEP_IDS.OPTIONAL_SETUP}
          key={STEP_IDS.OPTIONAL_SETUP}
          steps={[
            <WizardStep
              name={sl.encryptionOptional}
              id={STEP_IDS.ENCRYPTION}
              key={STEP_IDS.ENCRYPTION}
            >
              <Encryption />
            </WizardStep>,
            <WizardStep
              name={sl.clusterUpdatesOptional}
              id={STEP_IDS.CLUSTER_UPDATES}
              key={STEP_IDS.CLUSTER_UPDATES}
            >
              <ClusterUpdates />
            </WizardStep>,
            ...(showClusterWideProxy
              ? [
                  <WizardStep
                    name={sl.clusterWideProxy}
                    id={STEP_IDS.CLUSTER_WIDE_PROXY}
                    key={STEP_IDS.CLUSTER_WIDE_PROXY}
                  >
                    <ClusterWideProxy />{' '}
                  </WizardStep>,
                ]
              : []),
          ]}
        />
        <WizardStep name={sl.review} id={STEP_IDS.REVIEW} key={STEP_IDS.REVIEW}>
          <Review />
        </WizardStep>
      </Wizard>
    </div>
  );
};
