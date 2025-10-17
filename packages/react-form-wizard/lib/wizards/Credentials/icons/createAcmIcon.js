import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
let currentId = 0;
export function createIcon({ name, xOffset = 0, yOffset = 0, width, height, svgPath, }) {
    var _a;
    return _a = class SVGIcon extends React.Component {
            constructor() {
                super(...arguments);
                this.id = `acm-icon-title-${currentId++}`;
            }
            render() {
                const { title, className, ...props } = this.props;
                const classes = className ? `pf-v6-svg ${className}` : 'pf-v6-svg';
                const hasTitle = Boolean(title);
                const viewBox = [xOffset, yOffset, width, height].join(' ');
                return (_jsxs("svg", { className: classes, viewBox: viewBox, fill: "currentColor", "aria-labelledby": hasTitle ? this.id : undefined, "aria-hidden": hasTitle ? undefined : true, role: "img", width: "1em", height: "1em", ...props, children: [hasTitle && _jsx("title", { id: this.id, children: title }), svgPath] }));
            }
        },
        _a.displayName = name,
        _a;
}
//# sourceMappingURL=createAcmIcon.js.map