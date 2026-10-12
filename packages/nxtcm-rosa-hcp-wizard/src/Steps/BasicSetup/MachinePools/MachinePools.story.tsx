// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
import React, { useMemo } from 'react';

import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';
import { FormProvider, useForm } from 'react-hook-form';

import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import {
  makeDefaultRosaHcpCtWizardData,
  makeMachineTypesResource,
  makeVpcListResource,
  WizardFieldMetaChangeEffectsCtHarness,
} from '../../../test/rosaHcpWizardCtSpecHelpers';
import type {
  MachineTypesResource,
  ROSAHCPCluster,
  VpcListResource,
  WizardConfig,
} from '../../../types';
import { createClusterValidationResolver } from '../../../utilities/clusterValidationResolver';
import { WizardConfigProvider } from '../../../WizardConfigContext';
import { getClusterValidationSchemaDefaultValues } from '../../../yupSchemas';
import { MachinePools } from './MachinePools';

export type MachinePoolsMountProps = {
  vpcList?: VpcListResource;
  machineTypes?: MachineTypesResource;
  defaultValues?: Partial<ROSAHCPCluster>;
  config?: WizardConfig;
};

const MachinePoolsMountComponent: React.FC<MachinePoolsMountProps> = ({
  vpcList,
  machineTypes,
  defaultValues = {},
  config = {},
}) => {
  const resolver = useMemo(
    () => createClusterValidationResolver(defaultRosaHcpWizardValidatorStrings),
    []
  );

  const schemaDefaults = getClusterValidationSchemaDefaultValues();

  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: {
      ...schemaDefaults,
      region: 'us-east-1',
      cluster_version: '4.16.2',
      ...defaultValues,
    },
    resolver,
    mode: 'onTouched',
  });

  const vpcListProps = makeVpcListResource(vpcList);
  const machineTypesProps = makeMachineTypesResource(machineTypes);

  const wizardData = useMemo(
    () =>
      makeDefaultRosaHcpCtWizardData({
        machineTypes: machineTypesProps,
        vpcList: vpcListProps,
      }),
    [machineTypesProps, vpcListProps]
  );

  return withRosaCt(
    <WizardConfigProvider config={config}>
      <FormProvider {...methods}>
        <Form>
          <WizardFieldMetaChangeEffectsCtHarness wizardData={wizardData} />
          <MachinePools vpcList={vpcListProps} machineTypes={machineTypesProps} />
        </Form>
      </FormProvider>
    </WizardConfigProvider>
  );
};

type BrowserProps = NonNullable<React.ComponentProps<typeof MachinePoolsMountComponent>>;

export type MachinePoolsMountGalleryProps = Omit<BrowserProps, 'vpcList' | 'machineTypes'> & {
  vpcList?: Omit<NonNullable<BrowserProps['vpcList']>, 'fetch'>;
  machineTypes?: Omit<NonNullable<BrowserProps['machineTypes']>, 'fetch'>;
};

export function MachinePoolsMount(props: MachinePoolsMountGalleryProps): React.ReactElement {
  const [vpcFetchCalls, setVpcFetchCalls] = React.useState<
    Parameters<NonNullable<NonNullable<BrowserProps['vpcList']>['fetch']>>[]
  >([]);
  const [fetchMachineTypesCalls, setFetchMachineTypesCalls] = React.useState<
    Parameters<NonNullable<NonNullable<BrowserProps['machineTypes']>['fetch']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      vpcList: props.vpcList
        ? {
            ...props.vpcList,
            fetch: (...args) => {
              setVpcFetchCalls((calls) => [...calls, args]);
              return Promise.resolve();
            },
          }
        : undefined,
      machineTypes: props.machineTypes
        ? {
            ...props.machineTypes,
            fetch: (...args) => {
              setFetchMachineTypesCalls((calls) => [...calls, args]);
              return Promise.resolve();
            },
          }
        : undefined,
    }),
    [props]
  );
  return (
    <>
      <MachinePoolsMountComponent {...browserProps} />
      <div hidden>
        <input data-testid="vpcFetch-calls" readOnly value={JSON.stringify(vpcFetchCalls)} />
        <input data-testid="vpcFetch-count" readOnly value={String(vpcFetchCalls.length)} />
        <input
          data-testid="fetchMachineTypes-calls"
          readOnly
          value={JSON.stringify(fetchMachineTypesCalls)}
        />
        <input
          data-testid="fetchMachineTypes-count"
          readOnly
          value={String(fetchMachineTypesCalls.length)}
        />
      </div>
    </>
  );
}
