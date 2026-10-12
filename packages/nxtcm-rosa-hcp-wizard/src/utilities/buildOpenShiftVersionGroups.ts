import type { RosaHcpWizardOpenShiftVersionGroupLabels } from '../stringsProvider/rosaHcpWizardStrings.types';
import type { OpenShiftVersionGroup, OpenShiftVersionsData } from '../types';

/** Builds grouped OpenShift version options for the version select (Details step). */
export function buildOpenShiftVersionGroups(
  data: OpenShiftVersionsData,
  labels: RosaHcpWizardOpenShiftVersionGroupLabels
): OpenShiftVersionGroup[] {
  const { default: defaultVersion, latest, releases } = data;

  if (defaultVersion == null && latest == null) {
    return [{ label: labels.releases, options: releases }];
  }

  if (defaultVersion != null && latest != null && latest.value === defaultVersion.value) {
    return [
      { label: labels.defaultRecommended, options: [defaultVersion] },
      { label: labels.previousReleases, options: releases },
    ];
  }

  const groups: OpenShiftVersionGroup[] = [];
  if (latest != null) {
    groups.push({ label: labels.latestRelease, options: [latest] });
  }
  if (defaultVersion != null) {
    groups.push({ label: labels.defaultRelease, options: [defaultVersion] });
  }
  groups.push({ label: labels.previousReleases, options: releases });
  return groups;
}
