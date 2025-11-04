import '@patternfly/react-core/dist/styles/base.css'; 
import '@patternfly/patternfly/patternfly-addons.css';
import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
