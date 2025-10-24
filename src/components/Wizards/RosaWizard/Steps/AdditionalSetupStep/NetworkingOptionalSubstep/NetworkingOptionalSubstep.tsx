import { Section, WizCheckbox, WizTextInput } from "@patternfly-labs/react-form-wizard"
import { useInput } from "@patternfly-labs/react-form-wizard/inputs/Input"
import { Alert, Content, ContentVariants } from "@patternfly/react-core"


export const NetworkingOptionalSubstep = (props: any) => {
    const {value} = useInput(props)
    const {metadata} = value;
    const defaultCidrValue = metadata?.cidrDefault;

    return(
        <>
        <Section id="optional-networking-substep-section" key="optional-networking-substep-section-key" label="Networking">
            <WizCheckbox id="cluster-wide-proxy" path="metadata.cluster-wide-proxy" label="Configure a cluter-wide proxy" helperText="Enable an HTTP or HTTPS proxy to deny direct access to the internet from your cluster." />

        </Section>

        <Section id="optional-networking-cidr-ranges-section" key="optional-networking-cidr-ranges-section-key" label="CIDR ranges">
            <Alert variant="info" title="Take a not of the keys associated with your cluster. If you delete your keys, the cluster will not be available" ouiaId="encryptionKeysAlert" >

                <Content component={ContentVariants.p}>
                    Specify non-overelapping ranges for machine, service, and pod ranges. Make sure that your internal organization's networking ranges do not overlap with ours, which are Kubernetes. Each range should correspond to the first IP address in their subnet.
                </Content>

                <Content component={ContentVariants.p}>
                    HERE GOES LINK: Learn more about configureing network settings (needs external link icon)
                </Content>
            </Alert>
        <WizCheckbox id="use-cidr-default-values" path="metadata.cidrDefault" label="Use default values" helperText="The values are safe defaults. However, you must ensure that the Machine CIDR matches the selected VPC subnets." />

        <WizTextInput path="metadata.machine-cidr" label="Machine CIDR" 
        helperText="Subnet mask must be between /16 and /25"
         disabled={defaultCidrValue}
        />

        <WizTextInput path="metadata.service-cidr" label="Service CIDR" 
        helperText="Subnet mask must be at most /24"
        disabled={defaultCidrValue}
        />

        <WizTextInput path="metadata.pod-cidr" label="Pod CIDR" 
        helperText="Subnet mask must allow for at least 32 nodes"
         disabled={defaultCidrValue}
        />

        <WizTextInput path="metadata.host-prefix" label="Host prefix" 
        helperText="Must be between /23 and /26"
         disabled={defaultCidrValue}
        />

        </Section>
        </>
    )
}