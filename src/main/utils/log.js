import os from 'os';
import path from 'path';

import log from 'electron-log';
import pkg from '../../../package.json';

const HOME_DIR = os.homedir();
const PATH_SEP = path.sep;
const APP_DIR = `${HOME_DIR}${PATH_SEP}.gnatha`;

log.transports.file.level = 'info';
log.transports.file.file = `${APP_DIR}${PATH_SEP}app.log`;

const showErrorMessage = (msg) => {
  // notification.error({ description: msg, message: 'Error' });
  console.error(msg);
};

const elog = {
  info: (...messages) => {
    log.info(`ELECTREA: ${pkg.version} : ${messages}`);
  },
  debug: (...messages) => {
    log.debug(`ELECTREA: ${pkg.version} : ${messages}`);
  },
  error: (messages) => {
    log.error(`ELECTREA: ${pkg.version} : ${messages}`);
    showErrorMessage(messages);
  },
};

export default elog;
