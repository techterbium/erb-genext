import si from 'systeminformation';
import isReachable from 'is-reachable';
import LOG from './log';

export const isInternetConnected = async () => {
  try {
    const isOl = await isReachable('google.com');
    return isOl;
  } catch (ex) {
    LOG.info('Error while trying to connect to internet', ex);
    return false;
  }
};

export const getSystemID = async () => {
  try {
    const sysi = await si.system();
    const systemID = sysi.uuid || sysi.serial || sysi.sku;

    if (!systemID) {
      throw new Error(
        'Unable to read system configuration. Electrea cannot play videos here.'
      );
    }
    return systemID;
  } catch (ex) {
    LOG.info('Error while fetching system info', ex);
  }
  return false;
  // const nwi = await si.networkInterfaces();
  // const macs = nwi.map((nwc) => nwc.mac);
  // return sysi.uuid || sysi.serial || macs[0];
  // INFO: We are not relying on macs today, as we are not storing them in our license info and cannot be validated later.
};

export const getSystemInfo = async () => {
  const systeminfo = await si.system();
  const mem = await si.mem();
  const osinfo = await si.osInfo();

  return {
    system: {
      manf: systeminfo.manufacturer || ' ',
      model: systeminfo.model || ' ',
      serial: systeminfo.serial || ' ',
      sku: systeminfo.sku || ' ',
      uuid: systeminfo.uuid || ' ',
    },
    totalMemory: mem.total || ' ',
    os: {
      pf: osinfo.platform || ' ',
      dstro: osinfo.distro || ' ',
      cname: osinfo.codename || ' ',
      arch: osinfo.arch || ' ',
    },
  };
};
