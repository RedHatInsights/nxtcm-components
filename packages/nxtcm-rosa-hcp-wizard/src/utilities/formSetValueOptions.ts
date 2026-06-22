export type FormSetValueOptions = {
  shouldDirty?: boolean;
  shouldTouch?: boolean;
  shouldValidate?: boolean;
};

/** Default RHF flags for wizard field resets and derived sync writes. */
export const DEFAULT_FORM_SET_VALUE_OPTS: Required<FormSetValueOptions> = {
  shouldDirty: true,
  shouldTouch: false,
  shouldValidate: false,
};

/** RHF flags when a derived sync write should re-run validation. */
export const DEFAULT_FORM_SET_VALUE_OPTS_WITH_VALIDATE: Required<FormSetValueOptions> = {
  shouldDirty: true,
  shouldTouch: false,
  shouldValidate: true,
};

export function buildFormSetValueOptions(
  options: FormSetValueOptions = {}
): Required<FormSetValueOptions> {
  return {
    shouldDirty: options.shouldDirty ?? DEFAULT_FORM_SET_VALUE_OPTS.shouldDirty,
    shouldTouch: options.shouldTouch ?? DEFAULT_FORM_SET_VALUE_OPTS.shouldTouch,
    shouldValidate: options.shouldValidate ?? DEFAULT_FORM_SET_VALUE_OPTS.shouldValidate,
  };
}
