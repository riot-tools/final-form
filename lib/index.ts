import { makeOnBeforeUnmount, makeOnMounted } from '@riot-tools/sak'

import { initializeForm } from './initializeForm'
import { registerField, FormElement } from './registerField'
import { assertProperConfig } from './utils'

import type {
    Config,
    FieldConfig,
    FieldState,
    FieldSubscription,
    FormApi,
    FormSubscription,
    InternalFormState
} from 'final-form'

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
type FieldRegistrations = Map<HTMLElement, Function>;

type RffFieldConfigs<V> = Record<keyof V, FieldConfig<PropType<V, keyof V>>>
type RffFieldSubscriptions<V> = Record<keyof V, FieldSubscription>

export type OnFormMutatedArgument<V> = {
    mutationsList: MutationRecord[],
    observer: MutationObserver,
    registrations: FieldRegistrations,
    form: FormApi<V>,
    registerField: (HTMLElement) => void
};

export type RffInternalState<V> = {
    form: FormApi<V>;
    registered: Partial<Record<keyof V, boolean>>;
    registrations: FieldRegistrations;
    enableDefaultBehavior?: boolean;
    observer?: MutationObserver;
    mutatorOptions?: MutationObserverInit;
    unsubscribe?: Function;
};

export type FinalFormComponent<T, V= {}> = T & {

    initialValues: Partial<V>;
    formConfig?: Partial<Config<V, V>>;
    formSubscriptions?: FormSubscription;
    manuallyInitializeFinalForm?: boolean;
    mutatorOptions?: MutationObserverInit;

    formElement(): HTMLFormElement;
    validate?(values: Partial<V>): Partial<Record<keyof V, string>>;
    onSubmit?(values: V): void;
    onFormChange?(formState: InternalFormState): void;
    onFieldChange?(field: HTMLInputElement, fieldState: FieldState<PropType<V, keyof V>>): void;
    onFormMutated?(opts: OnFormMutatedArgument<V>): void;

    fieldConfigs?: Partial<RffFieldConfigs<V>>;

    fieldSubscriptions?: Partial<RffFieldSubscriptions<V>>;
};

export type FinalFormInitializedComponent<T, V = {}> = FinalFormComponent<T, V> & {

    finalForm(): FormApi<V>
    initializeFinalForm(): void
};

/**
 * Utility type for declaring error objects
 */
export type RffErrorsFor<Values> = Record<keyof Values, string>;

/**
 * Registers form and fields automatically using Final Form
 * @param {FinalFormComponent} component
 * @returns {FinalFormInitializedComponent}
 */
export const withFinalForm = <C, V = any>(component: FinalFormComponent<C, V>): FinalFormInitializedComponent<C, V> => {

    const state: RffInternalState<V> = {

        form: null,
        registered: {},
        registrations: new Map()
    }

    // If there is no onSubmit function, we will assume default DOM behavior
    if (!component.onSubmit) {
        component.onSubmit = function() {}
        state.enableDefaultBehavior = true
    }

    // Validation is optional
    if (!component.validate) {
        component.validate = () => ({} as any)
    }


    // Validate configuration if we are not manually initializing
    if (component.manuallyInitializeFinalForm !== true) {

        assertProperConfig(component)
    }

    const initialized = component as FinalFormInitializedComponent<C, V>

    // Set function for manual initializing. Prevent double initialization.
    initialized.initializeFinalForm = function() {

        if (state.form !== null) {

            throw Error('FinalForm has already been initialized on this component')
        }

        initializeForm<C, V>(this, state)
    }

    // eslint-disable-next-line no-unused-vars
    makeOnMounted (initialized, function(this: FinalFormInitializedComponent<C, V>) {

        if (this.onFormMutated instanceof Function) {

            const MutationObserver = window.MutationObserver || global.WebKitMutationObserver || global.MozMutationObserver

            const registerFieldHelper = (field: FormElement) => registerField(this, state, field)

            state.observer = new MutationObserver((mutationsList, observer) => {

                this.onFormMutated.apply(this, [{
                    mutationsList,
                    observer,
                    registrations: state.registrations,
                    form: state.form,
                    registerField: registerFieldHelper
                }])
            })

            state.mutatorOptions = this.mutatorOptions || {}
        }

        if (!this.manuallyInitializeFinalForm) {

            initializeForm<C, V>(this, state)
        }
    })

    makeOnBeforeUnmount(initialized, () => {

        state.unsubscribe()

        state.form = null
        state.registered = {}
        state.registrations = new Map()
    })

    // Access finaly form
    initialized.finalForm = () => state.form

    return initialized
}

/**
 * Checks if a component has `formElement` function and returns wrapped in `withFinalForm`
 * @param {RiotComponent} component riot component
 * @returns {FinalFormInitializedComponent} initialized final form component
 */
export const install = <C>(component: C): C | FinalFormInitializedComponent<C> => {

    const wrapped = component as FinalFormComponent<C>

    if (typeof wrapped.formElement === 'function') {

        return withFinalForm(wrapped)
    }

    return wrapped
}

export default withFinalForm
