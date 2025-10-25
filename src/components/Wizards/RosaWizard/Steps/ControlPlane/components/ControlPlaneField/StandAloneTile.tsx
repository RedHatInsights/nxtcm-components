import { CardGroup } from '@patternfly-labs/react-form-wizard';
import {
  GridItem,
  Content,
  ContentVariants,
  List,
  ListItem,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons';

export const StandAloneTile = (props: any) => {
  return (
    <GridItem span={6}>
      <CardGroup
        value="Classic"
        cardId="standalone-control-plane-card"
        title="ROSA classic architecture"
      >
        <Card
          id="standalone-control-plane-card"
          data-testid="standalone-control-planes"
          isSelectable
          isSelected={props.value as boolean}
          isFullHeight
          isDisabled={props.isHostedDisabled}
          isLarge
        >
          <CardHeader
            selectableActions={{
              variant: 'single',
              onChange: () => {
                // Stand-alone architecture selected
              },
              isHidden: true,
              selectableActionAriaLabelledby: 'standalone-control-plane-card-title',
            }}
          >
            <CardTitle id="standalone-control-plane-card">
              &quot;ROSA classic architecture&quot;
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Content component={ContentVariants.p} className="pf-v6-u-mb-md">
              The Red Hat OpenShift Service on AWS (classic architecture) runs an OpenShift cluster
              with a coupled control and data plane, hosted on dedicated nodes with a shared
              network.
            </Content>
            <List isPlain className="pf-v6-u-mb-md">
              <ListItem icon={<CheckIcon className="pf-v6-u-active-color-100" />}>
                Control plane resources are hosted in your own AWS account
              </ListItem>
              <ListItem icon={<CheckIcon className="pf-v6-u-active-color-100" />}>
                Full compliance certifications
              </ListItem>
              <ListItem icon={<CheckIcon className="pf-v6-u-active-color-100" />}>
                Red Hat SRE managed
              </ListItem>
            </List>
          </CardBody>
        </Card>
      </CardGroup>
      {/* <StandAloneTile handleChange={handleChange} isSelected={isTileSelected === 'false'} /> */}
    </GridItem>
  );
};
