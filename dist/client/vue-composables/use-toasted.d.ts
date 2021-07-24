import { ToastInterface } from 'vue-toastification';
export declare type ToastOptions = Omit<Exclude<Parameters<ToastInterface['success']>[1], undefined>, 'type'>;
declare type ShowMessage = (message: string, options?: ToastOptions) => void;
declare const useToasted: () => {
    showSuccess: ShowMessage;
    showError: ShowMessage;
};
export default useToasted;
