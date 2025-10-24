import { Content, ContentVariants } from "@patternfly/react-core"
import { CopyInstruction } from "./CopyInstruction"


export const OIDCConfigHint = () => {
    return(
        <>
            <Content component={ContentVariants.p}>
                Create a new OIDC config ID by running the following commands in your CLI. Then, refresh and select the new config ID from the dropdown.
            </Content>
             <CopyInstruction variant="expansion">
                        rosa login --use-auth-code --url https://api.stage.openshift.com
                       </CopyInstruction>
                        <CopyInstruction>
                                   rosa create oidc-config
                                  </CopyInstruction>

        </>
    )
}