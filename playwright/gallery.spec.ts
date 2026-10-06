import { expect, storyCallback, storyCallbackCalls, test } from '../ct-fixture';

const statefulStory = 'nxtcm-dashboard/playwrightGallery/StatefulGalleryStory';

test('mounts a gallery story by exact ID', async ({ mount }) => {
  const component = await mount(statefulStory, { label: 'Clicks' });
  await expect(component.getByRole('button', { name: 'Clicks: 0' })).toBeVisible();
});

test('updates story props while preserving React state', async ({ mount }) => {
  const component = await mount(statefulStory, { label: 'Clicks' });
  await component.getByRole('button').click();
  await component.update({ label: 'Updated' });
  await expect(component.getByRole('button', { name: 'Updated: 1' })).toBeVisible();
});

test('unmounts the active gallery story', async ({ mount }) => {
  const component = await mount(statefulStory);
  await component.unmount();
  await expect(component.getByRole('button')).toHaveCount(0);
});

test('records story callbacks entirely in the browser', async ({ mount, page }) => {
  const component = await mount('nxtcm-dashboard/playwrightGallery/CallbackGalleryStory', {
    onAction: storyCallback('action'),
  });
  await component.getByRole('button', { name: 'Invoke callback' }).click();
  await expect.poll(() => storyCallbackCalls(page, 'action')).toEqual([['browser-value']]);
});

test('rejects invalid gallery story IDs and render failures', async ({ mount }) => {
  await expect(mount('nxtcm-dashboard/missing/Unknown')).rejects.toThrow(/Unknown story ID/);
  await expect(mount('nxtcm-dashboard/playwrightGallery/NonComponentExport')).rejects.toThrow(
    /does not identify a component function export/
  );
  await expect(mount('nxtcm-dashboard/playwrightGallery/ThrowingGalleryStory')).rejects.toThrow(
    /Failed to render story .*intentional gallery render failure/
  );
});
