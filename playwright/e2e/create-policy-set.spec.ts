// Copyright Contributors to the Open Cluster Management project
import { test, expect } from '@playwright/test';
import YAML from 'yaml';

const PlacementBindingType = {
  apiVersion: 'policy.open-cluster-management.io/v1',
  kind: 'PlacementBinding',
};

const PlacementRuleType = {
  apiVersion: 'apps.open-cluster-management.io/v1',
  kind: 'PlacementRule',
};

const PlacementRuleApiGroup = 'apps.open-cluster-management.io';
const PlacementRuleKind = 'PlacementRule';

const PolicySetType = {
  apiVersion: 'policy.open-cluster-management.io/v1beta1',
  kind: 'PolicySet',
};

const PolicySetApiGroup = 'policy.open-cluster-management.io';
const PolicySetKind = 'PolicySet';

test.describe('create policy set', () => {
  test('complete create policy set workflow', async ({ page }) => {
    // Navigate and setup
    await page.goto('http://localhost:3000/wizards/?route=create-policy-set');
    await page.locator('#nav-toggle').click();
    await page.locator('#yaml-switch').click({ force: true });

    // Details
    await page.locator('#name').fill('my-policy-set', { delay: 200 });
    await page.locator('#namespace').click();
    await page.locator('#my-namespace-1').click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Policies - check all policies
    await page.locator('#policies').getByRole('checkbox', { name: 'Select all' }).check();
    await page.getByRole('button', { name: 'Next' }).click();

    // Placement
    await page.locator('#add-button').click();
    const labelExpressions = page.locator('#label-expressions');
    await labelExpressions.locator('#key').click();
    await page.locator('#region').click();
    // Note: multiselect might need special handling - for now assuming it works similarly
    await labelExpressions.locator('#values').click();
    await page.locator('#us-east-1').click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Review
    const expected = [
      {
        ...PolicySetType,
        metadata: { name: 'my-policy-set', namespace: 'my-namespace-1' },
        spec: { description: '', policies: ['my-policy-1', 'my-policy-2'] },
      },
      {
        ...PlacementRuleType,
        metadata: {
          name: 'my-policy-set-placement',
          namespace: 'my-namespace-1',
        },
        spec: {
          clusterSelector: {
            matchExpressions: [
              { key: 'region', operator: 'In', values: ['us-east-1'] },
            ],
          },
          clusterConditions: [],
        },
      },
      {
        ...PlacementBindingType,
        metadata: {
          name: 'my-policy-set-placement',
          namespace: 'my-namespace-1',
        },
        placementRef: {
          apiGroup: PlacementRuleApiGroup,
          kind: PlacementRuleKind,
          name: 'my-policy-set-placement',
        },
        subjects: [
          {
            apiGroup: PolicySetApiGroup,
            kind: PolicySetKind,
            name: 'my-policy-set',
          },
        ],
      },
    ];

    const yaml = expected.map((doc) => YAML.stringify(doc)).join('---\n');
    await expect(page.locator('#yaml-editor')).toHaveText(yaml);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });
});

