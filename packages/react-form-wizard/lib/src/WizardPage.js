import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Breadcrumb, BreadcrumbItem, Flex, Page, PageSection, PageSectionTypes, PageSectionVariants, Switch, Content, Title, } from '@patternfly/react-core';
import { useCallback, useState } from 'react';
import { WizardYamlEditor } from './components/YamlEditor';
import { Wizard } from './Wizard';
function getWizardYamlEditor() {
    return _jsx(WizardYamlEditor, {});
}
export function WizardPage(props) {
    let { yamlEditor } = props;
    if (!yamlEditor)
        yamlEditor = getWizardYamlEditor;
    const [drawerExpanded, setDrawerExpanded] = useState(props.yaml !== false && localStorage.getItem('yaml') === 'true');
    const toggleDrawerExpanded = useCallback(() => {
        setDrawerExpanded((drawerExpanded) => {
            localStorage.setItem('yaml', (!drawerExpanded).toString());
            return !drawerExpanded;
        });
    }, []);
    return (_jsx(Page, { breadcrumb: props.breadcrumb && (_jsx(Breadcrumb, { children: props.breadcrumb.map((crumb) => (_jsx(BreadcrumbItem, { to: crumb.to, children: crumb.label }, crumb.label))) })), isBreadcrumbGrouped: true, additionalGroupedContent: _jsxs(PageSection, { variant: "default", children: [_jsxs(Flex, { alignItems: { default: 'alignItemsCenter' }, wrap: "noWrap", style: { flexWrap: 'nowrap', gap: 16 }, children: [_jsx(Title, { headingLevel: "h1", children: props.title }), props.yaml !== false && (_jsx(Switch, { id: "yaml-switch", label: "YAML", isChecked: drawerExpanded, onChange: () => toggleDrawerExpanded() }))] }), props.description && _jsx(Content, { component: "small", children: props.description })] }), groupProps: { stickyOnBreakpoint: { default: 'top' } }, children: _jsx(PageSection, { type: PageSectionTypes.wizard, variant: PageSectionVariants.default, children: _jsx(Wizard, { ...props, showHeader: false, showYaml: drawerExpanded, yamlEditor: yamlEditor, children: props.children }) }) }));
}
//# sourceMappingURL=WizardPage.js.map