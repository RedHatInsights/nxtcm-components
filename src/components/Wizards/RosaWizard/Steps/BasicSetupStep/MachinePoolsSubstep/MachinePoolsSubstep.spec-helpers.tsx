/**
 * Playwright CT mount target only — import {@link MachinePoolsSubstepMount} alone from this file in
 * *.spec.tsx so the CT transform can replace it with an import ref. Fixtures and strings live in
 * {@link ./MachinePoolsSubstep.fixtures}.
 * @see https://playwright.dev/docs/test-components#test-stories
 */
import React, { useEffect } from 'react';
import { MachinePoolsSubstep } from './MachinePoolsSubstep';
import { RosaWizardStringsProvider } from '../../../RosaWizardStringsContext';
import { useAppForm, type RosaFormApi } from '../../../RosaFormContext';
import type { RosaWizardFormData } from '../../../../types';
import {
  createMockClusterData,
  mockMachineTypesData,
  mockVpcList,
  type MachinePoolsSubstepStoryProps,
} from './MachinePoolsSubstep.fixtures';

/** Re-exported props type for `MachinePoolsSubstepMount` consumers in specs and stories. */
export type { MachinePoolsSubstepStoryProps };

/**
 * Triggers onChange validation on all fields so errors are visible
 * immediately — replaces the old ShowValidationContext.Provider pattern.
 */
function ValidateOnMount({ form }: { form: RosaFormApi }): null {
  useEffect(() => {
    void form.validateAllFields('change');
  }, [form]);
  return null;
}

/** Wraps children in `AppForm` with `createMockClusterData` defaults; optionally runs `validateAllFields` on mount. */
const MachinePoolsFormWrapper: React.FC<{
  clusterOverrides?: Record<string, unknown>;
  showValidation?: boolean;
  children: React.ReactNode;
}> = ({ clusterOverrides = {}, showValidation, children }) => {
  const form = useAppForm({
    defaultValues: createMockClusterData(clusterOverrides) as unknown as RosaWizardFormData,
    onSubmit: async () => {},
  });

  return (
    <form.AppForm>
      {showValidation && <ValidateOnMount form={form as RosaFormApi} />}
      {children}
    </form.AppForm>
  );
};

/**
 * CT mount for `MachinePoolsSubstep` with wizard strings, optional `showValidation`, and fixture-backed VPC/types.
 * Pass `clusterOverrides`, `vpcList`, or `machineTypes` to exercise loading, empty lists, or validation.
 */
export const MachinePoolsSubstepMount: React.FC<
  MachinePoolsSubstepStoryProps & { showValidation?: boolean }
> = ({
  vpcList = mockVpcList,
  machineTypes = mockMachineTypesData,
  clusterOverrides = {},
  showValidation,
}) => (
  <RosaWizardStringsProvider>
    <MachinePoolsFormWrapper clusterOverrides={clusterOverrides} showValidation={showValidation}>
      <MachinePoolsSubstep vpcList={vpcList} machineTypes={machineTypes} />
    </MachinePoolsFormWrapper>
  </RosaWizardStringsProvider>
);
