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
 * @fileoverview Helper class for working with the Merchant Center API.
 * @see {@link https://developers.google.com/shopping-content/guides/quickstart}
 */

/**
 * Interface for the parameters of the API call.
 */
interface MerchantCenterCallParams {
  method: string;
  contentType: string;
  headers: {Authorization: string};
  muteHttpExceptions: boolean;
  payload?: string;
}

/**
 * Interface for the response from the Merchant Center API.
 */
interface MerchantCenterResponse {
  results?: Array<any>;
  nextPageToken?: string | null;
  error?: {
    code: number;
    message: string;
  } | null;
}

/**
 * Interface for the report query entries.
 */
interface ReportQueryEntries {
  pageSize: number;
  pageToken?: string;
}

/**
 * A class for interacting with the Merchant Center API.
 */
class MerchantCenterAPI {
  /**
   * The base URL for the Merchant Center API.
   * @type {string}
   */
  url: string;

  /**
   * The authentication token for the API.
   * @type {string}
   */
  token: string;

  /**
   * Creates a new instance of the MerchantCenterAPI.
   * @param {string} token - The authentication token for the API.
   */
  constructor(token: string) {
    this.url = 'https://shoppingcontent.googleapis.com/content/v2.1/';
    this.token = token;
  }

  /**
   * Makes a call to the Merchant Center API.
   * @param {string} service - The API service endpoint.
   * @param {string} method - The HTTP method (e.g., 'get', 'post').
   * @param {object} [payload={}] - The payload data for the request (optional).
   * @returns {MerchantCenterResponse} The parsed JSON response from the API.
   */
  call(
    service: string,
    method: string,
    payload: object = {},
  ): MerchantCenterResponse {
    const params: MerchantCenterCallParams = {
      method: method,
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + this.token,
      },
      muteHttpExceptions: true,
    };

    if (Object.keys(payload).length !== 0) {
      params.payload = JSON.stringify(payload);
    }

    // @ts-ignore
    const response = UrlFetchApp.fetch(this.url + service, params);
    return JSON.parse(response.getContentText());
  }

  /**
   * Retrieves a report from the Merchant Center.
   * @param {string} merchantId - The Merchant Center ID.
   * @param {ReportQueryEntries} entries - The report search criteria.
   * @param {boolean} [fullDownload=false] - Whether to download the full report
   *  (default: false, fetches preview).
   * @param {number} [pageSize=1000] - The number of rows per page (default:
   *  1000). Applies to both preview and full download.
   * @returns {Array} The report data as an array of results.
   */
  get_report(
    merchantId: string,
    entries: ReportQueryEntries,
    fullDownload: boolean = false,
    pageSize: number = 1000,
  ): Array<any> {
    const queryEntries: ReportQueryEntries = {
      ...entries,
      pageSize: pageSize,
    };

    let pageToken: string | null = '';
    const fullResults: any[] = [];
    let nTries = 0;
    const maxTries = 3;

    do {
      queryEntries.pageToken = pageToken;

      const response = this.call(
        merchantId + '/reports/search',
        'post',
        queryEntries,
      );

      if (response.error !== null && response.error !== undefined) {
        // @ts-ignore
        Logger.log(`Error(${response.error.code}): ${response.error.message}`);
        if (response.error.code === 500) {
          if (nTries < maxTries) {
            // @ts-ignore
            Logger.log(`Internal error. Trying again #${nTries + 1}`);
            nTries += 1;
            continue;
          }
          throw new Error(
            'Internal error getting report. Please try it again later',
          );
        }
        break;
      }

      // Process results if no errors
      if (Array.isArray(response.results)) {
        fullResults.push(...response.results);
      }

      pageToken = response.nextPageToken || null;
    } while (fullDownload && pageToken !== null);

    // @ts-ignore
    Logger.log(`Final results: ${fullResults.length} rows.`);
    return fullResults;
  }

  /**
   * Transforms the raw response data by extracting all nested properties.
   * @param {Array} responseData - The raw response data.
   * @returns {Array} The transformed data with all nested properties extracted
   *  and flattened.
   */
  transformResponseData(responseData: Array<any>): Array<any> {
    return responseData.map((item) => {
      const transformedItem: {[key: string]: any} = {};
      // Recursively extract nested properties
      const extractNestedProperties = (obj: { [x: string]: any; }, prefix = '') => {
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            extractNestedProperties(
              obj[key],
              prefix ? `${prefix}.${key}` : key,
            );
          } else {
            transformedItem[prefix ? `${prefix}.${key}` : key] = obj[key];
          }
        }
      };
      extractNestedProperties(item);
      return transformedItem;
    });
  }
}
