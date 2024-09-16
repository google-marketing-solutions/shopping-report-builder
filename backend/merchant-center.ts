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
   * Makes a call to the Merchant Center API.
   * @param {MerchantCenterAPIRequest} request - The API request.
   * @returns {MerchantCenterAPIResponse} The API call response.
   */
  call(request: MerchantCenterAPIRequest): MerchantCenterAPIResponse {
    // TODO: write me
    return {} as MerchantCenterAPIResponse;
  }

  /**
   * Calls all pages in the API request and returns the results concatenated.
   * Results can be paginated, so this request steps through each page and
   * combines the results in an array.
   * @param {MerchantCenterAPIRequest} request - The API request.
   * @returns {Array<any>} An array containing the results from the request.
   */
  callAllPages(request: MerchantCenterAPIRequest): Array<any> {
    // TODO: write me
    return [];
  }

  /**
   * Retrieves a report from the Merchant Center.
   * @param {MerchantCenterAPIReportRequest} request - The API request.
   * @returns {Array<any>} An array containing the results from the request.
   */
  getReport(request: MerchantCenterAPIReportRequest): Array<any> {
    // TODO: write me
    return [];
  }
}
