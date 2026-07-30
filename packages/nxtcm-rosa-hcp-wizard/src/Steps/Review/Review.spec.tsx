import React from 'react';
import { expect, test } from '@playwright/experimental-ct-react';
import { ClusterUpgrade } from '../../types';
import rosaHcpWizardFixtures from '../../ROSAHCPWizard.fixtures';
import { defaultRosaHcpWizardStrings } from '../../stringsProvider/rosaHcpWizardStrings.defaults';
import { ReviewHarness } from './Review.spec-helpers';

const mp = defaultRosaHcpWizardStrings.machinePools;
const sg = defaultRosaHcpWizardStrings.securityGroups;
const a = defaultRosaHcpWizardStrings.autoscaling;
const cu = defaultRosaHcpWizardStrings.clusterUpdates;
const cw = defaultRosaHcpWizardStrings.clusterWideProxy;
const reviewStrings = defaultRosaHcpWizardStrings.review;

const validTrustBundlePem = `-----BEGIN CERTIFICATE-----
MIIBkTCB+wIJAKHBfpHYbpHTMA0GCSqGSIb3DQEBCwUAMBExDzANBgNVBAMMBnRl
c3RjYTAeFw0yMzAxMDEwMDAwMDBaFw0yNDAxMDEwMDAwMDBaMBExDzANBgNVBAMM
BnRlc3RjYTBcMA0GCSqGSIb3DQEBAQUAAwIAATANBgkqhkiG9w0BAQsFAAMCAQA=
-----END CERTIFICATE-----`;

