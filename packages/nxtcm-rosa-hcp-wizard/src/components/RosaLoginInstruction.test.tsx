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

  it('returns command with actual credentials when acm product has selectedSecret', () => {
    const selectedSecret = { client_id: 'my-client-id', client_secret: 'my-client-secret' };
    expect(getRosaLoginCommand('acm', selectedSecret)).toBe(
      'rosa login --client-id my-client-id --client-secret my-client-secret'
    );
  });

  it('returns the default command for ocm even when selectedSecret is provided', () => {
    const selectedSecret = { client_id: 'my-client-id', client_secret: 'my-client-secret' };
    const defaultCommand = 'rosa login --use-auth-code --url https://api.openshift.com';
    expect(getRosaLoginCommand('ocm', selectedSecret)).toBe(defaultCommand);
  });

  it('returns the default command for oem even when selectedSecret is provided', () => {
    const selectedSecret = { client_id: 'my-client-id', client_secret: 'my-client-secret' };
    const defaultCommand = 'rosa login --use-auth-code --url https://api.openshift.com';
    expect(getRosaLoginCommand('oem', selectedSecret)).toBe(defaultCommand);
  });

  it('returns the placeholder service command for acm when selectedSecret is undefined', () => {
    expect(getRosaLoginCommand('acm', undefined)).toBe(
      'rosa login --client-id <CLIENT_ID> --client-secret <CLIENT_SECRET>'
    );
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

  it('accepts selectedSecret prop', () => {
    const selectedSecret = { client_id: 'test-id', client_secret: 'test-secret' };
    const element = React.createElement(RosaLoginInstruction, {
      product: 'acm',
      selectedSecret,
    });
    expect(element.props.selectedSecret).toEqual(selectedSecret);
  });
});
