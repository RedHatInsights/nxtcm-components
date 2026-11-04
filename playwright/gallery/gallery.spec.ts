import { expect, test } from '../ct-fixture';
import type {
  CallbackGalleryStory,
  StatefulGalleryStory,
  ThrowingGalleryStory,
} from './fixtures.story';

const statefulStory = 'gallery/fixtures/StatefulGalleryStory';

test('mounts a gallery story by exact ID', async ({ mount }) => {
  const component = await mount<typeof StatefulGalleryStory>(statefulStory, { label: 'Clicks' });
  await expect(component.getByRole('button', { name: 'Clicks: 0' })).toBeVisible();
});

test('updates story props while preserving React state', async ({ mount }) => {
  const component = await mount<typeof StatefulGalleryStory>(statefulStory, { label: 'Clicks' });
  await component.getByRole('button').click();
  await component.update({ label: 'Updated' });
  await expect(component.getByRole('button', { name: 'Updated: 1' })).toBeVisible();
});

test('unmounts the active gallery story', async ({ mount }) => {
  const component = await mount<typeof StatefulGalleryStory>(statefulStory);
  await component.unmount();
  await expect(component.getByRole('button')).toHaveCount(0);
});

test('records story callbacks entirely in the browser', async ({ mount }) => {
  const component = await mount<typeof CallbackGalleryStory>(
    'gallery/fixtures/CallbackGalleryStory'
  );
  await component.getByRole('button', { name: 'Invoke callback' }).click();
  await expect(component.getByTestId('action')).toHaveValue('browser-value');
});

test('rejects invalid gallery story IDs and render failures', async ({ mount }) => {
  await expect(mount('gallery/missing/Unknown')).rejects.toThrow(/Unknown story ID/);
  await expect(mount('gallery/fixtures/NonComponentExport')).rejects.toThrow(
    /does not identify a component function export/
  );
  await expect(
    mount<typeof ThrowingGalleryStory>('gallery/fixtures/ThrowingGalleryStory')
  ).rejects.toThrow(/Failed to render story .*intentional gallery render failure/);
});
