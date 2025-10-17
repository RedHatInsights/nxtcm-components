import * as React from 'react';
export interface IconDefinition {
    name?: string;
    width: number;
    height: number;
    svgPath: JSX.Element;
    xOffset?: number;
    yOffset?: number;
}
export interface SVGIconProps extends Omit<React.HTMLProps<SVGElement>, 'ref'> {
    title?: string;
    className?: string;
}
export declare function createIcon({ name, xOffset, yOffset, width, height, svgPath, }: IconDefinition): React.ComponentClass<SVGIconProps>;
