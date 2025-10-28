import { Section, WizTextInput, WizFileUpload } from "@patternfly-labs/react-form-wizard"
import { Alert, Content, ContentVariants } from "@patternfly/react-core"



export const ClusterWideProxySubstep = () => {
    return(
    <Section id="cluster-wide-proxy-section-id" key="cluster-wide-proxy-section-key" label="Cluster-wide proxy">
        <Content component={ContentVariants.p}>Enable an HTTP or HTTPS proxy to deny direct access to the internet from your cluster.</Content>
        {"HERE GOES EXTERNAL LINK: Learn more about configuring a cluster-wide proxy"}
        <Alert variant="info" isInline isPlain title="Configure at least 1 of the following fields:" />
        <WizTextInput label="HTTP proxy URL" helperText="Specify a proxy URL to use for HTTP connections outside the cluster." path="cluster.http_proxy_url"/>
        <WizTextInput label="HTTPS proxy URL" helperText="Specify a proxy URL to use for HTTPS connections outside the cluster." path="cluster.https_proxy_url"/>
        <WizTextInput label="No Proxy domains" helperText="Preface a domain with . to match subdomains only. For example, .y.com matches x.y.com, but not y.com. Use * to bypass proxy for all destinations." path="cluster.no_proxy_domains"/>

        {"HERE GOES FILE UPLOAD THAT NEEDS TO BE CREATED IN REACT-FORM-WIZARD"}
        <WizFileUpload path="cluster.additional_trust_bundle" />
    </Section>)
}