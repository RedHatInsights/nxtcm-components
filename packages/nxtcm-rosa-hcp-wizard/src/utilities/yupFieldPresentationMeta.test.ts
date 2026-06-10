import React from 'react';
import * as yup from 'yup';

import { getYupFieldPresentationMeta } from './yupFieldPresentationMeta';

describe('getYupFieldPresentationMeta', () => {
  it('returns meta fields attached with .meta()', () => {
    const schema = yup.object({
      acceptTerms: yup.boolean().required().meta({
        id: 'accept-terms',
        label: 'I accept',
        title: 'Terms',
        helperText: 'Required to continue.',
        labelHelp: 'Legal text',
        labelHelpTitle: 'Terms details',
      }),
    });
    expect(getYupFieldPresentationMeta(schema, 'acceptTerms')).toEqual({
      id: 'accept-terms',
      label: 'I accept',
      title: 'Terms',
      helperText: 'Required to continue.',
      labelHelp: 'Legal text',
      labelHelpTitle: 'Terms details',
    });
  });

  it('returns empty object when no meta is set', () => {
    const schema = yup.object({
      optIn: yup.boolean().optional(),
    });
    expect(getYupFieldPresentationMeta(schema, 'optIn')).toEqual({});
  });

  it('reads nested paths via object describe', () => {
    const schema = yup.object({
      user: yup.object({
        name: yup.string().required().meta({ id: 'user-name', label: 'Name' }),
      }),
    });
    expect(getYupFieldPresentationMeta(schema, 'user.name')).toEqual({
      id: 'user-name',
      label: 'Name',
    });
  });

  it('returns labelKey from .meta() when set', () => {
    const schema = yup.object({
      billing: yup.string().meta({ labelKey: 'details.billingLabel', id: 'billing-field' }),
    });
    expect(getYupFieldPresentationMeta(schema, 'billing')).toEqual({
      id: 'billing-field',
      labelKey: 'details.billingLabel',
    });
  });

  it('returns placeholder and placeholderKey from .meta() when set', () => {
    const schema = yup.object({
      short: yup.string().meta({
        placeholder: 'Inline placeholder',
        placeholderKey: 'networking.publicSubnetPlaceholder',
      }),
    });
    expect(getYupFieldPresentationMeta(schema, 'short')).toEqual({
      placeholder: 'Inline placeholder',
      placeholderKey: 'networking.publicSubnetPlaceholder',
    });
  });

  it('returns *Key helpers from .meta() when set', () => {
    const schema = yup.object({
      field: yup.string().meta({
        helperTextKey: 'networking.machineCidrHelp',
        labelHelpKey: 'networking.publicPopover',
        labelHelpTitleKey: 'details.clusterNameLabel',
      }),
    });
    expect(getYupFieldPresentationMeta(schema, 'field')).toEqual({
      helperTextKey: 'networking.machineCidrHelp',
      labelHelpKey: 'networking.publicPopover',
      labelHelpTitleKey: 'details.clusterNameLabel',
    });
  });

  it('preserves React element helperText from .meta()', () => {
    const helper = React.createElement('span', { 'data-testid': 'meta-helper' }, 'From meta');
    const schema = yup.object({
      acceptTerms: yup.boolean().optional().meta({ helperText: helper }),
    });
    const { helperText } = getYupFieldPresentationMeta(schema, 'acceptTerms');
    // Yup describe/meta may return a new element reference with the same shape.
    expect(helperText).toStrictEqual(helper);
  });
});
