import initializeFinalForm from './initializeFinalForm';
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
 * @param {function} component.formElement Required function that returns the form element to bind to
 * @param {function} component.onSubmit Final Form submit function. Required if `enableDefaultBehavior` is unset. Cannot not be used with `enableDefaultBehavior`
 * @param {boolean} component.enableDefaultBehavior Allows forms to submit using default DOM behavior. Cannot be used with `onSubmit`
 * @param {boolean} component.manuallyInitializeFinalForm In case you want to manually initialize final form after some async event.
 * @param {object} component.initialValues Final Form initialValues
 * @param {function} component.validate Form validate function
 * @param {onFormChange} component.onFormChange Final Form listener that passes form state
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
        registered: {}
    };

    // onSubmit is useless if default behavior is enabled
    if (component.enableDefaultBehavior === true) {
        component.onSubmit = function () {};
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

    component.onMounted = function (...riotargs) {

        if (!this.manuallyInitializeFinalForm) {

            initializeFinalForm.apply(this, [state]);
        }

        if (onMounted) {
            onMounted.apply(this, riotargs);
        }
    };

    // Cleanup before unmounting to avoid memory leaks
    component.onBeforeUnmount = function (...args) {

        state.unsubscribe();

        state.form = null;
        state.registered = {};

        if (onBeforeUnmount) {
            onBeforeUnmount.apply(this, args);
        }
    };

    // Access finaly form
    component.finalForm = () => state.form;

    return component;
};


export default withFinalForm;