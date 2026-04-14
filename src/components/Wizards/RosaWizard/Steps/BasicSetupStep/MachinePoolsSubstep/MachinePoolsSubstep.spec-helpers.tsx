/**
 * Playwright CT mount target only — import {@link MachinePoolsSubstepMount} alone from this file in
 * *.spec.tsx so the CT transform can replace it with an import ref. Fixtures and strings live in
 * {@link ./MachinePoolsSubstep.fixtures}.
 * @see https://playwright.dev/docs/test-components#test-stories
 */
import React, { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { MachinePoolsSubstep } from './MachinePoolsSubstep';
import { RosaWizardStringsProvider } from '../../../RosaWizardStringsContext';
import {
  createMockClusterData,
  mockMachineTypesData,
  mockVpcList,
  type MachinePoolsSubstepStoryProps,
} from './MachinePoolsSubstep.fixtures';
import type { RosaWizardFormData } from '../../../../types';

export type { MachinePoolsSubstepStoryProps };

export const MachinePoolsSubstepMount: React.FC<MachinePoolsSubstepStoryProps> = ({
  vpcList = mockVpcList,
  machineTypes = mockMachineTypesData,
  clusterOverrides = {},
}) => {
  const defaultValues = useMemo(
    () => createMockClusterData(clusterOverrides) as RosaWizardFormData,
    [clusterOverrides]
  );
  const methods = useForm<RosaWizardFormData>({
    defaultValues,
    mode: 'onChange',
  });

  return (
    <RosaWizardStringsProvider>
      <FormProvider {...methods}>
        <MachinePoolsSubstep vpcList={vpcList} machineTypes={machineTypes} />
      </FormProvider>
    </RosaWizardStringsProvider>
  );
};
