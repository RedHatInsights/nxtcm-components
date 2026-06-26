import { Content, Form, Split, SplitItem, Stack } from '@patternfly/react-core';
import { LabelHelp } from './LabelHelp';
import React, { ReactNode } from 'react';

type SectionProps = {
  id?: string;
  label: string | ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  labelHelpTitle?: string;
  labelHelp?: string;
};

export const Section: React.FunctionComponent<SectionProps> = (props) => {
  const id =
    props.id ??
    (typeof props.label === 'string' ? props.label.toLowerCase().split(' ').join('-') : '');

  return (
    <section id={id} className="pf-v6-c-form__group" role="group">
      <Form onSubmit={(e) => e.preventDefault()}>
        <Split hasGutter>
          <SplitItem isFilled>
            <Stack>
              <Split hasGutter>
                <div className="pf-v6-c-form__section-title pf-v6-u-w-100">
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
      </Form>
    </section>
  );
};
