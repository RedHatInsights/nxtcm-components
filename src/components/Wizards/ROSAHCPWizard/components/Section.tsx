import { Content, Split, SplitItem, Stack } from '@patternfly/react-core';
import { LabelHelp } from './LabelHelp';
import React, { ReactNode } from 'react';

type SectionProps = {
  id?: string;
  label: string;
  description?: ReactNode;
  prompt?: string;
  children?: ReactNode;
  defaultExpanded?: boolean;
  labelHelpTitle?: string;
  labelHelp?: string;
  autohide?: boolean;
};

export const Section: React.FunctionComponent<SectionProps> = (props) => {
  const id = props.id ?? props.label?.toLowerCase().split(' ').join('-') ?? '';

  return (
    <section id={id} className="pf-v6-c-form__group" role="group">
      <Split hasGutter>
        <SplitItem isFilled>
          <Stack>
            <Split hasGutter>
              <div className="pf-v6-c-form__section-title">
                {props.label}
                {props.id && (
                  <LabelHelp
                    id={props.id}
                    labelHelp={props.labelHelp}
                    labelHelpTitle={props.labelHelpTitle}
                  />
                )}
              </div>
            </Split>
            {props.description && (
              <Content component="small" className="pf-v6-u-pt-sm">
                {props.description}
              </Content>
            )}
          </Stack>
        </SplitItem>
      </Split>
      {props.children}
    </section>
  );
};
