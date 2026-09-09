import semver from 'semver';

import { MAX_NODES_HCP_DEFAULT, MAX_NODES_HCP_INSUFFICIENT_VERSION } from '../constants';

export { MAX_NODES_HCP_DEFAULT, MAX_NODES_HCP_INSUFFICIENT_VERSION };

const scaleMaxNodesBasedOnOpenshiftVersion = (openshiftVersion: string): boolean => {
  const coerced = semver.coerce(openshiftVersion);
  if (!coerced) {
    return true;
  }

  const major = coerced.major;
  const minor = coerced.minor;
  const patch = coerced.patch;

  if (major > 4) {
    return true;
  }
  if (major === 4 && minor >= 16) {
    return true;
  }
  if (major < 4) {
    return false;
  }
  if (major === 4 && minor <= 13) {
    return false;
  }
  if (major === 4 && minor === 14) {
    return patch >= 28;
  }
  if (major === 4 && minor === 15) {
    return patch >= 15;
  }
  return true;
};

export const getAutoscalingMaxNodes = (openshiftVersion?: string): number => {
  if (openshiftVersion && !scaleMaxNodesBasedOnOpenshiftVersion(openshiftVersion)) {
    return MAX_NODES_HCP_INSUFFICIENT_VERSION;
  }
  return MAX_NODES_HCP_DEFAULT;
};
