import { isValidElement, useMemo } from 'react';
import { Content, Grid, GridItem, Stack } from '@patternfly/react-core';
import * as yup from 'yup';

import {
  getYupFieldDescriptionAtPath,
  testsFromDescription,
  type YupFieldDescribeOptions,
} from '../../utilities/yupFieldDescribe';

/** Yup's public `Test` type hides `OPTIONS`; `describe()` uses this internally. */
type YupInternalTest = yup.AnySchema['tests'][number] & {
  OPTIONS?: { name?: string; message?: unknown; params?: Record<string, unknown> };
};

/**
 * Same test ordering + de-duplication Yup uses in {@link yup.Schema.describe}
 * (first test wins per `OPTIONS.name`).
 */
function schemaTestsMatchingYupDescribe(
  leaf: yup.AnySchema,
  describeOptions?: YupFieldDescribeOptions
): YupInternalTest[] {
  const next = (describeOptions ? leaf.resolve(describeOptions) : leaf).clone();
  const list = next.tests as YupInternalTest[];
  return list.filter(
    (n, idx, arr) => arr.findIndex((c) => c.OPTIONS?.name === n.OPTIONS?.name) === idx
  );
}

function storyJsonReplacer(_key: string, value: unknown): unknown {
  if (isValidElement(value)) {
    return '[React element]';
  }
  if (typeof value === 'function') {
    return `[Function: ${value.name || 'anonymous'}]`;
  }
  if (typeof value === 'symbol') {
    return String(value);
  }
  return value;
}

/**
 * Pretty-print {@link yup.Schema.describe} for Storybook (React nodes / functions / symbols are stubbed).
 * Yup's `describe()` omits each test's validation `message`; this merges those messages from the
 * resolved schema's test queue so Storybook shows the same error copy as runtime validation.
 * For conditional schemas, pass the same `describeOptions` you use with {@link isYupFieldRequired}.
 */
export function yupDescribeJson(
  schema: yup.AnyObjectSchema,
  path: string,
  describeOptions?: YupFieldDescribeOptions
): string {
  const leaf = yup.reach(schema, path) as yup.AnySchema;
  const description = getYupFieldDescriptionAtPath(schema, path, describeOptions);
  const filteredTests = schemaTestsMatchingYupDescribe(leaf, describeOptions);
  const tests = testsFromDescription(description).map((t, i) => {
    const message = filteredTests[i]?.OPTIONS?.message;
    return message !== undefined ? { ...t, message } : { ...t };
  });
  return JSON.stringify({ ...description, tests }, storyJsonReplacer, 2);
}

export interface WizFieldsYupStoryDebugGridProps {
  schema: yup.AnyObjectSchema;
  fieldPath: string;
  lastSubmit: unknown;
  describeOptions?: YupFieldDescribeOptions;
  className?: string;
  emptySubmitMessage?: string;
}

/**
 * Side-by-side Yup `describe()` output and last submit JSON for Wiz* Storybook demos.
 */
export function WizFieldsYupStoryDebugGrid({
  schema,
  fieldPath,
  lastSubmit,
  describeOptions,
  className = 'pf-v6-u-mt-lg',
  emptySubmitMessage = 'Submit the form above to see parsed values here.',
}: WizFieldsYupStoryDebugGridProps) {
  const yupJson = useMemo(
    () => yupDescribeJson(schema, fieldPath, describeOptions),
    [schema, fieldPath, describeOptions]
  );

  return (
    <Grid hasGutter className={className}>
      <GridItem span={12} md={6}>
        <Stack hasGutter>
          <Content component="p">
            Yup <code>describe()</code> for <code>{fieldPath}</code> (type, optional, tests with
            validation messages, <code>meta</code>, …)
          </Content>
          <Content
            component="pre"
            className="pf-v6-u-font-family-monospace pf-v6-u-overflow-auto pf-v6-u-p-sm pf-v6-u-background-color-200"
          >
            {yupJson}
          </Content>
        </Stack>
      </GridItem>
      <GridItem span={12} md={6}>
        <Stack hasGutter>
          <Content component="p">Form values after last successful submit</Content>
          <Content
            component="pre"
            className="pf-v6-u-font-family-monospace pf-v6-u-overflow-auto pf-v6-u-p-sm pf-v6-u-background-color-200"
          >
            {lastSubmit !== null ? JSON.stringify(lastSubmit, null, 2) : emptySubmitMessage}
          </Content>
        </Stack>
      </GridItem>
    </Grid>
  );
}
