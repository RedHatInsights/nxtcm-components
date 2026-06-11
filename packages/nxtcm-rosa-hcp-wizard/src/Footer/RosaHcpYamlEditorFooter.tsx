import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import { useCallback, useState } from 'react';
import type React from 'react';

import type { ROSAHCPCluster } from '../types';
import { useRosaHcpWizardStrings } from '../stringsProvider/RosaHcpWizardStringsContext';
import type { YamlEditorHandle } from '../Steps/YamlEditor/RosaHcpYamlEditorStep';
import { useRosaHcpWizardSubmit } from './useRosaHcpWizardSubmit';

export type RosaHcpYamlEditorFooterProps = {
  editorRef: React.RefObject<YamlEditorHandle>;
  onClose: () => void;
  onCancel?: () => void;
  onSubmit: (data: ROSAHCPCluster) => Promise<void>;
};

export function RosaHcpYamlEditorFooter({
  editorRef,
  onClose,
  onCancel,
  onSubmit,
}: RosaHcpYamlEditorFooterProps) {
  const { isSubmitting, showValidationAlert, submitWizard } = useRosaHcpWizardSubmit({ onSubmit });
  const { wizard, yamlEditor: yamlStrings } = useRosaHcpWizardStrings();
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  const handleApply = useCallback(() => {
    if (editorRef.current?.hasSchemaErrors()) return;

    void (async () => {
      try {
        editorRef.current?.applyToForm();
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

  return (
    <WizardFooterWrapper>
      {showValidationAlert ? (
        <Alert
          className="pf-v6-u-mb-md"
          title={wizard.fixValidationErrors}
          isInline
          variant={AlertVariant.danger}
          role="alert"
        />
      ) : null}
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
              {wizard.applyChanges}
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
        variant={ModalVariant.small}
        isOpen={isDiscardModalOpen}
        onClose={handleDiscardCancel}
        aria-labelledby="rosa-hcp-yaml-discard-modal-title"
      >
        <ModalHeader
          title={yamlStrings.discardConfirmTitle}
          titleIconVariant="warning"
          labelId="rosa-hcp-yaml-discard-modal-title"
        />
        <ModalBody>{yamlStrings.discardConfirmBody}</ModalBody>
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
