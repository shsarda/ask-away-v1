import { IBackgroundJobPayload, IDataEvent } from 'msteams-app-questionly.common';
import axios, { AxiosRequestConfig } from 'axios';
import { exceptionLogger, getOperationIdForCurrentRequest } from 'src/util/exceptionTracking';
import { getAvatarKey, getBackgroundFunctionKey } from 'src/util/keyvault';
import { IQnASession_populated, IQuestion } from 'msteams-app-questionly.data';
import {
    createQnaSessionCreatedEvent,
    createQnaSessionEndedEvent,
    createQuestionAddedEvent,
    createQuestionDownvotedEvent,
    createQuestionMarkedAsAnsweredEvent,
    createQuestionUpvotedEvent,
} from 'src/background-job/events/dataEventUtility';
import { StatusCodes } from 'http-status-codes';
import { TelemetryExceptions } from 'src/constants/telemetryConstants';
import random from 'random';
import seedrandom from 'seedrandom';
import * as jwt from 'jsonwebtoken';
import { DefaultAzureCredential } from '@azure/identity';

const axiosConfig: AxiosRequestConfig = axios.defaults;
let backgroundJobUri: string;

// Load background job uri and function key in memory.
// throws exception if these values failed to load.
export const initBackgroundJobSetup = async () => {
    if (process.env.BackgroundJobUri === undefined) {
        exceptionLogger('backgroundJobUri is missing in app settings.');
        throw new Error('backgroundJobUri is missing in app settings.');
    }

    backgroundJobUri = process.env.BackgroundJobUri;
};

/**
 * Triggers background job for new qnaSession created event.
 * @param session - Newly created qnaSession document.
 * @param serviceUrl - bot service url.
 * @param meetingId - meeting id.
 */
export const triggerBackgroundJobForQnaSessionCreatedEvent = async (session: IQnASession_populated, serviceUrl: string, aadObjectId: string, meetingId?: string): Promise<void> => {
    const eventData = createQnaSessionCreatedEvent(session);
    await triggerBackgroundJob(session.conversationId, session._id, eventData, serviceUrl, aadObjectId, meetingId);
};

/**
 * Triggers background job for qnaSession ended event.
 * @param conversationId - conversation id.
 * @param qnaSessionId - qnaSession id.
 * @param endedByUserAadObjectId - AadObject id of user who ended the session.
 * @param serviceUrl - bot service url.
 * @param meetingId - meeting id.
 */
export const triggerBackgroundJobForQnaSessionEndedEvent = async (conversationId: string, qnaSessionId: string, endedByUserId: string, serviceUrl: string, meetingId?: string) => {
    const eventData = await createQnaSessionEndedEvent(qnaSessionId, endedByUserId);
    await triggerBackgroundJob(conversationId, qnaSessionId, eventData, serviceUrl, endedByUserId, meetingId);
};

/**
 * Triggers background job for question upvoted event.
 * @param conversationId - conversation id.
 * @param questionId - question id.
 * @param qnaSessionId - qnaSession id.
 * @param upvotedByUserId - AadObject id of user who upvoted the question.
 * @param serviceUrl - bot service url.
 * @param meetingId - meeting id.
 */
export const triggerBackgroundJobForQuestionUpvotedEvent = async (
    conversationId: string,
    questionId: string,
    qnaSessionId: string,
    upvotedByUserId: string,
    serviceUrl: string,
    meetingId?: string
) => {
    const eventData = await createQuestionUpvotedEvent(qnaSessionId, questionId, upvotedByUserId);
    await triggerBackgroundJob(conversationId, qnaSessionId, eventData, serviceUrl, upvotedByUserId, meetingId);
};

/**
 * Triggers background job for question downvoted event.
 * @param conversationId - conversation id.
 * @param questionId - question id.
 * @param qnaSessionId - qnaSession id.
 * @param downvotedByUserId - AadObject id of user who downvoted the question.
 * @param serviceUrl - bot service url.
 * @param meetingId - meeting id.
 */
export const triggerBackgroundJobForQuestionDownvotedEvent = async (
    conversationId: string,
    questionId: string,
    qnaSessionId: string,
    downvotedByUserId: string,
    serviceUrl: string,
    meetingId?: string
) => {
    const eventData = await createQuestionDownvotedEvent(qnaSessionId, questionId, downvotedByUserId);
    await triggerBackgroundJob(conversationId, qnaSessionId, eventData, serviceUrl, downvotedByUserId, meetingId);
};

