import { useId } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Content, ContentVariants } from '@patternfly/react-core/dist/dynamic/components/Content';
import {
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core/dist/dynamic/components/Drawer';
import { PageSection } from '@patternfly/react-core/dist/dynamic/components/Page';
import { Stack, StackItem } from '@patternfly/react-core/dist/dynamic/layouts/Stack';

import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import type { RosaLoginProduct } from '../rosaLoginCommand';
import { AccountRoles } from './AccountRoles';
import { AssociateAWSAccountInfo } from './AssociateAWSAccountInfo';
import { LoginStep } from './LoginStep';
import { OCMRole } from './OCMRole';
import { UserRole } from './UserRole';

type StepDrawerProps = {
  isDrawerExpanded: boolean;
  setIsDrawerExpanded: (expanded: boolean) => void;
  /** The consuming product. Determines which ROSA login command is shown. Defaults to 'acm'. */
  product?: RosaLoginProduct;
  children: React.ReactNode;
};

export const DetailsStepDrawer = (props: StepDrawerProps): React.ReactElement => {
  const { isDrawerExpanded, setIsDrawerExpanded, product } = props;
  const d = useRosaHcpWizardStrings().associateAwsDrawer;
  const panelTitleId = useId();
  const onClose = (): void => {
    setIsDrawerExpanded(false);
  };

  return (
    <Drawer isExpanded={isDrawerExpanded}>
      <DrawerContent
        panelContent={
          <DrawerPanelContent
            isResizable={true}
            defaultSize="40%"
            focusTrap={{
              enabled: true,
              elementToFocusOnExpand: `[aria-labelledby="${panelTitleId}"] button[aria-label="Close drawer panel"]`,
              'aria-labelledby': panelTitleId,
            }}
          >
            <DrawerHead>
              <Content component={ContentVariants.h2}>
                <span id={panelTitleId}>{d.panelTitle}</span>
              </Content>
              <DrawerActions>
                <DrawerCloseButton onClose={onClose} aria-label="Close drawer panel" />
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
                    <Button variant={ButtonVariant.secondary} onClick={onClose}>
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
