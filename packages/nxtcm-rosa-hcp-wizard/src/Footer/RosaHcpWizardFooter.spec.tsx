import { test, expect, type MountResult } from '@playwright/experimental-ct-react';

import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from '../stringsProvider/rosaHcpWizardStrings.defaults';
import { RosaHcpWizardValidationMount } from './RosaHcpWizardFooter.spec-helpers';
import fixtures from '../ROSAHCPWizard.fixtures';
import { mockRoles } from '../Steps/BasicSetup/Details/Details.fixtures';
import {
  VALID_DETAILS_FORM_VALUES,
  VALID_REVIEW_SUBMIT_FORM_VALUES,
} from './rosaHcpWizardFooter.test-data';
import { STEP_IDS } from '../constants';

const INSTALLER_ROLE_LABEL = mockRoles[0].installerRole.label;

const w = defaultRosaHcpWizardStrings.wizard;
const d = defaultRosaHcpWizardStrings.details;
const mp = defaultRosaHcpWizardStrings.machinePools;
const FIX_VALIDATION_ALERT = w.fixValidationErrors;
const SKIP_TO_REVIEW = w.skipToReview;
const FOOTER_BACK = w.back;
const FOOTER_NEXT = w.next;
const FOOTER_SUBMIT = w.createCluster;
const REQUIRED_FIELD_MESSAGE = defaultRosaHcpWizardValidatorStrings.commonRequired;
const rp = defaultRosaHcpWizardStrings.rolesAndPolicies;
const review = defaultRosaHcpWizardStrings.review;
const encryption = defaultRosaHcpWizardStrings.encryption;

/** PatternFly danger Alert exposes the title as a heading (e.g. "Danger alert: …"). */
const validationAlertHeading = { name: new RegExp(FIX_VALIDATION_ALERT) };

async function expectWizardNavError(component: MountResult, stepId: string): Promise<void> {
  await expect(component.locator(`#${stepId}`)).toContainText(', error');
}

async function expectWizardNavNoError(component: MountResult, stepId: string): Promise<void> {
  await expect(component.locator(`#${stepId}`)).not.toContainText(', error');
}

function wizardNavStep(component: MountResult, stepId: string) {
  return component.locator(`#${stepId}`);
}

async function clickNextTimes(component: MountResult, count: number): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await component.getByRole('button', { name: FOOTER_NEXT }).click();
  }
}

async function advancePastDetailsStep(component: MountResult): Promise<void> {
  await clickNextTimes(component, 1);
}

/** Details → Roles → Machine pools → Networking → Encryption (requires `isVisitRequired`). */
async function advanceToEncryptionStep(component: MountResult): Promise<void> {
  await clickNextTimes(component, 4);
}

/** Details → … → Cluster updates → Review. */
async function advanceToReviewStep(component: MountResult): Promise<void> {
  await clickNextTimes(component, 6);
}

async function clickBackTimes(component: MountResult, count: number): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await component.getByRole('button', { name: FOOTER_BACK }).click();
  }
}

async function selectAwsInfrastructureAccount(
  component: MountResult,
  page: import('@playwright/test').Page,
  accountLabel: string
): Promise<void> {
  const combo = component.locator('#associated_aws_id-form-group').getByRole('combobox', {
    name: defaultRosaHcpWizardStrings.details.awsInfraPlaceholder,
    exact: true,
  });
  await combo.click();
  await combo.fill(accountLabel.includes('Staging') ? 'Staging' : accountLabel);
  await page.getByRole('option', { name: accountLabel, exact: true }).click();
}

