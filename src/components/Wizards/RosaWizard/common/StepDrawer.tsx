import {
  Drawer,
  DrawerContent,
  DrawerPanelContent,
  DrawerHead,
  Content,
  ContentVariants,
  DrawerActions,
  DrawerCloseButton,
  DrawerPanelBody,
  Stack,
  StackItem,
  PageSection,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import { AssociateAWSAccountInfo } from './AssociateAWSAccountInfo';
import { OCMRole } from './OCMRole';
import { UserRole } from './UserRole';
import { AccountRoles } from './AccountRoles';

export const StepDrawer = (props: any) => {
  const { isDrawerExpanded, onWizardExpand, setIsDrawerExpanded } = props;
  return (
    <Drawer isInline isExpanded={isDrawerExpanded} onExpand={onWizardExpand}>
      <DrawerContent
        panelContent={
          <DrawerPanelContent isResizable={true} defaultSize="40%">
            <DrawerHead>
              <Content component={ContentVariants.h2}>How to associate a new AWS account</Content>
              <DrawerActions>
                <DrawerCloseButton onClick={() => setIsDrawerExpanded(false)} />
              </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody>
              <PageSection hasBodyWrapper={false}>
                <Stack hasGutter>
                  <StackItem>
                    <Content component={ContentVariants.p}>
                      ROSA cluster deployments use the AWS Security Token Service for added
                      security. Run the following required steps from a CLI authenticated with both
                      AWS and ROSA.
                    </Content>
                    <Content component={ContentVariants.p}>
                      You must use ROSA CLI version 1.2.31 or above.
                    </Content>
                  </StackItem>
                  <StackItem>
                    <AssociateAWSAccountInfo title="Step 1: OCM Role" initiallyExpanded>
                      <OCMRole />
                    </AssociateAWSAccountInfo>
                  </StackItem>
                  <StackItem>
                    <AssociateAWSAccountInfo title="Step 2: User Role">
                      <UserRole />
                    </AssociateAWSAccountInfo>
                  </StackItem>
                  <StackItem>
                    <AssociateAWSAccountInfo title="Step 3: User Role">
                      <AccountRoles />
                    </AssociateAWSAccountInfo>
                  </StackItem>

                  <StackItem>
                    <Content component={ContentVariants.p} className="pf-v6-u-mr-md">
                      After you've completed all the steps, close this guide and choose your
                      account.
                    </Content>
                  </StackItem>
                  <StackItem>
                    <Button
                      variant={ButtonVariant.secondary}
                      onClick={() => setIsDrawerExpanded(false)}
                    >
                      Close
                    </Button>
                  </StackItem>
                </Stack>
              </PageSection>
            </DrawerPanelBody>
          </DrawerPanelContent>
        }
      >
        {props.children}
      </DrawerContent>
    </Drawer>
  );
};
