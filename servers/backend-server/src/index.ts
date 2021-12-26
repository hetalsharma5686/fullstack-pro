/* eslint-disable import/first */
/// <reference types="webpack-env" />
// eslint-disable-next-line global-require, import/first, no-unused-expressions, @typescript-eslint/no-var-requires
process.env.ENV_FILE !== null && require('dotenv').config({ path: process.env.ENV_FILE });

import 'reflect-metadata';
import { logger } from '@cdm-logger/server';
import { Service } from './service';

declare let module: __WebpackModuleApi.Module;

process.on('uncaughtException', (ex) => {
    logger.error(ex);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error(reason);
});
const service = new Service();

async function start() {
    await service.initialize();
    await service.start();
}
if (module.hot) {
    module.hot.status((event) => {
        if (event === 'abort' || event === 'fail') {
            logger.error(`HMR error status: ${event}`);
            // Signal webpack.run.js to do full-reload of the back-end
            service.gracefulShutdown(event);
        }
        // adddintionally when event is idle due to external modules
        if (event === 'idle') {
            service.gracefulShutdown(event);
        }
    });
    module.hot.accept();
}

start();
