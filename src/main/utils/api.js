import axios from 'axios';
import { v5 as UUIDV5 } from 'uuid';

import CFG from './config';
import CONST from './constants';
import LOG from './log';
import AuthFlow from '../authentication/index';
// import isDev from 'electron-is-dev';

const PKG = require('../../../package.json');

const STAGE = 'prod';
// const STAGE = isDev ? 'dev' : 'prod';

const REST_API_END_POINT = `https://eapi.gnatha.in/${STAGE}/`;
const USER_INFO_END_POINT = 'https://www.googleapis.com/oauth2/v3/userinfo';

const headers = {
  'X-User-Agent': 'Electrea-App',
  'X-User-Agent-Version': PKG.version,
};

const opts = {
  baseURL: REST_API_END_POINT,
  json: true,
  headers,
};

const API = axios.create(opts);

export const getRefreshToken = () => {
  console.log('refreshToken', CFG.readDataFromFile());
  const rt = CFG.getKey(CONST.KEYS.ACCESS_TOKEN_RESPONSE).refreshToken;
  console.log('RT', CFG.getKey(CONST.KEYS.ACCESS_TOKEN_RESPONSE));
  console.log('RT', rt);
  return rt;
};

const getLatestToken = async () => {
  const authFlow = new AuthFlow();
  const accessToken = await authFlow.refreshAccessToken(getRefreshToken());
  return accessToken;
};

export const getProviderUserInfo = async () => {
  try {
    let user = CFG.getKey('user');
    if (!user) {
      const accessToken = await getLatestToken();
      const myHeaders = {
        Authorization: `Bearer ${accessToken}`,
      };
      const userInfoResponse = await axios.get(USER_INFO_END_POINT, {
        headers: myHeaders,
      });
      user = userInfoResponse.data;
      user.uid = UUIDV5(user.email, UUIDV5.DNS);
      CFG.setKey('user', user);
    }
    return user;
  } catch (e) {
    LOG.error(e.message);
  }
  return false;
};

export const getUserInfoWithAccessToken = async (accessToken) => {
  try {
    const myHeaders = {
      Authorization: `Bearer ${accessToken}`,
    };

    const userInfoResponse = await axios.get(USER_INFO_END_POINT, {
      headers: myHeaders,
    });
    return userInfoResponse.body;
  } catch (e) {
    LOG.error(e.message);
  }
  return false;
};

const getAuthHeader = async () => {
  const accessToken = await getLatestToken();
  return { headers: { Authorization: `Bearer ${accessToken}` } };
};

export const getUser = async (uid) => {
  try {
    const aheader = await getAuthHeader();
    console.log(uid);
    console.log(aheader);
    const { data } = await API.get(`users/${uid}`, aheader);
    return data.data;
  } catch (e) {
    console.error(e);
    LOG.error('Error while fetching user details.', e.message);
  }
  return false;
};

export const getUserLicenses = async (uid) => {
  const aheader = await getAuthHeader();
  const { data: resp } = await API.get(`users/${uid}/licenses`, aheader);
  return resp.data;
};

export const bindLicense = async (uid, lid, sysinfo) => {
  const myHeaders = await getAuthHeader();

  const data = { sysinfo };
  data.data = sysinfo;
  data.action = 'BIND';

  const { data: resp } = await API.put(`users/${uid}/licenses/${lid}`, data, {
    myHeaders,
  });
  return resp.data;
};
