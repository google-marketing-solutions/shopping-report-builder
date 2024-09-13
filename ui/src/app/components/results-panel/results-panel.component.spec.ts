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
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {BehaviorSubject} from 'rxjs';

import {ApiService} from '../../services/api.service';
import {ResultsPanelComponent} from './results-panel.component';

describe('ResultsPanelComponent', () => {
  let component: ResultsPanelComponent;
  let fixture: ComponentFixture<ResultsPanelComponent>;
  let apiService: ApiService;
  let merchantReportResultsSubject: BehaviorSubject<any[]>;

  beforeEach(async () => {
    merchantReportResultsSubject = new BehaviorSubject<any[]>([]);

    const apiServiceStub = {
      _merchantReportResults: merchantReportResultsSubject,
      get merchantReportResults() {
        return this._merchantReportResults.asObservable();
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        ResultsPanelComponent,
        MatTableModule,
        MatCardModule,
        NoopAnimationsModule,
      ],
      providers: [{provide: ApiService, useValue: apiServiceStub}],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsPanelComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display table when there are results', fakeAsync(() => {
    const mockData = [{col1: 'value1', col2: 'value2'}];

    merchantReportResultsSubject.next(mockData);
    fixture.detectChanges();
    tick();

    const table = fixture.debugElement.query(By.css('table'));
    expect(table).toBeTruthy();
  }));

  it('should not display table if no data initially', () => {
    const table = fixture.debugElement.query(By.css('table'));
    expect(table).toBeFalsy();
  });
});
