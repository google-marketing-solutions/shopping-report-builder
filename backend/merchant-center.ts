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

import {
  MerchantCenterAPIReportRequest,
  MerchantCenterAPIRequest,
  MerchantCenterAPIResponse,
} from './models';

/**
 * A class for interacting with the Merchant Center API.
 */
export class MerchantCenterAPI {
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
   * Build a MerchantCenterAPIRequest object to make calls to the API.
   * @param {string} service - The API service endpoint.
   * @param {string} method - The HTTP method (e.g., 'get', 'post').
   * @param {object} [payload={}] - The payload data for the request (optional).
   * @returns {MerchantCenterAPIRequest} a merchant API request object to use to
   *  make a call to the API.
   */
  buildMerchantCenterAPIRequest(
    service: string,
    method: string,
    payload: object = {},
  ): MerchantCenterAPIRequest {
    const request: MerchantCenterAPIRequest = {
      url: this.url + service,
      method,
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + this.token,
      },
      muteHttpExceptions: true,
    };

    if (Object.keys(payload).length !== 0) {
      request.payload = JSON.stringify(payload);
    }

    return request;
  }

  /**
   * Makes a call to the Merchant Center API.
   * @param {MerchantCenterAPIRequest} request - The API request.
   * @returns {MerchantCenterAPIResponse} The API call response.
   */
  call(request: MerchantCenterAPIRequest): MerchantCenterAPIResponse {
    Logger.log(
      `Running call() for ${request.url} with ` +
        `${JSON.stringify(request.payload)}`,
    );
    const params: {[key: string]: any} = {...request};
    delete params.url;
    const response = UrlFetchApp.fetch(request.url, params);
    const responseJson = JSON.parse(response.getContentText());

    if (responseJson.error) {
      Logger.log(`API Error: ${responseJson.error.message}`);
      throw new Error(responseJson.error.message);
    }

    return responseJson as MerchantCenterAPIResponse;
  }

  /**
   * Calls all pages in the API request and returns the results concatenated.
   * Results can be paginated, so this request steps through each page and
   * combines the results in an array.
   * @param {MerchantCenterAPIRequest} request - The API request.
   * @returns {Array<any>} An array containing the results from the request.
   */
  callAllPages(request: MerchantCenterAPIRequest): Array<any> {
    Logger.log(`Running callAllPages() for ${JSON.stringify(request)}`);
    // TODO: write me
    return [];
  }

  /**
   * Retrieves a report from the Merchant Center.
   * @param {MerchantCenterAPIReportRequest} request - The API request.
   * @returns {Array<any>} An array containing the results from the request.
   */
  getReport(request: MerchantCenterAPIReportRequest): Array<any> {
    Logger.log(`Running getReport() for ${JSON.stringify(request)}`);
    const apiRequest = this.buildMerchantCenterAPIRequest(
      request.merchantId + '/reports/search',
      'post',
      request.payload,
    );
    if (request.fetchAll === true) {
      return this.callAllPages(apiRequest);
    }
    return this.call(apiRequest).results || [];
  }
}
