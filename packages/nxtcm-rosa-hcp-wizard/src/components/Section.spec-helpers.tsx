import React from 'react';
import { withRosaCt } from './WizFields/wizFieldCtSpecHelpers';
import { Section } from './Section';

export interface SectionMountProps {
  id?: string;
  label?: string | React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  labelHelpTitle?: string;
  labelHelp?: string;
}

export const SectionMount: React.FC<SectionMountProps> = ({
  id,
  label = 'Section Label',
  description,
  children,
  labelHelpTitle,
  labelHelp,
}) => {
  return withRosaCt(
    <Section
      id={id}
      label={label}
      description={description}
      labelHelpTitle={labelHelpTitle}
      labelHelp={labelHelp}
    >
      {children}
    </Section>
  );
};
