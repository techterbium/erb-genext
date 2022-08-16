import CFG from './config';
import CONST from './constants';
import LOG from './log';

export const isUserLogged = () => {
  const accessTokenResponse = CFG.getKey(CONST.KEYS.ACCESS_TOKEN_RESPONSE);
  return accessTokenResponse && accessTokenResponse.refreshToken;
};

export const getRefreshToken = () => {
  const accessTokenResponse = CFG.getKey(CONST.KEYS.ACCESS_TOKEN_RESPONSE);
  if (accessTokenResponse) return accessTokenResponse.refreshToken;
  return null;
};

export const getAccessToken = () => {
  const accessTokenResponse = CFG.getKey(CONST.KEYS.ACCESS_TOKEN_RESPONSE);
  if (accessTokenResponse) return accessTokenResponse.accessToken;
  return null;
};
