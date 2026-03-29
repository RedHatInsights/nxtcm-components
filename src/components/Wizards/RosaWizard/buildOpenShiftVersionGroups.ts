import type { OpenShiftVersionGroup, OpenShiftVersionsData } from '../types';

const VERSION_GROUP_LABELS = {
  latest: 'Latest release',
  default: 'Default release',
  defaultRecommended: 'Default (Recommended)',
  previousReleases: 'Previous releases',
  releases: 'Releases',
} as const;

/** Builds grouped OpenShift version options for the version select (Details step). */
export function buildOpenShiftVersionGroups(data: OpenShiftVersionsData): OpenShiftVersionGroup[] {
  const hasDefault = data.default != null;
  const hasLatest = data.latest != null;
  const releasesLabel =
    hasDefault || hasLatest ? VERSION_GROUP_LABELS.previousReleases : VERSION_GROUP_LABELS.releases;

  if (!hasDefault && !hasLatest) {
    return [{ label: releasesLabel, options: data.releases }];
  }

  if (hasDefault && hasLatest && data.latest!.value === data.default!.value) {
    return [
      { label: VERSION_GROUP_LABELS.defaultRecommended, options: [data.default!] },
      { label: releasesLabel, options: data.releases },
    ];
  }

  const groups: OpenShiftVersionGroup[] = [];
  if (hasLatest) {
    groups.push({ label: VERSION_GROUP_LABELS.latest, options: [data.latest!] });
  }
  if (hasDefault) {
    groups.push({ label: VERSION_GROUP_LABELS.default, options: [data.default!] });
  }
  groups.push({ label: releasesLabel, options: data.releases });
  return groups;
}
