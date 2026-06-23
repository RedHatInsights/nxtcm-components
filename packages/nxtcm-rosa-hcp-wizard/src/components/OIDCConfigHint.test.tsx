import React from 'react';
import { OIDCConfigHint } from './OIDCConfigHint';

describe('OIDCConfigHint', () => {
  it('is a valid React component that accepts an optional product prop', () => {
    expect(typeof OIDCConfigHint).toBe('function');

    // Verify it can be called with no props (defaults to acm)
    const noPropsElement = React.createElement(OIDCConfigHint);
    expect(noPropsElement).toBeDefined();
    expect(noPropsElement.props).toEqual({});

    // Verify it accepts the product prop
    const withAcmElement = React.createElement(OIDCConfigHint, { product: 'acm' });
    expect(withAcmElement.props.product).toBe('acm');

    const withOcmElement = React.createElement(OIDCConfigHint, { product: 'ocm' });
    expect(withOcmElement.props.product).toBe('ocm');

    const withOemElement = React.createElement(OIDCConfigHint, { product: 'oem' });
    expect(withOemElement.props.product).toBe('oem');
  });
});
