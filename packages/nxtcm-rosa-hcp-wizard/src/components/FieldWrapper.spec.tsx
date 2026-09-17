import { test, expect } from '../../../../ct-fixture';
import { type FieldWrapperSize } from './FieldWrapper';

test.describe('FieldWrapper', () => {
  test('renders field content', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/FieldWrapper/FieldWrapperStory',
      { variant: 'field' }
    );

    await expect(component.getByText('Cluster name')).toBeVisible();
  });

  test('renders additional content below the field', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/FieldWrapper/FieldWrapperStory',
      { variant: 'additional' }
    );

    await expect(component.getByText('Field label')).toBeVisible();
    await expect(component.getByRole('link', { name: 'Learn more' })).toBeVisible();
  });

  for (const { size, multiplier } of [
    { size: 'sm' as const, multiplier: 20 },
    { size: 'md' as const, multiplier: 30 },
    { size: 'lg' as const, multiplier: 40 },
  ] satisfies Array<{ size: Exclude<FieldWrapperSize, 'full'>; multiplier: number }>) {
    test(`constrains ${size} field max-width with PatternFly spacer tokens`, async ({
      mount,
      page,
    }) => {
      await mount('nxtcm-rosa-hcp-wizard/components/FieldWrapper/FieldWrapperStory', {
        variant: 'sized',
        size,
      });

      const wrapper = page.getByTestId('rosa-hcp-field-wrapper');
      await expect(page.getByText('Sized field')).toBeVisible();
      await expect(wrapper).toHaveClass(new RegExp(`rosa-hcp-field-wrapper--${size}`));

      const expectedMaxWidth = await wrapper.evaluate((el, tokenMultiplier) => {
        const probe = document.createElement('div');
        probe.style.width = `calc(var(--pf-t--global--spacer--md) * ${tokenMultiplier})`;
        el.appendChild(probe);
        const width = getComputedStyle(probe).width;
        probe.remove();
        return width;
      }, multiplier);

      await expect(wrapper).toHaveCSS('max-width', expectedMaxWidth);
    });
  }

  test('renders full-width blocks alongside fields', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/FieldWrapper/FieldWrapperStory',
      { variant: 'full' }
    );

    await expect(component.getByText('Intro copy')).toBeVisible();
    await expect(component.getByText('Field label')).toBeVisible();
  });
});
