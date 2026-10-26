import type { ExtendedLayoutItem, ExtendedTemplateConfig } from '@patternfly/widgetized-dashboard';

function filterLayoutItem(item: ExtendedLayoutItem): ExtendedLayoutItem {
  return {
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    widgetType: item.widgetType,
    title: item.title,
  };
}

export function filterDashboardTemplate(template: ExtendedTemplateConfig): ExtendedTemplateConfig {
  const filtered = {} as ExtendedTemplateConfig;
  const breakpoints: Array<keyof ExtendedTemplateConfig> = ['sm', 'md', 'lg', 'xl'];

  for (const breakpoint of breakpoints) {
    if (template[breakpoint]) {
      filtered[breakpoint] = template[breakpoint].map(filterLayoutItem);
    }
  }

  return filtered;
}
