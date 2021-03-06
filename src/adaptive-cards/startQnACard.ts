import { IAdaptiveCard } from 'adaptivecards';
import { startQnAStrings, genericStrings } from 'src/localization/locale';

const {AutoCloseInDays = -1, AutoDeleteInDays = -1} = process.env

/**
 * Adaptive Card form used to collect information to start the QnA.
 */
export const startQnACard = (autoCloseInDays=AutoCloseInDays, autoDeleteInDays=AutoDeleteInDays) => {
    const showInfo = autoCloseInDays >= 0 || autoDeleteInDays >= 0;

    return <IAdaptiveCard>{
        $schema: 'https://adaptivecards.io/schemas/adaptive-card.json',
        type: 'AdaptiveCard',
        version: '1.2',
        body: [
            {
                type: 'ColumnSet',
                columns: [
                    {
                        type: 'Column',
                        width: 2,
                        items: [
                            {
                                type: 'Container',
                                items: [
                                    {
                                        type: 'TextBlock',
                                        text: '${errorMessage}',
                                        color: 'Attention',
                                    },
                                    {
                                        type: 'TextBlock',
                                        text: `${startQnAStrings(
                                            'titleFieldLabel'
                                        )}*`,
                                        wrap: true,
                                    },
                                    {
                                        type: 'Input.Text',
                                        id: 'title',
                                        value: '${title}',
                                        maxLength: 250,
                                    },
                                    {
                                        type: 'TextBlock',
                                        text: `${startQnAStrings(
                                            'descriptionFieldLabel'
                                        )}* (250 ${genericStrings(
                                            'maxCharacters'
                                        )})`,
                                        wrap: true,
                                    },
                                    {
                                        type: 'Input.Text',
                                        id: 'description',
                                        value: '${description}',
                                        maxLength: 250,
                                        placeholder: startQnAStrings(
                                            'descriptionFieldExample'
                                        ),
                                    },
                                    {
                                        type: 'TextBlock',
                                        text: showInfo ? startQnAStrings(
                                            'additionalInfo',
                                            {
                                                autoCloseInDays,
                                                autoDeleteInDays,
                                            }
                                        ) : '',
                                        wrap: true,
                                        size: 'small',
                                        isSubtle: true,
                                        weight: 'lighter'
                                    }
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        actions: [
            {
                id: 'submit',
                type: 'Action.Submit',
                title: genericStrings('preview'),
            },
        ],
    };
}