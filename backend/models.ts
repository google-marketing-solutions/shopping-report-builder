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
 * @fileoverview Definitions for the models used in the backend code.
 */

/**
 * Interface for making requests to the Merchant Center API.
 */
export interface MerchantCenterAPIRequest {
  url: string;
  method: string;
  contentType: string;
  headers: {
    Authorization: string;
  };
  muteHttpExceptions: boolean;
  payload?: {
    [key: string]: any;
  };
}

/**
 * Interface for the Merchant Center API response.
 */
export interface MerchantCenterAPIResponse {
  results?: Array<any>;
  nextPageToken?: string | null;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Interface for making a call to the report endpoint of the API.
 */
export interface MerchantCenterAPIReportRequest {
  merchantId: number;
  fetchAll: boolean;
  payload: {
    query: string;
    pageSize: number;
    pageToken?: string;
  };
}
