import { Content } from '@patternfly/react-core';
import { Fragment, ReactNode } from 'react';

type RosaSectionProps = {
  id?: string;
  label: string;
  description?: ReactNode;
  children?: ReactNode;
};

/** Lightweight section header for wizard steps (replaces react-form-wizard `Section` for edit mode). */
export function RosaSection(props: RosaSectionProps) {
  const id = props.id ?? props.label?.toLowerCase().split(' ').join('-') ?? '';
  return (
    <section id={id} className="pf-v6-c-form__section" role="group">
      <div className="pf-v6-c-form__section-title">{props.label}</div>
      {props.description && (
        <Content component="small" style={{ paddingTop: 8 }}>
          {props.description}
        </Content>
      )}
      {props.children ? <Fragment>{props.children}</Fragment> : null}
    </section>
  );
}
