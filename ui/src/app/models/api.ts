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
 * Interface for previewing a Merchant Center Report request.
 */
export interface PreviewMerchantCenterReportRequest {
  query: string;
  merchantId: number;
  pageSize?: number;
}

/**
 * Interface for exporting a Merchant Center Report.
 */
export interface ExportMerchantCenterReportRequest {
  query: string;
  merchantId: number;
  sheetName: string;
}

/**
 * Interface for looking up columns in Google Sheets.
 */
export interface SheetLookupConfig {
  sheetName: string;
  columnIndex: number; // 1-based index
}

/**
 * Interface for the API response.
 */
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
