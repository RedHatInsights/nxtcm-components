import { test, expect } from '@playwright/experimental-ct-react';

import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from '../stringsProvider/rosaHcpWizardStrings.defaults';
import { RosaHcpWizardValidationMount } from './RosaHcpWizardFooter.spec-helpers';
import {
  ROSA_HCP_FOOTER_CT_VISITED_THROUGH_ENCRYPTION,
  ROSA_HCP_FOOTER_CT_VISITED_THROUGH_REVIEW,
  ROSA_HCP_FOOTER_CT_VISITED_THROUGH_ROLES,
} from './rosaHcpWizardFooter.spec-data';
import fixtures from '../ROSAHCPWizard.fixtures';
import { STEP_IDS } from '../constants';
import { mockRoles } from '../Steps/BasicSetup/Details/Details.fixtures';
import {
  VALID_DETAILS_FORM_VALUES,
  VALID_REVIEW_SUBMIT_FORM_VALUES,
} from './rosaHcpWizardFooter.test-data';

const INSTALLER_ROLE_LABEL = mockRoles[0].installerRole.label;

const w = defaultRosaHcpWizardStrings.wizard;
const FIX_VALIDATION_ALERT = w.fixValidationErrors;
const SKIP_TO_REVIEW = w.skipToReview;
const FOOTER_BACK = w.back;
const FOOTER_NEXT = w.next;
const FOOTER_SUBMIT = w.submit;
const REQUIRED_FIELD_MESSAGE = defaultRosaHcpWizardValidatorStrings.commonRequired;
const rp = defaultRosaHcpWizardStrings.rolesAndPolicies;
const review = defaultRosaHcpWizardStrings.review;
const encryption = defaultRosaHcpWizardStrings.encryption;

/** PatternFly danger Alert exposes the title as a heading (e.g. "Danger alert: …"). */
const validationAlertHeading = { name: new RegExp(FIX_VALIDATION_ALERT) };

