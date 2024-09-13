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
import {PlatformRef} from '@angular/core';
import {TestBed, fakeAsync, tick} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {of} from 'rxjs';
import {mockPreviewMerchantCenterReportResponse} from '../mocks/mock-api-data';
import {
  ExportMerchantCenterReportRequest,
  PreviewMerchantCenterReportRequest,
} from '../models/api';
import {ApiService} from './api.service';
import {EnvironmentService} from './environment.service';
import { SHEET_LOOKUP_CONFIG } from '../config/sheet-columns';

describe('ApiService', () => {
  let service: ApiService;
  let mockEnvironmentService: jasmine.SpyObj<EnvironmentService>;
  let mockGoogleScriptRun: jasmine.SpyObj<any>;

  beforeEach(() => {
    (window as any).google = {
      script: {
        run: jasmine.createSpyObj('google.script.run', [
          'previewMerchantCenterReport',
          'exportMerchantCenterReport',
          'withSuccessHandler',
        ]),
      },
    };
    mockGoogleScriptRun = (window as any).google.script.run;

    mockEnvironmentService = {
      production: false,
    } as jasmine.SpyObj<EnvironmentService>;

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        ApiService,
        {provide: PlatformRef, useValue: {}},
        {provide: EnvironmentService, useValue: mockEnvironmentService},
      ],
    });
    service = TestBed.inject(ApiService);
  });

  afterEach(() => {
    (window as any).google = null;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('previewMerchantCenterReport', () => {
    it('should return mock data in non-production', (done) => {
      mockEnvironmentService.production = false;
      spyOn(service as any, '_previewMerchantCenterReport').and.returnValue(
        of(JSON.stringify(mockPreviewMerchantCenterReportResponse)),
      );
      const request: PreviewMerchantCenterReportRequest = {
        query: 'test',
        merchantId: 123,
      };
      service.previewMerchantCenterReport(request).subscribe((data) => {
        expect(data).toEqual(mockPreviewMerchantCenterReportResponse.data);
        done();
      });
    });

    it('should call google.script.run in production', fakeAsync(() => {
      fakeAsync(() => {
        mockEnvironmentService.production = true;
        const request: PreviewMerchantCenterReportRequest = {
          query: 'test',
          merchantId: 123,
        };
        service.previewMerchantCenterReport(request);
        tick(0); // Tick to allow the promise to resolve
        expect(
          mockGoogleScriptRun.previewMerchantCenterReport,
        ).toHaveBeenCalledWith(request.query, request.merchantId);
      });
    }));
  });

  describe('exportMerchantCenterReport', () => {
    it('should return true in non-production', (done) => {
      mockEnvironmentService.production = false;
      const request: ExportMerchantCenterReportRequest = {
        query: 'test',
        merchantId: 123,
        sheetName: 'testSheet',
      };
      service.exportMerchantCenterReport(request).subscribe((result) => {
        expect(result).toBe(true);
        done();
      });
    });

    it('should call google.script.run in production', fakeAsync(() => {
      fakeAsync(() => {
        mockEnvironmentService.production = true;
        const request: ExportMerchantCenterReportRequest = {
          query: 'test',
          merchantId: 123,
          sheetName: 'testSheet',
        };
        service.exportMerchantCenterReport(request);
        tick(0);
        expect(
          mockGoogleScriptRun.exportMerchantCenterReport,
        ).toHaveBeenCalledWith(
          request.query,
          request.merchantId,
          request.sheetName,
        );
      });
    }));
  });

  describe('getSheetLookupData', () => {
    it('should return mock data in non-production for merchantIds', (done) => {
      mockEnvironmentService.production = false;
      spyOn(service as any, '_getSheetLookupData').and.returnValue(
        of(['11111', '22222', '33333']),
      );
      service.getSheetLookupData('merchantIds').subscribe((data) => {
        expect(data).toEqual(['11111', '22222', '33333']);
        done();
      });
    });

    it('should call google.script.run in production for merchantIds', fakeAsync(() => {
      fakeAsync(() => {
        mockEnvironmentService.production = true;
        const config = SHEET_LOOKUP_CONFIG['merchantIds'];
        service.getSheetLookupData('merchantIds');
        tick(0);
        expect(mockGoogleScriptRun.getSheetColumnData).toHaveBeenCalledWith(
          config.sheetName,
          config.columnIndex,
        );
      });
    }));
  });
});
