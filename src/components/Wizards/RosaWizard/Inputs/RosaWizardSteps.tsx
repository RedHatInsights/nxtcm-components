import { Form } from '@patternfly/react-core';
import { Fragment, type ReactElement, type ReactNode } from 'react';

/** Expandable group marker (mirrors react-form-wizard `ExpandableStep` for shell parsing). */
export function RosaExpandableStep(props: {
  id: string;
  label: React.ReactNode;
  isExpandable?: boolean;
  steps?: ReactElement[];
  children?: ReactNode;
  hidden?: (item: unknown) => boolean;
  autohide?: boolean;
}) {
  if (props.steps && props.steps.length > 0) {
    return null;
  }
  return <Fragment>{props.children}</Fragment>;
}

/** Single wizard sub-step (mirrors react-form-wizard `Step`). */
export function RosaStep(props: { id: string; label: string; children?: ReactNode }) {
  return (
    <div id={props.id}>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        {props.children}
      </Form>
    </div>
  );
}
