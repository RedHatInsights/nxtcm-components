import { createElement, type ComponentProps } from 'react';
import dashboard = require('@redhat-cloud-services/nxtcm-dashboard');
import wizard = require('@redhat-cloud-services/nxtcm-rosa-hcp-wizard');

// Check the require condition's declarations against the consumer's React types.
declare const wizardProps: ComponentProps<typeof wizard.RosaHCPWizard>;
createElement(dashboard.TotalClusters, { data: { total: 23 } });
createElement(wizard.RosaHCPWizard, wizardProps);
