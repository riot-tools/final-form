import { createForm } from 'final-form';

import registerField from './registerField';
import { assertProperConfig } from './utils';

export default function (state) {

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

            e.preventDefault()
            state.form.submit()
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
        )


        if (skip) { return };

        registerField.apply(self, [state, field]);
    });
}