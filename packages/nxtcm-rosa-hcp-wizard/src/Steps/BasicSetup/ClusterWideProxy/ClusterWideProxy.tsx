import { Alert } from '@patternfly/react-core';
import { Section } from '../../../components/Section';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../constants/links';
import { WizTextInput } from '../../../components/WizFields/WizTextInput';
import { clusterValidationSchema } from '../../../yupSchemas';
import { useFormContext, useWatch } from 'react-hook-form';
import { ROSAHCPCluster } from '../../../types';
import { WizFileUpload } from '../../../components/WizFields/WizFileUpload';
import { FieldWrapper } from '../../../components/FieldWrapper';

export const ClusterWideProxy = () => {
  const cw = useRosaHcpWizardStrings().clusterWideProxy;
  const { getFieldState, formState } = useFormContext<ROSAHCPCluster>();
  const httpProxyValue = useWatch<ROSAHCPCluster>({ name: 'http_proxy_url' });
  const httpsProxyValue = useWatch<ROSAHCPCluster>({ name: 'https_proxy_url' });
  const httpState = getFieldState('http_proxy_url', formState);
  const httpsState = getFieldState('https_proxy_url', formState);
  const isHttpValid = !!httpProxyValue && !httpState.error;
  const isHttpsValid = !!httpsProxyValue && !httpsState.error;
  const disableNoProxyDomains = !isHttpValid && !isHttpsValid;

  return (
    <Section label={cw.sectionLabel} description={cw.intro}>
      <ExternalLink href={links.CONFIGURE_PROXY_URL}>{cw.learnMoreLink}</ExternalLink>
      <Alert variant="info" isInline isPlain title={cw.alertConfigureFields} />
      <FieldWrapper size="lg">
        <WizTextInput name="http_proxy_url" schema={clusterValidationSchema} />
      </FieldWrapper>
      <FieldWrapper size="lg">
        <WizTextInput name="https_proxy_url" schema={clusterValidationSchema} />
      </FieldWrapper>
      <FieldWrapper size="lg">
        <WizTextInput
          isDisabled={disableNoProxyDomains}
          name="no_proxy_domains"
          schema={clusterValidationSchema}
        />
      </FieldWrapper>
      <FieldWrapper size="lg">
        <WizFileUpload name="additional_trust_bundle" schema={clusterValidationSchema} />
      </FieldWrapper>
    </Section>
  );
};
