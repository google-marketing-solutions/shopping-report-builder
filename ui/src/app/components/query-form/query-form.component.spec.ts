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
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {of, throwError} from 'rxjs';
import {ApiService} from '../../services/api.service';
import {QueryFormComponent} from './query-form.component';

describe('QueryFormComponent', () => {
  let component: QueryFormComponent;
  let fixture: ComponentFixture<QueryFormComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', [
      'previewMerchantCenterReport',
      'exportMerchantCenterReport',
      'getSheetLookupData',
    ]);

    mockApiService.getSheetLookupData.and.returnValue(
      of(['1', '11111', '22222', '33333']),
    );

    await TestBed.configureTestingModule({
      imports: [QueryFormComponent, BrowserAnimationsModule],
      providers: [{provide: ApiService, useValue: mockApiService}],
    }).compileComponents();

    fixture = TestBed.createComponent(QueryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate a random sheet name on initialization', () => {
    expect(component.sheetName).toMatch(/query_\d+/);
  });

  it('isFormValid should correctly determine form validity', () => {
    component.merchantId = 0;
    component.query = '';
    component.sheetName = '';
    expect(component.isFormValid()).toBeFalse();

    component.merchantId = 123;
    component.query = '';
    component.sheetName = '';
    expect(component.isFormValid()).toBeFalse();

    component.merchantId = 123;
    component.query = 'test query';
    component.sheetName = '';
    expect(component.isFormValid()).toBeFalse();

    component.merchantId = 123;
    component.query = '';
    component.sheetName = 'test sheet';
    expect(component.isFormValid()).toBeFalse();

    component.merchantId = 123;
    component.query = 'test query';
    component.sheetName = 'test sheet';
    expect(component.isFormValid()).toBeTrue();

    component.merchantId = -1;
    expect(component.isFormValid()).toBeFalse();
  });

  it('onPreview should NOT call ApiService if form is invalid', () => {
    component.merchantId = 0;
    component.query = '';
    component.sheetName = '';

    component.onPreview();

    expect(mockApiService.previewMerchantCenterReport).not.toHaveBeenCalled();
  });

  it('onPreview should call ApiService with correct request on valid form', () => {
    component.merchantId = 123;
    component.query = 'my query';
    component.sheetName = 'my sheet';

    const mockResponse: any[] = [];
    mockApiService.previewMerchantCenterReport.and.returnValue(
      of(mockResponse),
    );

    component.onPreview();

    expect(mockApiService.previewMerchantCenterReport).toHaveBeenCalledWith({
      merchantId: 123,
      query: 'my query',
    });
  });

  it('onExport should NOT call ApiService if form is invalid', () => {
    component.merchantId = 0;
    component.query = '';
    component.sheetName = '';

    component.onExport();

    expect(mockApiService.exportMerchantCenterReport).not.toHaveBeenCalled();
  });

  it('onExport should call ApiService with correct request on valid form', () => {
    component.merchantId = 123;
    component.query = 'my query';
    component.sheetName = 'my sheet';

    const mockResponse: boolean = true;
    mockApiService.exportMerchantCenterReport.and.returnValue(of(mockResponse));

    component.onExport();

    expect(mockApiService.exportMerchantCenterReport).toHaveBeenCalledWith({
      merchantId: 123,
      query: 'my query',
      sheetName: 'my sheet',
    });
  });

  it('should show an error message when the service returns an error', fakeAsync(() => {
    const errorMessage = 'Simulated error from the service';
    mockApiService.previewMerchantCenterReport.and.returnValue(
      throwError(() => errorMessage),
    );

    component.merchantId = 123;
    component.query = 'my query';
    component.sheetName = 'my sheet';

    component.onPreview();

    tick();

    fixture.detectChanges();

    expect(component.apiErrors).toBe(errorMessage);
  }));

  it('should filter merchantIds based on input value', () => {
    component.merchantIds = [123, 456, 789, 1234];
    fixture.detectChanges();

    const inputEvent = {target: {value: '12'}} as any as Event;
    component.onMerchantIdInputChange(inputEvent);

    component.filteredMerchantIds.subscribe((filteredIds) => {
      expect(filteredIds).toEqual([123, 1234]);
    });

    const inputEvent2 = {target: {value: '456'}} as any as Event;
    component.onMerchantIdInputChange(inputEvent2);

    component.filteredMerchantIds.subscribe((filteredIds) => {
      expect(filteredIds).toEqual([456]);
    });
  });

  it('should set merchantId when there is a single match', () => {
    component.merchantIds = [123];
    fixture.detectChanges();

    const inputEvent = {target: {value: '123'}} as any as Event;
    component.onMerchantIdInputChange(inputEvent);

    expect(component.merchantId).toBe(123);
  });
});
