import { expect, test } from '@playwright/experimental-ct-react';

import { UseGetDocsVersionMount } from './links.spec-helpers';

/** Builds the expected base URL for a given docs major version. */
const rosaDocsBase = (version: string): string =>
  `https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/${version}/html`;

test.describe('useGetDocsVersion', () => {
  test.describe('version resolution — fallback behavior (no published overrides)', () => {
    test('should default to v4 docs when no clusterVersion is provided', async ({ mount }) => {
      const component = await mount(<UseGetDocsVersionMount />);
      await expect(component.getByTestId('IAM_RESOURCES')).toContainText(rosaDocsBase('4'));
    });

    test('should resolve to v4 docs for a v4 cluster version', async ({ mount }) => {
      const component = await mount(<UseGetDocsVersionMount clusterVersion="4.16.2" />);
      await expect(component.getByTestId('IAM_RESOURCES')).toContainText(rosaDocsBase('4'));
    });

    test('should fall back to v4 docs when cluster major is not published', async ({ mount }) => {
      const component = await mount(<UseGetDocsVersionMount clusterVersion="5.1.0" />);
      await expect(component.getByTestId('IAM_RESOURCES')).toContainText(rosaDocsBase('4'));
    });

    test('should fall back to v4 docs for an empty string cluster version', async ({ mount }) => {
      const component = await mount(<UseGetDocsVersionMount clusterVersion="" />);
      await expect(component.getByTestId('IAM_RESOURCES')).toContainText(rosaDocsBase('4'));
    });
  });

  test.describe('version resolution — with published docs versions', () => {
    test('should resolve to v4 docs when v4 cluster is selected and both v4 and v5 are published', async ({
      mount,
    }) => {
      const component = await mount(
        <UseGetDocsVersionMount clusterVersion="4.16.2" docsVersions={['4', '5']} />
      );
      await expect(component.getByTestId('IAM_RESOURCES')).toContainText(rosaDocsBase('4'));
    });

    test('should resolve to v5 docs when v5 cluster is selected and v5 is published', async ({
      mount,
    }) => {
      const component = await mount(
        <UseGetDocsVersionMount clusterVersion="5.1.0" docsVersions={['5']} />
      );
      await expect(component.getByTestId('IAM_RESOURCES')).toContainText(rosaDocsBase('5'));
    });

    test('should resolve to v5 docs when v5 cluster is selected and both v4 and v5 are published', async ({
      mount,
    }) => {
      const component = await mount(
        <UseGetDocsVersionMount clusterVersion="5.1.0" docsVersions={['4', '5']} />
      );
      await expect(component.getByTestId('IAM_RESOURCES')).toContainText(rosaDocsBase('5'));
    });

    test('should fall back to v4 docs when cluster major is 6 and only v4 and v5 are published', async ({
      mount,
    }) => {
      const component = await mount(
        <UseGetDocsVersionMount clusterVersion="6.0.0" docsVersions={['4', '5']} />
      );
      await expect(component.getByTestId('IAM_RESOURCES')).toContainText(rosaDocsBase('4'));
    });
  });

  test.describe('all link keys use the resolved docs version', () => {
    const linkKeys = [
      'IAM_RESOURCES',
      'CONFIGURE_PRIVATE_CONNECTIONS',
      'ROSA_AWS_ACCOUNT_ASSOCIATION',
      'ROSA_SERVICE_ETCD_ENCRYPTION',
      'CIDR_RANGE_DEFINITIONS_ROSA',
      'CIDR_MACHINE',
      'CIDR_SERVICE',
      'CIDR_POD',
      'CIDR_HOST_PREFIX',
      'CONFIGURE_PROXY_URL',
      'ROSA_Z_STREAM',
      'ROSA_LIFE_CYCLE',
      'ROSA_CLUSTER_AUTOSCALING',
      'ROSA_WORKER_NODE_COUNT',
      'ROSA_INSTANCE_TYPES',
      'ROSA_SHARED_VPC',
      'ROSA_ROLES_LEARN_MORE',
      'ROSA_OIDC_LEARN_MORE',
      'ROSA_SECURITY_GROUPS',
    ] as const;

    for (const key of linkKeys) {
      test(`${key} should contain the v5 docs base URL when v5 is resolved`, async ({ mount }) => {
        const component = await mount(
          <UseGetDocsVersionMount clusterVersion="5.1.0" docsVersions={['5']} />
        );
        await expect(component.getByTestId(key)).toContainText(rosaDocsBase('5'));
      });
    }
  });
});
