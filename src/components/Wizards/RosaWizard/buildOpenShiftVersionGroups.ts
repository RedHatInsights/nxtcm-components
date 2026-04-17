import type { OpenShiftVersionGroup, OpenShiftVersionsData } from '../types';
import type { RosaWizardOpenShiftVersionGroupLabels } from './rosaWizardStrings.types';

/**
 * Groups OpenShift versions for the Details step select: latest, default, and remaining releases,
 * with labels that depend on whether the API returned separate latest/default entries.
 */
export function buildOpenShiftVersionGroups(
  data: OpenShiftVersionsData,
  labels: RosaWizardOpenShiftVersionGroupLabels
): OpenShiftVersionGroup[] {
  const hasDefault = data.default != null;
  const hasLatest = data.latest != null;
  const releasesLabel = hasDefault || hasLatest ? labels.previousReleases : labels.releases;

  if (!hasDefault && !hasLatest) {
    return [{ label: releasesLabel, options: data.releases }];
  }

  if (hasDefault && hasLatest && data.latest!.value === data.default!.value) {
    return [
      { label: labels.defaultRecommended, options: [data.default!] },
      { label: releasesLabel, options: data.releases },
    ];
  }

  const groups: OpenShiftVersionGroup[] = [];
  if (hasLatest) {
    groups.push({ label: labels.latestRelease, options: [data.latest!] });
  }
  if (hasDefault) {
    groups.push({ label: labels.defaultRelease, options: [data.default!] });
  }
  groups.push({ label: releasesLabel, options: data.releases });
  return groups;
}
