import { type ReactElement, useState, version } from 'react';
import { createRoot } from 'react-dom/client';

import { TotalClusters } from '@redhat-cloud-services/nxtcm-dashboard';
import {
  RosaHCPWizard,
  type ROSAHCPWizardData,
} from '@redhat-cloud-services/nxtcm-rosa-hcp-wizard';

import '@patternfly/react-core/dist/styles/base.css';
import '@redhat-cloud-services/nxtcm-dashboard/index.css';
import '@redhat-cloud-services/nxtcm-rosa-hcp-wizard/index.css';

const emptyResource = {
  data: [],
  isFetching: false,
  error: null,
  fetch: (): Promise<void> => Promise.resolve(),
};

const wizardData: ROSAHCPWizardData = {
  awsInfrastructureAccounts: emptyResource,
  awsBillingAccounts: emptyResource,
  regions: emptyResource,
  versions: { ...emptyResource, data: { releases: [] } },
  machineTypes: emptyResource,
  roles: {
    ...emptyResource,
    ocmRoleError: null,
    userRoleError: null,
    ocmRoleARN: null,
  },
  oidcConfig: emptyResource,
  vpcList: emptyResource,
  clusterNameValidation: { isFetching: false, error: null },
};

function Consumer(): ReactElement {
  const [action, setAction] = useState('ready');
  return (
    <>
      <output aria-label="React version">{version}</output>
      <output aria-label="Last action">{action}</output>
      <TotalClusters data={{ total: 23 }} onViewMore={() => setAction('view clusters')} />
      <RosaHCPWizard
        title="Compatibility wizard"
        wizardData={wizardData}
        onCancel={() => setAction('cancel wizard')}
        onSubmit={() => Promise.resolve()}
        resourceGenerator={{ renderYaml: () => '', validateYaml: () => [] }}
      />
    </>
  );
}

const container = document.getElementById('root');
if (!container) throw new Error('Missing consumer root');
createRoot(container).render(<Consumer />);
