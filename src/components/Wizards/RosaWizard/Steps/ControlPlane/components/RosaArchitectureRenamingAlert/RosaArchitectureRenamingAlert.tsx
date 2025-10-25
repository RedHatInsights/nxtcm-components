import { Alert, List, ListItem } from '@patternfly/react-core';

type RosaArchitectureRenamingAlertProps = {
  allowAlertFeatureFlag: boolean;
  rosaArchitectureRenaimingAlertLink: React.ReactNode;
  rosaArchitectureRenamingAlertClassName?: string;
};

export const RosaArchitectureRenamingAlert: React.FunctionComponent<
  RosaArchitectureRenamingAlertProps
> = ({
  rosaArchitectureRenamingAlertClassName,
  allowAlertFeatureFlag,
  rosaArchitectureRenaimingAlertLink,
}) => {
  return allowAlertFeatureFlag ? (
    <Alert
      variant="info"
      isInline
      title="Red Hat OpenShift Service on AWS (ROSA) architectures are being renamed"
      actionLinks={
        //   <ExternalLink href={learnMoreLink}>Learn more</ExternalLink>
        rosaArchitectureRenaimingAlertLink
      }
      className={rosaArchitectureRenamingAlertClassName}
    >
      <List>
        <ListItem>
          ROSA Classic architecture will be renamed to &quot;Red Hat OpenShift Service on AWS
          (classic architecture)&quot;.
        </ListItem>
        <ListItem>
          ROSA architecture with hosted control planes will be renamed to &quot;Red Hat OpenShift
          Service on AWS&quot;.
        </ListItem>
      </List>
    </Alert>
  ) : null;
};