test.describe('Review', () => {
  test('renders review guidance and section summaries', async ({ mount }) => {
    const c = await mount(<ReviewHarness />);

    await expect(c.getByRole('button', { name: /^Details$/i })).toBeVisible();
    await expect(c.getByRole('button', { name: /^Roles and policies$/i })).toBeVisible();
    await expect(c.getByRole('button', { name: /^Networking$/i })).toBeVisible();
  });

  test('hides cluster-wide proxy when optional proxy fields match defaults', async ({ mount }) => {
    const c = await mount(<ReviewHarness />);

    await expect(c.getByRole('button', { name: /cluster-wide proxy/i })).toHaveCount(0);
  });

  test('shows cluster-wide proxy when a proxy value differs from defaults', async ({ mount }) => {
    const c = await mount(
      <ReviewHarness formOverrides={{ http_proxy_url: 'http://proxy.example.com:8080' }} />
    );

    const proxyToggle = c.getByRole('button', { name: /cluster-wide proxy/i });
    await expect(proxyToggle).toBeVisible();
    await expect(proxyToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(c.getByText('http://proxy.example.com:8080')).toBeVisible();
  });

  test('hides additional trust bundle row when proxy section is visible but bundle is empty', async ({
    mount,
  }) => {
    const c = await mount(
      <ReviewHarness formOverrides={{ http_proxy_url: 'http://proxy.example.com:8080' }} />
    );

    await expect(c.getByText(cw.trustBundleLabel, { exact: true })).toHaveCount(0);
    await expect(c.getByRole('button', { name: reviewStrings.showMore })).toHaveCount(0);
  });

  test('collapses additional trust bundle by default and expands on Show more', async ({
    mount,
  }) => {
    const c = await mount(
      <ReviewHarness
        formOverrides={{
          http_proxy_url: 'http://proxy.example.com:8080',
          additional_trust_bundle: validTrustBundlePem,
        }}
      />
    );

    await expect(c.getByText(cw.trustBundleLabel, { exact: true })).toBeVisible();
    const showMore = c.getByRole('button', { name: reviewStrings.showMore });
    await expect(showMore).toBeVisible();
    await expect(showMore).toHaveAttribute('aria-expanded', 'false');
    await expect(c.getByText(/-----BEGIN CERTIFICATE-----/)).toHaveCount(0);

    await showMore.click();
    await expect(c.getByRole('button', { name: reviewStrings.showLess })).toBeVisible();
    await expect(c.getByText(/-----BEGIN CERTIFICATE-----/)).toBeVisible();
  });

  test('renders one Edit Step control per visible review section', async ({ mount }) => {
    const c = await mount(<ReviewHarness />);

    // Seven configured sections; cluster-wide proxy is omitted when unchanged.
    await expect(c.getByRole('button', { name: 'Edit Step' })).toHaveCount(6);
  });

  test('machine pools review shows selected VPC label and private subnet label', async ({
    mount,
  }) => {
    const vpc = rosaHcpWizardFixtures.mockVPCs[0];
    const privateSubnet = vpc.aws_subnets.find((subnet) => subnet.name.includes('private'));
    if (!privateSubnet) {
      throw new Error('fixture VPC is missing a private subnet');
    }
    const c = await mount(
      <ReviewHarness
        formOverrides={{
          selected_vpc: vpc.id,
          machine_pools_subnets: [{ machine_pool_subnet: privateSubnet.subnet_id }],
        }}
      />
    );

    await expect(c.getByText(vpc.name)).toBeVisible();
    await expect(c.getByText(privateSubnet.name)).toBeVisible();
    await expect(c.getByText(mp.subnetLabel)).toBeVisible();
  });

  test('machine pools review hides replica fields when autoscaling is off', async ({ mount }) => {
    const c = await mount(
      <ReviewHarness
        formOverrides={{
          autoscaling: false,
          // Differs from default (2) so the machine pool section starts expanded.
          nodes_compute: 3,
        }}
      />
    );

    const machinePoolsToggle = c.getByRole('button', { name: /^Machine pool$/i });
    await expect(machinePoolsToggle).toHaveAttribute('aria-expanded', 'true');

    await expect(c.getByText(a.computeCountLabel, { exact: true })).toBeVisible();
    await expect(c.getByText(a.minLabel, { exact: true })).toHaveCount(0);
    await expect(c.getByText(a.maxLabel, { exact: true })).toHaveCount(0);
  });

  test('machine pools review hides compute count when autoscaling is on', async ({ mount }) => {
    const c = await mount(
      <ReviewHarness
        formOverrides={{
          autoscaling: true,
          min_replicas: 2,
          max_replicas: 6,
          nodes_compute: 2,
        }}
      />
    );

    const machinePoolsToggle = c.getByRole('button', { name: /^Machine pool$/i });
    await expect(machinePoolsToggle).toHaveAttribute('aria-expanded', 'true');

    // exact: true — "Min/Max compute node count" also contain this substring.
    await expect(c.getByText(a.computeCountLabel, { exact: true })).toHaveCount(0);
    await expect(c.getByText(a.minLabel, { exact: true })).toBeVisible();
    await expect(c.getByText(a.maxLabel, { exact: true })).toBeVisible();
    await expect(c.getByText('6', { exact: true })).toBeVisible();
  });

  test('machine pools review shows IMDS, root disk with unit, and security group labels', async ({
    mount,
  }) => {
    const vpc = rosaHcpWizardFixtures.mockVPCs[0];
    const c = await mount(
      <ReviewHarness
        formOverrides={{
          selected_vpc: vpc.id,
          imds: 'imdsv2only',
          compute_root_volume: 400,
          security_groups_worker: ['sg-0a1b2c3d4e5f00001', 'sg-0a1b2c3d4e5f00003'],
        }}
      />
    );

    await expect(c.getByText(mp.imdsV2Label)).toBeVisible();
    await expect(c.getByText('400 GiB')).toBeVisible();
    await expect(c.getByText('default, web-server-sg')).toBeVisible();
    await expect(c.getByText(sg.formLabel)).toBeVisible();
  });

  test('cluster updates review shows human-readable schedule for automatic updates', async ({
    mount,
  }) => {
    const c = await mount(
      <ReviewHarness
        formOverrides={{
          upgrade_policy: ClusterUpgrade.automatic,
          upgrade_schedule: '00 4 * * 0',
        }}
      />
    );

    const clusterUpdatesToggle = c.getByRole('button', { name: /cluster updates \(optional\)/i });
    await expect(clusterUpdatesToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(c.getByText(cu.upgradeScheduleLabel, { exact: true })).toBeVisible();
    await expect(c.getByText('Sunday, 04:00 UTC')).toBeVisible();
  });
});
