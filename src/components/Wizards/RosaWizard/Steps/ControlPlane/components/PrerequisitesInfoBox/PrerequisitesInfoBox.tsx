import { Hint, HintTitle, HintBody } from '@patternfly/react-core';

type PrerequisitesInfoBoxProps = {
  showRosaCliRequirement: boolean;
  rosaHostedCliMinVersion: string;
  productName: string;
  linkToGetStarted: React.ReactNode;
};

export const PrerequisitesInfoBox: React.FunctionComponent<PrerequisitesInfoBoxProps> = ({
  showRosaCliRequirement = true,
  rosaHostedCliMinVersion,
  productName,
  linkToGetStarted,
}) => {
  return (
    <Hint>
      <HintTitle>
        <strong>Did you complete your prerequisites?</strong>
      </HintTitle>
      <HintBody>
        <p>
          To create a {productName} (ROSA) cluster via the web interface, you must complete the
          prerequisite steps on the {linkToGetStarted}.
          {/* <Link to="/create/rosa/getstarted">Set up ROSA page</Link> */}
        </p>
        {showRosaCliRequirement && (
          <p>
            Make sure you are using ROSA CLI version {rosaHostedCliMinVersion} or above for hosted
            control plane architecture.
          </p>
        )}
      </HintBody>
    </Hint>
  );
};
