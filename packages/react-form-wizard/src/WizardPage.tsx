/* Copyright Contributors to the Open Cluster Management project */
import {
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  Page,
  PageSection,
  PageSectionTypes,
  PageSectionVariants,
  Switch,
  Content,
  Title,
} from '@patternfly/react-core'
import { ReactNode, useCallback, useState } from 'react'
import { WizardYamlEditor } from './components/YamlEditor'
import { Wizard, WizardProps } from './Wizard'

export type WizardPageProps = {
  breadcrumb?: { label: string; to?: string }[]
  yaml?: boolean
  yamlEditor?: () => ReactNode
} & WizardProps

function getWizardYamlEditor() {
  return <WizardYamlEditor />
}

export function WizardPage(props: WizardPageProps) {
  let { yamlEditor } = props
  if (!yamlEditor) yamlEditor = getWizardYamlEditor
  const [drawerExpanded, setDrawerExpanded] = useState(props.yaml !== false && localStorage.getItem('yaml') === 'true')
  const toggleDrawerExpanded = useCallback(() => {
    setDrawerExpanded((drawerExpanded) => {
      localStorage.setItem('yaml', (!drawerExpanded).toString())
      return !drawerExpanded
    })
  }, [])
  return (
    <div style={{height: '100vh'}}>
       <PageSection variant="default" >
          <Flex alignItems={{ default: 'alignItemsCenter' }} wrap="noWrap" style={{ flexWrap: 'nowrap', gap: 16 }}>
            <Title headingLevel="h1">{props.title}</Title>
            {props.yaml !== false && (
              <Switch
                id="yaml-switch"
                label="YAML"
                isChecked={drawerExpanded}
                onChange={() => toggleDrawerExpanded()}
              />
            )}
          </Flex>
          {props.description && <Content component="small">{props.description}</Content>}
        </PageSection>
        <Wizard {...props} showHeader={false} showYaml={drawerExpanded} yamlEditor={yamlEditor}>
          {props.children}
        </Wizard>
     
    </div>
  )
}
