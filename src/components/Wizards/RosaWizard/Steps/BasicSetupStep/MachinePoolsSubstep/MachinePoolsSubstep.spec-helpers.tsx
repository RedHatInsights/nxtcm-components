/**
 * Playwright CT mount target only — import {@link MachinePoolsSubstepMount} alone from this file in
 * *.spec.tsx so the CT transform can replace it with an import ref. Fixtures and strings live in
 * {@link ./MachinePoolsSubstep.fixtures}.
 * @see https://playwright.dev/docs/test-components#test-stories
 */
import React, { useState, useCallback } from 'react';
import { MachinePoolsSubstep } from './MachinePoolsSubstep';
import { RosaWizardStringsProvider } from '../../../RosaWizardStringsContext';
import { ItemContext } from '@patternfly-labs/react-form-wizard/contexts/ItemContext';
import { DataContext } from '@patternfly-labs/react-form-wizard/contexts/DataContext';
import {
  DisplayModeContext,
  DisplayMode,
} from '@patternfly-labs/react-form-wizard/contexts/DisplayModeContext';
import { ShowValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ShowValidationProvider';
import { ValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ValidationProvider';
import { StepShowValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/StepShowValidationProvider';
import {
  createMockClusterData,
  mockMachineTypesData,
  mockVpcList,
  type MachinePoolsSubstepStoryProps,
} from './MachinePoolsSubstep.fixtures';

export type { MachinePoolsSubstepStoryProps };

export const MachinePoolsSubstepMount: React.FC<MachinePoolsSubstepStoryProps> = ({
  vpcList = mockVpcList,
  machineTypes = mockMachineTypesData,
  clusterOverrides = {},
}) => {
  const [data, setData] = useState(() => createMockClusterData(clusterOverrides));

  const update = useCallback(() => {
    setData((currentData) => ({ ...currentData }));
  }, []);

  return (
    <RosaWizardStringsProvider>
      <DataContext.Provider value={{ update }}>
        <DisplayModeContext.Provider value={DisplayMode.Step}>
          <ItemContext.Provider value={data}>
            <StepShowValidationProvider>
              <ShowValidationProvider>
                <ValidationProvider>
                  <MachinePoolsSubstep vpcList={vpcList} machineTypes={machineTypes} />
                </ValidationProvider>
              </ShowValidationProvider>
            </StepShowValidationProvider>
          </ItemContext.Provider>
        </DisplayModeContext.Provider>
      </DataContext.Provider>
    </RosaWizardStringsProvider>
  );
};
