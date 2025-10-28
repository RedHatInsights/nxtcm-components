import {
  Radio,
  Section,
  WizArrayInput,
  WizCheckbox,
  WizNumberInput,
  WizRadioGroup,
  WizSelect,
  WizTextDetail,
} from "@patternfly-labs/react-form-wizard";
import { LabelHelp } from "@patternfly-labs/react-form-wizard/components/LabelHelp";
import { InputCommonProps, useInput } from "@patternfly-labs/react-form-wizard/inputs/Input";
import {
  Content,
  ContentVariants,
  Flex,
  FlexItem,
} from "@patternfly/react-core";

// type NetworkingAndSubnetsSubStepProps = InputCommonProps & {
//   publicSubnets: any;
//   privateSubnets: any;
//   vpcList: any;
// };

export const NetworkingAndSubnetsSubStep = (props: any) => {
  const { value } = useInput(props);
  const { cluster } = value;

  return (
    <>
      <Section label="Networking" id="networking-section" key="networking-section-key">
        <WizRadioGroup
          id="public-private-subnet-radio-group"
          path="cluster.cluster_privacy"
          label="Install your cluster with all public or private API endpoints and application routes."
        >
          <Radio
            id="public"
            label="Public"
            value="external"
            popover={
              <LabelHelp
                id="subnet-label-help"
                labelHelp="Access Kubernetes API endpoint and application routes from the internet."
              />
            }
          >
            <WizSelect
              label="Public subnet name"
              path="cluster.cluster_privacy_public_subnet_id"
              options={props.publicSubnets}
              placeholder="Select public subnet name"
            />
          </Radio>

          <Radio
            id="private"
            label="Private"
            value="internal"
            popover={
              <LabelHelp
                id="subnet-label-help"
                labelHelp="Access Kubernetes API endpoint and application routes from direct private connections only."
              />
            }
          >
          </Radio>
        </WizRadioGroup>
      </Section>

      <Section label="Machine pools" id="machine-pools-section" key="machine-pools-key">
        <Content component={ContentVariants.p}>
          Create machine pools and specify the private subnet for each machine pool. To allow high availability for your workloads, add machine pools on different availablity zones.
        </Content>
        <Content component={ContentVariants.p}>
          The following settings apply to all machine pools created during cluster install. Additional machine pools can be created after cluster creation.
        </Content>

        <WizSelect
          label={`Select a VPC to install your machine pools into your selected regions: ${cluster?.region}`}
          path="cluster.selected_vpc"
          placeholder="Select a VPC to install your machine pools into"
          required
          labelHelp="To create a cluster hosted by Red Hat, you must have a Virtual Private Cloud (VPC) available to create clusters on. {HERE GOES THE LINK: Learn more about VPCs}"
          options={props.vpcList}
        />

        <WizSelect
          label="Compute node instance type"
          path="cluster.machine_type"
          required
          labelHelp="Instance types are made from varying combinations of CPU, memory, storage, and networking capacity. Instance type availability depends on regional availability and your AWS account configuration. {HERE GOES THE LINK: Learn more }"
          options={props.vpcList}
        />
        <WizCheckbox
          title="Autoscaling"
          helperText="Autoscaling automatically adds and removes nodes from the machine pool based on resource requirements. {HERE GOES LINK: Learn more about autscaling with ROSA.}"
          path="cluster.autoscaling"
          label="Enable autoscaling"
          required
        />
        {
          cluster?.autoscaling ? (
            <Flex>
              <FlexItem>
                <WizNumberInput
                  required
                  path="cluster.min_replicas"
                  label="Min compute node count"
                  labelHelp="The number of compute nodes to provision for your initial machine pool. {HERE GOES LINK: Learn more about compute node count}."
                />
              </FlexItem>
              <FlexItem>
                <WizNumberInput
                  required
                  path="cluster.max_replicas"
                  label="Max compute node count"
                  labelHelp="The number of compute nodes to provision for your initial machine pool. {HERE GOES LINK: Learn more about compute node count}."
                />
              </FlexItem>
            </Flex>

          ) : (
            <WizNumberInput
              required
              path="cluster.nodes_compute"
              label="Compute node count"
              labelHelp="The number of compute nodes to provision for your initial machine pool. {HERE GOES LINK: Learn more about compute node count}."
            />
          )
        }


        <WizArrayInput
          path="cluster.machine_pools_subnets"
          label="Machine pools"
          placeholder="Add machine pool"
          collapsedContent={<WizTextDetail path="name" placeholder="Expand to edit the machine pool details" />}
        >
          <Flex>
            <FlexItem>
              <Content component={ContentVariants.p} style={{ fontWeight: '500' }}>Machine Pool</Content>
              <Content component={ContentVariants.p}>Machine pool 1</Content>
            </FlexItem>
            <FlexItem>
              <WizSelect path="machine_pool_subnet" label="Private subnet name" options={['default']} />
            </FlexItem>
          </Flex>
        </WizArrayInput>
      </Section>
    </>
  );
};
