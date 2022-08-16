import AuthFlow, { AuthStateEmitter } from '../authentication';
import * as API from '../utils/api';

const LoginFlow = async (callback) => {
  const authFlow = new AuthFlow();
  const svcConfig = await authFlow.fetchServiceConfiguration();
  authFlow.makeAuthorizationRequest();
  authFlow.authStateEmitter.on(
    AuthStateEmitter.ON_TOKEN_RESPONSE,
    async (accessTokenResponse) => {
      console.log('EVENT:CAPTURED', accessTokenResponse);
      const user = await API.getProviderUserInfo();
      console.log('USER:LOGGEDIN', user.uid);
      const electreaUser = await API.getUser(user.uid);
      console.log('ElectreaUser', electreaUser);
      // this.setState({ isSplash: true, electreaUser });
      callback(electreaUser);
    }
  );
};

export default LoginFlow;
