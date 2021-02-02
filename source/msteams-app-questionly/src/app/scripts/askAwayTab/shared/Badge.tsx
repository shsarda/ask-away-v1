import './../index.scss';
import { Properties as CSSProperties } from 'csstype';
import * as React from 'react';

/**
 * Properties for the Badge React component
 */
export interface BadgeProps {
    text: string;
    styles: CSSProperties;
}
const Badge: React.FunctionComponent<BadgeProps> = (props) => {
    return (
        <span style={props.styles} className={`badge`}>
            {props.text}
        </span>
    );
};
export default Badge;