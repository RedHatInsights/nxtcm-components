// Copyright Contributors to the Open Cluster Management project
import { test, expect } from '@playwright/test';
import YAML from 'yaml';
test.describe('ansible wizard', () => {
  test('complete ansible automation workflow', async ({ page }) => {
    // Navigate and setup
    await page.goto('http://localhost:3000/wizards/?route=ansible');
    await page.locator('#nav-toggle').click();
    await page.locator('#yaml-switch').click({ force: true });
    await expect(page.locator('h1')).toContainText('Create Ansible automation');

    // Details step
    await page.locator('#name').fill('my-template');
    await page.locator('#namespace').click();
    await page.locator('#default').click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Install step
    await page.locator('#install-secret').click();
    await page.locator('#my-inst-creds').click();

    // Install prehooks
    const installPrehooks = page.locator('#install-prehooks');
    await installPrehooks.locator('#add-button').click();

    const installPrehook1 = page.locator('#install-prehooks-1');
    await installPrehook1.locator('#name').fill('pre-inst-1');
    const prehook1ExtraVars = installPrehook1.locator('#extra_vars');
    await prehook1ExtraVars.locator('#add-button').click();
    await prehook1ExtraVars.locator('#key-1').fill('pre-inst-1-var-1');
    await prehook1ExtraVars.locator('#value-1').fill('pre-inst-1-val-1');
    await prehook1ExtraVars.locator('#add-button').click();
    await prehook1ExtraVars.locator('#key-2').fill('pre-inst-1-var-2');
    await prehook1ExtraVars.locator('#value-2').fill('pre-inst-1-val-2');
    await installPrehook1.getByRole('button', { name: 'Details' }).click();

    await installPrehooks.locator('#add-button').last().click();

    const installPrehook2 = page.locator('#install-prehooks-2');
    await installPrehook2.locator('#name').fill('pre-inst-2');
    const prehook2ExtraVars = installPrehook2.locator('#extra_vars');
    await prehook2ExtraVars.locator('#add-button').click();
    await prehook2ExtraVars.locator('#key-1').fill('pre-inst-2-var-1');
    await prehook2ExtraVars.locator('#value-1').fill('pre-inst-2-val-1');
    await prehook2ExtraVars.locator('#add-button').click();
    await prehook2ExtraVars.locator('#key-2').fill('pre-inst-2-var-2');
    await prehook2ExtraVars.locator('#value-2').fill('pre-inst-2-val-2');
    await installPrehook2.getByRole('button', { name: 'Details' }).click();

    // Install posthooks
    const installPosthooks = page.locator('#install-posthooks');
    await installPosthooks.locator('#add-button').click();

    const installPosthook1 = page.locator('#install-posthooks-1');
    await installPosthook1.locator('#name').fill('post-inst-1');
    const posthook1ExtraVars = installPosthook1.locator('#extra_vars');
    await posthook1ExtraVars.locator('#add-button').click();
    await posthook1ExtraVars.locator('#key-1').fill('post-inst-1-var-1');
    await posthook1ExtraVars.locator('#value-1').fill('post-inst-1-val-1');
    await posthook1ExtraVars.locator('#add-button').click();
    await posthook1ExtraVars.locator('#key-2').fill('post-inst-1-var-2');
    await posthook1ExtraVars.locator('#value-2').fill('post-inst-1-val-2');
    await installPosthook1.getByRole('button', { name: 'Details' }).click();

    await installPosthooks.locator('#add-button').last().click();

    const installPosthook2 = page.locator('#install-posthooks-2');
    await installPosthook2.locator('#name').fill('post-inst-2');
    const posthook2ExtraVars = installPosthook2.locator('#extra_vars');
    await posthook2ExtraVars.locator('#add-button').click();
    await posthook2ExtraVars.locator('#key-1').fill('post-inst-2-var-1');
    await posthook2ExtraVars.locator('#value-1').fill('post-inst-2-val-1');
    await posthook2ExtraVars.locator('#add-button').click();
    await posthook2ExtraVars.locator('#key-2').fill('post-inst-2-var-2');
    await posthook2ExtraVars.locator('#value-2').fill('post-inst-2-val-2');
    await installPosthook2.getByRole('button', { name: 'Details' }).click();

    await page.getByRole('button', { name: 'Next' }).click();

    // Upgrade step
    await page.locator('#upgrade-secret').click();
    await page.locator('#my-up-creds').click();

    // Upgrade prehooks
    const upgradePrehooks = page.locator('#upgrade-prehooks');
    await upgradePrehooks.locator('#add-button').click();

    const upgradePrehook1 = page.locator('#upgrade-prehooks-1');
    await upgradePrehook1.locator('#name').fill('pre-up-1');
    const upPrehook1ExtraVars = upgradePrehook1.locator('#extra_vars');
    await upPrehook1ExtraVars.locator('#add-button').click();
    await upPrehook1ExtraVars.locator('#key-1').fill('pre-up-1-var-1');
    await upPrehook1ExtraVars.locator('#value-1').fill('pre-up-1-val-1');
    await upPrehook1ExtraVars.locator('#add-button').click();
    await upPrehook1ExtraVars.locator('#key-2').fill('pre-up-1-var-2');
    await upPrehook1ExtraVars.locator('#value-2').fill('pre-up-1-val-2');
    await upgradePrehook1.getByRole('button', { name: 'Details' }).click();

    await upgradePrehooks.locator('#add-button').last().click();

    const upgradePrehook2 = page.locator('#upgrade-prehooks-2');
    await upgradePrehook2.locator('#name').fill('pre-up-2');
    const upPrehook2ExtraVars = upgradePrehook2.locator('#extra_vars');
    await upPrehook2ExtraVars.locator('#add-button').click();
    await upPrehook2ExtraVars.locator('#key-1').fill('pre-up-2-var-1');
    await upPrehook2ExtraVars.locator('#value-1').fill('pre-up-2-val-1');
    await upPrehook2ExtraVars.locator('#add-button').click();
    await upPrehook2ExtraVars.locator('#key-2').fill('pre-up-2-var-2');
    await upPrehook2ExtraVars.locator('#value-2').fill('pre-up-2-val-2');
    await upgradePrehook2.getByRole('button', { name: 'Details' }).click();

    // Upgrade posthooks
    const upgradePosthooks = page.locator('#upgrade-posthooks');
    await upgradePosthooks.locator('#add-button').click();

    const upgradePosthook1 = page.locator('#upgrade-posthooks-1');
    await upgradePosthook1.locator('#name').fill('post-up-1');
    const upPosthook1ExtraVars = upgradePosthook1.locator('#extra_vars');
    await upPosthook1ExtraVars.locator('#add-button').click();
    await upPosthook1ExtraVars.locator('#key-1').fill('post-up-1-var-1');
    await upPosthook1ExtraVars.locator('#value-1').fill('post-up-1-val-1');
    await upPosthook1ExtraVars.locator('#add-button').click();
    await upPosthook1ExtraVars.locator('#key-2').fill('post-up-1-var-2');
    await upPosthook1ExtraVars.locator('#value-2').fill('post-up-1-val-2');
    await upgradePosthook1.getByRole('button', { name: 'Details' }).click();

    await upgradePosthooks.locator('#add-button').last().click();

    const upgradePosthook2 = page.locator('#upgrade-posthooks-2');
    await upgradePosthook2.locator('#name').fill('post-up-2');
    const upPosthook2ExtraVars = upgradePosthook2.locator('#extra_vars');
    await upPosthook2ExtraVars.locator('#add-button').click();
    await upPosthook2ExtraVars.locator('#key-1').fill('post-up-2-var-1');
    await upPosthook2ExtraVars.locator('#value-1').fill('post-up-2-val-1');
    await upPosthook2ExtraVars.locator('#add-button').click();
    await upPosthook2ExtraVars.locator('#key-2').fill('post-up-2-var-2');
    await upPosthook2ExtraVars.locator('#value-2').fill('post-up-2-val-2');
    await upgradePosthook2.getByRole('button', { name: 'Details' }).click();

    await page.getByRole('button', { name: 'Next' }).click();

    // Review step
    const review = page.locator('#review');

    const details = review.locator('#details');
    await expect(details.locator('#name')).toContainText('my-template');
    await expect(details.locator('#namespace')).toContainText('default');

    const install = review.locator('#install');
    await expect(install.locator('#install-secret')).toContainText('my-inst-creds');
    await expect(install.locator('#install-prehooks')).toContainText('pre-inst-1');
    await expect(install.locator('#install-prehooks')).toContainText('pre-inst-2');
    await expect(install.locator('#install-posthooks')).toContainText('post-inst-1');
    await expect(install.locator('#install-posthooks')).toContainText('post-inst-2');

    const upgrade = review.locator('#upgrade');
    await expect(upgrade.locator('#upgrade-secret')).toContainText('my-up-creds');
    await expect(upgrade.locator('#upgrade-prehooks')).toContainText('pre-up-1');
    await expect(upgrade.locator('#upgrade-prehooks')).toContainText('pre-up-2');
    await expect(upgrade.locator('#upgrade-posthooks')).toContainText('post-up-1');
    await expect(upgrade.locator('#upgrade-posthooks')).toContainText('post-up-2');

    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

    // Verify YAML results
    const expected = {
      apiVersion: 'cluster.open-cluster-management.io/v1beta1',
      kind: 'ClusterCurator',
      metadata: {
        name: 'my-template',
        namespace: 'default',
      },
      spec: {
        install: {
          towerAuthSecret: 'my-inst-creds',
          prehook: [
            {
              name: 'pre-inst-1',
              extra_vars: {
                'pre-inst-1-var-1': 'pre-inst-1-val-1',
                'pre-inst-1-var-2': 'pre-inst-1-val-2',
              },
            },
            {
              name: 'pre-inst-2',
              extra_vars: {
                'pre-inst-2-var-1': 'pre-inst-2-val-1',
                'pre-inst-2-var-2': 'pre-inst-2-val-2',
              },
            },
          ],
          posthook: [
            {
              name: 'post-inst-1',
              extra_vars: {
                'post-inst-1-var-1': 'post-inst-1-val-1',
                'post-inst-1-var-2': 'post-inst-1-val-2',
              },
            },
            {
              name: 'post-inst-2',
              extra_vars: {
                'post-inst-2-var-1': 'post-inst-2-val-1',
                'post-inst-2-var-2': 'post-inst-2-val-2',
              },
            },
          ],
        },
        upgrade: {
          towerAuthSecret: 'my-up-creds',
          prehook: [
            {
              name: 'pre-up-1',
              extra_vars: {
                'pre-up-1-var-1': 'pre-up-1-val-1',
                'pre-up-1-var-2': 'pre-up-1-val-2',
              },
            },
            {
              name: 'pre-up-2',
              extra_vars: {
                'pre-up-2-var-1': 'pre-up-2-val-1',
                'pre-up-2-var-2': 'pre-up-2-val-2',
              },
            },
          ],
          posthook: [
            {
              name: 'post-up-1',
              extra_vars: {
                'post-up-1-var-1': 'post-up-1-val-1',
                'post-up-1-var-2': 'post-up-1-val-2',
              },
            },
            {
              name: 'post-up-2',
              extra_vars: {
                'post-up-2-var-1': 'post-up-2-val-1',
                'post-up-2-var-2': 'post-up-2-val-2',
              },
            },
          ],
        },
      },
    };

    const yaml = YAML.stringify(expected);
    await expect(page.locator('#yaml-editor')).toHaveText(yaml);
  });
});
