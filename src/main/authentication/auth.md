constructor
setAuthorizationListener - gets code and code_verifier - calls makeRefreshTokenRequest() - calls performWithFreshTokens()

fetchServiceConfiguration

makeAuthorizationRequest

- creates new `AuthorizationRequest()`
- `authorizationHandler.performAuthorizationRequest`
- control goes to listener (constructor) - returns code, code verifier
- calls makeRefreshTokenRequest()
- calls performWithFreshTokens()
- calls authStateEmitter.emit()

- makeRefreshTokenRequest
  - takes in code, codeVerifier.
  - new TokenRequest() is called.
  - `tokenHandler.performTokenRequest` is called.
  - **updates this.refreshToken and this.accessTokenResponse**

* calls performWithFreshTokens()
  - is accessToken is valid, returns the same.
  - otherwise, refreshes the accessToken using RefreshToken
  - return accessTokenResponse

makeRefreshTokenRequest

- Updates this.refreshToken
- updates this.accessTokenResponse

performWithFreshTokens

- Updates this.accessTokenResponse
