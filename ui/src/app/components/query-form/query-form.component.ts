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
import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Observable, of} from 'rxjs';
import {
  ExportMerchantCenterReportRequest,
  PreviewMerchantCenterReportRequest,
} from '../../models/api';
import {ApiService} from '../../services/api.service';

/**
 * A query form for interacting with a merchant center report API.
 */
@Component({
  selector: 'app-query-form',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
  ],
  templateUrl: './query-form.component.html',
  styleUrls: ['./query-form.component.scss'],
})
export class QueryFormComponent implements OnInit {
  /** The merchant ID associated with the report. */
  merchantId: number | null = null;

  /** The user-entered query for the report. */
  query: string = '';

  /** The name of the sheet where the report results will be exported. */
  sheetName: string = '';

  /** Flag indicating if a preview request is in progress. */
  isPreviewLoading: boolean = false;

  /** Flag indicating if an export request is in progress. */
  isExportLoading: boolean = false;

  /** Errors from the API */
  apiErrors: string = '';

  /** Successful message from the API */
  successMessage: string = '';

  /** All fetched merchant IDs stored in memory */
  merchantIds: number[] = [];

  /** Filtered merchant IDs for autocomplete based on user input */
  filteredMerchantIds: Observable<number[]> = of([]);

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {
    this.sheetName = this.generateRandomSheetName();
  }

  ngOnInit() {
    this.cdr.detectChanges();
    this.fetchMerchantIds();
  }

  /**
   * Fetches all merchant IDs from the Google Sheet and stores them in memory.
   */
  fetchMerchantIds(): void {
    this.apiService.getSheetLookupData('merchantIds').subscribe((data) => {
      this.merchantIds = data.map(Number).filter(Number.isInteger);
      this.filteredMerchantIds = of(this.merchantIds);
    });
  }

  /**
   * Filters the merchant IDs based on the user's input in the autocomplete field
   * and sets the merchantId if there is a single match.
   * @param value The value entered by the user.
   */
  onMerchantIdInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.value) {
      this.merchantId = Number(inputElement.value);
      this.filteredMerchantIds = of(
        this.merchantIds.filter((id) =>
          id.toString().includes(inputElement.value),
        ),
      );
    } else {
      this.merchantId = null;
      this.filteredMerchantIds = of(this.merchantIds);
    }
  }

  /**
   * Generates a random sheet name for the report export.
   * @returns A string containing a random sheet name.
   */
  generateRandomSheetName(): string {
    return `query_${Date.now()}`;
  }

  /**
   * Checks if the form is valid for submission (all fields filled).
   * @returns True if all form fields are filled, false otherwise.
   */
  isFormValid(): boolean {
    return (
      this.merchantId !== null &&
      this.merchantId > 0 &&
      this.query.length > 0 &&
      this.sheetName.length > 0
    );
  }

  /**
   * Triggers a preview request for the merchant center report.
   */
  onPreview(): void {
    if (this.isFormValid()) {
      this.isPreviewLoading = true;
      this.apiErrors = '';
      const request: PreviewMerchantCenterReportRequest = {
        merchantId: this.merchantId!,
        query: this.query,
      };

      this.apiService.previewMerchantCenterReport(request).subscribe({
        complete: () => {
          this.isPreviewLoading = false;
        },
        error: (error) => {
          // Apps Script runs Angular in an iframe, creating a separate
          // execution context. Even with NgZone.run(), the iframe's timing can
          // prevent immediate UI updates. setTimeout(..., 0) forces the code to
          // run at the end of the event loop, providing a small delay for
          // Angular's change detection to catch up within the iframe.
          this.ngZone.run(() => {
            setTimeout(() => {
              this.isPreviewLoading = false;
              this.apiErrors =
                typeof error === 'string'
                  ? error
                  : error?.message || 'An error occurred.';
              this.cdr.detectChanges();
            }, 0);
          });
        },
      });
    }
  }

  /**
   * Triggers an export request for the merchant center report.
   */
  onExport(): void {
    if (this.isFormValid()) {
      this.isExportLoading = true;
      this.apiErrors = '';
      const request: ExportMerchantCenterReportRequest = {
        merchantId: this.merchantId!,
        query: this.query,
        sheetName: this.sheetName,
      };

      this.apiService.exportMerchantCenterReport(request).subscribe({
        next: (success) => {
          if (success) {
            this.ngZone.run(() => {
              setTimeout(() => {
                this.isExportLoading = false;
                this.successMessage = `Report exported successfully to: ${this.sheetName}`;
                this.cdr.detectChanges();
              }, 0);
            });
          }
        },
        error: (error) => {
          // Apps Script runs Angular in an iframe, creating a separate
          // execution context. Even with NgZone.run(), the iframe's timing can
          // prevent immediate UI updates. setTimeout(..., 0) forces the code to
          // run at the end of the event loop, providing a small delay for
          // Angular's change detection to catch up within the iframe.
          this.ngZone.run(() => {
            setTimeout(() => {
              this.isPreviewLoading = false;
              this.apiErrors =
                typeof error === 'string'
                  ? error
                  : error?.message || 'An error occurred.';
              this.cdr.detectChanges();
            }, 0);
          });
        },
      });
    }
  }
}
