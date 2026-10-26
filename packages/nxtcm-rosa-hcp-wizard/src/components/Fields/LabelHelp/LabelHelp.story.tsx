export { LabelHelp as LabelHelpStory } from './LabelHelp';

import { LabelHelp } from './LabelHelp';

export function EmptyLabelHelpStory(): React.ReactElement {
  return (
    <div>
      <span data-testid="marker">form field</span>
      <LabelHelp id="lh-empty" />
    </div>
  );
}
