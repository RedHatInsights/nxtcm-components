// Copyright Contributors to the Open Cluster Management project
import { test, expect } from '@playwright/test';
import YAML from 'yaml';

const PolicyAutomationType = {
  apiVersion: 'policy.open-cluster-management.io/v1beta1',
  kind: 'PolicyAutomation',
};

test.describe('edit policy automation', () => {
  test('complete edit policy automation workflow', async ({ page }) => {
    // Navigate and setup
    await page.goto('http://localhost:3000/wizards/?route=edit-policy-automation');
    await page.locator('#nav-toggle').click();
    await page.locator('#yaml-switch').click({ force: true });

    // Jobs
    await page.getByRole('combobox', { name: 'Select the ansible job' }).click();
    await page.locator('#job2').click();

    // Schedule/Mode - Once
    await page.getByRole('combobox', { name: 'Select the schedule' }).click();
    await page.locator('#Once').click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Review - Once mode
    const expectedOnce = [
      {
        ...PolicyAutomationType,
        metadata: {
          name: 'my-policy-policy-automation',
          namespace: 'my-namespace',
        },
        spec: {
          policyRef: 'my-policy',
          mode: 'once',
          automationDef: {
            name: 'job2',
            secret: 'my-ansible-creds',
            type: 'AnsibleJob',
          },
        },
      },
    ];

    const yamlOnce = expectedOnce.map((doc) => YAML.stringify(doc)).join('---\n');
    await expect(page.locator('#yaml-editor')).toHaveText(yamlOnce);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Back' })).toBeEnabled();
    await page.getByRole('button', { name: 'Back' }).click();

    // Schedule/Mode - EveryEvent
    await page.getByRole('combobox', { name: 'Select the schedule' }).click();
    await page.locator('#EveryEvent').click();
    
    const delayFormGroup = page.locator('#spec-delayafterrunseconds-form-group');
    await delayFormGroup.getByLabel('Plus').click();
    await delayFormGroup.getByLabel('Plus').click();
    await delayFormGroup.getByLabel('Plus').click();
    await delayFormGroup.getByLabel('Minus').click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Review - EveryEvent mode
    const expectedEveryEvent = [
      {
        ...PolicyAutomationType,
        metadata: {
          name: 'my-policy-policy-automation',
          namespace: 'my-namespace',
        },
        spec: {
          policyRef: 'my-policy',
          mode: 'everyEvent',
          automationDef: {
            name: 'job2',
            secret: 'my-ansible-creds',
            type: 'AnsibleJob',
          },
          delayAfterRunSeconds: 2,
        },
      },
    ];

    const yamlEveryEvent = expectedEveryEvent.map((doc) => YAML.stringify(doc)).join('---\n');
    await expect(page.locator('#yaml-editor')).toHaveText(yamlEveryEvent);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });
});

