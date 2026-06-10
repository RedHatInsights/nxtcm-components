/* eslint-disable camelcase */

/**
 * Analytics Event Builder Utility
 *
 * This module provides helper functions to create standardized analytics events for Segment tracking.
 * Each function returns an object with an `event` name and `properties` object that can be passed
 * directly to the analytics tracking service.
 *
 * @example
 * // Using with the useChrome hook
 * const { analytics } = useChrome();
 *
 * const { event, properties } = fileDownload({ link_name: 'ocp-cli' });
 * analytics.track(event, properties);
 *
 * @example
 * // Tracking a button click with optional value
 * const { event, properties } = buttonClicked({
 *   link_name: 'submit-form',
 *   resourceType: 'cluster',
 *   value: true
 * });
 * analytics.track(event, properties);
 */

const eventNames = {
  FILE_DOWNLOADED: 'File Downloaded',
  BUTTON_CLICKED: 'Button Clicked',
  LINK_CLICKED: 'Link Clicked',
  CHECKBOX_CLICKED: 'Checkbox Clicked',
  RADIOBUTTON_CLICKED: 'Radiobutton Clicked',
  SECTION_EXPANDED: 'Section Expanded',
  ALERT_INTERACTION: 'Alert Interaction',
  TAB_VIEWED: 'Tab Viewed',
};

const dataKeys = {
  // Used to help key events
  LINK_NAME: 'link_name',
  CURRENT_PATH: 'current_path',
  RESOURCE_TYPE: 'resourceType',
  LINK_URL: 'link_url',
  FROM_FCN: 'from-fcn',

  // Custom properties that can be added to the event

  VALUE: 'value',
  CHECKED: 'checked',
  ACTION: 'action',
  SEVERITY: 'severity',
  TYPE: 'type',
  TAB_NAME: 'tab_name',
  INITIAL_LOAD: 'initial_load',
  REDIRECTED_TO_DEFAULT_TAB: 'redirected_to_default_tab',
};

export const actionTypes = {
  DISMISS: 'dismiss',
};

export const severityTypes = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
};

const defaultCurrentPath = window.location.pathname;
const defaultResourceType = 'all';

/**
 * Creates a tracking event for file downloads
 *
 * @param {Object} params - The event parameters
 * @param {string} params.link_name - The name/identifier of the downloaded file (e.g., 'ocp-cli', 'pull-secret')
 * @param {string} [params.current_path] - The current URL path where the download occurred. Defaults to window.location.pathname
 * @param {boolean} [params.from_fcn] - Whether the event originated from within a FCN shared component. Defaults to true
 * @returns {Object} An object containing the event name and properties for analytics tracking
 */
export const fileDownload = ({
  link_name,
  current_path,
  from_fcn = true,
}: {
  link_name: string;
  current_path?: string;
  from_fcn?: boolean;
}) => ({
  event: eventNames.FILE_DOWNLOADED,
  properties: {
    [dataKeys.LINK_NAME]: link_name,
    [dataKeys.CURRENT_PATH]: current_path || defaultCurrentPath,

    [dataKeys.FROM_FCN]: from_fcn,
  },
});

/**
 * Creates a tracking event for button clicks
 *
 * @param {Object} params - The event parameters
 * @param {string} params.link_name - The name/identifier of the button that was clicked
 * @param {string} [params.current_path] - The current URL path where the click occurred. Defaults to window.location.pathname
 * @param {string} [params.resourceType] - The type of resource associated with the button (e.g., 'osd', 'ocp', 'moa' ). Defaults to 'all'
 * @param {string|number|boolean} [params.value] - Optional value associated with the button click (e.g., toggle state, selection value)
 * @param {boolean} [params.from_fcn] - Whether the event originated from within a FCN shared component. Defaults to true
 * @returns {Object} An object containing the event name and properties for analytics tracking
 */
export const buttonClicked = ({
  link_name,
  current_path,
  resourceType,
  value,
  from_fcn = true,
}: {
  link_name: string;
  current_path?: string;
  resourceType?: string;
  value?: string | number | boolean;
  from_fcn?: boolean;
}) => ({
  event: eventNames.BUTTON_CLICKED,
  properties: {
    [dataKeys.LINK_NAME]: link_name,
    [dataKeys.CURRENT_PATH]: current_path || defaultCurrentPath,
    [dataKeys.RESOURCE_TYPE]: resourceType || defaultResourceType,

    [dataKeys.FROM_FCN]: from_fcn,
    ...(value !== undefined && {
      [dataKeys.VALUE]: value,
    }),
  },
});

