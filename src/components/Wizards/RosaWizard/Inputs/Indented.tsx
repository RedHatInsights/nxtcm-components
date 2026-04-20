import { Stack } from '@patternfly/react-core';
import { Fragment, ReactNode } from 'react';
import { useWatch } from 'react-hook-form';
import type { RosaWizardFormData } from '../../types';

export function Indented(props: {
  id?: string;
  children?: ReactNode;
  hidden?: (item: RosaWizardFormData) => boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) {
  const item = useWatch() as RosaWizardFormData;
  const { paddingBottom, paddingTop } = props;
  if (!props.children) return <Fragment />;
  if (props.hidden?.(item)) return <Fragment />;
  return (
    <Stack
      id={props.id}
      hasGutter
      style={{ paddingLeft: 22, paddingBottom, paddingTop }}
    >
      {props.children}
    </Stack>
  );
}
