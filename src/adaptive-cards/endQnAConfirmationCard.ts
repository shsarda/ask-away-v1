'use strict';

import { IAdaptiveCard } from 'adaptivecards';
import { endQnAStrings, genericStrings } from 'src/localization/locale';

const {AutoDeleteInDays = -1} = process.env

/**
 * Defines the template for the adaptive card used when confirming the ending of the QnA.
 */
export const endQnAConfirmationCard = (autoDeleteInDays=AutoDeleteInDays) => {
    const showExpiryNotice = autoDeleteInDays >= 0;

    return <IAdaptiveCard>{
        $schema: 'https://adaptivecards.io/schemas/adaptive-card.json',
        type: 'AdaptiveCard',
        version: '1.0',
        body: [
            {
                type: 'TextBlock',
                text: endQnAStrings('prompt'),
                size: 'large',
            },
            {
                type: 'TextBlock',
                text: showExpiryNotice ? endQnAStrings('sessionDeletionDetails', {
                    autoDeleteInDays
                }) : '',
                size: 'default',
            },
        ],
        actions: [
            {
                id: 'cancelEndQnA',
                type: 'Action.Submit',
                title: genericStrings('cancel'),
                data: {
                    qnaSessionId: '${qnaId}',
                    id: 'cancelEndQnA',
                },
            },
            {
                id: 'submitEndQnA',
                type: 'Action.Submit',
                title: genericStrings('endSession', ),
                data: {
                    qnaSessionId: '${qnaId}',
                    id: 'submitEndQnA',
                },
            },
        ],
    };
}