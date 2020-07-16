// Copyright 2020 the Deno authors. All rights reserved. MIT license.

import {
  APIGatewayProxyEventV2,
  Context,
  APIGatewayProxyResultV2,
} from "../../deps.ts";
import { respondJSON } from "../../utils/http.ts";
import { listEntries, countEntries } from "../../utils/database.ts";

export async function handler(
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResultV2> {
  // TODO(lucacasonato): gracefully handle errors

  const limit = parseInt(event.queryStringParameters?.limit || "20");
  const page = parseInt(event.queryStringParameters?.page || "1");
  const query = event.queryStringParameters?.query || undefined;

  if (limit > 100 || limit < 1) {
    return respondJSON({
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: "the limit may not be larger than 100 or smaller than 1",
      }),
    });
  }

  if (page < 1) {
    return respondJSON({
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: "the page number must not be lower than 1",
      }),
    });
  }

  const [results, count] = await Promise.all([
    listEntries(limit, page, query),
    countEntries(),
  ]);

  return respondJSON({
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: {
        total_count: count,
        results,
      },
    }),
  });
}
