import {
  buildRosaHcpWizardStringBundles,
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
  mergeRosaHcpWizardStrings,
  mergeRosaHcpWizardValidatorStrings,
  type RosaHcpWizardStrings,
} from './rosaHcpWizardStrings';

describe('wizard string bundle merging', () => {
  it('merges nested overrides without mutating defaults or the patch', () => {
    const patch = { wizard: { stepLabels: { review: 'Summary' }, next: undefined } };
    const result = mergeRosaHcpWizardStrings(patch);

    expect(result.wizard.stepLabels).toEqual({
      ...defaultRosaHcpWizardStrings.wizard.stepLabels,
      review: 'Summary',
    });
    expect(result.wizard.next).toBe(defaultRosaHcpWizardStrings.wizard.next);
    expect(defaultRosaHcpWizardStrings.wizard.stepLabels.review).toBe('Review');
    expect(patch).toEqual({ wizard: { stepLabels: { review: 'Summary' }, next: undefined } });
    expect(result.wizard).not.toBe(defaultRosaHcpWizardStrings.wizard);
  });

  it('keeps defaults when a patch is absent and ignores inherited patch keys', () => {
    expect(mergeRosaHcpWizardStrings()).toBe(defaultRosaHcpWizardStrings);
    const patch = { wizard: { next: 'Continue' } };
    Object.setPrototypeOf(patch, { submitError: { title: 'Inherited override' } });

    const result = mergeRosaHcpWizardStrings(patch);
    expect(result.wizard.next).toBe('Continue');
    expect(result.submitError).toBe(defaultRosaHcpWizardStrings.submitError);
  });

  it('replaces function leaves and keeps sibling validator defaults', () => {
    const tooLong = (label: string, max: number): string => `${label}: ${max}`;
    const result = mergeRosaHcpWizardValidatorStrings({ operatorRolesPrefix: { tooLong } });

    expect(result.operatorRolesPrefix.tooLong).toBe(tooLong);
    expect(result.operatorRolesPrefix.tooLong('Prefix', 10)).toBe('Prefix: 10');
    expect(result.operatorRolesPrefix.invalidFormat).toBe(
      defaultRosaHcpWizardValidatorStrings.operatorRolesPrefix.invalidFormat
    );
  });

  it('replaces array leaves without merging their indices', () => {
    const daysOfWeek: RosaHcpWizardStrings['clusterUpdates']['daysOfWeek'] = [
      'Su',
      'Mo',
      'Tu',
      'We',
      'Th',
      'Fr',
      'Sa',
    ];
    const result = mergeRosaHcpWizardStrings({ clusterUpdates: { daysOfWeek } });

    expect(result.clusterUpdates.daysOfWeek).toBe(daysOfWeek);
    expect(defaultRosaHcpWizardStrings.clusterUpdates.daysOfWeek).not.toEqual(daysOfWeek);
    expect(result.clusterUpdates.sectionLabel).toBe(
      defaultRosaHcpWizardStrings.clusterUpdates.sectionLabel
    );
  });

  it('builds UI and validator bundles independently', () => {
    const result = buildRosaHcpWizardStringBundles({
      wizard: { next: 'Continue' },
      validators: { commonRequired: 'Required value' },
    });

    expect(result.strings.wizard.next).toBe('Continue');
    expect(result.validators.commonRequired).toBe('Required value');
    expect(result.validators.clusterName).toBe(defaultRosaHcpWizardValidatorStrings.clusterName);
  });
});

describe('yamlEditor.validationErrorsFound', () => {
  it('pluralizes the default English by count', () => {
    const { validationErrorsFound } = defaultRosaHcpWizardStrings.yamlEditor;
    expect(validationErrorsFound(1)).toBe('1 validation error found');
    expect(validationErrorsFound(3)).toBe('3 validation errors found');
  });

  it('uses a host-provided formatter in place of the default', () => {
    const result = mergeRosaHcpWizardStrings({
      yamlEditor: { validationErrorsFound: (count: number) => `${count} errores` },
    });
    expect(result.yamlEditor.validationErrorsFound(2)).toBe('2 errores');
  });
});
