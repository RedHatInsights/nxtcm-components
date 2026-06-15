import { ClusterUpgrade, type ROSAHCPCluster } from '../../types';
import { shouldHideReviewRow } from './shouldHideReviewRow';

const baseFormValues: Partial<ROSAHCPCluster> = {
  autoscaling: false,
  nodes_compute: 2,
  min_replicas: 2,
  max_replicas: 4,
  imds: 'imdsv2only',
  security_groups_worker: ['sg-1'],
};

describe('shouldHideReviewRow', () => {
  it('hides when meta hideInReview is true', () => {
    expect(
      shouldHideReviewRow({
        path: 'autoscaling',
        formValues: baseFormValues,
        metaShouldHideInReview: true,
      })
    ).toBe(true);
  });

  it('hides nodes_compute when autoscaling is enabled', () => {
    expect(
      shouldHideReviewRow({
        path: 'nodes_compute',
        formValues: { ...baseFormValues, autoscaling: true },
        metaShouldHideInReview: false,
      })
    ).toBe(true);
  });

  it('shows nodes_compute when autoscaling is disabled', () => {
    expect(
      shouldHideReviewRow({
        path: 'nodes_compute',
        formValues: baseFormValues,
        metaShouldHideInReview: false,
      })
    ).toBe(false);
  });

  it('hides min and max replicas when autoscaling is disabled', () => {
    expect(
      shouldHideReviewRow({
        path: 'min_replicas',
        formValues: baseFormValues,
        metaShouldHideInReview: false,
      })
    ).toBe(true);
    expect(
      shouldHideReviewRow({
        path: 'max_replicas',
        formValues: baseFormValues,
        metaShouldHideInReview: false,
      })
    ).toBe(true);
  });

  it('shows min and max replicas when autoscaling is enabled', () => {
    const formValues = { ...baseFormValues, autoscaling: true };
    expect(
      shouldHideReviewRow({
        path: 'min_replicas',
        formValues,
        metaShouldHideInReview: false,
      })
    ).toBe(false);
    expect(
      shouldHideReviewRow({
        path: 'max_replicas',
        formValues,
        metaShouldHideInReview: false,
      })
    ).toBe(false);
  });

  it('hides imds when value is empty', () => {
    expect(
      shouldHideReviewRow({
        path: 'imds',
        formValues: { ...baseFormValues, imds: '' },
        metaShouldHideInReview: false,
      })
    ).toBe(true);
    expect(
      shouldHideReviewRow({
        path: 'imds',
        formValues: { ...baseFormValues, imds: undefined },
        metaShouldHideInReview: false,
      })
    ).toBe(true);
  });

  it('hides security_groups_worker when missing, empty, or blank ids only', () => {
    expect(
      shouldHideReviewRow({
        path: 'security_groups_worker',
        formValues: { ...baseFormValues, security_groups_worker: [] },
        metaShouldHideInReview: false,
      })
    ).toBe(true);
    expect(
      shouldHideReviewRow({
        path: 'security_groups_worker',
        formValues: { ...baseFormValues, security_groups_worker: undefined },
        metaShouldHideInReview: false,
      })
    ).toBe(true);
    expect(
      shouldHideReviewRow({
        path: 'security_groups_worker',
        formValues: { ...baseFormValues, security_groups_worker: [''] },
        metaShouldHideInReview: false,
      })
    ).toBe(true);
    expect(
      shouldHideReviewRow({
        path: 'security_groups_worker',
        formValues: { ...baseFormValues, security_groups_worker: ['  '] },
        metaShouldHideInReview: false,
      })
    ).toBe(true);
  });

  it('shows security_groups_worker when ids are present', () => {
    expect(
      shouldHideReviewRow({
        path: 'security_groups_worker',
        formValues: baseFormValues,
        metaShouldHideInReview: false,
      })
    ).toBe(false);
  });

  it('hides upgrade_schedule when policy is manual or schedule is empty', () => {
    expect(
      shouldHideReviewRow({
        path: 'upgrade_schedule',
        formValues: {
          upgrade_policy: ClusterUpgrade.manual,
          upgrade_schedule: '00 4 * * 0',
        },
        metaShouldHideInReview: false,
      })
    ).toBe(true);
    expect(
      shouldHideReviewRow({
        path: 'upgrade_schedule',
        formValues: {
          upgrade_policy: ClusterUpgrade.automatic,
          upgrade_schedule: '',
        },
        metaShouldHideInReview: false,
      })
    ).toBe(true);
  });

  it('shows upgrade_schedule when automatic policy has a cron value', () => {
    expect(
      shouldHideReviewRow({
        path: 'upgrade_schedule',
        formValues: {
          upgrade_policy: ClusterUpgrade.automatic,
          upgrade_schedule: '00 4 * * 0',
        },
        metaShouldHideInReview: false,
      })
    ).toBe(false);
  });

  it('hides additional_trust_bundle when missing or blank', () => {
    expect(
      shouldHideReviewRow({
        path: 'additional_trust_bundle',
        formValues: { ...baseFormValues, additional_trust_bundle: '' },
        metaShouldHideInReview: false,
      })
    ).toBe(true);
    expect(
      shouldHideReviewRow({
        path: 'additional_trust_bundle',
        formValues: { ...baseFormValues, additional_trust_bundle: undefined },
        metaShouldHideInReview: false,
      })
    ).toBe(true);
    expect(
      shouldHideReviewRow({
        path: 'additional_trust_bundle',
        formValues: { ...baseFormValues, additional_trust_bundle: '   ' },
        metaShouldHideInReview: false,
      })
    ).toBe(true);
  });

  it('shows additional_trust_bundle when PEM content is present', () => {
    expect(
      shouldHideReviewRow({
        path: 'additional_trust_bundle',
        formValues: {
          ...baseFormValues,
          additional_trust_bundle: '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----',
        },
        metaShouldHideInReview: false,
      })
    ).toBe(false);
  });
});
