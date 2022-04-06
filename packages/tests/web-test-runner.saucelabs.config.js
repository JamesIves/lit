/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {wtrConfig} from './wtr-config.js';
import {createSauceLabsLauncher} from '@web/test-runner-saucelabs';

/***
 * Below is a list of tests that will run externally in Saucelabs.
 * When a package requires remote testing, add it to the list below.
 *
 * Not all tests have production requirements.
 */

const devFiles = [
  '../labs/observers/development/**/*_test.(js|html)',
  '../labs/react/development/**/*_test.(js|html)',
  '../labs/router/development/**/*_test.js',
  '../labs/scoped-registry-mixin/development/**/*_test.(js|html)',
  '../labs/ssr/development/**/*_test.(js|html)',
  '../labs/task/development/**/*_test.(js|html)',
  '../lit-element/development/**/*_test.(js|html)',
  '../lit-html/development/**/*_test.(js|html)',
  '../reactive-element/development/**/*_test.(js|html)',
];

const prodFiles = [
  '../labs/ssr/development/**/*_test.(js|html)',
  '../lit-element/development/**/*_test.(js|html)',
  '../lit-html/development/**/*_test.(js|html)',
  '../reactive-element/development/**/*_test.(js|html)',
];

const browserSettings = {
  chromium: {
    browserName: 'chrome',
    browserVersion: 'latest-3',
    platformName: 'Windows 10',
  },
  firefox: {
    browserName: 'Firefox',
    browserVersion: '78',
    platformName: 'Windows 10',
  },
  safari: {
    browserName: 'Safari',
    browserVersion: 'latest',
    platformName: 'macOS 10.15',
  },
  IE: {
    browserName: 'Internet Explorer',
    browserVersion: '11',
    platformName: 'Windows 10',
  },
};

const mode = (process.env.MODE || '').trim();
const user = (process.env.SAUCE_USERNAME || '').trim();
const key = (process.env.SAUCE_ACCESS_KEY || '').trim();
const tunnelIdentifier = (process.env.SAUCE_TUNNEL_ID || '').trim();

if (!user || !key || !tunnelIdentifier) {
  throw new Error(`
To test on Sauce, set the following env variables
- SAUCE_USERNAME
- SAUCE_ACCESS_KEY
- SAUCE_TUNNEL_ID
  `);
}

/***
 * Shared tunnels are 'high availablity' tunnels at Saucelabs
 *
 * Tunnels are generally meant to run 1 test suite. However, Lit runs
 * 50+ test files. Saucelabs recommends a shared tunnel for this use case.
 * When multiple tests use the same tunnel, a tunnel collision occurs.
 * When tunnel requests collide, the most recent is favored and the previous
 * is dropped.
 *
 * By using a `tunnelIdentifier` alongside `noRemoveCollidingTunnels` and
 * `sharedTunnel` properties in the SauceLabsLauncher config, tests will
 * avoid tunnel collisions.
 *
 * To read more go to:
 * https://docs.saucelabs.com/secure-connections/sauce-connect/setup-configuration/high-availability/
 *
 */
const sauceLauncher = createSauceLabsLauncher(
  {
    user,
    key,
  },
  {
    build: tunnelIdentifier,
  },
  {
    noRemoveCollidingTunnels: true,
    sharedTunnel: true,
    tunnelIdentifier,
  }
);

let browsers;
// example: BROWSERS=chromium npm run tests
if (browserSettings[process.env.BROWSERS] !== undefined) {
  browsers = [sauceLauncher(browserSettings[process.env.BROWSERS])];
}
// example: BROWSERS=sauce npm run tests
if (process.env.BROWSERS === 'sauce') {
  browsers = [
    sauceLauncher(browserSettings.chromium),
    sauceLauncher(browserSettings.firefox),
    sauceLauncher(browserSettings.safari),
  ];
}
// example: BROWSERS=sauce-ie11 npm run tests
if (process.env.BROWSERS === 'sauce-ie11') {
  browsers = [sauceLauncher(browserSettings.IE)];
}

const files = mode === 'prod' ? prodFiles : devFiles;

// https://modern-web.dev/docs/test-runner/cli-and-configuration/
export default {
  ...wtrConfig,
  browsers,
  files,
};