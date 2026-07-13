import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  PageSection,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { OCMRole } from './OCMRole';
import { AccountRoles } from './AccountRoles';
import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import { UserRole } from './UserRole';
import { AssociateAWSAccountInfo } from './AssociateAWSAccountInfo';
import { LoginStep } from './LoginStep';
import type { RosaLoginProduct } from '../rosaLoginCommand';

type StepDrawerProps = {
  isDrawerExpanded: boolean;
  setIsDrawerExpanded: (expanded: boolean) => void;
  onWizardExpand: () => void;
  /** The consuming product. Determines which ROSA login command is shown. Defaults to 'acm'. */
  product?: RosaLoginProduct;
  children: React.ReactNode;
};

export const DetailsStepDrawer = (props: StepDrawerProps) => {
  const { isDrawerExpanded, onWizardExpand, setIsDrawerExpanded, product } = props;
  const d = useRosaHcpWizardStrings().associateAwsDrawer;
  return (
    <Drawer isExpanded={isDrawerExpanded} onExpand={onWizardExpand}>
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
                    <AssociateAWSAccountInfo title={d.stepLoginTitle} initiallyExpanded>
                      <LoginStep product={product} />
                    </AssociateAWSAccountInfo>
                  </StackItem>
                  <StackItem>
                    <AssociateAWSAccountInfo title={d.step1Title}>
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
