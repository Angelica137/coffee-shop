/* @TODO replace with your variables
 * ensure all variables on this page match your project
 */

export const environment = {
  production: false,
  apiServerUrl: 'http://127.0.0.1:5000', // the running FLASK api server url
  auth0: {
    domain: 'dev-q2zjnanpz8egzzkb.us.auth0.com',
    clientId: 'woYvvUVGkhWRF7esuD4oOOyYRcib5iR8',
    authorizationParams: {
      redirect_uri: 'http://localhost:8100/tabs/drink-menu',
      audience: '', // the audience set for the auth0 app
    }
  }
};
