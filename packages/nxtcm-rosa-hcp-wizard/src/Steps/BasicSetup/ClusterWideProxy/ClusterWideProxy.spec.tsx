import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../test-helpers';
import { defaultRosaHcpWizardStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import { ClusterWideProxyMount } from './ClusterWideProxy.spec-helpers';

const cw = defaultRosaHcpWizardStrings.clusterWideProxy;

test.describe('ClusterWideProxy (ROSA HCP)', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<ClusterWideProxyMount />);
    await checkAccessibility({ component });
  });

  test('should render the section title', async ({ mount }) => {
    const component = await mount(<ClusterWideProxyMount />);
    await expect(component.getByText(cw.sectionLabel, { exact: true })).toBeVisible();
  });

  test('should render the intro text', async ({ mount }) => {
    const component = await mount(<ClusterWideProxyMount />);
    await expect(component.getByText(cw.intro)).toBeVisible();
  });

  test('should render the learn more link', async ({ mount }) => {
    const component = await mount(<ClusterWideProxyMount />);
    await expect(component.getByText(cw.learnMoreLink)).toBeVisible();
  });

  test('should render the configure at least 1 field alert', async ({ mount }) => {
    const component = await mount(<ClusterWideProxyMount />);
    await expect(component.getByText(cw.alertConfigureFields)).toBeVisible();
  });

  test('should render the HTTP proxy URL input', async ({ mount }) => {
    const component = await mount(<ClusterWideProxyMount />);
    await expect(component.getByText(cw.httpLabel, { exact: true })).toBeVisible();
    await expect(component.getByRole('textbox', { name: cw.httpLabel })).toBeVisible();
  });

  test('should render the HTTPS proxy URL input', async ({ mount }) => {
    const component = await mount(<ClusterWideProxyMount />);
    await expect(component.getByText(cw.httpsLabel, { exact: true })).toBeVisible();
    await expect(component.getByRole('textbox', { name: cw.httpsLabel })).toBeVisible();
  });

  test('should render the No Proxy domains input', async ({ mount }) => {
    const component = await mount(<ClusterWideProxyMount />);
    await expect(component.getByText(cw.noProxyLabel, { exact: true })).toBeVisible();
    await expect(component.getByRole('textbox', { name: cw.noProxyLabel })).toBeVisible();
  });

  test('should render the Additional trust bundle field', async ({ mount }) => {
    const component = await mount(<ClusterWideProxyMount />);
    await expect(component.getByText(cw.trustBundleLabel, { exact: true })).toBeVisible();
  });

  test.describe('ClusterWideProxy — HTTP proxy URL validation', () => {
    test('should allow typing a valid HTTP proxy URL', async ({ mount }) => {
      const component = await mount(<ClusterWideProxyMount />);
      const input = component.getByRole('textbox', { name: cw.httpLabel });
      await input.fill('http://proxy.example.com:8080');
      await expect(input).toHaveValue('http://proxy.example.com:8080');
    });

    test('should show error for an invalid URL', async ({ mount }) => {
      const component = await mount(<ClusterWideProxyMount />);
      const input = component.getByRole('textbox', { name: cw.httpLabel });
      await input.fill('not-a-url');
      await input.blur();
      await expect(component.getByText('Invalid URL')).toBeVisible();
    });

    test('should show error for HTTPS scheme in HTTP proxy field', async ({ mount }) => {
      const component = await mount(<ClusterWideProxyMount />);
      const input = component.getByRole('textbox', { name: cw.httpLabel });
      await input.fill('https://proxy.example.com:8080');
      await input.blur();
      await expect(
        component.getByText(/The URL should include the scheme prefix \(http:\/\/\)/)
      ).toBeVisible();
    });

    test('should not show error when HTTP proxy URL is empty', async ({ mount }) => {
      const component = await mount(<ClusterWideProxyMount />);
      const input = component.getByRole('textbox', { name: cw.httpLabel });
      await input.click();
      await input.blur();
      await expect(component.getByText('Invalid URL')).not.toBeVisible();
    });
  });

  test.describe('ClusterWideProxy — HTTPS proxy URL validation', () => {
    test('should allow typing a valid HTTPS proxy URL', async ({ mount }) => {
      const component = await mount(<ClusterWideProxyMount />);
      const input = component.getByRole('textbox', { name: cw.httpsLabel });
      await input.fill('https://proxy.example.com:443');
      await expect(input).toHaveValue('https://proxy.example.com:443');
    });

    test('should allow HTTP scheme in HTTPS proxy field', async ({ mount }) => {
      const component = await mount(<ClusterWideProxyMount />);
      const input = component.getByRole('textbox', { name: cw.httpsLabel });
      await input.fill('http://proxy.example.com:8080');
      await input.blur();
      await expect(component.getByText('Invalid URL')).not.toBeVisible();
    });

    test('should show error for an invalid URL in HTTPS proxy field', async ({ mount }) => {
      const component = await mount(<ClusterWideProxyMount />);
      const input = component.getByRole('textbox', { name: cw.httpsLabel });
      await input.fill('not-a-url');
      await input.blur();
      await expect(component.getByText('Invalid URL')).toBeVisible();
    });

    test('should show error for FTP scheme in HTTPS proxy field', async ({ mount }) => {
      const component = await mount(<ClusterWideProxyMount />);
      const input = component.getByRole('textbox', { name: cw.httpsLabel });
      await input.fill('ftp://proxy.example.com');
      await input.blur();
      await expect(
        component.getByText(/The URL should include the scheme prefix \(http:\/\/, https:\/\/\)/)
      ).toBeVisible();
    });

    test('should not show error when HTTPS proxy URL is empty', async ({ mount }) => {
      const component = await mount(<ClusterWideProxyMount />);
      const input = component.getByRole('textbox', { name: cw.httpsLabel });
      await input.click();
      await input.blur();
      await expect(component.getByText('Invalid URL')).not.toBeVisible();
    });
  });

  test.describe('ClusterWideProxy — No Proxy domains', () => {
    test('should disable No Proxy domains when both HTTP and HTTPS proxy are empty', async ({
      mount,
    }) => {
      const component = await mount(<ClusterWideProxyMount />);
      const noProxyInput = component.getByRole('textbox', { name: cw.noProxyLabel });
      await expect(noProxyInput).toBeDisabled();
    });

    test('should enable No Proxy domains when a valid HTTP proxy is provided', async ({
      mount,
    }) => {
      const component = await mount(
        <ClusterWideProxyMount
          defaultValues={{ http_proxy_url: 'http://proxy.example.com:8080' }}
        />
      );
      const noProxyInput = component.getByRole('textbox', { name: cw.noProxyLabel });
      await expect(noProxyInput).toBeEnabled();
    });

    test('should enable No Proxy domains when a valid HTTPS proxy is provided', async ({
      mount,
    }) => {
      const component = await mount(
        <ClusterWideProxyMount
          defaultValues={{ https_proxy_url: 'https://proxy.example.com:443' }}
        />
      );
      const noProxyInput = component.getByRole('textbox', { name: cw.noProxyLabel });
      await expect(noProxyInput).toBeEnabled();
    });

    test('should show error for an invalid No Proxy domain', async ({ mount }) => {
      const component = await mount(
        <ClusterWideProxyMount
          defaultValues={{ http_proxy_url: 'http://proxy.example.com:8080' }}
        />
      );
      const noProxyInput = component.getByRole('textbox', { name: cw.noProxyLabel });
      await noProxyInput.fill('invalid_domain');
      await noProxyInput.blur();
      await expect(component.getByText(/isn't valid/)).toBeVisible();
    });

    test('should allow a valid No Proxy domain', async ({ mount }) => {
      const component = await mount(
        <ClusterWideProxyMount
          defaultValues={{ http_proxy_url: 'http://proxy.example.com:8080' }}
        />
      );
      const noProxyInput = component.getByRole('textbox', { name: cw.noProxyLabel });
      await noProxyInput.fill('example.com');
      await noProxyInput.blur();
      await expect(component.getByText(/isn't valid/)).not.toBeVisible();
    });

    test('should allow multiple comma-separated valid No Proxy domains', async ({ mount }) => {
      const component = await mount(
        <ClusterWideProxyMount
          defaultValues={{ http_proxy_url: 'http://proxy.example.com:8080' }}
        />
      );
      const noProxyInput = component.getByRole('textbox', { name: cw.noProxyLabel });
      await noProxyInput.fill('example.com,sub.domain.org');
      await noProxyInput.blur();
      await expect(component.getByText(/isn't valid/)).not.toBeVisible();
    });
  });

  test.describe('ClusterWideProxy — No Proxy domains reset on proxy change', () => {
    test('should reset No Proxy domains when HTTP proxy URL changes', async ({ mount }) => {
      const component = await mount(
        <ClusterWideProxyMount
          defaultValues={{
            http_proxy_url: 'http://proxy.example.com:8080',
            no_proxy_domains: 'example.com',
          }}
        />
      );
      const httpInput = component.getByRole('textbox', { name: cw.httpLabel });
      await httpInput.fill('');
      await httpInput.blur();

      const noProxyInput = component.getByRole('textbox', { name: cw.noProxyLabel });
      await expect(noProxyInput).toBeDisabled();
      await expect(noProxyInput).toHaveValue('');
    });
  });

  test.describe('ClusterWideProxy — pre-populated default values', () => {
    test('should render with pre-populated HTTP proxy URL', async ({ mount }) => {
      const component = await mount(
        <ClusterWideProxyMount defaultValues={{ http_proxy_url: 'http://my-proxy.com:3128' }} />
      );
      const input = component.getByRole('textbox', { name: cw.httpLabel });
      await expect(input).toHaveValue('http://my-proxy.com:3128');
    });

    test('should render with pre-populated HTTPS proxy URL', async ({ mount }) => {
      const component = await mount(
        <ClusterWideProxyMount defaultValues={{ https_proxy_url: 'https://my-proxy.com:443' }} />
      );
      const input = component.getByRole('textbox', { name: cw.httpsLabel });
      await expect(input).toHaveValue('https://my-proxy.com:443');
    });

    test('should render with pre-populated No Proxy domains', async ({ mount }) => {
      const component = await mount(
        <ClusterWideProxyMount
          defaultValues={{
            http_proxy_url: 'http://proxy.example.com:8080',
            no_proxy_domains: 'internal.corp.com',
          }}
        />
      );
      const input = component.getByRole('textbox', { name: cw.noProxyLabel });
      await expect(input).toHaveValue('internal.corp.com');
    });
  });
});
