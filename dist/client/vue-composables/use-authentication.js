"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerInjectionSymbol = void 0;
const vue_1 = require("vue");
const oidc_client_1 = __importDefault(require("oidc-client"));
const client_id = process.env.VUE_APP_OIDC_CLIENT_ID;
if (!client_id)
    throw new Error(`VUE_APP_OIDC_CLIENT_ID should be present in process.env`);
exports.routerInjectionSymbol = Symbol('router');
const oktaUser = vue_1.ref(null);
oidc_client_1.default.Log.logger = console;
const protocol = window.location.protocol;
const hostname = window.location.hostname;
const port = window.location.port;
const settings = {
    authority: 'https://ou.okta.com',
    client_id,
    redirect_uri: `${protocol}//${hostname}${port ? `:${port}` : ''}/callback`,
    silent_redirect_uri: `${protocol}//${hostname}${port ? `:${port}` : ''}/silent-renew`,
    post_logout_redirect_uri: `${protocol}//${hostname}${port ? `:${port}` : ''}/`,
    automaticSilentRenew: true,
    response_type: 'id_token token',
    scope: 'openid profile email',
    userStore: new oidc_client_1.default.WebStorageStateStore({
        store: window.localStorage
    })
};
const userManager = new oidc_client_1.default.UserManager(settings);
userManager.events.addUserLoaded((user) => {
    const router = vue_1.inject(exports.routerInjectionSymbol);
    if (!router) {
        throw new Error(`Router wasn't provided using 'routerInjectionSymbol' from this module. 
      Please, call 'provide(routerInjectionSymbol, router)' in your vue main.ts file`);
    }
    oktaUser.value = user;
    const desiredUrl = user.state;
    const currentURL = window.location.pathname;
    if (desiredUrl && desiredUrl !== currentURL) {
        router.push(desiredUrl);
    }
});
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const useAuthentication = () => {
    const login = async (currentUrl) => {
        if (currentUrl === '/silent-renew') {
            await userManager.signinSilentCallback();
            return;
        }
        const user = await userManager.getUser();
        const isTokenExpired = new Date().getTime() > new Date(user ? user.expires_at * 1000 : 0).getTime();
        if (user && !isTokenExpired) {
            oktaUser.value = user;
            return;
        }
        if (currentUrl === '/callback') {
            await userManager.signinCallback();
            return;
        }
        userManager.signinRedirect({ state: currentUrl });
    };
    const onLogout = async () => {
        oktaUser.value = null;
        await userManager.signoutRedirect();
    };
    return { oktaUser, login, onLogout };
};
exports.default = useAuthentication;
