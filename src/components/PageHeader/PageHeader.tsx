import {
  Button,
  Flex,
  Label,
  LabelProps,
  Nav,
  NavItem,
  NavList,
  PageSection,
  PageSectionVariants,
  Popover,
  PopoverProps,
  Spinner,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { ReadOnlyBanner } from '../ReadOnlyBanner/ReadOnlyBanner';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import { ConsoleBreadcrumbs } from '../ConsoleBreadcrumbs';
import RefreshButton from '../RefreshButton/RefreshButton';

export type CommonPageHeaderProps = {
  title: string | React.ReactNode;
  titleTooltip?: string | React.ReactNode;
  titleHeadingLevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  titleHeadingSize?: TitleSizes;
  popoverPosition?: PopoverProps['position'];
  popoverAutoWidth?: PopoverProps['hasAutoWidth'];
  label?: string | React.ReactNode;
  labelColor?: LabelProps['color'];
  description?: string | React.ReactNode;
  breadcrumbs?: { text: string; to?: string }[];
  navigation?: NavigationItem[];
  controls?: React.ReactNode;
  switches?: React.ReactNode;
  acmActions?: React.ReactNode;
  searchbar?: React.ReactNode;
  variant?: PageSectionVariants;
  clusterClaimName?: string;

  showSpinner?: boolean;
  refresh?: () => void;
  hasBodyWrapper?: boolean;
  someReadOnly?: boolean;
  error?: any;
  Link?: any;
  showPreviewLabel?: boolean;
  PreviewLabel?: React.ReactNode;
  isRefreshing?: boolean;
  isArchived?: boolean;
  isDeprovisioned?: boolean;
  errorTriangle?: React.ReactNode;
  refreshClusterDetails?: () => void;
  autoRefreshEnabled?: boolean;
  useShortTimer?: boolean;
  unarchiveBtn?: React.ReactNode;
  launchConsole?: React.ReactNode;
  shouldShowRefreshBtn?: boolean;
  ocmActions?: React.ReactNode;
};

type GenericComponentProps<P> = CommonPageHeaderProps & P;

type NavigationItem = {
  linkTo: any;
  title: string;
  isActive: boolean;
  shouldDisplayNavItem: boolean;
};

export enum PageSectionUpdatedVariants {
  default = 'default',
  light = 'light',
  dark = 'dark',
  darker = 'darker',
}

export function ConsoleSecondaryNav(props: { children: React.ReactNode }) {
  return (
    <Nav variant="horizontal">
      <NavList>{props.children}</NavList>
    </Nav>
  );
}
export function ConsoleSecondaryNavItem(props: {
  onClick?: () => void;
  isActive: boolean;
  to?: string;
  children: React.ReactNode;
}) {
  return (
    <NavItem onClick={props.onClick} isActive={props.isActive} to={props.to}>
      {props.children}
    </NavItem>
  );
}

export const PageHeader = <P,>({
  someReadOnly,
  hasBodyWrapper,
  variant,
  Link,
  labelColor,
  label,
  title,
  titleHeadingLevel,
  titleHeadingSize,
  titleTooltip,
  popoverPosition,
  popoverAutoWidth,
  breadcrumbs,
  description,
  clusterClaimName,
  navigation,
  switches,
  searchbar,
  acmActions,
  controls,

  PreviewLabel,
  showPreviewLabel,
  isRefreshing,
  error,
  errorTriangle,
  isArchived,
  isDeprovisioned,
  refreshClusterDetails,
  autoRefreshEnabled,
  useShortTimer,
  unarchiveBtn,
  launchConsole,
  shouldShowRefreshBtn,
  ocmActions,
}: GenericComponentProps<P>) => {
  return (
    <>
      {someReadOnly && <ReadOnlyBanner someReadOnly={someReadOnly} />}

      <PageSection
        hasBodyWrapper={hasBodyWrapper}
        variant={variant}
        padding={{ default: 'noPadding' }}
      >
        <Split>
          <SplitItem isFilled>
            <Stack hasGutter>
              <StackItem isFilled>
                <PageSection
                  variant={PageSectionVariants.default}
                  style={{
                    paddingBottom: navigation ? 'inherit' : undefined,
                    paddingTop: breadcrumbs
                      ? 'var(--pf-v6-c-page__main-breadcrumb--PaddingTop)'
                      : undefined,
                  }}
                >
                  <Stack hasGutter>
                    {breadcrumbs && (
                      <StackItem>
                        <ConsoleBreadcrumbs
                          items={breadcrumbs}
                          getLabel={(item: any) => (item.text ? item.text : item.label)}
                          getTo={(item: any) => (item.to ? item.to : item.path)}
                          LinkComponent={Link}
                        />
                      </StackItem>
                    )}
                    <StackItem isFilled>
                      <Split hasGutter>
                        <SplitItem>
                          <Title headingLevel={titleHeadingLevel} size={titleHeadingSize}>
                            {title}
                            {titleTooltip && (
                              <Popover
                                bodyContent={titleTooltip}
                                hasAutoWidth={
                                  /* istanbul ignore next */
                                  popoverAutoWidth ?? true
                                }
                                position={
                                  /* istanbul ignore next */
                                  popoverPosition ?? 'right'
                                }
                              >
                                <Button
                                  variant="plain"
                                  style={{
                                    padding: 0,
                                    marginLeft: '8px',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  <OutlinedQuestionCircleIcon />
                                </Button>
                              </Popover>
                            )}
                            {showPreviewLabel && PreviewLabel}
                          </Title>
                        </SplitItem>
                        {label && labelColor && (
                          <SplitItem>
                            <Label color={labelColor}>{label}</Label>
                          </SplitItem>
                        )}
                        {switches && (
                          <SplitItem>
                            <span
                              style={{
                                paddingLeft: '24px',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {switches}
                            </span>
                          </SplitItem>
                        )}
                        {isRefreshing && (
                          <SplitItem>
                            <Spinner size="lg" aria-label="Loading..." className="pf-v6-u-ma-md" />
                          </SplitItem>
                        )}
                        {error && <SplitItem>{errorTriangle}</SplitItem>}
                      </Split>
                      {description && (
                        <div style={{ paddingTop: '8px' }}>
                          {clusterClaimName && (
                            <span
                              style={{
                                color: 'var(--pf-v6-global--Color--200)',
                              }}
                            >
                              {clusterClaimName}
                            </span>
                          )}
                        </div>
                      )}
                    </StackItem>
                  </Stack>
                </PageSection>
              </StackItem>
              {navigation && (
                <StackItem>
                  <PageSection
                    variant="default"
                    type="default"
                    style={{ paddingTop: 0, paddingBottom: 0 }}
                  >
                    <ConsoleSecondaryNav>
                      {navigation
                        .filter((navItem: NavigationItem) => navItem.shouldDisplayNavItem)
                        .map((navItem: NavigationItem, index: number) => {
                          return (
                            <ConsoleSecondaryNavItem key={index} isActive={navItem.isActive}>
                              <Link to={navItem.linkTo}>{navItem.title}</Link>
                            </ConsoleSecondaryNavItem>
                          );
                        })}
                    </ConsoleSecondaryNav>
                  </PageSection>
                </StackItem>
              )}
            </Stack>
          </SplitItem>

          {shouldShowRefreshBtn && (
            <SplitItem
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
              }}
            >
              <Flex
                flexWrap={{ default: 'nowrap' }}
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsSm' }}
                id="cl-details-btns"
              >
                {!isArchived && !isDeprovisioned ? (
                  <>
                    {launchConsole}
                    {ocmActions}
                  </>
                ) : (
                  !isDeprovisioned && unarchiveBtn
                )}
                {!isDeprovisioned && !isArchived && (
                  <RefreshButton
                    autoRefresh={autoRefreshEnabled}
                    refreshFunc={refreshClusterDetails}
                    clickRefreshFunc={refreshClusterDetails}
                    useShortTimer={useShortTimer}
                  />
                )}
              </Flex>
            </SplitItem>
          )}

          {(controls || acmActions || searchbar) && (
            <SplitItem>
              <PageSection
                variant={PageSectionVariants.default}
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                }}
              >
                <Stack hasGutter>
                  {searchbar && (
                    <SplitItem
                      style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {searchbar}
                    </SplitItem>
                  )}
                  {controls && (
                    <StackItem
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                      }}
                    >
                      {controls}
                    </StackItem>
                  )}
                  {acmActions && (
                    <Flex
                      flexWrap={{ default: 'nowrap' }}
                      alignItems={{ default: 'alignItemsCenter' }}
                      spaceItems={{ default: 'spaceItemsSm' }}
                    >
                      {acmActions}
                    </Flex>
                  )}
                </Stack>
              </PageSection>
            </SplitItem>
          )}
        </Split>
      </PageSection>
    </>
  );
};