/**
   use* Creates a tracking event for link clicks
   *
   * @param {Object} params - The event parameters
   * @param {string} params.link_name - The name/identifier of the link that was clicked
   * @param {string} [params.current_path] - The current URL path where the click occurred. Defaults to window.location.pathname
   * @param {string} [params.resourceType] - The type of resource associated with the button (e.g., 'osd', 'ocp', 'moa' ). Defaults to 'all'
   * @param {string} params.link_url - The destination URL of the link
   * @param {boolean} [params.from_fcn] - Whether the event originated from within a FCN shared component. Defaults to true
   * @returns {Object} An object containing the event name and properties for analytics tracking
   */
export const linkClicked = ({
  link_name,
  current_path,
  resourceType,
  link_url,
  from_fcn = true,
}: {
  link_name: string;
  current_path?: string;
  resourceType?: string;
  link_url: string;
  from_fcn?: boolean;
}) => ({
  event: eventNames.BUTTON_CLICKED,
  properties: {
    [dataKeys.LINK_NAME]: link_name,
    [dataKeys.CURRENT_PATH]: current_path || defaultCurrentPath, // aka path
    [dataKeys.RESOURCE_TYPE]: resourceType || defaultResourceType,
    [dataKeys.LINK_URL]: link_url,

    [dataKeys.FROM_FCN]: from_fcn,
  },
});

/**
 * Creates a tracking event for checkbox interactions
 *
 * @param {Object} params - The event parameters
 * @param {string} params.link_name - The name/identifier of the checkbox that was clicked
 * @param {string} [params.current_path] - The current URL path where the interaction occurred. Defaults to window.location.pathname
 * @param {string} [params.resourceType] - The type of resource associated with the button (e.g., 'osd', 'ocp', 'moa' ). Defaults to 'all'
 * @param {boolean} params.checked - The new checked state of the checkbox (true for checked, false for unchecked)
 * @param {boolean} [params.from_fcn] - Whether the event originated from within a FCN shared component. Defaults to true
 * @returns {Object} An object containing the event name and properties for analytics tracking
 */
export const checkboxClicked = ({
  link_name,
  current_path,
  resourceType,
  checked,
  from_fcn = true,
}: {
  link_name: string;
  current_path?: string;
  resourceType?: string;
  checked: boolean;
  from_fcn?: boolean;
}) => ({
  event: eventNames.CHECKBOX_CLICKED,
  properties: {
    [dataKeys.LINK_NAME]: link_name,
    [dataKeys.CURRENT_PATH]: current_path || defaultCurrentPath,
    [dataKeys.RESOURCE_TYPE]: resourceType || defaultResourceType,

    [dataKeys.CHECKED]: checked,
    [dataKeys.FROM_FCN]: from_fcn,
  },
});

/**
 * Creates a tracking event for radio button selections
 *
 * @param {Object} params - The event parameters
 * @param {string} params.link_name - The name/identifier of the radio button group
 * @param {string} [params.current_path] - The current URL path where the selection occurred. Defaults to window.location.pathname
 * @param {string} [params.resourceType] - The type of resource associated with the button (e.g., 'osd', 'ocp', 'moa' ). Defaults to 'all'
 * @param {string|number|boolean} params.value - The value of the selected radio button option
 * @param {boolean} [params.from_fcn] - Whether the event originated from within a FCN shared component. Defaults to true
 * @returns {Object} An object containing the event name and properties for analytics tracking
 */
export const radioButtonClicked = ({
  link_name,
  current_path,
  resourceType,
  value,
  from_fcn = true,
}: {
  link_name: string;
  current_path?: string;
  resourceType?: string;
  value: string | number | boolean;
  from_fcn?: boolean;
}) => ({
  event: eventNames.RADIOBUTTON_CLICKED,
  properties: {
    [dataKeys.LINK_NAME]: link_name,
    [dataKeys.CURRENT_PATH]: current_path || defaultCurrentPath,
    [dataKeys.RESOURCE_TYPE]: resourceType || defaultResourceType,

    [dataKeys.VALUE]: value,
    [dataKeys.FROM_FCN]: from_fcn,
  },
});

/**
 * Creates a tracking event for expandable section interactions
 *
 * @param {Object} params - The event parameters
 * @param {string} params.link_name - The name/identifier of the section that was expanded
 * @param {string} [params.current_path] - The current URL path where the expansion occurred. Defaults to window.location.pathname
 * @param {string} [params.resourceType] - The type of resource associated with the button (e.g., 'osd', 'ocp', 'moa' ). Defaults to 'all'
 * @param {boolean} [params.from_fcn] - Whether the event originated from within a FCN shared component. Defaults to true
 * @returns {Object} An object containing the event name and properties for analytics tracking
 */