test.describe('RosaHcpWizardFooter — left nav validation icons', () => {
  test('shows error icons on Details and Basic setup after Next fails validation', async ({
    mount,
  }) => {
    const component = await mount(<RosaHcpWizardValidationMount />);

    await component.getByRole('button', { name: FOOTER_NEXT }).click();

    await expectWizardNavError(component, STEP_IDS.DETAILS);
    await expectWizardNavError(component, STEP_IDS.BASIC_SETUP);
    await expectWizardNavNoError(component, STEP_IDS.OPTIONAL_SETUP);
  });

  test('clears nav error icons after Details fields become valid', async ({ mount }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount
        defaultValues={{
          ...VALID_DETAILS_FORM_VALUES,
          name: '',
        }}
      />
    );

    await component.getByRole('button', { name: FOOTER_NEXT }).click();
    await expectWizardNavError(component, STEP_IDS.DETAILS);

    await component.getByRole('textbox', { name: /Cluster name/i }).fill('mycluster');

    await expectWizardNavNoError(component, STEP_IDS.DETAILS);
    await expectWizardNavNoError(component, STEP_IDS.BASIC_SETUP);
  });

  test('shows error icons on Encryption and Additional setup after Skip to review fails', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount defaultValues={VALID_REVIEW_SUBMIT_FORM_VALUES} />
    );

    await advanceToEncryptionStep(component);
    await component.getByRole('checkbox', { name: encryption.etcdLabel }).check();
    await component.getByRole('button', { name: SKIP_TO_REVIEW }).click();

    await expectWizardNavError(component, STEP_IDS.ENCRYPTION);
    await expectWizardNavError(component, STEP_IDS.OPTIONAL_SETUP);
    await expectWizardNavNoError(component, STEP_IDS.BASIC_SETUP);
  });

  test('shows error icons on steps with errors after a failed Review Submit', async ({ mount }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount defaultValues={VALID_REVIEW_SUBMIT_FORM_VALUES} />
    );

    await advanceToReviewStep(component);
    await expect(component.getByText(review.sectionLabel, { exact: true })).toBeVisible();

    await component.getByRole('button', { name: review.editStep }).first().click();
    await component.getByRole('textbox', { name: /Cluster name/i }).fill('');
    await component.getByRole('button', { name: w.stepLabels.review, exact: true }).click();

    await component.getByRole('button', { name: FOOTER_SUBMIT }).click();

    await expectWizardNavError(component, STEP_IDS.DETAILS);
    await expectWizardNavError(component, STEP_IDS.BASIC_SETUP);
  });
});

