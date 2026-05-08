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

  it('reads nested paths via yup.reach', () => {
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
