import { DefaultAzureCredential } from "@azure/identity";
import { exceptionLogger } from "./exceptionTracking";

let credential: DefaultAzureCredential;

/**
 * Get DefaultAzureCredential instance.
 */
export const getCredential = () => {
    if (!credential) {
        credential = new DefaultAzureCredential();
    }
    return credential;
}

/**
 * Get token using DefaultAzureCredential.
 */
export const getAccessToken = async () => {
    if (!process.env.MicrosoftAppId) {
        throw new Error('Microsoft app id not defined in app settings')
    }
    const accessToken = await getCredential().getToken(process.env.MicrosoftAppId);
    exceptionLogger(new Error('**** Access token : ' + JSON.stringify(accessToken)))
    return accessToken;
}