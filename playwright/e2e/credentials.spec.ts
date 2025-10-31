// Copyright Contributors to the Open Cluster Management project
import { test, expect } from '@playwright/test';
import YAML from 'yaml';

test.describe('credentials wizard - aws', () => {
  test('complete aws credentials workflow', async ({ page }) => {
    // Navigate and setup
    await page.goto('http://localhost:3000/wizards/?route=credentials');
    await page.locator('#nav-toggle').click();
    await page.locator('#yaml-switch').click({ force: true });
    await expect(page.locator('h1')).toContainText('Add credentials');

    // Credential type
    await page.getByRole('heading', { name: 'Amazon Web Services' }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Basic information
    await page.locator('#name').fill('my-credentials');
    await page.locator('#namespace').click();
    await page.locator('#default').click();
    await page.locator('#base-domain').fill('my-base-domain');
    await page.getByRole('button', { name: 'Next' }).click();

    // Amazon web services
    const awsSection = page.locator('section#amazon-web-services');
    await awsSection.locator('#aws-key-id').fill('my-key-id');
    await awsSection.locator('#aws-access-key').fill('my-access-key');
    await page.getByRole('button', { name: 'Next' }).click();

    // Proxy
    const proxySection = page.locator('section#proxy');
    await proxySection.locator('#http-proxy').fill('my-http-proxy');
    await proxySection.locator('#https-proxy').fill('my-https-proxy');
    await proxySection.locator('#no-proxy').fill('my-no-proxy');
    await proxySection.locator('#trust-bundle').fill('my-trust-bundle');
    await page.getByRole('button', { name: 'Next' }).click();

    // Pull secret and SSH
    const pullSecretSection = page.locator('section#pull-secret-and-ssh');
    await pullSecretSection.locator('#pull-secret').fill('my-pull-secret');
    await pullSecretSection.locator('#ssh-private-key').fill('my-ssh-private');
    await pullSecretSection.locator('#ssh-public-key').fill('my-ssh-public');
    await page.getByRole('button', { name: 'Next' }).click();

    // Review
    const expected = {
      apiVersion: 'v1',
      kind: 'Secret',
      type: 'Opaque',
      metadata: {
        name: 'my-credentials',
        namespace: 'default',
        labels: {
          'cluster.open-cluster-management.io/credentials': '',
          'cluster.open-cluster-management.io/type': 'aws',
        },
      },
      stringData: {
        baseDomain: 'my-base-domain',
        aws_access_key_id: 'my-key-id',
        aws_secret_access_key: 'my-access-key',
        httpProxy: 'my-http-proxy',
        httpsProxy: 'my-https-proxy',
        noProxy: 'my-no-proxy',
        additionalTrustBundle: 'my-trust-bundle',
        pullSecret: 'my-pull-secret',
        'ssh-privatekey': 'my-ssh-private',
        'ssh-publickey': 'my-ssh-public',
      },
    };

    const yaml = YAML.stringify(expected);
    await expect(page.locator('#yaml-editor')).toHaveText(yaml);
  });
});

