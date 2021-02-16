import { createForm } from 'final-form';

// Register field with form
function registerField (state, field) {

    // Lexical this = mounted component
    const self = this;

    const {
        fieldSubscriptions = {},
        fieldConfigs = {},
        onFieldChange
    } = self;

    const { name } = field;

    state.form.registerField(
        name,
        fieldState => {
            const { blur, change, focus, value, ...rest } = fieldState;

            // first time, register event listeners, unless it's a radio field
            if (!state.registered[name] || field.type === 'radio') {
                field.addEventListener('blur', () => blur());
                field.addEventListener('focus', () => focus());

                // Radio buttons and hidden fields would not have a blur event
                // in some cases, instead we bind to change event
                if (field.type === 'radio' || field.type === 'hidden') {

                    // Get radio label text as Radio button value
                    field.addEventListener('change', ({ target }) => (
                        change(
                            target.value || (
                                target.labels[0] || {}
                            ).innerText
                        )
                    ));
                }
                else {
                    field.addEventListener('input', ({ target }) => change(
                        field.type === 'checkbox'
                            ? target.checked
                            : target.value
                    ));
                }
                state.registered[name] = true;
            }

            // update value
            if (field.type === 'checkbox') {
                field.checked = value;
            } else if (field.type !== 'radio') {
                field.value = value === undefined ? '' : value;
            }

            // execute field change callback
            // Pass field, value, and other final form field subscriptions
            if (onFieldChange) {

                onFieldChange.apply(self, [field, { value, ...rest }]);
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
}

const isNotFunction = fn => fn.constructor !== Function;
const requiredFnValidate = (fn) => !fn || isNotFunction(fn);
const optionalFnValidate = (fn) => fn && isNotFunction(fn);

const assertProperConfig = (component) => {

    if (requiredFnValidate(component.formElement)) { throw TypeError('formElement is not a function'); }
    if (optionalFnValidate(component.validate)) { throw TypeError('validate is not a function'); }
    if (optionalFnValidate(component.onFieldChange)) { throw TypeError('onFieldChange is not a function'); }
    if (optionalFnValidate(component.onFormChange)) { throw TypeError('onFormChange is not a function'); }
    if (optionalFnValidate(component.onSubmit)) { throw TypeError('onSubmit is not a function'); }
};

function initializeFinalForm (state) {

    // Lexical this = mounted component
    const self = this;

    const {

        initialValues = {},
        formConfig = {},
        formSubscriptions = {},

        onSubmit,
        validate,
        onFormChange,
        formElement
    } = self;

    // Manually initialized forms are not validated onMount,
    // instead they are validated on initialization
    if (self.manuallyInitializeFinalForm === true) {

        assertProperConfig(self);
    }

    // Create form after component is mounted
    state.form = createForm({
        ...(formConfig || {}),
        initialValues,
        onSubmit: (...args) => onSubmit.apply(self, args),
        validate: (...args) => validate.apply(self, args),
        destroyOnUnregister: true
    });

    state.unsubscribe = state.form.subscribe(
        formState => {
            if (onFormChange) {
                onFormChange.apply(self, [formState]);
            }
        },
        { // FormSubscription: the list of values you want to be updated about
            dirty: true,
            valid: true,
            values: true,
            ...(formSubscriptions || {})
        }
    );

    const formEl = formElement.apply(self);

    formEl.addEventListener('submit', e => {

        if (!state.enableDefaultBehavior) {

            e.preventDefault();
            state.form.submit();
        }
    });

    formEl.addEventListener('reset', () => {

        state.form.reset();
    });

    [...formEl.elements].forEach(field => {

        // Only register valid fields with names
        // Skip fields that are flagged to be ignored
        const skip = (
            field.nodeName === 'BUTTON' ||
            field.hasAttribute('ignore') ||
            !field.name ||
            field.type === 'button' ||
            field.type === 'reset'
        );


        if (skip) { return }
        registerField.apply(self, [state, field]);
    });
}

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
    };

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
