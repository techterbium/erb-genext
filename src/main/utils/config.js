import fs from 'fs';
import os from 'os';
import path from 'path';
import SimpleCrypto from 'simple-crypto-js';

import LOG from './log';
import getStrongKey from './addon';

const home = os.homedir();
const electreaHome = `${home}${path.sep}.electrea`;
const cfgfilepath = `${electreaHome}${path.sep}app.cfg`;

class Config {
  crypt = null;

  config = null;

  constructor() {
    this.crypt = new SimpleCrypto(getStrongKey());

    try {
      const homeExists = fs.existsSync(electreaHome);
      if (!homeExists) {
        LOG.info('config location is being created');
        fs.mkdirSync(electreaHome);
      }

      if (fs.existsSync(cfgfilepath)) {
        this.config = this.readDataFromFile();
      } else {
        LOG.info('config file is being created');
        this.writeDataToFile({});
        this.config = {};
      }
    } catch (e) {
      LOG.error(`ERROR CODE 002:${e.message}`);
    }
  }

  getConfig() {
    return this.config;
  }

  readDataFromFile() {
    let plainMessage = '';
    try {
      const cryptedMessage = fs.readFileSync(cfgfilepath, 'utf8').toString();
      plainMessage = this.crypt.decrypt(cryptedMessage);
      return JSON.parse(plainMessage);
    } catch (e) {
      console.trace();
      LOG.error(`ERROR CODE 003:${e.message}`);
      LOG.error('plainMessage', plainMessage);
    }
    return false;
  }

  writeDataToFile(data) {
    try {
      const cipherText = this.crypt.encrypt(JSON.stringify(data));
      fs.writeFileSync(cfgfilepath, cipherText);
    } catch (e) {
      LOG.error(`ERROR CODE 004:${e.message}`);
    }
  }

  getKey(key) {
    try {
      return this.config[key];
    } catch (e) {
      LOG.error(`ERROR CODE 005:${e.message}`);
    }
    return false;
  }

  setKey(key, value) {
    try {
      this.config[key] = value;
      this.writeDataToFile(this.config);
    } catch (e) {
      LOG.error(`ERROR CODE 006:${e.message}`);
    }
  }
}

const CFG = new Config();

export default CFG;
