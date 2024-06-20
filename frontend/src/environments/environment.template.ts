export const environment = {
  production: false,
  apiServerUrl: 'http://127.0.0.1:5000',
  auth0: {
    domain: '<YOUR_AUTH0_DOMAIN>',
    clientId: '<YOUR_AUTH0_CLIENT_ID>',
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: '<YOUR_AUTH0_AUDIENCE>',
    }
  }
};