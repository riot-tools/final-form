import { makeOnMounted, makeOnBeforeUnmount } from '@riot-tools/sak';

import { initializeForm } from './initializeForm';
import { registerField } from './registerField';
import { assertProperConfig } from './utils';
import { component, RiotComponent } from 'riot';

import type {
    Config,
    FieldConfig,
    FieldState,
    FieldSubscription,
    FormApi,
    FormSubscription
} from 'final-form';


type FieldRegistrations = Map<HTMLElement, Function>;

export type OnFormMutatedArgument = {
    mutationsList: MutationRecord[],
    observer: MutationObserver,
    registrations: FieldRegistrations,
    form: FormApi,
    registerField: (HTMLElement) => void
};

export type InternalFormState = {
    form: FormApi;
    registered: {
        [key: string]: boolean
    };
    registrations: FieldRegistrations;
    enableDefaultBehavior?: boolean;
    observer?: MutationObserver;
    mutatorOptions?: MutationObserverInit;
    unsubscribe?: Function;
};

export type FinalFormComponent = RiotComponent & {

    initialValues: object;
    formConfig?: Config;
    formSubscriptions?: FormSubscription;
    manuallyInitializeFinalForm?: boolean;
    mutatorOptions?: MutationObserverInit;

    formElement: () => HTMLFormElement;
    validate?: (errors: object) => object;
    onSubmit?: (values: object) => void;
    onFormChange?: (formState: FormApi) => void;
    onFieldChange?: (field: HTMLElement, fieldState: FieldState<any>) => void;
    onFormMutated?: (opts: OnFormMutatedArgument) => void;

    fieldConfigs?: {
        [key: string]: FieldConfig<any>
    };

    fieldSubscriptions?: {
        [key: string]: FieldSubscription
    };
};

export type FinalFormInitializedComponent = FinalFormComponent & {

    finalForm: () => FormApi
    initializeFinalForm: () => void
};

/**
 * Registers form and fields automatically using Final Form
 * @param component
 * @returns
 */
export const withFinalForm = <C>(component: C & FinalFormComponent): C & FinalFormInitializedComponent => {

    const state: InternalFormState = {

        form: null,
        registered: {},
        registrations: new Map()
    }

    // If there is no onSubmit function, we will assume default DOM behavior
    if (!component.onSubmit) {
        component.onSubmit = function () {};
        state.enableDefaultBehavior = true;
    }

    // Validation is optional
    if (!component.validate) {
        component.validate = () => ({});
    }


    // Validate configuration if we are not manually initializing
    if (component.manuallyInitializeFinalForm !== true) {

        assertProperConfig(component);
    };

    const initialized = component as C & FinalFormInitializedComponent;

    // Set function for manual initializing. Prevent double initialization.
    initialized.initializeFinalForm = function () {

        if (state.form !== null) {

            throw Error('FinalForm has already been initialized on this component');
        }

        return initializeForm(this, state);
    }

    makeOnMounted(initialized, function () {

        if (this.onFormMutated instanceof Function) {

            const MutationObserver = window.MutationObserver || global.WebKitMutationObserver || global.MozMutationObserver;

            const registerFieldHelper = (field) => registerField(this, state, field);

            state.observer = new MutationObserver((mutationsList, observer) => {

                this.onFormMutated.apply(this, [{
                    mutationsList,
                    observer,
                    registrations: state.registrations,
                    form: state.form,
                    registerField: registerFieldHelper
                }]);
            })

            state.mutatorOptions = this.mutatorOptions || {};
        }

        if (!this.manuallyInitializeFinalForm) {

            initializeForm(this, state);
        }
    });

    makeOnBeforeUnmount(initialized, () => {

        state.unsubscribe();

        state.form = null;
        state.registered = {};
        state.registrations = new Map();
    });

    // Access finaly form
    initialized.finalForm = () => state.form;

    return initialized;
};

/**
 * Checks if a component has `formElement` function and returns wrapped in `withFinalForm`
 * @param wrapped riot component
 * @returns initialized final form component
 */
export const install = <C>(component: C): C | C & FinalFormInitializedComponent => {

    const wrapped = component as C & FinalFormComponent;

    if (typeof wrapped.formElement === 'function') {

        return withFinalForm(wrapped);
    }

    return wrapped;
};

export default withFinalForm;