/**
 * Triggers background job for question posted event.
 * @param conversationId - conversation id.
 * @param question - question document.
 * @param qnaSessionId - qnaSession id.
 * @param postedByUserId - AadObject id of user who posted the question.
 * @param serviceUrl - bot service url.
 * @param meetingId - meeting id.
 */
export const triggerBackgroundJobForQuestionPostedEvent = async (conversationId: string, question: IQuestion, qnaSessionId: string, postedByUserId: string, serviceUrl: string, meetingId?: string) => {
    const eventData = await createQuestionAddedEvent(qnaSessionId, question, postedByUserId);
    await triggerBackgroundJob(conversationId, qnaSessionId, eventData, serviceUrl, postedByUserId, meetingId);
};

/**
 * Triggers background job for question marked as answered event.
 * @param conversationId - conversation id.
 * @param questionId - question id.
 * @param qnaSessionId - qnaSession id.
 * @param markedAnsweredByUserAadObjectId - AadObject id of user who marked the question as answered.
 * @param serviceUrl - bot service url.
 * @param meetingId - meeting id.
 */
export const triggerBackgroundJobForQuestionMarkedAsAnsweredEvent = async (
    conversationId: string,
    questionId: string,
    qnaSessionId: string,
    markedAnsweredByUserAadObjectId: string,
    serviceUrl: string,
    meetingId?: string
) => {
    const eventData = await createQuestionMarkedAsAnsweredEvent(qnaSessionId, questionId, markedAnsweredByUserAadObjectId);
    await triggerBackgroundJob(conversationId, qnaSessionId, eventData, serviceUrl, markedAnsweredByUserAadObjectId, meetingId);
};

/**
 * Triggers background job with appropriate params. This function eats up all the exception and logs them.
 * @param conversationId - conversation id.
 * @param qnaSessionId - qnaSession id.
 * @param dataEvent - data event for clients to update UX real time.
 * @param serviceUrl - bot service url.
 * @param meetingId - meeting id.
 */
const triggerBackgroundJob = async (conversationId: string, qnaSessionId: string, dataEvent: IDataEvent, serviceUrl: string, aadObjectId: string, meetingId?: string): Promise<void> => {
    const backgroundJobPayload: IBackgroundJobPayload = {
        conversationId: conversationId,
        qnaSessionId: qnaSessionId,
        eventData: dataEvent,
        operationId: getOperationIdForCurrentRequest(),
        serviceUrl: serviceUrl,
        meetingId: meetingId,
    };

    try {
        const token = await getJWTAccessToken(aadObjectId);
        axiosConfig.headers['Authorization'] = `Bearer ${token}`;

        const res = await axios.post(backgroundJobUri, backgroundJobPayload, axiosConfig);

        if (res.status != StatusCodes.ACCEPTED) {
            throw new Error(`Error in scheduling background job for conversation id ${conversationId}. returned status: ${res.status}, data: ${res.data}`);
        }
    } catch (error) {
        exceptionLogger(error, {
            conversationId: conversationId,
            qnaSessionId: qnaSessionId,
            filename: module.id,
            exceptionName: TelemetryExceptions.TriggerBackgroundJobFailed,
        });
    }
};

const getJWTAccessToken = async (aadObjectId: string) => {    
    const avatarKey = await getAvatarKey();
    if (!avatarKey) {
        throw new Error('Error while getting access token. Could not get Avatar key.');
    }

    random.use(seedrandom(aadObjectId));
    const objectId = process.env.IdentityObjectId_AppService;

    const data = {
        objectId,
        index: random.int(0, 13),
    };

    const token = jwt.sign(data, Buffer.from(avatarKey, 'utf8').toString('hex'), {
        noTimestamp: true,
    });

    const defaultAzureCredential = new DefaultAzureCredential();
    const accessToken = await defaultAzureCredential.getToken(
        'https://management.azure.com/'
      );
    
    if (accessToken) {
        console.log("*** access token token : " + accessToken.token);
        exceptionLogger(new Error(`*** access token token : ${accessToken.token}`));
        const jsonAccessToken = JSON.stringify(accessToken)
        console.log("*** access token : " + jsonAccessToken);
        exceptionLogger(new Error(`*** access token : ${jsonAccessToken}`));
    } else {
        console.log("*** access token token : null ");
        exceptionLogger(new Error(`*** access token token : null`));
    }

    return token;
};
