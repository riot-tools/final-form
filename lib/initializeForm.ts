import { createForm } from 'final-form';
import { registerField } from './registerField';
import { assertProperConfig } from './utils';

import type { FinalFormInitializedComponent, InternalFormState } from '.'

export function initializeForm(
    component: FinalFormInitializedComponent,
    state: InternalFormState
): void {

    const {

        initialValues = {},
        formConfig = {},
        formSubscriptions = {},

        onSubmit,
        validate,
        onFormChange,
        formElement
    } = component;

    // Manually initialized forms are not validated onMount,
    // instead they are validated on initialization
    if (component.manuallyInitializeFinalForm === true) {

        assertProperConfig(component);
    }

    // Create form after component is mounted
    state.form = createForm({
        ...(formConfig || {}),
        initialValues,
        onSubmit: (...args) => onSubmit.apply(component, args),
        validate: (...args) => validate.apply(component, args),
        destroyOnUnregister: true
    });

    const unsubscribe = state.form.subscribe(
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

    state.unsubscribe = () => {

        unsubscribe();

        if (state.observer) {

            state.observer.disconnect();
        }
    };

    const formEl = formElement.apply(component);

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

        registerField(component, state, field);
    });

    if (state.observer) {

        state.observer.observe(formEl, {
            subtree: true,
            childList: true,
            attributes: true,
            ...state.mutatorOptions
        });
    }
}