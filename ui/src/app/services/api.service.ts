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

import {Injectable, NgZone} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  delay,
  map,
  Observable,
  of,
  throwError,
} from 'rxjs';
import {SHEET_LOOKUP_CONFIG} from '../config/sheet-columns';
import {mockPreviewMerchantCenterReportResponse} from '../mocks/mock-api-data';
import {
  APIResponse,
  ExportMerchantCenterReportRequest,
  PreviewMerchantCenterReportRequest,
} from '../models/api';
import {EnvironmentService} from './environment.service';

/**
 * A service that interacts with the Merchant Center API.
 *
 * This service provides methods to preview and export Merchant Center reports.
 * In development mode, it uses mock data. In production mode, it interacts
 * with Google Apps Script to make API calls.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  /**
   * A BehaviorSubject that stores the latest preview report results.
   *
   * This subject is used to notify components about changes in the report data.
   */
  private _merchantReportResults = new BehaviorSubject<any[]>([]);
  public merchantReportResults: Observable<any[]> =
    this._merchantReportResults.asObservable();

  constructor(
    private ngZone: NgZone,
    private environmentService: EnvironmentService,
  ) {}

  /**
   * Previews a Merchant Center report based on the given request.
   *
   * This method takes a `PreviewMerchantCenterReportRequest` object as input.
   * It returns an Observable that emits the parsed report data if successful,
   * or throws an error if the request fails.
   *
   * @param request The request object containing query and merchant ID.
   * @returns An Observable that emits the parsed report data or throws an
   *   error.
   */
  previewMerchantCenterReport(
    request: PreviewMerchantCenterReportRequest,
  ): Observable<any[]> {
    return this._previewMerchantCenterReport(request).pipe(
      map((response) => this.handleResponse(response)),
      catchError((error) => {
        console.error('Error from previewMerchantCenterReport:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Internal helper method to handle the preview report request logic.
   *
   * This method determines if the request should be made using mock data
   * (in development mode) or by calling Google Apps Script (in production mode).
   * It returns an Observable that emits the raw JSON response string.
   *
   * @param request The request object containing query and merchant ID.
   * @returns An Observable that emits the raw JSON response string.
   */
  private _previewMerchantCenterReport(
    request: PreviewMerchantCenterReportRequest,
  ): Observable<string> {
    if (!this.environmentService.production) {
      if (request.merchantId === 1) {
        return throwError(() => 'Error: User cannot access account');
      }
      return of(JSON.stringify(mockPreviewMerchantCenterReportResponse)).pipe(
        delay(500),
      );
    } else {
      return new Observable<string>((subscriber) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        google.script.run
          .withSuccessHandler((response: string) => {
            this.ngZone.run(() => {
              console.log(response);
              subscriber.next(JSON.stringify(response));
              subscriber.complete();
            });
          })
          .withFailureHandler((error: any) => {
            this.ngZone.run(() => {
              subscriber.error(error);
            });
          })
          .previewMerchantCenterReport(request.query, request.merchantId);
      });
    }
  }

  /**
   * Handles the response from the API and updates the internal BehaviorSubject.
   *
   * This method parses the JSON response, checks for success, updates the
   * `_merchantReportResults` BehaviorSubject with the data if successful, and
   * throws an error otherwise.
   *
   * @param response The raw JSON response string from the API.
   * @returns The parsed data array if the response is successful.
   * @throws An error if the response indicates failure.
   */
  private handleResponse(response: string): any[] {
    const parsedResponse = JSON.parse(response);
    if (!parsedResponse.success) {
      throw new Error(
        parsedResponse.message || 'API returned a non-success status.',
      );
    }
    this._merchantReportResults.next(parsedResponse.data);
    return parsedResponse.data;
  }

  /**
   * Exports a Merchant Center report to a Google Sheet.
   *
   * This method triggers an export of the report data to a specified Google
   * Sheet. In development environments, it simulates the export with a delay,
   * but does not actually output anything.
   *
   * @param request The ExportMerchantCenterReportRequest object containing the
   *  report query, merchant ID, and sheet name.
   * @returns An Observable that emits `true` on successful export.
   */
  exportMerchantCenterReport(
    request: ExportMerchantCenterReportRequest,
  ): Observable<boolean> {
    if (!this.environmentService.production) {
      return of(true).pipe(delay(1000));
    } else {
      return new Observable<boolean>((subscriber) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        google.script.run
          .withSuccessHandler(() => {
            this.ngZone.run(() => {
              subscriber.next(true);
              subscriber.complete();
            });
          })
          .withFailureHandler((error: any) => {
            this.ngZone.run(() => {
              subscriber.error(error);
            });
          })
          .exportMerchantCenterReport(
            request.query,
            request.merchantId,
            request.sheetName,
          );
      });
    }
  }

  /**
   * Fetches data from a Google Sheet based on the specified configuration key.
   *
   * This method takes a key (e.g., 'merchantIds') as input.
   * It uses the corresponding configuration from `SHEET_LOOKUP_CONFIG`
   * to determine the sheet name and column index. Then, it retrieves the
   * data from the specified column in the Google Sheet.
   *
   * In development mode, it uses mock data. In production mode, it interacts
   * with Google Apps Script to make API calls.
   *
   * @param key The key referencing a configuration entry in `SHEET_LOOKUP_CONFIG`.
   * @returns An Observable that emits the fetched data array if successful,
   *   or throws an error if the request fails.
   */
  getSheetLookupData(key: string): Observable<any[]> {
    const config = SHEET_LOOKUP_CONFIG[key];
    if (!config) {
      throw new Error(`Invalid lookup key: ${key}`);
    }

    return this._getSheetLookupData(key, config.sheetName, config.columnIndex);
  }

  private _getSheetLookupData(
    key: string,
    sheetName: string,
    columnIndex: number,
  ): Observable<any[]> {
    if (!this.environmentService.production) {
      return of(['1', '11111', '22222', '33333']);
    } else {
      return new Observable<any[]>((subscriber) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        google.script.run
        .withSuccessHandler((response: APIResponse) => {
          this.ngZone.run(() => {
            subscriber.next(response.data);
            subscriber.complete();
          });
        })
        .withFailureHandler((error: any) => {
          this.ngZone.run(() => {
            subscriber.error(error);
          });
        })
        .getSheetColumnData(sheetName, columnIndex);
      });
    }
  }
}
