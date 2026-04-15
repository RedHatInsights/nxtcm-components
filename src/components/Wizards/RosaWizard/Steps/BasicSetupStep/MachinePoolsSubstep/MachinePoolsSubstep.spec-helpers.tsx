/**
 * Playwright CT mount target only — import {@link MachinePoolsSubstepMount} alone from this file in
 * *.spec.tsx so the CT transform can replace it with an import ref. Fixtures and strings live in
 * {@link ./MachinePoolsSubstep.fixtures}.
 * @see https://playwright.dev/docs/test-components#test-stories
 */
import React, { useMemo } from 'react';
import { FormProvider } from 'react-hook-form';
import { MachinePoolsSubstep } from './MachinePoolsSubstep';
import { mergeRosaCtClusterDefaults, useRosaWizardCtForm } from '../../../rosaWizardCtForm';
import { RosaWizardStringsProvider } from '../../../RosaWizardStringsContext';
import {
  createMockClusterData,
  mockMachineTypesData,
  mockVpcList,
  type MachinePoolsSubstepStoryProps,
} from './MachinePoolsSubstep.fixtures';
import type { RosaWizardFormData } from '../../../../types';

export type { MachinePoolsSubstepStoryProps };

function MachinePoolsSubstepMountInner({
  vpcList = mockVpcList,
  machineTypes = mockMachineTypesData,
  clusterOverrides = {},
}: MachinePoolsSubstepStoryProps) {
  const defaultValues = useMemo((): RosaWizardFormData => {
    const { cluster } = createMockClusterData(clusterOverrides);
    return mergeRosaCtClusterDefaults(cluster as RosaWizardFormData['cluster']);
  }, [clusterOverrides]);

  const methods = useRosaWizardCtForm(defaultValues, { mode: 'onChange' });

  return (
    <FormProvider {...methods}>
      <MachinePoolsSubstep vpcList={vpcList} machineTypes={machineTypes} />
    </FormProvider>
  );
}

export const MachinePoolsSubstepMount: React.FC<MachinePoolsSubstepStoryProps> = (props) => (
  <RosaWizardStringsProvider>
    <MachinePoolsSubstepMountInner {...props} />
  </RosaWizardStringsProvider>
);
