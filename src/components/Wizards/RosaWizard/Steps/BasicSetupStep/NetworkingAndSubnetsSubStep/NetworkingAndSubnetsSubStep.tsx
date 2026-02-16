import { Radio, Section, WizRadioGroup, WizSelect } from '@patternfly-labs/react-form-wizard';
import { LabelHelp } from '@patternfly-labs/react-form-wizard/components/LabelHelp';
import { useInput } from '@patternfly-labs/react-form-wizard/inputs/Input';
import { Subnet, VPC } from '../../../../types';
import { useTranslation } from '../../../../../../context/TranslationContext';
import { subnetsFilter } from '../../../helpers';

export const NetworkingAndSubnetsSubStep = (props: any) => {
  const { t } = useTranslation();
  const { value } = useInput(props);
  const { cluster } = value;

  const selectedVPC = props.vpcList.find((vpc: VPC) => vpc.id === cluster?.selected_vpc);

  const { publicSubnets } = subnetsFilter(selectedVPC);

  return (
    <>
      <Section label={t('Networking')} id="networking-section" key="networking-section-key">
        <WizRadioGroup
          id="public-private-subnet-radio-group"
          path="cluster.cluster_privacy"
          helperText={t(
            'Install your cluster with all public or private API endpoints and application routes.'
          )}
        >
          <Radio
            id="public"
            label={t('Public')}
            value="external"
            popover={
              <LabelHelp
                id="subnet-label-help"
                labelHelp={t(
                  'Access Kubernetes API endpoint and application routes from the internet.'
                )}
              />
            }
          >
            <WizSelect
              label={t('Public subnet name')}
              path="cluster.cluster_privacy_public_subnet_id"
              options={publicSubnets?.map((subnet: Subnet) => {
                return {
                  label: subnet.name,
                  value: subnet.subnet_id,
                };
              })}
              placeholder={t('Select public subnet name')}
            />
          </Radio>

          <Radio
            id="private"
            label={t('Private')}
            value="internal"
            popover={
              <LabelHelp
                id="subnet-label-help"
                labelHelp={t(
                  'Access Kubernetes API endpoint and application routes from direct private connections only.'
                )}
              />
            }
          ></Radio>
        </WizRadioGroup>
      </Section>
    </>
  );
};
