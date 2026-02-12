import { test, expect } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../../../test-helpers';
import { NetworkingSubStepStory } from './NetworkingAndSubnetsSubStep.story';

test.describe('NetworkingAndSubnetsSubStep', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);
    await checkAccessibility({ component });
  });

  test('should render Networking section with radio options', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    await expect(component.getByText('Networking', { exact: true })).toBeVisible();
    await expect(component.getByRole('radio', { name: 'Public' })).toBeVisible();
    await expect(component.getByRole('radio', { name: 'Private' })).toBeVisible();
  });

  test('should have Private radio option clickable', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    const privateRadio = component.getByRole('radio', { name: 'Private' });
    await expect(privateRadio).toBeVisible();
    await expect(privateRadio).toBeEnabled();
    await privateRadio.click();
  });
});
