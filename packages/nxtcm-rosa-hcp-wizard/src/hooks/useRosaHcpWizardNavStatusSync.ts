import { useEffect } from 'react';
import { useWizardContext } from '@patternfly/react-core';

import { useRosaHcpWizardNavStepStatuses } from './useRosaHcpWizardNavStepStatuses';

/** Pushes computed validation status onto PatternFly wizard nav items. */
export function useRosaHcpWizardNavStatusSync(includeClusterWideProxy: boolean): void {
  const navStepStatuses = useRosaHcpWizardNavStepStatuses(includeClusterWideProxy);
  const { setStep } = useWizardContext();

  useEffect(() => {
    for (const [stepId, status] of Object.entries(navStepStatuses)) {
      setStep({ id: stepId, status });
    }
  }, [navStepStatuses, setStep]);
}
