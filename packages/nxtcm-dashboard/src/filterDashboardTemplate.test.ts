import type { ExtendedTemplateConfig } from '@patternfly/widgetized-dashboard';

import { filterDashboardTemplate } from './filterDashboardTemplate';

describe('filterDashboardTemplate', () => {
  it.each(['sm', 'md', 'lg', 'xl'] as const)(
    'keeps the allowlisted fields for %s',
    (breakpoint) => {
      const item = {
        i: `${breakpoint}-widget`,
        x: 1,
        y: 2,
        w: 3,
        h: 4,
        widgetType: 'example',
        title: 'Example',
        static: true,
        moved: true,
        config: { wrapperProps: { className: 'should be dropped' } },
        minW: 1,
      };

      const result = filterDashboardTemplate({ [breakpoint]: [item] } as ExtendedTemplateConfig);

      expect(result).toEqual({
        [breakpoint]: [
          {
            i: `${breakpoint}-widget`,
            x: 1,
            y: 2,
            w: 3,
            h: 4,
            widgetType: 'example',
            title: 'Example',
          },
        ],
      });
    }
  );

  it('maps every present breakpoint without inventing missing breakpoints', () => {
    const result = filterDashboardTemplate({
      sm: [
        {
          i: 'small',
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          widgetType: 'small-widget',
          title: 'Small',
        },
      ],
      xl: [
        {
          i: 'large',
          x: 2,
          y: 3,
          w: 4,
          h: 5,
          widgetType: 'large-widget',
          title: 'Large',
        },
      ],
    } as ExtendedTemplateConfig);

    expect(result).toEqual({
      sm: [
        {
          i: 'small',
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          widgetType: 'small-widget',
          title: 'Small',
        },
      ],
      xl: [
        {
          i: 'large',
          x: 2,
          y: 3,
          w: 4,
          h: 5,
          widgetType: 'large-widget',
          title: 'Large',
        },
      ],
    });
  });
});
