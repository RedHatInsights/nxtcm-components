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
import { FIELD_NAME } from '../../../constants';

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
