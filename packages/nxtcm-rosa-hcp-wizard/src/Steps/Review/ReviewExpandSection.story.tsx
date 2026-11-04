import { ReviewExpandSection } from './ReviewExpandSection';

export function ExpandedReviewSection(): React.ReactElement {
  return (
    <ReviewExpandSection label="Networking summary" initialExpanded>
      <p>subnet-a and subnet-b</p>
    </ReviewExpandSection>
  );
}

export function CollapsedReviewSection(): React.ReactElement {
  return (
    <ReviewExpandSection label="Proxy settings" initialExpanded={false}>
      <p>http://proxy.example</p>
    </ReviewExpandSection>
  );
}
