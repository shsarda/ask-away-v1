import './../index.scss';
import * as React from 'react';
import { Image, Text, Flex } from '@fluentui/react-northstar';
const NoQuestionImage = require('./../../../web/assets/no-question.png');
/**
 * Properties for the NoQuestionDesign React component
 */
export interface NoQuestionDesignProps {}
const NoQuestionDesign: React.FunctionComponent<NoQuestionDesignProps> = (props) => {
    return (
        <div className="no-question-layout">
            <Flex column>
                <Image src={NoQuestionImage} />
                <div className="sub-text">
                    <Text weight="bold" content="Q&A session is live... Ask away!" />
                </div>
            </Flex>
        </div>
    );
};
export default NoQuestionDesign;