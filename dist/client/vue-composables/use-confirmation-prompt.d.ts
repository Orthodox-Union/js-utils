import { Ref, DefineComponent } from 'vue';
export declare type SetupOptions = {
    message: Ref<string>;
    confirmText: Ref<string>;
    cancelText: Ref<string>;
    processing: Ref<boolean>;
    show: Ref<boolean>;
};
export declare const setupConfirmationPrompt: (modalComponent: DefineComponent<unknown, unknown, unknown>) => void;
declare type Options<Entity extends unknown> = {
    onConfirmed: (entity: Entity) => Promise<void>;
    confirmText?: string;
    cancelText?: string;
    question?: string | ((entity: Entity) => string);
};
declare const useConfirmationPrompt: <Entity extends unknown>(options: Options<Entity>) => {
    trigger: (entity: Entity) => void;
};
export default useConfirmationPrompt;
