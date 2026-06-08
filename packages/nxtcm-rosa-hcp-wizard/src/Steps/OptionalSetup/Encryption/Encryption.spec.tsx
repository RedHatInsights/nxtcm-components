import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../test-helpers';
import { ClusterEncryptionKeys } from '../../../types';
import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import { EncryptionMount } from './Encryption.spec-helpers';

const e = defaultRosaHcpWizardStrings.encryption;
const v = defaultRosaHcpWizardValidatorStrings.kmsKeyArn;
const requiredMessage = defaultRosaHcpWizardValidatorStrings.commonRequired;

test.describe('Encryption (ROSA HCP)', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<EncryptionMount />);
    await checkAccessibility({ component });
  });

  test('should render the Advanced encryption section title', async ({ mount }) => {
    const component = await mount(<EncryptionMount />);
    await expect(component.getByText(e.sectionLabel, { exact: true })).toBeVisible();
  });

  test('should render the Encryption Keys radio group', async ({ mount }) => {
    const component = await mount(<EncryptionMount />);
    await expect(component.getByText(e.keysGroupLabel, { exact: true })).toBeVisible();
  });

  test('should render the default KMS radio option', async ({ mount }) => {
    const component = await mount(<EncryptionMount />);
    await expect(component.getByRole('radio', { name: e.defaultKms })).toBeVisible();
  });

  test('should render the custom KMS radio option', async ({ mount }) => {
    const component = await mount(<EncryptionMount />);
    await expect(component.getByRole('radio', { name: e.customKms })).toBeVisible();
  });

  test('should have default KMS selected by default', async ({ mount }) => {
    const component = await mount(<EncryptionMount />);
    await expect(component.getByRole('radio', { name: e.defaultKms })).toBeChecked();
    await expect(component.getByRole('radio', { name: e.customKms })).not.toBeChecked();
  });

  test('should render the Learn more link for encryption keys', async ({ mount }) => {
    const component = await mount(<EncryptionMount />);
    await expect(component.getByText(e.keysLearnMore).first()).toBeVisible();
  });

  test('should render the etcd encryption checkbox', async ({ mount }) => {
    const component = await mount(<EncryptionMount />);
    await expect(component.getByRole('checkbox', { name: e.etcdLabel })).toBeVisible();
  });

  test('should render the info alert about encryption keys', async ({ mount }) => {
    const component = await mount(<EncryptionMount />);
    await expect(component.getByText(e.keysNoteAlert)).toBeVisible();
  });

  test.describe('Encryption — custom KMS key', () => {
    test('should not show Key ARN input when default KMS is selected', async ({ mount }) => {
      const component = await mount(<EncryptionMount />);
      await expect(component.getByRole('textbox', { name: e.keyArnLabel })).not.toBeVisible();
    });

    test('should show Key ARN input when custom KMS is selected', async ({ mount }) => {
      const component = await mount(
        <EncryptionMount defaultValues={{ encryption_keys: ClusterEncryptionKeys.custom }} />
      );
      await expect(component.getByRole('textbox', { name: e.keyArnLabel })).toBeVisible();
    });

    test('should show Key ARN input after clicking custom KMS radio', async ({ mount }) => {
      const component = await mount(<EncryptionMount />);

      await component.getByRole('radio', { name: e.customKms }).click();

      await expect(component.getByRole('textbox', { name: e.keyArnLabel })).toBeVisible();
    });

    test('should hide Key ARN input when switching back to default KMS', async ({ mount }) => {
      const component = await mount(
        <EncryptionMount defaultValues={{ encryption_keys: ClusterEncryptionKeys.custom }} />
      );

      await expect(component.locator('#kms_key_arn-form-group')).toBeVisible();
      await component.getByRole('radio', { name: e.defaultKms }).click();
      await expect(component.locator('#kms_key_arn-form-group')).not.toBeVisible();
    });

    test('should clear custom KMS Key ARN validation when default KMS is selected', async ({
      mount,
    }) => {
      const component = await mount(
        <EncryptionMount
          defaultValues={{
            encryption_keys: ClusterEncryptionKeys.custom,
            region: 'us-east-1',
          }}
        />
      );

      const arnInput = component.locator('#kms_key_arn-form-group').getByRole('textbox');
      await arnInput.fill('not-a-valid-arn');
      await arnInput.blur();
      await expect(component.getByText(v.invalidArn)).toBeVisible();

      await component.getByRole('radio', { name: e.defaultKms }).click();

      await expect(component.getByText(v.invalidArn)).not.toBeVisible();
      await expect(component.getByText(requiredMessage)).not.toBeVisible();
    });

    test('should display validation error when custom KMS Key ARN is empty', async ({ mount }) => {
      const component = await mount(
        <EncryptionMount
          defaultValues={{
            encryption_keys: ClusterEncryptionKeys.custom,
            region: 'us-east-1',
          }}
        />
      );

      const arnInput = component.locator('#kms_key_arn-form-group').getByRole('textbox');
      await arnInput.focus();
      await arnInput.blur();

      await expect(component.getByText(requiredMessage)).toBeVisible();
    });

    test('should display validation error for KMS ARN with whitespace', async ({ mount }) => {
      const component = await mount(
        <EncryptionMount
          defaultValues={{
            encryption_keys: ClusterEncryptionKeys.custom,
            region: 'us-east-1',
          }}
        />
      );

      const arnInput = component.locator('#kms_key_arn-form-group').getByRole('textbox');
      await arnInput.fill('arn:aws:kms:us-east-1:123456789012:key/abc def');
      await arnInput.blur();

      await expect(component.getByText(v.noWhitespace)).toBeVisible();
    });

    test('should display validation error for invalid KMS ARN format', async ({ mount }) => {
      const component = await mount(
        <EncryptionMount
          defaultValues={{
            encryption_keys: ClusterEncryptionKeys.custom,
            region: 'us-east-1',
          }}
        />
      );

      const arnInput = component.locator('#kms_key_arn-form-group').getByRole('textbox');
      await arnInput.fill('not-a-valid-arn');
      await arnInput.blur();

      await expect(component.getByText(v.invalidArn)).toBeVisible();
    });

    test('should display validation error when KMS ARN region does not match selected region', async ({
      mount,
    }) => {
      const component = await mount(
        <EncryptionMount
          defaultValues={{
            encryption_keys: ClusterEncryptionKeys.custom,
            region: 'us-east-1',
          }}
        />
      );

      const arnInput = component.locator('#kms_key_arn-form-group').getByRole('textbox');
      await arnInput.fill(
        'arn:aws:kms:eu-west-1:123456789012:key/12345678-1234-1234-9abc-123456789012'
      );
      await arnInput.blur();

      await expect(component.getByText(v.wrongRegion)).toBeVisible();
    });

    test('should accept a valid KMS ARN matching the selected region', async ({ mount }) => {
      const component = await mount(
        <EncryptionMount
          defaultValues={{
            encryption_keys: ClusterEncryptionKeys.custom,
            region: 'us-east-1',
          }}
        />
      );

      const arnInput = component.locator('#kms_key_arn-form-group').getByRole('textbox');
      await arnInput.fill(
        'arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-9abc-123456789012'
      );
      await arnInput.blur();

      await expect(component.getByText(v.noWhitespace)).not.toBeVisible();
      await expect(component.getByText(v.invalidArn)).not.toBeVisible();
      await expect(component.getByText(v.wrongRegion)).not.toBeVisible();
    });
  });

  test.describe('Encryption — etcd encryption', () => {
    test('should not show etcd Key ARN input when etcd encryption is unchecked', async ({
      mount,
    }) => {
      const component = await mount(<EncryptionMount />);
      await expect(component.getByRole('checkbox', { name: e.etcdLabel })).not.toBeChecked();
      await expect(component.locator('#etcd_key_arn-form-group')).not.toBeVisible();
    });

    test('should show etcd Key ARN input when etcd encryption is checked', async ({ mount }) => {
      const component = await mount(<EncryptionMount defaultValues={{ etcd_encryption: true }} />);
      await expect(component.getByRole('textbox', { name: e.keyArnLabel })).toBeVisible();
    });

    test('should show etcd Key ARN input after checking etcd encryption', async ({ mount }) => {
      const component = await mount(<EncryptionMount />);

      await component.getByRole('checkbox', { name: e.etcdLabel }).check();

      await expect(component.getByRole('textbox', { name: e.keyArnLabel })).toBeVisible();
    });

    test('should hide etcd Key ARN input after unchecking etcd encryption', async ({ mount }) => {
      const component = await mount(<EncryptionMount defaultValues={{ etcd_encryption: true }} />);

      await expect(component.getByRole('textbox', { name: e.keyArnLabel })).toBeVisible();
      await component.getByRole('checkbox', { name: e.etcdLabel }).uncheck();
      await expect(component.locator('#etcd_key_arn-form-group')).not.toBeVisible();
    });

    test('should clear etcd Key ARN validation when etcd encryption is unchecked', async ({
      mount,
    }) => {
      const component = await mount(
        <EncryptionMount
          defaultValues={{
            etcd_encryption: true,
            region: 'us-east-1',
          }}
        />
      );

      const arnInput = component.locator('#etcd_key_arn-form-group').getByRole('textbox');
      await arnInput.fill('not-a-valid-arn');
      await arnInput.blur();
      await expect(component.getByText(v.invalidArn)).toBeVisible();

      await component.getByRole('checkbox', { name: e.etcdLabel }).uncheck();

      await expect(component.getByText(v.invalidArn)).not.toBeVisible();
      await expect(component.getByText(requiredMessage)).not.toBeVisible();
    });

    test('should display validation error when etcd Key ARN is empty', async ({ mount }) => {
      const component = await mount(
        <EncryptionMount
          defaultValues={{
            etcd_encryption: true,
            region: 'us-east-1',
          }}
        />
      );

      const arnInput = component.locator('#etcd_key_arn-form-group').getByRole('textbox');
      await arnInput.focus();
      await arnInput.blur();

      await expect(component.getByText(requiredMessage)).toBeVisible();
    });

    test('should display validation error for etcd KMS ARN with whitespace', async ({ mount }) => {
      const component = await mount(
        <EncryptionMount
          defaultValues={{
            etcd_encryption: true,
            region: 'us-east-1',
          }}
        />
      );

      const arnInput = component.locator('#etcd_key_arn-form-group').getByRole('textbox');
      await arnInput.fill('arn:aws:kms:us-east-1:123456789012:key/abc def');
      await arnInput.blur();

      await expect(component.getByText(v.noWhitespace)).toBeVisible();
    });

    test('should display validation error for invalid etcd KMS ARN format', async ({ mount }) => {
      const component = await mount(
        <EncryptionMount
          defaultValues={{
            etcd_encryption: true,
            region: 'us-east-1',
          }}
        />
      );

      const arnInput = component.locator('#etcd_key_arn-form-group').getByRole('textbox');
      await arnInput.fill('not-a-valid-arn');
      await arnInput.blur();

      await expect(component.getByText(v.invalidArn)).toBeVisible();
    });

    test('should display validation error when etcd KMS ARN region does not match', async ({
      mount,
    }) => {
      const component = await mount(
        <EncryptionMount
          defaultValues={{
            etcd_encryption: true,
            region: 'us-east-1',
          }}
        />
      );

      const arnInput = component.locator('#etcd_key_arn-form-group').getByRole('textbox');
      await arnInput.fill(
        'arn:aws:kms:eu-west-1:123456789012:key/12345678-1234-1234-9abc-123456789012'
      );
      await arnInput.blur();

      await expect(component.getByText(v.wrongRegion)).toBeVisible();
    });

    test('should render the Learn more link for etcd encryption', async ({ mount }) => {
      const component = await mount(<EncryptionMount />);
      await expect(component.getByText(e.etcdLearnMore).last()).toBeVisible();
    });
  });
});