/** PatternFly prepends screen-reader ", error" before the step label in nav button names. */
const wizardNavStepErrorButtonName = (stepLabel: string): RegExp =>
  new RegExp(`, error ${stepLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');

test.describe('RosaHcpWizardFooter — left nav enablement', () => {
  test('disables forward unvisited steps while on Details', async ({ mount }) => {
    const component = await mount(<RosaHcpWizardValidationMount />);

    await expect(
      component.getByRole('button', { name: w.stepLabels.rolesAndPolicies, exact: true })
    ).toBeDisabled();
    await expect(
      component.getByRole('button', { name: w.stepLabels.review, exact: true })
    ).toBeDisabled();
  });

  test('keeps previous steps enabled when on a later step', async ({ mount }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount defaultValues={VALID_DETAILS_FORM_VALUES} />
    );

    await component.getByRole('button', { name: FOOTER_NEXT }).click();
    await expect(component.getByText(rp.accountRolesSection, { exact: true })).toBeVisible();

    await expect(
      component.getByRole('button', { name: w.stepLabels.details, exact: true })
    ).toBeEnabled();
  });

  test('blocks forward nav to Additional setup when an earlier step has validation errors', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount
        initialStepId={STEP_IDS.ROLES_AND_POLICIES}
        initialVisitedStepIds={ROSA_HCP_FOOTER_CT_VISITED_THROUGH_ENCRYPTION}
      />
    );

    await expect(component.getByText(w.stepLabels.additionalSetup)).toBeDisabled();
  });

  test('disables forward visited steps when the active step has empty required fields', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount defaultValues={VALID_DETAILS_FORM_VALUES} />
    );

    await component.getByRole('button', { name: FOOTER_NEXT }).click();
    await expect(component.getByText(rp.accountRolesSection, { exact: true })).toBeVisible();

    await component.getByRole('button', { name: w.stepLabels.details, exact: true }).click();
    await component.getByRole('textbox', { name: /Cluster name/i }).fill('');

    await expect(
      component.getByRole('button', { name: w.stepLabels.rolesAndPolicies, exact: true })
    ).toBeDisabled();
  });

  test('disables forward visited steps while cluster name async validation is in progress', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount
        defaultValues={VALID_DETAILS_FORM_VALUES}
        clusterNameUniquenessPending
      />
    );

    await component.getByRole('button', { name: FOOTER_NEXT }).click();
    await expect(component.getByText(rp.accountRolesSection, { exact: true })).toBeVisible();

    await component.getByRole('button', { name: w.stepLabels.details, exact: true }).click();

    const nameInput = component.getByRole('textbox', { name: /Cluster name/i });
    await nameInput.fill('renamed-cluster');
    await nameInput.blur();

    await expect
      .poll(async () =>
        component
          .getByRole('button', { name: w.stepLabels.rolesAndPolicies, exact: true })
          .isDisabled()
      )
      .toBe(true);
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

  test('sets the Details nav step status to error when Next fails validation', async ({
    mount,
  }) => {
    const component = await mount(<RosaHcpWizardValidationMount />);

    await component.getByRole('button', { name: FOOTER_NEXT }).click();

    await expect(
      component.getByRole('button', { name: wizardNavStepErrorButtonName(w.stepLabels.details) })
    ).toBeVisible();
  });

  test('sets the Basic setup parent nav step status to error when a child step fails validation', async ({
    mount,
  }) => {
    const component = await mount(<RosaHcpWizardValidationMount />);

    await component.getByRole('button', { name: FOOTER_NEXT }).click();

    await expect(
      component.getByRole('button', { name: wizardNavStepErrorButtonName(w.stepLabels.basicSetup) })
    ).toBeVisible();
  });

  test('clears the Details nav step error status when the step becomes valid', async ({
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
    await expect(
      component.getByRole('button', { name: wizardNavStepErrorButtonName(w.stepLabels.details) })
    ).toBeVisible();

    await component.getByRole('textbox', { name: /Cluster name/i }).fill('mycluster');

    await expect(
      component.getByRole('button', { name: wizardNavStepErrorButtonName(w.stepLabels.details) })
    ).not.toBeVisible();
    await expect(
      component.getByRole('button', { name: wizardNavStepErrorButtonName(w.stepLabels.basicSetup) })
    ).not.toBeVisible();
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

  test('does not show the validation alert on Details after Roles Next failed and the user navigates back', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount
        defaultValues={VALID_DETAILS_FORM_VALUES}
        initialStepId={STEP_IDS.ROLES_AND_POLICIES}
        initialVisitedStepIds={ROSA_HCP_FOOTER_CT_VISITED_THROUGH_ROLES}
      />
    );

    await expect(component.getByText(rp.accountRolesSection, { exact: true })).toBeVisible();
    await component.getByRole('button', { name: FOOTER_NEXT }).click();
    await expect(component.getByRole('heading', validationAlertHeading)).toBeVisible();

    await component.getByRole('button', { name: w.stepLabels.details, exact: true }).click();

    await expect(component.getByRole('heading', validationAlertHeading)).not.toBeVisible();
  });
});

test.describe('RosaHcpWizardFooter — Skip to review', () => {
  test('does not show Skip to review on the Details step', async ({ mount }) => {
    const component = await mount(<RosaHcpWizardValidationMount />);
    await expect(component.getByRole('button', { name: SKIP_TO_REVIEW })).not.toBeVisible();
  });

  test('shows Skip to review on an Additional setup step', async ({ mount }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount
        initialStepId={STEP_IDS.ENCRYPTION}
        initialVisitedStepIds={ROSA_HCP_FOOTER_CT_VISITED_THROUGH_ENCRYPTION}
      />
    );

    await expect(component.getByText(encryption.sectionLabel, { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: SKIP_TO_REVIEW })).toBeVisible();
  });

  test('shows the validation alert and stays on the step when Skip to review is pressed with invalid fields', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount
        initialStepId={STEP_IDS.ENCRYPTION}
        initialVisitedStepIds={ROSA_HCP_FOOTER_CT_VISITED_THROUGH_ENCRYPTION}
      />
    );

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
      <RosaHcpWizardValidationMount
        initialStepId={STEP_IDS.ENCRYPTION}
        initialVisitedStepIds={ROSA_HCP_FOOTER_CT_VISITED_THROUGH_ENCRYPTION}
      />
    );

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
      <RosaHcpWizardValidationMount
        defaultValues={VALID_DETAILS_FORM_VALUES}
        initialStepId={STEP_IDS.ENCRYPTION}
        initialVisitedStepIds={ROSA_HCP_FOOTER_CT_VISITED_THROUGH_ENCRYPTION}
      />
    );

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
    const encryptionNav = component.getByRole('button', {
      name: w.stepLabels.encryptionOptional,
      exact: true,
    });
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
      <RosaHcpWizardValidationMount
        initialStepId={STEP_IDS.ENCRYPTION}
        initialVisitedStepIds={ROSA_HCP_FOOTER_CT_VISITED_THROUGH_ENCRYPTION}
      />
    );

    await component.getByRole('button', { name: SKIP_TO_REVIEW }).click();

    await expect(component.getByText(review.sectionLabel, { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: SKIP_TO_REVIEW })).not.toBeVisible();
  });
});

test.describe('RosaHcpWizardFooter — Review Submit validation alert', () => {
  test('shows the validation alert on Review after a failed Submit with an invalid cluster name', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaHcpWizardValidationMount
        defaultValues={{
          ...VALID_REVIEW_SUBMIT_FORM_VALUES,
          name: '',
        }}
        initialStepId={STEP_IDS.REVIEW}
        initialVisitedStepIds={ROSA_HCP_FOOTER_CT_VISITED_THROUGH_REVIEW}
      />
    );

    await expect(component.getByText(review.sectionLabel, { exact: true })).toBeVisible();
    await component.getByRole('button', { name: FOOTER_SUBMIT }).click();
    await expect(component.getByRole('heading', validationAlertHeading)).toBeVisible();
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
        initialStepId={STEP_IDS.REVIEW}
        initialVisitedStepIds={ROSA_HCP_FOOTER_CT_VISITED_THROUGH_REVIEW}
      />
    );

    await component.getByRole('button', { name: FOOTER_SUBMIT }).click();
    await expect(component.getByRole('heading', validationAlertHeading)).toBeVisible();

    await component.getByRole('button', { name: review.editStep }).nth(1).click();
    await expect(component.getByText(rp.accountRolesSection, { exact: true })).toBeVisible();

    await component.locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle').click();
    await page.getByRole('option', { name: INSTALLER_ROLE_LABEL }).click();
    await component.locator('#byo_oidc_config_id-form-group .pf-v6-c-menu-toggle').click();
    await page.getByRole('option', { name: fixtures.mockOicdConfig[0].label }).click();

    await expect(component.getByRole('heading', validationAlertHeading)).not.toBeVisible();
  });
});