export const sectionExpanded = ({
  link_name,
  current_path,
  resourceType,
  from_fcn = true,
}: {
  link_name: string;
  current_path?: string;
  resourceType?: string;
  from_fcn?: boolean;
}) => ({
  event: eventNames.SECTION_EXPANDED,
  properties: {
    [dataKeys.LINK_NAME]: link_name,
    [dataKeys.CURRENT_PATH]: current_path || defaultCurrentPath,
    [dataKeys.RESOURCE_TYPE]: resourceType || defaultResourceType,

    [dataKeys.FROM_FCN]: from_fcn,
  },
});

/**
 * Creates a tracking event for alert interactions (e.g., dismissing alerts)
 *
 * @param {Object} params - The event parameters
 * @param {string} params.link_name - The name/identifier of the alert or alert group
 * @param {string} [params.current_path] - The current URL path where the interaction occurred. Defaults to window.location.pathname
 * @param {string} [params.resourceType] - The type of resource associated with the button (e.g., 'osd', 'ocp', 'moa' ). Defaults to 'all'
 * @param {string} params.action - The action performed on the alert. Use values from actionTypes (e.g., 'dismiss')
 * @param {string} params.severity - The severity level of the alert. Use values from severityTypes ('info', 'warning', 'error')
 * @param {string} [params.type] - Optional additional type information about the alert (e.g. alert identifier if part of a group)
 * @param {boolean} [params.from_fcn] - Whether the event originated from within a FCN shared component. Defaults to true
 * @returns {Object} An object containing the event name and properties for analytics tracking
 */
export const alertInteraction = ({
  link_name,
  current_path,
  resourceType,
  action,
  severity,
  type,
  from_fcn = true,
}: {
  link_name: string;
  current_path?: string;
  resourceType?: string;
  action: (typeof actionTypes)[keyof typeof actionTypes];
  severity: (typeof severityTypes)[keyof typeof severityTypes];
  type?: string;
  from_fcn?: boolean;
}) => ({
  event: eventNames.ALERT_INTERACTION,
  properties: {
    [dataKeys.LINK_NAME]: link_name,
    [dataKeys.CURRENT_PATH]: current_path || defaultCurrentPath,
    [dataKeys.RESOURCE_TYPE]: resourceType || defaultResourceType,

    [dataKeys.ACTION]: action,
    [dataKeys.SEVERITY]: severity,
    [dataKeys.FROM_FCN]: from_fcn,
    ...(type && { [dataKeys.TYPE]: type }),
  },
});

/**
 * Creates a tracking event for tab view interactions
 *
 * @param {Object} params - The event parameters
 * @param {string} params.link_name - The name/identifier of the tab container or navigation component
 * @param {string} [params.current_path] - The current URL path where the tab view occurred. Defaults to window.location.pathname
 * @param {string} [params.resourceType] - The type of resource associated with the tab (e.g., 'osd', 'ocp', 'moa' ). Defaults to 'all'
 * @param {string} params.tab_name - The name/identifier of the specific tab that was viewed
 * @param {boolean} params.initial_load - Whether this tab view occurred on the initial page load (true) or from user interaction (false)
 * @param {boolean} params.redirected_to_default_tab - Whether the user was redirected to this tab because it's the default (true) or navigated directly (false)
 * @param {boolean} [params.from_fcn] - Whether the event originated from within a FCN shared component. Defaults to true
 * @returns {Object} An object containing the event name and properties for analytics tracking
 */
export const tabViewed = ({
  link_name,
  current_path,
  resourceType,
  tab_name,
  initial_load,
  redirected_to_default_tab,
  from_fcn = true,
}: {
  link_name: string;
  current_path?: string;
  resourceType?: string;
  tab_name: string;
  initial_load: boolean;
  redirected_to_default_tab: boolean;
  from_fcn?: boolean;
}) => ({
  event: eventNames.TAB_VIEWED,
  properties: {
    [dataKeys.LINK_NAME]: link_name,
    [dataKeys.CURRENT_PATH]: current_path || defaultCurrentPath,
    [dataKeys.RESOURCE_TYPE]: resourceType || defaultResourceType,

    [dataKeys.TAB_NAME]: tab_name,
    [dataKeys.INITIAL_LOAD]: initial_load,
    [dataKeys.REDIRECTED_TO_DEFAULT_TAB]: redirected_to_default_tab,
    [dataKeys.FROM_FCN]: from_fcn,
  },
});
