import { expect } from '@playwright/test';

import { test } from '@/playwright/ct-fixture';
import { displayChecks, type DisplayView } from '@/playwright/display-a11y-matrix';

import type { DetailsStepDrawerMount } from './components/DetailsStepDrawer/DetailsStepDrawer.story';
import type { CheckboxErrorStory } from './components/Fields/Checkbox/Checkbox.story';
import type { TwoRadioHarness } from './components/Fields/Radio/Radio.story';
import type { WizSelectSubmitValidationHarness } from './components/WizFields/WizSelect/WizSelect.story';
import { WIZ_SELECT_SUBMIT_ERROR } from './components/WizFields/WizSelect/WizSelect.story-data';
import type { WizTextInputSubmitValidationHarness } from './components/WizFields/WizTextInput/WizTextInput.story';
import { WIZ_TEXT_INPUT_SUBMIT_ERROR } from './components/WizFields/WizTextInput/WizTextInput.story-data';
import type { RosaWizardSubmitErrorMount } from './RosaWizardSubmitError/RosaWizardSubmitError.story';
import type { ExpandedReviewSection } from './Steps/Review/ReviewExpandSection.story';

const views: DisplayView[] = [
  {
    name: 'Text input with a validation error',
    mount: (mount) =>
      mount<typeof WizTextInputSubmitValidationHarness>(
        'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputSubmitValidationHarness'
      ),
    prepare: async (component) => {
      await component.getByRole('button', { name: 'Submit', exact: true }).click();
    },
    textEquivalents: [WIZ_TEXT_INPUT_SUBMIT_ERROR],
    control: (component) => component.getByRole('textbox', { name: /Notes/ }),
  },
  {
    name: 'Select with a validation error',
    mount: (mount) =>
      mount<typeof WizSelectSubmitValidationHarness>(
        'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectSubmitValidationHarness'
      ),
    prepare: async (component) => {
      await component.getByRole('button', { name: 'Submit', exact: true }).click();
    },
    textEquivalents: [WIZ_SELECT_SUBMIT_ERROR],
    control: (component) => component.getByRole('button', { name: /Region/ }),
  },
  {
    // WizSelect hides its validation message while the menu is open.
    name: 'Select with an open menu',
    mount: (mount) =>
      mount<typeof WizSelectSubmitValidationHarness>(
        'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectSubmitValidationHarness'
      ),
    prepare: async (component, page) => {
      await component.getByRole('button', { name: /Region/ }).click();
      await page.getByRole('option', { name: 'us-east-1' }).waitFor();
    },
    textEquivalents: ['us-east-1', 'eu-west-1'],
    control: (_component, page) => page.getByRole('option', { name: 'eu-west-1' }),
  },
  {
    name: 'Checkbox with a validation error',
    mount: (mount) =>
      mount<typeof CheckboxErrorStory>(
        'nxtcm-rosa-hcp-wizard/components/Fields/Checkbox/Checkbox/CheckboxErrorStory'
      ),
    textEquivalents: ['You must accept to continue.'],
    control: (component) => component.getByRole('checkbox', { name: 'I agree' }),
  },
  {
    name: 'Radio group with a selected option',
    mount: (mount) =>
      mount<typeof TwoRadioHarness>(
        'nxtcm-rosa-hcp-wizard/components/Fields/Radio/Radio/TwoRadioHarness'
      ),
    textEquivalents: ['US East'],
    control: (component) => component.getByRole('radio', { name: 'US East' }),
    forcedColorsCheck: async (component) => {
      const selected = component.getByRole('radio', { name: 'US East' });
      const unselected = component.getByRole('radio', { name: 'US West' });
      await expect(selected).toBeChecked();
      await expect(unselected).not.toBeChecked();
      await selected.focus();
      const checkedImage = await selected.screenshot();
      await selected.evaluate((element) => {
        (element as HTMLInputElement).checked = false;
      });
      const uncheckedImage = await selected.screenshot();
      if (checkedImage.equals(uncheckedImage)) {
        throw new Error('The selected radio did not change appearance when unchecked.');
      }
    },
  },
  {
    name: 'Details drawer',
    mount: (mount) =>
      mount<typeof DetailsStepDrawerMount>(
        'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
        { initiallyExpanded: true }
      ),
    textEquivalents: [/how to associate a new aws account/i],
    control: (component) => component.getByRole('button', { name: /close drawer panel/i }),
  },
  {
    name: 'Expanded review section',
    mount: (mount) =>
      mount<typeof ExpandedReviewSection>(
        'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewExpandSection/ExpandedReviewSection'
      ),
    textEquivalents: ['subnet-a and subnet-b'],
    control: (component) => component.getByRole('button', { name: /Networking summary/ }),
  },
  {
    name: 'Submit error alert',
    mount: (mount) =>
      mount<typeof RosaWizardSubmitErrorMount>(
        'nxtcm-rosa-hcp-wizard/RosaWizardSubmitError/RosaWizardSubmitError/RosaWizardSubmitErrorMount',
        {
          onSubmitError: 'There has been an error creating the cluster',
          isNavigatingToReview: false,
        }
      ),
    textEquivalents: ['There has been an error creating the cluster'],
  },
];

for (const view of views) {
  test.describe(`${view.name} display settings`, () => {
    for (const [title, expectDisplay] of Object.entries(displayChecks)) {
      test(title, ({ mount, page }) => expectDisplay(view, mount, page));
    }
  });
}
