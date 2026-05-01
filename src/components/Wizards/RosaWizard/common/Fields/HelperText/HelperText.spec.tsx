import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';

import { HelperText } from './HelperText';
import { getValidated, helperTextId } from './helperTextUtils';

test.describe('HelperText', () => {
  test('renders helper text when provided', async ({ mount }) => {
    const mounted = await mount(
      <HelperText id="f1" helperText="Choose a value that fits your workload." />
    );
    await expect(mounted.getByText('Choose a value that fits your workload.')).toBeVisible();
  });

  test('renders error message when isError and errorMessage are set', async ({ mount }) => {
    const mounted = await mount(
      <HelperText id="f2" isError errorMessage="This field is required." />
    );
    await expect(mounted.getByText('This field is required.')).toBeVisible();
  });

  test('renders nothing when there is no helper text and no error to show', async ({ mount }) => {
    const mounted = await mount(
      <div>
        <span data-testid="anchor">above</span>
        <HelperText id="f3" />
      </div>
    );
    await expect(mounted.getByTestId('anchor')).toBeVisible();
    await expect(mounted.locator('#f3-helper-text')).toHaveCount(0);
  });

  test('renders success message when isSuccess and successMessage are set', async ({ mount }) => {
    const mounted = await mount(
      <HelperText id="f4" isSuccess successMessage="Saved successfully." />
    );
    await expect(mounted.getByText('Saved successfully.')).toBeVisible();
    await expect(mounted.locator('#f4-helper-text')).toBeVisible();
  });
});

test.describe('getValidated', () => {
  test('returns error when isError is true', () => {
    expect(getValidated(true, false)).toBe('error');
  });

  test('returns success when isSuccess is true and not error', () => {
    expect(getValidated(false, true)).toBe('success');
  });

  test('returns undefined when neither error nor success', () => {
    expect(getValidated(false, false)).toBeUndefined();
    expect(getValidated(undefined, undefined)).toBeUndefined();
  });
});

test.describe('helperTextId', () => {
  test('returns id fragment when isError and errorMessage, helper text, or isSuccess and successMessage', () => {
    expect(helperTextId({ id: 'x', isError: true, errorMessage: 'err' })).toBe('x-helper-text');
    expect(helperTextId({ id: 'x', helperText: 'hint' })).toBe('x-helper-text');
    expect(helperTextId({ id: 'x', isSuccess: true, successMessage: 'ok' })).toBe('x-helper-text');
  });

  test('returns empty string when no helper content to show', () => {
    expect(helperTextId({ id: 'x' })).toBe('');
    expect(helperTextId({ id: 'x', errorMessage: 'err' })).toBe('');
    expect(helperTextId({ id: 'x', isError: true })).toBe('');
    expect(helperTextId({ id: 'x', successMessage: 'ok' })).toBe('');
    expect(helperTextId({ id: 'x', isSuccess: true })).toBe('');
  });
});
