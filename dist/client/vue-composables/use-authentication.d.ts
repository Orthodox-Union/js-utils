import { Ref } from 'vue';
import oidcClient from 'oidc-client';
export declare const routerInjectionSymbol: unique symbol;
declare const useAuthentication: () => {
    oktaUser: Ref<oidcClient.User | null>;
    login: (currentUrl: string) => Promise<void>;
    onLogout: () => Promise<void>;
};
export default useAuthentication;
