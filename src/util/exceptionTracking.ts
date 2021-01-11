import * as appInsights from 'applicationinsights';
import { getApplicationInsightsInstrumentationKeyURI } from 'src/util/keyvault';

declare var jest : any | null;
export let aiClient: appInsights.TelemetryClient | null = null;


export const initiateAppInsights = async () => {
    const applicationInsightsInstrumentationKey = await getApplicationInsightsInstrumentationKeyURI();

    // Set up app insights
    appInsights
        .setup(applicationInsightsInstrumentationKey)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true, true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true, true)
        .setUseDiskRetryCaching(true)
        .setSendLiveMetrics(true)
        .setDistributedTracingMode(appInsights.DistributedTracingModes.AI);
    appInsights.start();

    aiClient = appInsights.defaultClient;
};

export const exceptionLogger = (error: Error) => {
    // eslint-disable-next-line @typescript-eslint/tslint/config
    if (typeof jest !== 'undefined') return;
    if (process.env.debugMode === 'true' || !aiClient) {
        // eslint-disable-next-line no-console
        console.error(error);
    } else {
        aiClient.trackException({ exception: error });
    }
};
