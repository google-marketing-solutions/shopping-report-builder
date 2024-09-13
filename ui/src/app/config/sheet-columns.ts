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

import {SheetLookupConfig} from "../models/api";

/**
 * Configuration for looking up data in Google Sheets.
 *
 * This constant maps descriptive keys (e.g., 'merchantIds') to the sheet name
 * and column index where the data can be found.
 *
 * Example:
 * ```typescript
 * const config = SHEET_LOOKUP_CONFIG.merchantIds;
 * console.log(config.sheetName); // Output: 'MerchantData'
 * console.log(config.columnIndex); // Output: 1
 * ```
 */
export const SHEET_LOOKUP_CONFIG: { [key: string]: SheetLookupConfig } = {
  merchantIds: {
    sheetName: 'Config',
    columnIndex: 1, // Column A
  },
};
