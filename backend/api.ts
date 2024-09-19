/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview API endpoints for the UI that orchestrate the key executions.
 */

import {MerchantCenterAPI} from "./merchant-center";
import {MerchantCenterAPIReportRequest} from "./models";
import {getOAuthToken} from "./utils";

/**
 * Fetches a preview of the data from the Merchant Center API.
 *
 * @param {string} query - The API query.
 * @param {number} merchantId - The Merchant Center ID.
 * @param {number} [pageSize=10] - The number of results to return.
 * @returns {any[]} The preview data (top 10 results).
 */
function previewMerchantCenterReport(
  query: string,
  merchantId: number,
  pageSize: number = 10,
): any[] {
  Logger.log(
    `Running previewMerchantCenterReport() for "${query}" for merchant: ` +
    `${merchantId}`);
  const token = getOAuthToken();
  const api = new MerchantCenterAPI(token);
  const request: MerchantCenterAPIReportRequest  = {
    merchantId: merchantId,
    fetchAll: false,
    payload: {
      query: query,
      pageSize,
    },
  };
  const response = api.getReport(request);
  return api.flatten(response);
}

export {
  previewMerchantCenterReport
};
