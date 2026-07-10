import React from 'react';
import { getRosaLoginCommand } from './rosaLoginCommand';
import { RosaLoginInstruction } from './RosaLoginInstruction';

describe('getRosaLoginCommand', () => {
  it('returns the service login command for acm', () => {
    expect(getRosaLoginCommand('acm')).toBe(
      'rosa login --client-id <CLIENT_ID> --client-secret <CLIENT_SECRET>'
    );
  });

  it('returns the default login command for ocm and oem', () => {
    const defaultCommand = 'rosa login --use-auth-code --url https://api.openshift.com';
    expect(getRosaLoginCommand('ocm')).toBe(defaultCommand);
    expect(getRosaLoginCommand('oem')).toBe(defaultCommand);
  });
});

describe('RosaLoginInstruction', () => {
  it('is a valid React component that accepts optional props', () => {
    expect(typeof RosaLoginInstruction).toBe('function');

    const noPropsElement = React.createElement(RosaLoginInstruction);
    expect(noPropsElement).toBeDefined();
    expect(noPropsElement.props).toEqual({});

    const withProductElement = React.createElement(RosaLoginInstruction, { product: 'ocm' });
    expect(withProductElement.props.product).toBe('ocm');

    const withoutInstructionsElement = React.createElement(RosaLoginInstruction, {
      showInstructions: false,
    });
    expect(withoutInstructionsElement.props.showInstructions).toBe(false);
  });
});
