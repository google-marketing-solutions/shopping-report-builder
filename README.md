# Shopping Report Builder

This tool simplifies the process of extracting reports from [the Reporting API
in Google Merchant Center](
    https://developers.google.com/shopping-content/guides/reports/overview) for
users who are less familiar with coding.


## The Problem
The Google Merchant Center UI doesn't allow exporting all available fields. This
can be a hurdle for users who need specific data for tasks like optimization,
but lack the technical expertise to access it via the Reporting API directly.

## Solution
This project offers a user-friendly interface embedded within Google Sheets.
Users can construct custom queries based on the Content API to extract specific
data from Merchant Center. The extracted information is then populated directly
into the Google Sheet, ready for analysis and further reporting.

## Getting Started
The easiest method for most users is to:

1. Create a copy of the provided Google Sheet.
2. Deploy the UI
3. Use the data: Once the UI is deployed, you can use it to generate reports and
   populate the Google Sheet.

## Advanced Users

### Manual Deployment (For users comfortable with Node.js and clasp)

These instructions guide you through a manual deployment process using the clasp
tool:

1. **Install Node.js and npm**: Ensure you have an up-to-date installation of
   Node.js and npm ([guide](
    https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)).
2. **Install clasp**: Install clasp globally by running:
   `npm install @google/clasp -g.`
3. **Login with clasp**: Log in to clasp using `clasp login`.
4. **Enable Apps Script API**: Navigate to [the Apps Script Settings page](
   https://script.google.com/corp/home/usersettings) and enable the Apps Script
   API.
5. **Get App Script ID**: Create a new Google Sheet. Go to Extensions -> App
   Script -> Project settings and copy the project ID.
6. **Configure clasp**:
  - Run `cp example.clasp.json .clasp.json` (copies a configuration file).
  - Update the `scriptId` property in the `.clasp.json` file with the App Script
    ID you copied in step 5.
7. Deploy the script: Run `./deploy.sh` to deploy the script to your Google Apps
   Script project.


### Local Development (For developers who want to contribute)

For developers interested in contributing to the UI development, standard
Angular commands can be used:

`ng serve`: Starts the development server.

Mock data is returned in development, it does not query the API. If you enter a
merchant ID of 1, it will return a mock error.

## Project Structure
The project is organized as follows:

- `/backend`: Contains all the Google Apps Script code responsible for
  interacting with the Reporting API and populating the Sheet.
- `/ui`: Contains the Angular code for the user interface.

## Example Queries

Pull your products and their click potential:
```
SELECT
  product_view.id,
  product_view.offer_id,
  product_view.click_potential,
  product_view.click_potential_rank
FROM
  ProductView
```

## Disclaimer
__This is not an officially supported Google product.__

Copyright 2024 Google LLC. This solution, including any related sample code or
data, is made available on an "as is", "as available", and "with all faults"
basis, solely for illustrative purposes, and without warranty or representation
of any kind. This solution is experimental, unsupported and provided solely for
your convenience. Your use of it is subject to your agreements with Google, as
applicable, and may constitute a beta feature as defined under those agreements.
To the extent that you make any data available to Google in connection with your
use of the solution, you represent and warrant that you have all necessary and
appropriate rights, consents and permissions to permit Google to use and process
that data. By using any portion of this solution, you acknowledge, assume and
accept all risks, known and unknown, associated with its usage, including with
respect to your deployment of any portion of this solution in your systems, or
usage in connection with your business, if at all.
