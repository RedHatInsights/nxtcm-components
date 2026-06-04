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
import { OCMRole } from './OCMRole';
import { AccountRoles } from './AccountRoles';
import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import { UserRole } from './UserRole';
import { AssociateAWSAccountInfo } from '../AssociateAWSAccountInfo';

type StepDrawerProps = {
  isDrawerExpanded: boolean;
  setIsDrawerExpanded: (expanded: boolean) => void;
  onWizardExpand: () => void;
  children: React.ReactNode;
};

export const DetailsStepDrawer = (props: StepDrawerProps) => {
  const { isDrawerExpanded, onWizardExpand, setIsDrawerExpanded } = props;
  const d = useRosaHcpWizardStrings().associateAwsDrawer;
  return (
    <Drawer isInline isExpanded={isDrawerExpanded} onExpand={onWizardExpand}>
      <DrawerContent
        panelContent={
          <DrawerPanelContent isResizable={true} defaultSize="40%">
            <DrawerHead>
              <Content component={ContentVariants.h2}>{d.panelTitle}</Content>
              <DrawerActions>
                <DrawerCloseButton onClick={() => setIsDrawerExpanded(false)} />
              </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody>
              <PageSection hasBodyWrapper={false}>
                <Stack hasGutter>
                  <StackItem>
                    <Content component={ContentVariants.p}>{d.introSts}</Content>
                    <Content component={ContentVariants.p}>{d.cliVersion}</Content>
                  </StackItem>
                  <StackItem>
                    <AssociateAWSAccountInfo title={d.step1Title} initiallyExpanded>
                      <OCMRole />
                    </AssociateAWSAccountInfo>
                  </StackItem>
                  <StackItem>
                    <AssociateAWSAccountInfo title={d.step2Title}>
                      <UserRole />
                    </AssociateAWSAccountInfo>
                  </StackItem>
                  <StackItem>
                    <AssociateAWSAccountInfo title={d.step3Title}>
                      <AccountRoles />
                    </AssociateAWSAccountInfo>
                  </StackItem>

                  <StackItem>
                    <Content component={ContentVariants.p} className="pf-v6-u-mr-md">
                      {d.closingPrompt}
                    </Content>
                  </StackItem>
                  <StackItem>
                    <Button
                      variant={ButtonVariant.secondary}
                      onClick={() => setIsDrawerExpanded(false)}
                    >
                      {d.closeButton}
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