test.describe('RosaHcpWizardFooter — step validation on Next', () => {
  test('disables Back on the Details step', async ({ mount }) => {
    const component = await mount(<RosaHcpWizardValidationMount />);
    await expect(component.getByRole('button', { name: FOOTER_BACK })).toBeDisabled();
  });

  test('shows the validation alert and field errors when Next is pressed with an invalid Details step', async ({
    mount,
  }) => {
    const component = await mount(<RosaHcpWizardValidationMount />);

    await component.getByRole('button', { name: FOOTER_NEXT }).click();

    await expect(component.getByRole('heading', validationAlertHeading)).toBeVisible();
    await expect(component.getByText(REQUIRED_FIELD_MESSAGE).first()).toBeVisible();
    await expect(component.getByRole('textbox', { name: /Cluster name/i })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  test('hides the validation alert after Details fields on the step become valid', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount
        defaultValues={{
          ...VALID_DETAILS_FORM_VALUES,
          name: '',
        }}
      />
    );

    await component.getByRole('button', { name: FOOTER_NEXT }).click();
    await expect(component.getByRole('heading', validationAlertHeading)).toBeVisible();

    await component.getByRole('textbox', { name: /Cluster name/i }).fill('mycluster');

    await expect(component.getByRole('heading', validationAlertHeading)).not.toBeVisible();
  });

  test('does not show the validation alert on the next step after advancing with a valid Details step', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount defaultValues={VALID_DETAILS_FORM_VALUES} />
    );

    await component.getByRole('button', { name: FOOTER_NEXT }).click();

    await expect(component.getByText(rp.accountRolesSection, { exact: true })).toBeVisible();
    await expect(component.getByRole('heading', validationAlertHeading)).not.toBeVisible();
    await expect(component.getByRole('button', { name: FOOTER_BACK })).toBeEnabled();
    await expect(component.locator('#installer_role_arn-form-group')).not.toContainText(
      REQUIRED_FIELD_MESSAGE
    );
  });

  test('keeps future nav steps disabled after Details Next failed validation', async ({
    mount,
  }) => {
    const component = await mount(<RosaHcpWizardValidationMount />);

    await component.getByRole('button', { name: FOOTER_NEXT }).click();
    await expect(component.getByRole('heading', validationAlertHeading)).toBeVisible();

    await expect(
      component.getByRole('button', { name: w.stepLabels.rolesAndPolicies, exact: true })
    ).toBeDisabled();
  });

  test('shows private subnet validation after Next when VPC is selected but subnet is empty', async ({
    mount,
    page,
  }) => {
    const mockVpc = fixtures.mockVPCs[0];
    const region = VALID_DETAILS_FORM_VALUES.region ?? 'us-east-1';
    const vpcSelectToggle = `${mp.vpcPlaceholder} ${region}`;

    const component = await mount(
      <RosaHcpWizardValidationMount
        defaultValues={{
          ...VALID_REVIEW_SUBMIT_FORM_VALUES,
          selected_vpc: '',
          machine_pools_subnets: [{ machine_pool_subnet: '' }],
        }}
      />
    );

    await advancePastDetailsStep(component);
    await component.getByRole('button', { name: FOOTER_NEXT }).click();
    await expect(component.locator('#machine-pools-section')).toBeVisible();

    await component.getByRole('button', { name: vpcSelectToggle, exact: true }).click();
    await page.getByRole('option', { name: mockVpc.name, exact: true }).click();

    await component.getByRole('button', { name: FOOTER_NEXT }).click();

    await expect(component.getByRole('heading', validationAlertHeading)).toBeVisible();
    await expect(component.locator('#machine_pool_subnet-form-group')).toContainText(
      REQUIRED_FIELD_MESSAGE
    );
    await expectWizardNavError(component, STEP_IDS.MACHINE_POOLS);
  });

  test('disables forward nav after clearing a billing select without revealing the inline error until Next', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount defaultValues={VALID_DETAILS_FORM_VALUES} />
    );

    await expect(
      component.getByText(defaultRosaHcpWizardStrings.details.awsInfraLabel)
    ).toBeVisible();

    const billingCombo = component
      .locator('#billing_account_id-form-group')
      .getByRole('combobox', { name: d.billingPlaceholder, exact: true });
    await billingCombo.click();
    await component
      .locator('#billing_account_id-form-group')
      .getByRole('button', { name: 'Clear selection' })
      .click();

    await expect(component.getByText(REQUIRED_FIELD_MESSAGE)).not.toBeVisible();
    await expectWizardNavNoError(component, STEP_IDS.DETAILS);
    await expect(
      component.getByRole('button', { name: w.stepLabels.rolesAndPolicies, exact: true })
    ).toBeDisabled();

    await component.getByRole('button', { name: FOOTER_NEXT }).click();

    await expect(component.getByText(REQUIRED_FIELD_MESSAGE).first()).toBeVisible();
    await expectWizardNavError(component, STEP_IDS.DETAILS);
    await expect(
      component.getByRole('button', { name: w.stepLabels.rolesAndPolicies, exact: true })
    ).toBeDisabled();
  });

  test('disables future nav steps after changing associated AWS infrastructure account on Details', async ({
    mount,
    page,
  }) => {
    test.setTimeout(30_000);
    const component = await mount(
      <RosaHcpWizardValidationMount defaultValues={VALID_REVIEW_SUBMIT_FORM_VALUES} />
    );

    await advanceToReviewStep(component);
    await expect(component.getByText(review.sectionLabel, { exact: true })).toBeVisible();

    await clickBackTimes(component, 6);
    await expect(
      component.getByText(defaultRosaHcpWizardStrings.details.awsInfraLabel)
    ).toBeVisible();

    await selectAwsInfrastructureAccount(component, page, 'AWS Account - Staging (234567890123)');

    await expect(wizardNavStep(component, STEP_IDS.ROLES_AND_POLICIES)).toBeDisabled();
    await expect(wizardNavStep(component, STEP_IDS.MACHINE_POOLS)).toBeDisabled();
    await expect(wizardNavStep(component, STEP_IDS.REVIEW)).toBeDisabled();
  });
});

