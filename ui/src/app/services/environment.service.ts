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
import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';

/**
 * Provides access to the application's environment configuration.
 * This service acts as an abstraction layer over the environment.ts file,
 * making it easier to mock and test environment-dependent logic.
 */
@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  /**
   * Private backing variable for the production flag.
   */
  private _production: boolean = environment.production;

  /**
   * Gets the production flag from the environment.
   *
   * @returns True if the application is in production mode, false otherwise.
   */
  get production(): boolean {
    return this._production;
  }

  /**
   * Sets the production flag. This is primarily used for testing purposes.
   *
   * @param value The new value for the production flag.
   */
  set production(value: boolean) {
    this._production = value;
  }
}
