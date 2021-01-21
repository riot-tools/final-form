import { createForm } from 'final-form';

import registerField from './registerField';
import { assertProperConfig } from './utils'

export default function (state) {

    // Lexical this = mounted component
    const self = this;

    const {
        enableDefaultBehavior,

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

        if (enableDefaultBehavior !== true) {

            e.preventDefault()
            state.form.submit()
        }
    });

    formEl.addEventListener('reset', () => {

        state.form.reset();
    });

    [...formEl.elements].forEach(field => {

        // Only register fields with names
        // Skip fields that are flagged to be ignored
        if (field.name && !field.hasAttribute('ignore')) {
            registerField.apply(self, [state, field]);
        }
    });
}