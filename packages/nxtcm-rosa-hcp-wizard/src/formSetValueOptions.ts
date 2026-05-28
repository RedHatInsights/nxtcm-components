export type FormSetValueOptions = {
  shouldDirty?: boolean;
  shouldTouch?: boolean;
  shouldValidate?: boolean;
};

/** Default react-hook-form `setValue` flags shared by wizard field reset/sync helpers. */
export function buildFormSetValueOptions(
  options: FormSetValueOptions = {}
): Required<FormSetValueOptions> {
  return {
    shouldDirty: options.shouldDirty ?? true,
    shouldTouch: options.shouldTouch ?? false,
    shouldValidate: options.shouldValidate ?? false,
  };
}
