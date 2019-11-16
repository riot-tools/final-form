import { createForm } from 'final-form';

const isNotFunction = fn => fn.constructor !== Function;
const requiredFnValidate = (fn) => !fn || isNotFunction(fn);
const optionalFnValidate = (fn) => fn && isNotFunction(fn);

/**
 * Form change callback
 *
 * @callback onFormChange
 * @param {object} formState form state
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
 * @param {function} component.formElement required function that returns the form element to bind to
 * @param {function} component.onSubmit required onSubmit function
 * @param {object} component.initialValues form initialValues
 * @param {function} component.validate form validate function
 * @param {onFormChange} component.onFormChange form listener that passes form state
 * @param {object} component.formSubscriptions form subscriptions
 * @param {object} component.fieldConfigs final form configs
 * @param {onFieldChange} component.onFieldChange callback ran when a field changes
 * @param {object} component.fieldSubscriptions a map of field subscriptions
 * @param {object} component.fieldConfigs a map of field configs
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
export default (component) => {

    const state = {
        form: null,
        registered: {}
    };

    const {
        onBeforeUnmount,
        onMounted,

        formElement,
        onSubmit,
        validate,
        onFormChange,
        onFieldChange,

        initialValues = {},
        formConfig = {},
        formSubscriptions = {},
        fieldSubscriptions = {},
        fieldConfigs = {}
    } = component;

    if (requiredFnValidate(formElement)) { throw TypeError('formElement is not a function'); }
    if (requiredFnValidate(onSubmit)) { throw TypeError('onSubmit is not a function'); }
    if (optionalFnValidate(validate)) { throw TypeError('validate is not a function'); }
    if (optionalFnValidate(onFieldChange)) { throw TypeError('onFieldChange is not a function'); }
    if (optionalFnValidate(onFormChange)) { throw TypeError('onFormChange is not a function'); }

    // Register field with form
    const registerField = (field) => {
        const { name } = field;
        state.form.registerField(
            name,
            fieldState => {
                const { blur, change, focus, value, ...rest } = fieldState;

                // first time, register event listeners
                if (!state.registered[name]) {
                    field.addEventListener('blur', () => blur());
                    field.addEventListener('input', event =>
                      change(
                        field.type === 'checkbox'
                          ? event.target.checked
                          : event.target.value
                      )
                    );
                    field.addEventListener('focus', () => focus());
                    state.registered[name] = true;
                }

                // update value
                if (field.type === 'checkbox') {
                    field.checked = value;
                } else {
                    field.value = value === undefined ? '' : value;
                }

                // execute field change callback
                // Pass field, value, and other final form field subscriptions
                if (onFieldChange) {

                    onFieldChange.apply(component, [field, { value, ...rest }]);
                }
            },

            // Default listeners
            // Can be overwritten with field
            {
                value: true,
                error: true,
                touched: true,
                ...(fieldSubscriptions[name] || {})
            },

            // Field configurations can also be passed per field
            {
                ...(fieldConfigs[name] || {})
            }
        );
    };

    component.onMounted = function (...args) {

        state.form = createForm({
            ...(formConfig || {}),
            onSubmit,
            initialValues,
            validate,
            destroyOnUnregister: true
        });

        state.unsubscribe = state.form.subscribe(
            formState => {
                if (onFormChange) {
                    onFormChange.apply(component, [formState]);
                }
            },
            { // FormSubscription: the list of values you want to be updated about
                dirty: true,
                valid: true,
                values: true,
                ...(formSubscriptions || {})
            }
        );

        console.log('object');
        const formEl = formElement.apply(component);

        formEl.addEventListener('submit', e => {
            e.preventDefault()
            state.form.submit()
        });

        formEl.addEventListener('reset', () => {
            state.form.reset();
        });

        [...formEl].forEach(field => {
            if (field.name) {
                registerField(field);
            }
        });

        if (onMounted) {
            onMounted.apply(component, args);
        }
    };

    component.onBeforeUnmount = function (...args) {

        state.unsubscribe();

        state.form = null;
        state.registered = {};

        if (onBeforeUnmount) {
            onBeforeUnmount.apply(component, args);
        }
    };

    return component;
};