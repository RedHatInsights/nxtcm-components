/**
 * Storybook / shared exports. Playwright CT: mount {@link MachinePoolsSubstepMount} from
 * ./MachinePoolsSubstep.spec-helpers and fixtures from ./MachinePoolsSubstep.fixtures separately.
 */

/** Renders the Machine Pools substep in a test-friendly mount target for visual or CT scenarios. */
export { MachinePoolsSubstepMount as MachinePoolsSubstepStory } from './MachinePoolsSubstep.spec-helpers';

/** Fixture data and helpers for building Machine Pools story props and default cluster form values. */
export {
  createMockClusterData,
  machinePoolsSubstepCtStrings,
  mockMachineTypesData,
  mockSecurityGroups,
  mockSubnets,
  mockVpcList,
  type MachinePoolsSubstepStoryProps,
} from './MachinePoolsSubstep.fixtures';
