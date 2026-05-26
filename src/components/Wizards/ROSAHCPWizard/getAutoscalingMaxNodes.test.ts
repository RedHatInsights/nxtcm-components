import {
  getAutoscalingMaxNodes,
  MAX_NODES_HCP_DEFAULT,
  MAX_NODES_HCP_INSUFFICIENT_VERSION,
} from './getAutoscalingMaxNodes';

describe('getAutoscalingMaxNodes', () => {
  it('returns default max when openshift version is not provided', () => {
    expect(getAutoscalingMaxNodes()).toBe(MAX_NODES_HCP_DEFAULT);
    expect(getAutoscalingMaxNodes(undefined)).toBe(MAX_NODES_HCP_DEFAULT);
  });

  it('returns insufficient max for openshift 4.13 and below', () => {
    expect(getAutoscalingMaxNodes('4.13.0')).toBe(MAX_NODES_HCP_INSUFFICIENT_VERSION);
    expect(getAutoscalingMaxNodes('4.10.8')).toBe(MAX_NODES_HCP_INSUFFICIENT_VERSION);
  });

  it('returns default max for openshift 4.16 and above', () => {
    expect(getAutoscalingMaxNodes('4.16.0')).toBe(MAX_NODES_HCP_DEFAULT);
    expect(getAutoscalingMaxNodes('4.17.1')).toBe(MAX_NODES_HCP_DEFAULT);
  });

  it('applies patch thresholds for openshift 4.14 and 4.15', () => {
    expect(getAutoscalingMaxNodes('4.14.27')).toBe(MAX_NODES_HCP_INSUFFICIENT_VERSION);
    expect(getAutoscalingMaxNodes('4.14.28')).toBe(MAX_NODES_HCP_DEFAULT);
    expect(getAutoscalingMaxNodes('4.15.14')).toBe(MAX_NODES_HCP_INSUFFICIENT_VERSION);
    expect(getAutoscalingMaxNodes('4.15.15')).toBe(MAX_NODES_HCP_DEFAULT);
  });
});
