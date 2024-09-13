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

import {readColumnFromSheet, writeToGoogleSheet} from './google-sheets';
import {MerchantCenterAPI} from './merchant-center';
import {APIResponse, MerchantCenterAPIReportRequest} from './models';
import {getOAuthToken} from './utils';

/**
 * Fetches a preview of the data from the Merchant Center API.
 *
 * @param {string} query - The API query.
 * @param {number} merchantId - The Merchant Center ID.
 * @param {number} [pageSize=10] - The number of results to return.
 * @returns {APIResponse} The API response with preview data.
 */
function previewMerchantCenterReport(
  query: string,
  merchantId: number,
  pageSize: number = 10,
): APIResponse {
  Logger.log(
    `Running previewMerchantCenterReport() for "${query}" for merchant: ` +
      `${merchantId}`,
  );
  try {
    const token = getOAuthToken();
    const api = new MerchantCenterAPI(token);
    const request: MerchantCenterAPIReportRequest = {
      merchantId: merchantId,
      fetchAll: false,
      payload: {
        query: query,
        pageSize,
      },
    };
    const response = api.getReport(request);
    const flattenedData = api.flatten(response);

    return {
      success: true,
      data: flattenedData,
    };
  } catch (error) {
    Logger.log(`Error fetching preview data: ${error}`);
    return {
      success: false,
      message: `Error fetching preview data: ${error}`,
    };
  }
}

/**
 * Fetches all data from the Merchant Center API and exports it to a Google Sheet.
 *
 * @param {string} query - The API query.
 * @param {number} merchantId - The Merchant Center ID.
 * @param {string} sheetName - The name of the sheet to export to.
 * @returns {APIResponse} The API response indicating export status.
 */
function exportMerchantCenterReport(
  query: string,
  merchantId: number,
  sheetName: string,
): APIResponse {
  Logger.log(
    `Running exportMerchantCenterReport() for "${query}" for merchant: ` +
      `${merchantId} to sheet: ${sheetName}`,
  );
  try {
    const token = getOAuthToken();
    const api = new MerchantCenterAPI(token);
    const request: MerchantCenterAPIReportRequest = {
      merchantId: merchantId,
      fetchAll: true,
      payload: {
        query: query,
        pageSize: 1000,
      },
    };
    const response = api.getReport(request);
    const flattenedData = api.flatten(response);

    writeToGoogleSheet(flattenedData, sheetName);

    return {success: true};
  } catch (error) {
    Logger.log(`Error exporting data: ${error}`);
    return {
      success: false,
      message: `Error exporting data: ${error}`,
    };
  }
}

/**
 * Fetches data from a specific sheet and column.
 *
 * @param {string} sheetName - The name of the sheet.
 * @param {number} columnIndex - The column index (1-based).
 * @returns {APIResponse} The API response with the data from the column.
 */
function getSheetColumnData(
  sheetName: string,
  columnIndex: number,
): APIResponse {
  Logger.log(
    `Running getSheetColumnData() for sheet: ${sheetName}, column: ${columnIndex}`,
  );

  const columnData = readColumnFromSheet(sheetName, columnIndex);
  let response;

  if (columnData === null) {
    response = {
      success: false,
      message: `Could not read from sheet: ${sheetName}`,
    };
  } else {
    response = {
      success: true,
      data: columnData,
    };
  }
  Logger.log(response);
  return response;
}

export {
  exportMerchantCenterReport,
  getSheetColumnData,
  previewMerchantCenterReport,
};
