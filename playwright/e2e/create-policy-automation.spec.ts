// Copyright Contributors to the Open Cluster Management project
import { test, expect } from '@playwright/test';
import YAML from 'yaml';

const PolicyAutomationType = {
  apiVersion: 'policy.open-cluster-management.io/v1beta1',
  kind: 'PolicyAutomation',
};

test.describe('create policy automation', () => {
  test('complete create policy automation workflow', async ({ page }) => {
    // Navigate and setup
    await page.goto('http://localhost:3000/wizards/?route=create-policy-automation');
    await page.locator('#nav-toggle').click();
    await page.locator('#yaml-switch').click({ force: true });

    // Credentials
    await page.getByRole('combobox', { name: 'Select the ansible credential' }).click();
    await page.locator('#my-ansible-creds').click();

    // Jobs
    await page.getByRole('combobox', { name: 'Select the ansible job' }).click();
    await page.locator('#job1').click();

    // Extra vars
    await page.locator('#add-button').click();
    await page.locator('#key-1').fill('abc');
    await page.locator('#value-1').fill('123');

    // Schedule/Mode
    await page.getByRole('combobox', { name: 'Select the schedule' }).click();
    await page.locator('#Disabled').click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Review
    const expected = [
      {
        ...PolicyAutomationType,
        metadata: {
          name: 'my-policy-policy-automation',
          namespace: 'my-namespace',
        },
        spec: {
          policyRef: 'my-policy',
          mode: 'disabled',
          automationDef: {
            name: 'job1',
            secret: 'my-ansible-creds',
            type: 'AnsibleJob',
            extra_vars: {
              abc: '123',
            },
          },
        },
      },
    ];

    const yaml = expected.map((doc) => YAML.stringify(doc)).join('---\n');
    await expect(page.locator('#yaml-editor')).toHaveText(yaml);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });
});

