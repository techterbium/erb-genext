import EventEmitter from 'events';

export default class AuthStateEmitter extends EventEmitter {
  static ON_TOKEN_RESPONSE = 'on_token_response';
}
