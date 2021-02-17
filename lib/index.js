import initializeFinalForm from './initializeFinalForm';
import registerField from './registerField';
import { assertProperConfig } from './utils'

/**
 * Form change callback
 *
 * @callback onFormChange
 * @param {object} formState final form form state
 */

/**
 * Field change callback
 *
 * @callback onFieldChange
 * @param {HTMLElement} field form field
 * @param {object} fieldState final form field state
 */

/**
 * Creates a final form wrapper for a component. Automatically unsubscribes and removes form when component unmounts.
 *
 * @param {object} component Riot component
 * @param {function} component.formElement [Required] function that returns the form element to bind to
 * @param {function} component.onSubmit Final Form submit function. If onSubmit is set, e.preventDefault() will be called in favor of this.
 * @param {boolean} component.manuallyInitializeFinalForm In case you want to manually initialize final form after some async event.
 * @param {object} component.initialValues Final Form initialValues
 * @param {function} component.validate Form validate function
 * @param {onFormChange} component.onFormChange Final Form listener that passes form state
 * @param {function} component.onFormMutated [optional] Callback that is passed necessary mutated DOM elements within the HTMLFormElement
 * @param {object} component.mutatorOptions [optional] Options to pass to mutator's observe function https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
 * @param {object} component.formSubscriptions Final Form subscriptions
 * @param {object} component.formConfig Final Form configs
 * @param {onFieldChange} component.onFieldChange Callback ran when a field changes
 * @param {object} component.fieldSubscriptions Final Form field subscriptions
 * @param {object} component.fieldConfigs Final Form field configs
 *
 * @example
 *
 * const component = withFinalForm({
 *     formElement() {
 *         return this.$('form');
 *     },
 *     onSubmit(values) {
 *         $api.post('/stuff', values);
 *     },
 *     initialValues: {
 *         name: '',
 *         age: null,
 *         address: ''
 *     },
 *     validate(values) {
 *         const errors = {};
 *         if (!values.name) errors.name = 'name is required';
 *         if (!values.age) errors.age = 'age is required';
 *         if (!/^\d+$/.test(values.age)) errors.age = 'age must be a number';
 *         return errors;
 *     },
 *     onFormChange({ valid }) {
 *
 *         const submit = this.formElement().querySelector('[type=submit]');
 *         submit.disabled = !valid;
 *     },
 *     onFieldChange(field, { touched, error }) {
 *
 *         const errorEl = field.parentElement.querySelector('.error');
 *
 *         if (touched && error) {
 *             if (errorEl) errorEl.innerHTML = error;
 *             field.parentElement.classList.add('error');
 *         } else {
 *             if (errorEl) errorEl.innerHTML = '';
 *             field.parentElement.classList.remove('error');
 *         }
 *     },
 *     formSubscriptions: {
 *         visited: true,
 *         dirty: true
 *     },
 *     fieldSubscriptions: {
 *         name: {
 *             pristine: true,
 *             valid: true
 *         }
 *     },
 *     fieldConfigs: {
 *         address: {
 *             afterSubmit: () => console.log('afterSubmit yay!!')
 *         }
 *     }
 * });
 */
const withFinalForm = (component) => {

    const state = {
        form: null,
        registered: {},
        registrations: new Map()
    };

    // If there is no onSubmit function, we will assume default DOM behavior
    if (!component.onSubmit) {
        component.onSubmit = function () {};
        state.enableDefaultBehavior = true;
    }

    // Validation is optional
    if (!component.validate) {
        component.validate = function () {};
    }

    const {
        onBeforeUnmount,
        onMounted
    } = component;

    // Validate configuration if we are not manually initializing
    if (component.manuallyInitializeFinalForm !== true) {

        assertProperConfig(component);
    }

    // Set function for manual initializing. Prevent double initialization.
    component.initializeFinalForm = function () {

        if (state.form !== null) {

            throw Error('FinalForm has already been initialized on this component');
        }

        return initializeFinalForm.apply(this, [state]);
    }

    component.onMounted = function (...args) {

        if (component.onFormMutated instanceof Function) {

            const MutationObserver = global.MutationObserver || global.WebKitMutationObserver || global.MozMutationObserver;

            const registerFieldHelper = (field) => registerField(state, field);

            state.observer = new MutationObserver((mutationsList, observer) => {

                component.onFormMutated.apply(this, [{
                    mutationsList,
                    observer,
                    registrations: state.registrations,
                    form: state.form,
                    registerField: registerFieldHelper
                }]);
            })

            state.mutatorOptions = component.mutatorOptions || {};
        }

        if (!this.manuallyInitializeFinalForm) {

            initializeFinalForm.apply(this, [state]);
        }

        if (onMounted) {
            onMounted.apply(this, args);
        }
    };

    // Cleanup before unmounting to avoid memory leaks
    component.onBeforeUnmount = function (...args) {

        state.unsubscribe();

        state.form = null;
        state.registered = {};
        state.registrations = new Map();

        if (onBeforeUnmount) {
            onBeforeUnmount.apply(this, args);
        }
    };

    // Access finaly form
    component.finalForm = () => state.form;

    return component;
};


export default withFinalForm;