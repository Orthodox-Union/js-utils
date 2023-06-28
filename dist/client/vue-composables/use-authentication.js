"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAuthentication = exports.routerInjectionSymbol = void 0;
const vue_1 = require("vue");
const oidc_client_1 = __importDefault(require("oidc-client"));
exports.routerInjectionSymbol = Symbol('router');
const oktaUser = vue_1.ref(null);
oidc_client_1.default.Log.logger = console;
let userManager = null;
const setupAuthentication = (settings) => {
    if (userManager) {
        throw new Error('The oidc client is already initialized');
    }
    if (!settings.client_id || typeof settings.client_id !== 'string') {
        throw new Error('OIDC client ID should be provided when setting up oidc client');
    }
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    const composedSettings = {
        authority: 'https://ou.okta.com',
        redirect_uri: `${protocol}//${hostname}${port ? `:${port}` : ''}/callback`,
        silent_redirect_uri: `${protocol}//${hostname}${port ? `:${port}` : ''}/silent-renew`,
        post_logout_redirect_uri: `${protocol}//${hostname}${port ? `:${port}` : ''}/`,
        automaticSilentRenew: true,
        response_type: 'id_token token',
        scope: 'openid profile email',
        userStore: new oidc_client_1.default.WebStorageStateStore({
            store: window.localStorage
        }),
        ...settings
    };
    userManager = new oidc_client_1.default.UserManager(composedSettings);
    userManager.events.addUserLoaded((user) => {
        // @ts-expect-error ts doesn't allow using symbols to store data in the global window object
        const router = window[exports.routerInjectionSymbol];
        if (!router) {
            throw new Error(`Router wasn't provided using 'routerInjectionSymbol' from this module. 
        Please, call 'window[routerInjectionSymbol] = router' in your vue main.ts file`);
        }
        oktaUser.value = user;
        const desiredUrl = user.state;
        const currentURL = window.location.pathname;
        if (desiredUrl && desiredUrl !== currentURL) {
            router.push(desiredUrl);
        }
    });
};
exports.setupAuthentication = setupAuthentication;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const useAuthentication = () => {
    if (!userManager) {
        throw new Error('User manager is not initialized. Please, call setupAuthentication first');
    }
    const login = async (currentUrl) => {
        if (!userManager)
            return;
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
        if (!userManager)
            return;
        oktaUser.value = null;
        await userManager.signoutRedirect();
    };
    return { oktaUser, login, onLogout };
};
exports.default = useAuthentication;
