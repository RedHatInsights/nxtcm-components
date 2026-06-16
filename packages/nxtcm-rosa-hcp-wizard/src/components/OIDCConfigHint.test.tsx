import React from 'react';
import { OIDCConfigHint } from './OIDCConfigHint';

describe('OIDCConfigHint', () => {
  it('is a valid React component that accepts an optional loginCommand prop', () => {
    // Verify it's a callable function component
    expect(typeof OIDCConfigHint).toBe('function');

    // Verify it can be called with no props (backward compatible)
    const noPropsElement = React.createElement(OIDCConfigHint);
    expect(noPropsElement).toBeDefined();
    expect(noPropsElement.props).toEqual({});

    // Verify it accepts loginCommand prop
    const withPropElement = React.createElement(OIDCConfigHint, {
      loginCommand: 'rosa login --use-auth-code --url https://custom.example.com',
    });
    expect(withPropElement.props.loginCommand).toBe(
      'rosa login --use-auth-code --url https://custom.example.com'
    );
  });
});
