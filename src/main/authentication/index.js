import { AuthorizationServiceConfiguration } from '@openid/appauth/built/authorization_service_configuration';
import { AuthorizationNotifier } from '@openid/appauth/built/authorization_request_handler';
import { NodeBasedHandler } from '@openid/appauth/built/node_support/node_request_handler';
import { BaseTokenRequestHandler } from '@openid/appauth/built/token_request_handler';
import { AuthorizationRequest } from '@openid/appauth/built/authorization_request';
import { NodeRequestor } from '@openid/appauth/built/node_support/node_requestor';
import { NodeCrypto } from '@openid/appauth/built/node_support/';
import {
  GRANT_TYPE_AUTHORIZATION_CODE,
  GRANT_TYPE_REFRESH_TOKEN,
  TokenRequest,
} from '@openid/appauth/built/token_request';

import AuthStateEmitter from './AuthStateEmitter';
import LOG from '../utils/log';
import cfg from '../utils/config';
import CONST from '../utils/constants';

const requestor = new NodeRequestor();

const openIdConnectUrl = 'https://accounts.google.com';
const clientId =
  '329555147842-814nbspstf4rq780ovrver3rhalk3cqr.apps.googleusercontent.com';
const redirectUri = 'http://127.0.0.1:8000';
const scope = 'email profile';

export default class AuthFlow {
  notifier;

  authorizationHandler;

  tokenHandler;

  authStateEmitter;

  // state
  configuration;

  refreshToken;

  accessTokenResponse;

  constructor() {
    this.notifier = new AuthorizationNotifier();
    this.authStateEmitter = new AuthStateEmitter();
    this.authorizationHandler = new NodeBasedHandler();
    this.tokenHandler = new BaseTokenRequestHandler(requestor);
    this.authorizationHandler.setAuthorizationNotifier(this.notifier);
    this.notifier.setAuthorizationListener((request, response, error) => {
      if (error) {
        LOG.info('Google Error', error);
      }
      if (response) {
        LOG.info('Google Login:', response.code);
        let codeVerifier;
        if (request.internal && request.internal.code_verifier) {
          codeVerifier = request.internal.code_verifier;
        }

        this.makeRefreshTokenRequest(response.code, codeVerifier)
          .then((result) => this.performWithFreshTokens())
          .then((accessToken) => {
            LOG.info('GOOGLE:EMIT-EVENT', accessToken);
            this.authStateEmitter.emit(
              AuthStateEmitter.ON_TOKEN_RESPONSE,
              accessToken
            );
            return true;
          })
          .catch(console.log);
      }
    });
  }

  // to be called when signin button is clicked
  fetchServiceConfiguration() {
    return AuthorizationServiceConfiguration.fetchFromIssuer(
      openIdConnectUrl,
      requestor
    )
      .then((response) => {
        // LOG.info("GOOGLE:CONFIG", JSON.stringify(response));
        this.configuration = response;
        return true;
      })
      .catch(console.log);
  }

  makeAuthorizationRequest() {
    if (!this.configuration) {
      return;
    }
    const extras = { prompt: 'consent', access_type: 'offline' };

    // create a request
    const request = new AuthorizationRequest(
      {
        client_id: clientId,
        redirect_uri: redirectUri,
        scope,
        response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
        state: undefined,
        extras,
      },
      new NodeCrypto()
    );
    this.authorizationHandler.performAuthorizationRequest(
      this.configuration,
      request
    );
  }

  makeRefreshTokenRequest(code, codeVerifier) {
    if (!this.configuration) {
      LOG.info('GOOGLE:MakeRefreshTokenRequest', 'invalid config');
      return Promise.resolve();
    }

    const extras = {};

    if (codeVerifier) {
      extras.code_verifier = codeVerifier;
    }

    // use the code to make the token request.
    const request = new TokenRequest({
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      code,
      refresh_token: undefined,
      extras,
    });

    return this.tokenHandler
      .performTokenRequest(this.configuration, request)
      .then((response) => {
        LOG.info('GOOGLE:MakeRefreshTokenRequest', response);
        console.log('GOOGLE:MakeRefreshTokenRequest', response);

        cfg.setKey(CONST.KEYS.ACCESS_TOKEN_RESPONSE, response);
        this.refreshToken = response.refreshToken;
        this.accessTokenResponse = response;
        return response;
      });
  }

  loggedIn() {
    return !!this.accessTokenResponse && this.accessTokenResponse.isValid();
  }

  signOut() {
    // forget all cached token state
    this.accessTokenResponse = undefined;
  }

  performWithFreshTokens() {
    if (!this.configuration) {
      LOG.info('GOOGLE:FRESHTOKEN', 'invalid service configuration');
      return Promise.reject(new Error('Unknown service configuration'));
    }
    if (!this.refreshToken) {
      LOG.info('GOOGLE:FRESHTOKEN', 'Missing refresh token');
      return Promise.resolve('Missing refreshToken.');
    }
    if (this.accessTokenResponse && this.accessTokenResponse.isValid()) {
      LOG.info('GOOGLE:FRESHTOKEN', 'Returning existing access token');
      return Promise.resolve(this.accessTokenResponse);
    }
    const request = new TokenRequest({
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: GRANT_TYPE_REFRESH_TOKEN,
      code: undefined,
      refresh_token: this.refreshToken,
      extras: undefined,
    });

    LOG.info('GOOGLE:FRESHTOKEN', 'Performing token request');
    return this.tokenHandler
      .performTokenRequest(this.configuration, request)
      .then((response) => {
        this.accessTokenResponse = response;
        return response;
      });
  }

  /*
    Takes refresh token stored in the .cfg file and gets the altest access token.
    Call this method when we know that the access token we have is invalid or expired.
  */
  async refreshAccessToken(refreshToken) {
    this.refreshToken = refreshToken;
    await this.fetchServiceConfiguration();
    const resp = await this.performWithFreshTokens();
    return resp.accessToken;
    // return this.fetchServiceConfiguration().then(performWithFreshTokens).then((resp) => resp);
  }
}

export { AuthStateEmitter };
