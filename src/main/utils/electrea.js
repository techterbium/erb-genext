import asar from 'asar';
import SimpleCrypto from 'simple-crypto-js';

import * as SYS from './system';
import * as API from './api';
import CFG from './config';
import LOG from './log';
import CONST from './constants';
import PKG from '../../../package.json';

export const getVersion = () => PKG.version;

export const getLocalLicenses = () => {
  return CFG.getKey(CONST.KEYS.LICENSES) || [];
};

const getSmartKey = (uid, lid) => {
  const p1 = uid.slice(0, 8);
  const p2 = uid.slice(24);
  return `${p1}${lid}eLe${p2}`;
};

const addNewKeys = (keys, key) => {
  try {
    const storedKeys = CFG.getKey(CONST.KEYS.ENCKEYS) || {};
    console.log('keys', keys, key);
    console.log('storedKeys', storedKeys);
    const dkeys = JSON.parse(new SimpleCrypto(key).decrypt(keys));
    console.log('dkeys', dkeys);
    CFG.setKey(CONST.KEYS.ENCKEYS, { ...storedKeys, ...dkeys });
  } catch (e) {
    console.trace();
    console.error('Error adding new keys');
  }
};

const addNewLocalLicense = (lic) => {
  const localLics = getLocalLicenses();
  delete lic.keys;
  localLics.push(lic);
  CFG.setKey(CONST.KEYS.LICENSES, localLics);
};

export const bindLicense = async (uid, lid) => {
  try {
    const sysinfo = await SYS.getSystemInfo();
    console.log(sysinfo);
    const lic = await API.bindLicense(uid, lid, sysinfo);
    LOG.info(`Binding licence ${lid} for ${uid} in ${sysinfo.system.uuid}`);
    LOG.info('LIC AFTER BINDING', JSON.stringify(lic));
    console.log('smart', getSmartKey(uid, lid));
    addNewKeys(lic.keys, getSmartKey(uid, lid));
    addNewLocalLicense(lic);
    return lic;
  } catch (ex) {
    console.trace();
    LOG.error('Error binding/adding new keys to config', ex.message);
  }
  return false;
};

export const getKeyByCategory = (catID) => {
  const storedKeys = CFG.getKey(CONST.KEYS.ENCKEYS) || {};
  console.log('catID', catID);
  console.log('catID2', storedKeys[catID]);
  if (!storedKeys[catID]) {
    throw new Error(
      'Invalid Configuration. Contact your organization or Open an issue by clicking Help -> Submit Issue'
    );
  }
  return storedKeys[catID] ? storedKeys[catID].keys : null;
};

export const getValidLicensesForLicensePage = async (licences) => {
  const uuid = await SYS.getSystemID();
  LOG.debug(`Validating licenses for ${uuid}`);
  const filteredLics = licences.filter(
    (lic) =>
      (lic.status === CONST.LICENSE_STATUS_ACTIVE &&
        lic.state === CONST.LICENSE_STATE_NEW) ||
      (lic.state === CONST.LICENSE_STATE_USED &&
        lic.status === CONST.LICENSE_STATUS_ACTIVE &&
        lic.system &&
        lic.system.system &&
        (lic.system.system.uuid === uuid || lic.system.system.serial === uuid))
  );
  return filteredLics;
};

export const getLicensesToStore = async (remoteLics) => {
  const validLics = await getValidLicensesForLicensePage(remoteLics);
  const storeLics = validLics.filter(
    (lic) => lic.state === CONST.LICENSE_STATE_USED
  );
  return storeLics;
};

export const getCategoriesFromLicenses = (lics) => {
  const categories = {};
  lics.forEach((lic) =>
    lic.categories.forEach((category) => {
      categories[category.id] = category;
    })
  );
  return categories;
};

export const syncLocalLicenseStore = async (remoteLics) => {
  try {
    const storeLics = await getLicensesToStore(remoteLics);
    const newCategories = getCategoriesFromLicenses(storeLics);
    CFG.setKey(CONST.KEYS.LICENSES, storeLics);
    CFG.setKey(CONST.KEYS.DFVD, Date.now());
    CFG.setKey(CONST.KEYS.CATEGORIGES, newCategories);
  } catch (e) {
    LOG.error(`ERROR CODE 007${e.message}`);
    throw e;
  }
};

export const readAsarFile = (asarFileName) => {
  if (!asarFileName) {
    throw new Error('Select a file');
  }

  const files = asar.listPackage(asarFileName);
  const metafile = asar.extractFile(asarFileName, 'meta.json').toString();
  const meta = JSON.parse(metafile);
  const mpdFile = files.filter((fil) => fil.endsWith('.mpd'))[0];
  return {
    filePath: `${asarFileName}${mpdFile}`,
    fileName: meta.videoName,
    kid: meta.kuid,
    category: meta.category.id,
    categoryName: meta.category.slug,
  };
};

export const addLocalCategory = (lic) => {
  const localCategories = CFG.getKey(CONST.KEYS.CATEGORIGES) || {};
  lic.categories.forEach((category) => {
    localCategories[category.id] = category;
  });
  CFG.setKey(CONST.KEYS.CATEGORIGES, localCategories);
};

export const isValidCategory = (category) => {
  const localCategories = CFG.getKey(CONST.KEYS.CATEGORIGES) || {};
  if (!localCategories[category]) {
    throw new Error(
      'Invalid Category. Contact your organization for more details.'
    );
  }
};

export const getAppUser = () => {
  return CFG.getKey(CONST.KEYS.USER);
};

export const getLicenseInfo = async () => {
  try {
    return CFG.getKey('licenses');
  } catch (ex) {
    LOG.info('Error while fetching licenses', ex);
  }
  return false;
};

export const isValidationDue = async () => {
  const dfvdate = CFG.getKey(CONST.KEYS.DFVD);
  const msInGap = Date.now() - dfvdate;
  const secondsInGap = Math.floor(msInGap / 1000);
  // LOG.info('SECONDS_IN_GAP', secondsInGap);
  // LOG.info('Validation Due', secondsInGap > 2629743);
  return secondsInGap > 2629743;
};

export const getValidLicenses = (licenseInfo = [], systemID) => {
  const lics = licenseInfo.filter(
    (lic) =>
      (lic.system &&
        lic.system.system &&
        lic.system.system.uuid === systemID) ||
      lic.status === 'new'
  );
  return lics;
};

const routeObj = (route, msg) => {
  LOG.info('ROUTING', route, msg);
  return { route, msg };
};

const getIRouting = (connected, msg) =>
  connected ? routeObj('licenses', msg) : routeObj('error', msg);

export const routeEngine = async (
  isInternet,
  licenseInfo,
  systemID,
  isValidationDued
) => {
  LOG.info('RE:Params', isInternet, systemID, isValidationDued);
  if (!systemID) {
    routeObj('error', 'Unable to read system details');
  }
  if (licenseInfo) {
    LOG.info('License info present', licenseInfo.length);
    const validLics = getValidLicenses(licenseInfo, systemID);
    LOG.info('Valid Lics', validLics.length);
    if (validLics.length > 0) {
      return isValidationDued
        ? getIRouting(isInternet, 'Due for validation and no internet')
        : routeObj('home', '');
    }
    return getIRouting(isInternet, 'No valid license in the system');
  }
  return getIRouting(
    isInternet,
    'Please connect to internet and restart the application'
  );
};

export const LOG_VALUES = (str, obj) => {
  console.log(str, obj);
};
