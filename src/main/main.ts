/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

import {
  getLicenseInfo,
  getValidLicensesForLicensePage,
  isValidationDue,
  routeEngine,
  syncLocalLicenseStore,
  bindLicense,
  addLocalCategory,
  getVersion,
  readAsarFile,
  isValidCategory,
  getKeyByCategory,
} from './utils/electrea';

import { isInternetConnected, getSystemID } from './utils/system';
import { isUserLogged } from './utils/auth';
import { getProviderUserInfo, getUserLicenses } from './utils/api';

import LOG from './utils/log';
import CFG from './utils/config';

import LoginFlow from './login/login';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

function inspectArguments() {
  const args = process.argv;
  args.forEach((value) => {
    if (
      value.includes('debug') ||
      value.includes('remote-debugging-port') ||
      value.includes('inspect')
    ) {
      app.quit();
    }
  });
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('home-page-visible', (evt, showFile) => {
  // menuBuilder.buildMenu(showFile);
});

ipcMain.on('get-system-details', (evt) => {
  console.log('get-system-details');
  Promise.all([
    isInternetConnected(),
    getLicenseInfo(),
    getSystemID(),
    isValidationDue(),
  ])
    .then((values) => {
      const [a, b, c, d] = values;
      console.log('abcd', a, b, c, d);
      routeEngine(a, b, c, d)
        .then((retVal) => {
          console.log('get-system-details', retVal);
          evt.reply('get-system-details-response', retVal);
        })
        .catch((err) => {
          LOG.info('Error while routing', JSON.stringify(err));
          evt.reply('get-system-details-response', err);
        });
    })
    .catch((err) => {
      LOG.info('Error while reading system details', JSON.stringify(err));
      evt.reply('get-system-details-response', err);
    });
});

ipcMain.on('get-config', (evt) => {
  const d = CFG.getConfig()
  evt.reply('get-config-resp', d);
})

ipcMain.on('login-flow', async (evt) => {
  console.log('login-flow-started');
  const cb = (usr: any) => {
    console.log('appuser', usr);
    CFG.setKey('appuser', usr);
  };
  LoginFlow(cb);
});

ipcMain.on('license-page', async (evt) => {
  console.log('license-page-ipcMain');
  const user = await getProviderUserInfo();
  console.log('LicPage-usr', user);
  const licenses = await getUserLicenses(user.uid);
  console.log('LicPage-lic', licenses);
  await syncLocalLicenseStore(licenses);
  const validLics = await getValidLicensesForLicensePage(licenses);
  LOG.info('Licenses synced up successfully.');
  evt.reply('license-page-response', { user, licenses: validLics });
});

ipcMain.on('get-user-log-status', async (evt) => {
  const user = isUserLogged();
  evt.reply('get-user-log-status-resp', user);
});

ipcMain.on('bind-license', async (evt, args) => {
  const [lic, user] = args;
  console.log('main-binding license', lic);
  const mlic = await bindLicense(user.uid, lic.id);
  console.log('mlic', mlic);
  addLocalCategory(mlic);
  evt.reply('bind-license-response', mlic);
});

ipcMain.on('get-version', async (evt) => {
  evt.reply('get-version-response', getVersion());
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const openFielHandler = async () => {
    const files = await dialog.showOpenDialog(mainWindow, {
      title: 'Choose asar file',
      filters: [{ name: 'Asar', extensions: ['asar'] }],
    });
    console.log(files);
    if (files && !files.canceled) {
      // actual file selected
      const asarFile = files.filePaths[0];
      const asarFileInfo = readAsarFile(asarFile);
      console.log(asarFileInfo);
      if (asarFileInfo) {
        isValidCategory(asarFileInfo.category);
        const keys = getKeyByCategory(asarFileInfo.category);
        mainWindow.webContents.send('file-selected', { asarFileInfo, keys });
      }
    }
  };

  const menuBuilder = new MenuBuilder(mainWindow, openFielHandler);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    inspectArguments();
    createWindow();
    console.log('total_config', CFG.getConfig());
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
