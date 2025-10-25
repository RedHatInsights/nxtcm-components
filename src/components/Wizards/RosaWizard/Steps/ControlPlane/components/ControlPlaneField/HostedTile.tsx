import { CardGroup } from '@patternfly-labs/react-form-wizard';
import {
  Alert,
  Content,
  ContentVariants,
  GridItem,
  Label,
  List,
  ListItem,
} from '@patternfly/react-core';
import StarIcon from '@patternfly/react-icons/dist/esm/icons/star-icon';
import { defaultMarginBottomSpacing } from './constants';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';

type HostedTielProps = {
  isHostedDisabled: boolean;
  rosaHomeGetStartedLink: React.ReactNode;
};

export const HostedTile: React.FunctionComponent<HostedTielProps> = ({
  isHostedDisabled,
  rosaHomeGetStartedLink,
}) => {
  return (
    <GridItem span={6}>
      <CardGroup
        value="HCP"
        cardId="hosted-control-plane-card"
        isHostedDisabled={isHostedDisabled}
        titleId="hosted-control-plane-card-title"
        title="ROSA hosted architecture"
      >
        <Label
          variant="filled"
          color="blue"
          icon={<StarIcon data-icon="star" />}
          className={defaultMarginBottomSpacing}
          // NOTE onClick is needed because labels are not clickable in a card (This is a PatternFly Bug)
          isClickable={!isHostedDisabled}
          //onClick={onChange}
          isDisabled={isHostedDisabled}
        >
          Recommended
        </Label>
        {isHostedDisabled && rosaHomeGetStartedLink && (
          <Alert
            variant="info"
            title={
              rosaHomeGetStartedLink
              // <>
              //     To create hosted control plane clusters, you&apos;ll need to{' '}
              //     <ExternalLink href={links.AWS_CONSOLE_ROSA_HOME_GET_STARTED}>
              //         enable ROSA hosted control plane
              //     </ExternalLink>
              // </>
            }
            className="pf-v6-u-mb-md"
          />
        )}
        <Content component={ContentVariants.p} className="pf-v6-u-mb-md">
          The Red Hat OpenShift Service on AWS with a hosted control plane architecture (ROSA HCP)
          runs an OpenShift cluster with a decoupled control plane as a multi-tenant workload and a
          data plane on a separate network for segmented management and workload traffic.
        </Content>
        <List isPlain className="pf-v6-u-mb-md">
          <ListItem icon={<CheckIcon className="pf-v6-u-active-color-100" />}>
            Control plane resources are hosted in a Red Hat-owned AWS account
          </ListItem>
          <ListItem icon={<CheckIcon className="pf-v6-u-active-color-100" />}>
            Better resource utilization with faster cluster creation
          </ListItem>
          <ListItem icon={<CheckIcon className="pf-v6-u-active-color-100" />}>
            Lower AWS infrastructure costs
          </ListItem>
          <ListItem icon={<CheckIcon className="pf-v6-u-active-color-100" />}>
            Full compliance certifications
          </ListItem>
          <ListItem icon={<CheckIcon className="pf-v6-u-active-color-100" />}>
            Red Hat SRE managed
          </ListItem>
        </List>
        <Alert
          variant="warning"
          isInline
          isPlain
          title="A Virtual Private Cloud is required for ROSA clusters hosted by Red Hat"
          className={defaultMarginBottomSpacing}
          // NOTE style is needed because alerts are not clickable in a card (This is a PatternFly Bug)
          style={{ position: 'inherit' }}
        />
      </CardGroup>
    </GridItem>
  );
};
