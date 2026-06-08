import React, { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { useForm } from 'react-hook-form';
import { WizTextInput } from './WizTextInput/WizTextInput';
import {
  stringLabelFromYupMeta,
  wizFallbackFieldId,
  wizFallbackLabelFromFieldPath,
  wizFieldShowsError,
  wizFieldShowsErrorMessage,
} from './wizFieldRhf';

describe('stringLabelFromYupMeta', () => {
  it('uses the field-path fallback when Yup meta has no string or number label', () => {
    expect(stringLabelFromYupMeta(undefined, 'fb')).toBe('fb');
    expect(stringLabelFromYupMeta(null, 'fb')).toBe('fb');
  });

  it('keeps string Yup labels and converts numeric meta labels to decimals', () => {
    expect(stringLabelFromYupMeta('Hi', 'fb')).toBe('Hi');
    expect(stringLabelFromYupMeta(42, 'fb')).toBe('42');
  });

  it('uses the fallback path when Yup stores a non-primitive label (e.g. JSX)', () => {
    const el = React.createElement('span', {}, 'nested');
    expect(stringLabelFromYupMeta(el as unknown as ReactNode, 'fallback-name')).toBe(
      'fallback-name'
    );
  });
});

describe('wizFallbackFieldId', () => {
  it('prefixes single-segment names and hyphenates dotted react-hook-form paths', () => {
    expect(wizFallbackFieldId('name')).toBe('wiz-field-name');
    expect(wizFallbackFieldId('cluster.displayName')).toBe('wiz-field-cluster-displayName');
  });
});

describe('wizFallbackLabelFromFieldPath', () => {
  it('falls back to the final segment for dotted react-hook-form paths', () => {
    expect(wizFallbackLabelFromFieldPath('foo')).toBe('foo');
    expect(wizFallbackLabelFromFieldPath('a.b.c')).toBe('c');
  });
});

describe('wizFieldShowsError', () => {
  it('returns false when the field is valid', () => {
    expect(wizFieldShowsError(false, true, true)).toBe(false);
  });

  it('returns false when the field is invalid but not yet touched or submitted', () => {
    expect(wizFieldShowsError(true, false, false)).toBe(false);
  });

  it('returns true when the field is invalid and touched (before submit)', () => {
    expect(wizFieldShowsError(true, true, false)).toBe(true);
  });

  it('returns true when the field is invalid and the form was submitted', () => {
    expect(wizFieldShowsError(true, false, true)).toBe(true);
  });
});

describe('wizFieldShowsErrorMessage', () => {
  it('returns false when there is no error message', () => {
    expect(wizFieldShowsErrorMessage(undefined, true, true)).toBe(false);
    expect(wizFieldShowsErrorMessage('', true, true)).toBe(false);
  });

  it('returns true when showWithoutTouch is set', () => {
    expect(wizFieldShowsErrorMessage('Taken', false, false, { showWithoutTouch: true })).toBe(true);
  });

  it('returns true when touched or submitted, matching resolver-driven errors', () => {
    expect(wizFieldShowsErrorMessage('Required', true, false)).toBe(true);
    expect(wizFieldShowsErrorMessage('Required', false, true)).toBe(true);
    expect(wizFieldShowsErrorMessage('Required', false, false)).toBe(false);
  });
});

describe('useWizRhfControl', () => {
  it('throws at render when WizTextInput is used without FormProvider or a control prop', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const container = document.createElement('div');
    const root = createRoot(container);
    expect(() => {
      act(() => {
        root.render(React.createElement(WizTextInput, { name: 'onlyName' }));
      });
    }).toThrow(
      'WizTextInput: pass `control` from useForm(), or wrap the form with <FormProvider {...methods}> from react-hook-form.'
    );

    root.unmount();
    jest.restoreAllMocks();
  });

  it('throws at render when validateOnBlur is used with control-only mount (no FormProvider)', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    function ControlOnlyValidateOnBlurHarness() {
      const methods = useForm({ defaultValues: { notes: '' } });
      return React.createElement(WizTextInput<{ notes: string }>, {
        control: methods.control,
        name: 'notes',
        validateOnBlur: true,
      });
    }

    const container = document.createElement('div');
    const root = createRoot(container);
    expect(() => {
      act(() => {
        root.render(React.createElement(ControlOnlyValidateOnBlurHarness));
      });
    }).toThrow(
      'WizTextInputBound: `validateOnBlur` requires FormProvider and cannot be used with control-only mounts (when only `control` is passed). Wrap the field with <FormProvider {...methods}> or omit `validateOnBlur`.'
    );

    root.unmount();
    jest.restoreAllMocks();
  });
});
