// Copyright Contributors to the Open Cluster Management project
import { test, expect } from '@playwright/test';
import YAML from 'yaml';

const PlacementType = {
  apiVersion: 'cluster.open-cluster-management.io/v1beta1',
  kind: 'Placement',
};

const PlacementApiGroup = 'cluster.open-cluster-management.io';
const PlacementKind = 'Placement';

const PlacementBindingType = {
  apiVersion: 'policy.open-cluster-management.io/v1',
  kind: 'PlacementBinding',
};

const PolicySetType = {
  apiVersion: 'policy.open-cluster-management.io/v1beta1',
  kind: 'PolicySet',
};

const PolicySetApiGroup = 'policy.open-cluster-management.io';
const PolicySetKind = 'PolicySet';

test.describe('edit policy set', () => {
  test('complete edit policy set workflow', async ({ page }) => {
    // Navigate and setup
    await page.goto('http://localhost:3000/wizards/?route=edit-policy-set-1');
    await page.locator('#nav-toggle').click();
    await page.locator('#yaml-switch').click({ force: true });

    // Details
    await expect(page.getByRole('textbox', { name: 'Name Name *' })).toHaveAttribute('readonly');
    await page.getByRole('button', { name: 'Next' }).click();

    // Policies - check all policies
    await page.locator('#policies').getByRole('checkbox', { name: 'Select all' }).check();
    await page.getByRole('button', { name: 'Next' }).click();

    // Placement
    await page.getByRole('button', { name: 'Next' }).click();

    // Review
    const expected = [
      {
        ...PolicySetType,
        metadata: {
          name: 'my-policy-set',
          namespace: 'my-namespace-1',
          uid: '00000000-0000-0000-0000-000000000000',
        },
        spec: { policies: ['my-policy-1', 'my-policy-2', 'my-policy-1000'] },
      },
      {
        ...PlacementType,
        metadata: {
          name: 'my-policy-set-placement-1',
          namespace: 'my-namespace-1',
          uid: '00000000-0000-0000-0000-000000000000',
        },
        spec: {
          clusterSets: ['my-cluster-set-1'],
          predicates: [
            {
              requiredClusterSelector: {
                labelSelector: {
                  matchExpressions: [
                    { key: 'cloud', operator: 'In', values: ['Microsoft'] },
                    { key: 'vendor', operator: 'In', values: ['OpenShift'] },
                    { key: 'region', operator: 'In', values: ['east', 'west'] },
                    {
                      key: 'environment',
                      operator: 'NotIn',
                      values: ['Production'],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        ...PlacementBindingType,
        metadata: {
          name: 'my-policy-set-placement-1-binding',
          namespace: 'my-namespace-1',
          uid: '00000000-0000-0000-0000-000000000000',
        },
        placementRef: {
          apiGroup: PlacementApiGroup,
          kind: PlacementKind,
          name: 'my-policy-set-placement-1',
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

