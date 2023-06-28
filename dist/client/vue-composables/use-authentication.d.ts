import { Ref } from 'vue';
import oidcClient, { UserManagerSettings } from 'oidc-client';
export declare const routerInjectionSymbol: unique symbol;
export declare const setupAuthentication: (settings: UserManagerSettings) => void;
declare const useAuthentication: () => {
    oktaUser: Ref<oidcClient.User | null>;
    login: (currentUrl: string) => Promise<void>;
    onLogout: () => Promise<void>;
};
export default useAuthentication;
