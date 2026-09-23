import { Alert } from '@patternfly/react-core';
import { useFormContext, useWatch } from 'react-hook-form';

import ExternalLink from '../../../components/ExternalLink';
import { FieldWrapper } from '../../../components/FieldWrapper';
import { Section } from '../../../components/Section';
import { WizFileUpload } from '../../../components/WizFields/WizFileUpload';
import { WizTextInput } from '../../../components/WizFields/WizTextInput';
import { FIELD_NAME } from '../../../constants';
import { useGetDocsVersion } from '../../../constants/links';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { ROSAHCPCluster } from '../../../types';
import { clusterValidationSchema } from '../../../yupSchemas';

export const ClusterWideProxy = () => {
  const cw = useRosaHcpWizardStrings().clusterWideProxy;
  const { getFieldState, formState } = useFormContext<ROSAHCPCluster>();
  const httpProxyValue = useWatch<ROSAHCPCluster>({ name: FIELD_NAME.HTTP_PROXY_URL });
  const httpsProxyValue = useWatch<ROSAHCPCluster>({ name: FIELD_NAME.HTTPS_PROXY_URL });
  const httpState = getFieldState(FIELD_NAME.HTTP_PROXY_URL, formState);
  const httpsState = getFieldState(FIELD_NAME.HTTPS_PROXY_URL, formState);
  const isHttpValid = !!httpProxyValue && !httpState.error;
  const isHttpsValid = !!httpsProxyValue && !httpsState.error;
  const disableNoProxyDomains = !isHttpValid && !isHttpsValid;

  const clusterVersion = useWatch({ name: FIELD_NAME.CLUSTER_VERSION });
  const links = useGetDocsVersion(clusterVersion);

  return (
    <Section label={cw.sectionLabel} description={cw.intro}>
      <ExternalLink href={links.CONFIGURE_PROXY_URL}>{cw.learnMoreLink}</ExternalLink>
      <Alert variant="info" isInline isPlain title={cw.alertConfigureFields} />
      <FieldWrapper size="lg">
        <WizTextInput name={FIELD_NAME.HTTP_PROXY_URL} schema={clusterValidationSchema} />
      </FieldWrapper>
      <FieldWrapper size="lg">
        <WizTextInput name={FIELD_NAME.HTTPS_PROXY_URL} schema={clusterValidationSchema} />
      </FieldWrapper>
      <FieldWrapper size="lg">
        <WizTextInput
          isDisabled={disableNoProxyDomains}
          name={FIELD_NAME.NO_PROXY_DOMAINS}
          schema={clusterValidationSchema}
        />
      </FieldWrapper>
      <FieldWrapper size="lg">
        <WizFileUpload name={FIELD_NAME.ADDITIONAL_TRUST_BUNDLE} schema={clusterValidationSchema} />
      </FieldWrapper>
    </Section>
  );
};
