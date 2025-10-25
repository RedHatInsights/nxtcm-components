import { Banner, Content } from '@patternfly/react-core';

export type ReadOnlyBannerProps = {
  isReadOnly?: boolean;
  someReadOnly?: boolean;
};

export const ReadOnlyBanner = ({ isReadOnly, someReadOnly }: ReadOnlyBannerProps) => {
  if (isReadOnly) {
    return (
      <Banner color="yellow" className="configuration_mode_read_only">
        <Content component="p">
          <b>You will be unable to configure your cluster during maintenance.</b>
        </Content>
        <Content component="p">
          Actions like configuring identity providers and updating cluster settings are disabled
          until maintenance is complete. More information may be available under{' '}
          <b>Cluster history</b> in Overview tab.
        </Content>
      </Banner>
    );
  }
  if (someReadOnly) {
    return (
      <Banner color="yellow" className="configuration_mode_read_only">
        <Content component="p">
          <b>You will be unable to configure some of your clusters during maintenance.</b>
        </Content>
        <Content component="p">
          Actions like configuring identity providers and updating cluster settings are disabled
          until maintenance is complete.
        </Content>
      </Banner>
    );
  }
  return null;
};
