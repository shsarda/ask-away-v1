import * as df from "durable-functions";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createBadRequestResponse } from "../src/utils/responseUtility";
import { isValidParam } from "../src/utils/requestUtility";
import { errorStrings } from "../src/constants/errorStrings";
import { initiateDBConnection } from "../src/utils/dbUtility";

const httpStart: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<any> {
  context.log(`**** Reading app settings`);
  context.log(
    `getting MicrosoftAppPassword from keyvault ${process.env.MicrosoftAppPassword}`
  );
  context.log(
    `getting AzureWebJobsStorage from keyvault ${process.env.AzureWebJobsStorage}`
  );
  context.log(
    `getting APPINSIGHTS_INSTRUMENTATIONKEY from keyvault ${process.env.APPINSIGHTS_INSTRUMENTATIONKEY}`
  );
  context.log(`getting MongoDbUri from keyvault ${process.env.MongoDbUri}`);
  context.log(
    `getting AzureSignalRConnectionString from keyvault ${process.env.AzureSignalRConnectionString}`
  );
  context.log(`getting AvatarKey from keyvault ${process.env.AvatarKey}`);

  if (!isValidParam(req.body?.conversationId)) {
    createBadRequestResponse(
      context,
      errorStrings.RequestParameterIsMissingError.replace(
        "{0}",
        "conversationId"
      )
    );
    return context.res;
  }

  if (!isValidParam(req.body?.eventData)) {
    createBadRequestResponse(
      context,
      errorStrings.RequestParameterIsMissingError.replace("{0}", "eventData")
    );
    return context.res;
  }

  // Initiate db connection if not initiated already.
  await initiateDBConnection();

  const client = df.getClient(context);
  const instanceId = await client.startNew(
    "background-jobs-orchestrator",
    undefined,
    req.body
  );

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return client.createCheckStatusResponse(context.bindingData.req, instanceId);
};

export default httpStart;