test.describe('RosaHcpWizardFooter — Skip to review', () => {
  test('does not show Skip to review on the Details step', async ({ mount }) => {
    const component = await mount(<RosaHcpWizardValidationMount />);
    await expect(component.getByRole('button', { name: SKIP_TO_REVIEW })).not.toBeVisible();
  });

  test('shows Skip to review on an Additional setup step', async ({ mount }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount defaultValues={VALID_REVIEW_SUBMIT_FORM_VALUES} />
    );

    await advanceToEncryptionStep(component);

    await expect(component.getByText(encryption.sectionLabel, { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: SKIP_TO_REVIEW })).toBeVisible();
  });

  test('shows the validation alert and stays on the step when Skip to review is pressed with invalid fields', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount defaultValues={VALID_REVIEW_SUBMIT_FORM_VALUES} />
    );

    await advanceToEncryptionStep(component);
    await component.getByRole('checkbox', { name: encryption.etcdLabel }).check();
    await component.getByRole('button', { name: SKIP_TO_REVIEW }).click();

    await expect(component.getByRole('heading', validationAlertHeading)).toBeVisible();
    await expect(component.getByText(REQUIRED_FIELD_MESSAGE).first()).toBeVisible();
    await expect(component.getByText(encryption.sectionLabel, { exact: true })).toBeVisible();
  });

  test('keeps Next and Skip to review enabled after field blur validation on Encryption', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount defaultValues={VALID_REVIEW_SUBMIT_FORM_VALUES} />
    );

    await advanceToEncryptionStep(component);
    await component.getByRole('radio', { name: encryption.customKms }).check();
    await component.getByRole('textbox', { name: encryption.keyArnLabel }).focus();
    await component.getByRole('textbox', { name: encryption.keyArnLabel }).blur();

    await expect(component.getByText(REQUIRED_FIELD_MESSAGE).first()).toBeVisible();
    await expect(component.getByRole('button', { name: FOOTER_NEXT })).toBeEnabled();
    await expect(component.getByRole('button', { name: SKIP_TO_REVIEW })).toBeEnabled();
  });

  test('keeps Key ARN validation after navigating away from Encryption and back', async ({
    mount,
  }) => {
    test.setTimeout(30_000);
    const component = await mount(
      <RosaHcpWizardValidationMount defaultValues={VALID_REVIEW_SUBMIT_FORM_VALUES} />
    );

    await advanceToEncryptionStep(component);
    await component.getByRole('radio', { name: encryption.customKms }).check();
    const keyArn = component.getByRole('textbox', { name: encryption.keyArnLabel });
    await keyArn.focus();
    await keyArn.blur();
    await expect(component.getByText(REQUIRED_FIELD_MESSAGE).first()).toBeVisible();

    await component.getByText(w.stepLabels.basicSetup).click();
    const rolesNav = component.getByRole('button', {
      name: w.stepLabels.rolesAndPolicies,
      exact: true,
    });
    await expect(rolesNav).toBeVisible();
    await rolesNav.click();
    await expect(component.getByText(rp.accountRolesSection, { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: FOOTER_NEXT })).toBeEnabled();

    await component.getByText(w.stepLabels.additionalSetup).click();
    const encryptionNav = wizardNavStep(component, STEP_IDS.ENCRYPTION);
    await expect(encryptionNav).toBeVisible();
    await encryptionNav.click();
    await expect(component.getByText(REQUIRED_FIELD_MESSAGE).first()).toBeVisible();
    await expect(component.getByRole('button', { name: FOOTER_NEXT })).toBeEnabled();
    await expect(component.getByRole('button', { name: SKIP_TO_REVIEW })).toBeEnabled();
  });

  test('navigates to Review when Skip to review is pressed with a valid current step', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount defaultValues={VALID_REVIEW_SUBMIT_FORM_VALUES} />
    );

    await advanceToEncryptionStep(component);
    await component.getByRole('button', { name: SKIP_TO_REVIEW }).click();

    await expect(component.getByText(review.sectionLabel, { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: SKIP_TO_REVIEW })).not.toBeVisible();
  });
});

test.describe('RosaHcpWizardFooter — Review Submit validation alert', () => {
  test('hides the validation alert after a failed Submit when the edited field becomes valid', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount defaultValues={VALID_REVIEW_SUBMIT_FORM_VALUES} />
    );

    await advanceToReviewStep(component);
    await expect(component.getByText(review.sectionLabel, { exact: true })).toBeVisible();

    await component.getByRole('button', { name: review.editStep }).first().click();
    const nameInput = component.getByRole('textbox', { name: /Cluster name/i });
    await nameInput.fill('');
    await component.getByRole('button', { name: FOOTER_NEXT }).click();
    await expect(component.getByRole('heading', validationAlertHeading)).toBeVisible();

    await nameInput.fill('mycluster');

    await expect(component.getByRole('heading', validationAlertHeading)).not.toBeVisible();
  });
});

test.describe('RosaHcpWizardFooter — validation alert after failed Review Submit', () => {
  test('hides the alert on Roles and policies when derived prefix and role ARNs become valid', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount
        defaultValues={{
          ...VALID_DETAILS_FORM_VALUES,
          // Match mock installer roleVersion (4.16.0) so the installer option is enabled.
          cluster_version: '4.16.0',
        }}
      />
    );

    await advancePastDetailsStep(component);
    await component.getByRole('button', { name: FOOTER_NEXT }).click();
    await expect(component.getByRole('heading', validationAlertHeading)).toBeVisible();

    await component.locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle').click();
    await page.getByRole('option', { name: INSTALLER_ROLE_LABEL }).click();
    await component.locator('#byo_oidc_config_id-form-group .pf-v6-c-menu-toggle').click();
    await page.getByRole('option', { name: fixtures.mockOicdConfig[0].label }).click();

    await expect(component.getByRole('heading', validationAlertHeading)).not.toBeVisible();
  });
});
