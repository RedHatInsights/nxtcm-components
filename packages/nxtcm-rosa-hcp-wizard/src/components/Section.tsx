import { Content, Form, Split, SplitItem, Stack } from '@patternfly/react-core';
import { LabelHelp } from './LabelHelp';
import React, { ReactNode } from 'react';
import './Section.css';

type SectionProps = {
  id?: string;
  label: string | ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  labelHelpTitle?: string;
  labelHelp?: string;
  /** Optional actions rendered beside the section title (e.g. Review "Edit in YAML"). */
  labelActions?: ReactNode;
  /** When false, step body is not wrapped in PatternFly Form (e.g. Review). Defaults to true. */
  isForm?: boolean;
};

export const Section: React.FunctionComponent<SectionProps> = (props) => {
  const {
    isForm = true,
    children,
    description,
    id: idProp,
    label,
    labelHelp,
    labelHelpTitle,
    labelActions,
  } = props;
  const id = idProp ?? (typeof label === 'string' ? label.toLowerCase().split(' ').join('-') : '');

  const sectionHeader = (
    <Split hasGutter>
      <SplitItem isFilled>
        <Stack>
          <Split hasGutter>
            <SplitItem isFilled>
              <div className="rosa-hcp-section__title pf-v6-u-w-100">
                {label}
                {idProp && (
                  <LabelHelp id={idProp} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} />
                )}
              </div>
            </SplitItem>
            {labelActions ? <SplitItem>{labelActions}</SplitItem> : null}
          </Split>
          {description && (
            <Content component="small" className="pf-v6-u-pt-sm">
              {description}
            </Content>
          )}
        </Stack>
      </SplitItem>
    </Split>
  );

  return (
    <section id={id} className="pf-v6-c-form__group" role="group">
      {isForm ? (
        <Form isWidthLimited onSubmit={(e) => e.preventDefault()}>
          {sectionHeader}
          {children}
        </Form>
      ) : (
        <>
          {/* pf-m-limit-width reads --pf-v6-c-form--m-limit-width--MaxWidth from PatternFly Form CSS */}
          <div className="pf-v6-c-form pf-m-limit-width">{sectionHeader}</div>
          {children}
        </>
      )}
    </section>
  );
};
