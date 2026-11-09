import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import {
  ActionList,
  ActionListGroup,
  ActionListItem,
} from '@patternfly/react-core/dist/dynamic/components/ActionList';
import { Button, ButtonVariant } from '@patternfly/react-core/dist/dynamic/components/Button';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core/dist/dynamic/components/Modal';
import { WizardFooterWrapper } from '@patternfly/react-core/dist/dynamic/components/Wizard';

import type { YamlEditorHandle } from '../Steps/YamlEditor/RosaHcpYamlEditorStep';
import { useRosaHcpWizardStrings } from '../stringsProvider/RosaHcpWizardStringsContext';
import { useRosaHcpWizardSubmit } from './useRosaHcpWizardSubmit';

export type RosaHcpYamlEditorFooterProps = {
  editorRef: React.RefObject<YamlEditorHandle | null>;
  onClose: () => void;
  onCancel?: () => void;
  onSubmit: (yamlString: string) => Promise<void>;
};

export function RosaHcpYamlEditorFooter({
  editorRef,
  onClose,
  onCancel,
  onSubmit,
}: RosaHcpYamlEditorFooterProps) {
  const getYaml = useCallback(() => editorRef.current?.getYaml() ?? '', [editorRef]);
  const { isSubmitting, submitWizard } = useRosaHcpWizardSubmit({
    onSubmit,
    getYaml,
    skipFormValidation: true,
  });
  const { wizard, yamlEditor: yamlStrings } = useRosaHcpWizardStrings();
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  const handleApply = useCallback(() => {
    if (!editorRef.current || editorRef.current.hasSchemaErrors()) return;

    void (async () => {
      try {
        await submitWizard();
      } catch {
        // keep the editor open so the user can correct the issue
      }
    })();
  }, [editorRef, submitWizard]);

  const handleDiscardClick = useCallback(() => {
    setIsDiscardModalOpen(true);
  }, []);

  const handleDiscardCancel = useCallback(() => {
    setIsDiscardModalOpen(false);
  }, []);

  const handleDiscardConfirm = useCallback(() => {
    setIsDiscardModalOpen(false);
    onClose();
  }, [onClose]);

  // PatternFly 6 has no Modal prop for the built-in close button's name, so
  // relabel it on the DOM (same approach as the YAML editor wrapper).
  // PatternFly's ModalContent renders the modal box one commit after isOpen
  // flips (its isRendered state is set in an effect), and on React 18 that
  // commit lands after this effect has already run. Watch for the button to
  // appear so the relabel works on both React versions.
  useEffect(() => {
    if (!isDiscardModalOpen) return;

    const relabelCloseButton = () =>
      document
        .querySelector('#rosa-hcp-yaml-discard-modal button[aria-label="Close"]')
        ?.setAttribute('aria-label', yamlStrings.discardModalCloseAriaLabel);

    relabelCloseButton();

    const observer = new MutationObserver(relabelCloseButton);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isDiscardModalOpen, yamlStrings.discardModalCloseAriaLabel]);

  return (
    <WizardFooterWrapper>
      <ActionList>
        <ActionListGroup>
          <ActionListItem>
            <Button
              variant={ButtonVariant.primary}
              type="button"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
              onClick={handleApply}
            >
              {wizard.createCluster}
            </Button>
          </ActionListItem>
          <ActionListItem>
            <Button
              variant={ButtonVariant.secondary}
              type="button"
              isDisabled={isSubmitting}
              onClick={handleDiscardClick}
            >
              {yamlStrings.discardChanges}
            </Button>
          </ActionListItem>
        </ActionListGroup>
        <ActionListGroup>
          <ActionListItem>
            <Button
              variant={ButtonVariant.link}
              type="button"
              isDisabled={isSubmitting}
              onClick={onCancel}
            >
              {yamlStrings.cancelCreation}
            </Button>
          </ActionListItem>
        </ActionListGroup>
      </ActionList>
      <Modal
        id="rosa-hcp-yaml-discard-modal"
        variant={ModalVariant.small}
        isOpen={isDiscardModalOpen}
        onClose={handleDiscardCancel}
        aria-labelledby="rosa-hcp-yaml-discard-modal-title"
        aria-describedby="rosa-hcp-yaml-discard-modal-body"
      >
        <ModalHeader
          title={yamlStrings.discardConfirmTitle}
          titleIconVariant="warning"
          labelId="rosa-hcp-yaml-discard-modal-title"
        />
        <ModalBody id="rosa-hcp-yaml-discard-modal-body">
          {yamlStrings.discardConfirmBody}
        </ModalBody>
        <ModalFooter>
          <Button variant={ButtonVariant.primary} onClick={handleDiscardConfirm}>
            {yamlStrings.discardConfirmYes}
          </Button>
          <Button variant={ButtonVariant.link} onClick={handleDiscardCancel}>
            {wizard.cancel}
          </Button>
        </ModalFooter>
      </Modal>
    </WizardFooterWrapper>
  );
}
