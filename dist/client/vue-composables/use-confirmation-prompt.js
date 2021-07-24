"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupConfirmationPrompt = void 0;
const vue_1 = require("vue");
let confirmationModalComponent = null;
const isMounted = false;
let setupOptions = null;
let selectedEntity = null;
let confirmCallbacks = [];
const resetOptions = () => {
    if (!setupOptions) {
        return;
    }
    setupOptions.show.value = false;
    setupOptions.processing.value = false;
    setupOptions.cancelText.value = '';
    setupOptions.confirmText.value = '';
    setupOptions.message.value = '';
};
const setupConfirmationPrompt = (modalComponent) => {
    if (confirmationModalComponent) {
        throw new Error('Confirmation prompt has been set up already');
    }
    confirmationModalComponent = modalComponent;
};
exports.setupConfirmationPrompt = setupConfirmationPrompt;
const useConfirmationPrompt = (options) => {
    if (!confirmationModalComponent) {
        throw new Error('Confirmation prompt needs to be set up first');
    }
    if (!setupOptions) {
        setupOptions = {
            cancelText: vue_1.ref(''),
            confirmText: vue_1.ref(''),
            processing: vue_1.ref(false),
            message: vue_1.ref(''),
            show: vue_1.ref(false)
        };
    }
    if (!selectedEntity) {
        selectedEntity = vue_1.ref(null);
    }
    if (!isMounted) {
        const modalView = vue_1.defineComponent({
            extends: confirmationModalComponent,
            data() {
                if (!setupOptions) {
                    throw new Error('Setup options should be present here');
                }
                return {
                    ...setupOptions,
                    onCancel: () => {
                        confirmCallbacks = [];
                        resetOptions();
                    },
                    onConfirm: async () => {
                        var _a;
                        if (!setupOptions)
                            return;
                        const currentEntity = (_a = selectedEntity === null || selectedEntity === void 0 ? void 0 : selectedEntity.value) !== null && _a !== void 0 ? _a : null;
                        setupOptions.processing.value = true;
                        try {
                            await Promise.all(confirmCallbacks.map((callback) => callback(currentEntity)));
                        }
                        catch {
                            //
                        }
                        resetOptions();
                        // @ts-expect-error entity type is lost here
                        options.onConfirmed(currentEntity);
                    }
                };
            }
        });
        const div = document.createElement('div');
        const element = document.getElementById('app');
        if (!element) {
            throw new Error('There is no `#app` html element');
        }
        element.appendChild(div);
        vue_1.createApp(modalView).mount(div);
    }
    const trigger = (entity) => {
        var _a, _b, _c;
        if (!setupOptions || !selectedEntity) {
            throw new Error('Setup options or entity ref are not present');
        }
        if (setupOptions.show.value || selectedEntity.value)
            return;
        setupOptions.message.value =
            typeof options.question === 'function' ? options.question(entity) : (_a = options.question) !== null && _a !== void 0 ? _a : '';
        setupOptions.cancelText.value = (_b = options.cancelText) !== null && _b !== void 0 ? _b : 'Cancel';
        setupOptions.confirmText.value = (_c = options.confirmText) !== null && _c !== void 0 ? _c : 'OK';
        selectedEntity.value = entity;
        setupOptions.show.value = true;
        setupOptions.processing.value = false;
        const callback = options.onConfirmed;
        confirmCallbacks.push(callback);
    };
    return { trigger };
};
exports.default = useConfirmationPrompt;
