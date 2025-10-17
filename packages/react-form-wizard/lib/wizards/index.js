import { jsx as _jsx } from "react/jsx-runtime";
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/react-styles/css/components/Wizard/wizard.css';
import '@patternfly/patternfly/patternfly-addons.css';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
const Demo = lazy(() => import('./Demo'));
const div = document.createElement('div');
document.body.appendChild(div);
const root = createRoot(div);
root.render(_jsx(StrictMode, { children: _jsx(Suspense, { fallback: _jsx("div", {}), children: _jsx(Demo, {}) }) }));
//# sourceMappingURL=index.js.map