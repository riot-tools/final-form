import { initializeForm } from './initializeForm';
import { registerField } from './registerField';
import { assertProperConfig } from './utils';
import { WithFinalFormOpts, InitializeFormState, InitializedComponent } from './types';

export const withFinalForm = (component: WithFinalFormOpts): InitializedComponent => {

    const state: InitializeFormState = {

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

    const {
        onBeforeUnmount,
        onMounted
    } = component;

    // Validate configuration if we are not manually initializing
    if (component.manuallyInitializeFinalForm !== true) {

        assertProperConfig(component);
    };

    const initialized = component as InitializedComponent;


    // Set function for manual initializing. Prevent double initialization.
    initialized.initializeFinalForm = function () {

        if (state.form !== null) {

            throw Error('FinalForm has already been initialized on this component');
        }

        return initializeForm(this, state);
    }

    initialized.onMounted = function (...args) {

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

        if (onMounted) {
            onMounted.apply(this, args);
        }
    };

    // Cleanup before unmounting to avoid memory leaks
    initialized.onBeforeUnmount = function (...args) {

        state.unsubscribe();

        state.form = null;
        state.registered = {};
        state.registrations = new Map();

        if (onBeforeUnmount) {
            onBeforeUnmount.apply(this, args);
        }
    };

    // Access finaly form
    initialized.finalForm = () => state.form;

    return initialized;
};

export default withFinalForm;
