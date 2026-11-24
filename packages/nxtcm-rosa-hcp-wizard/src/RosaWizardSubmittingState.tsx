import {
  EmptyState,
  EmptyStateBody,
} from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';

import { useRosaHcpWizardStrings } from './stringsProvider/RosaHcpWizardStringsContext';

type RosaWizardSubmittingStateProps = {
  createClusterTitleId: string;
};

export const RosaWizardSubmittingState = (props: RosaWizardSubmittingStateProps) => {
  const { createClusterTitleId } = props;
  const str = useRosaHcpWizardStrings();

  return (
    <EmptyState
      titleText={<span id={createClusterTitleId}>{str.createCluster.inProgressTitle}</span>}
      headingLevel="h2"
    >
      <EmptyStateBody>
        <Spinner />
      </EmptyStateBody>
    </EmptyState>
  );
};
