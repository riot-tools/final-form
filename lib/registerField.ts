import { FinalFormInitializedComponent, WffInternalState } from '.'

type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

type FormElementEvent = Event & {
    target: FormElement
}

export function registerField(
    component: FinalFormInitializedComponent,
    state: WffInternalState,
    field: FormElement
) {

    const {
        fieldSubscriptions = {},
        fieldConfigs = {},
        onFieldChange
    } = component;

    const { name } = field;
    const isType = { [field.type]: true };

    const store = {
        blur: null,
        focus: null,
        change: null,
        input: null,
    };

    const unregister = state.form.registerField(
        name,
        fieldState => {
            const { blur, change, focus, value, ...rest } = fieldState;

            store.blur = () => blur();
            store.focus = () => focus();
            store.change = ({ target }) => (
                change(
                    target.value || (
                        (
                            target.labels && target.labels[0]
                        ) || {}
                    ).innerText
                )
            );
            store.input = ({ target }) => change(
                field.type === 'checkbox'
                    ? target.checked
                    : target.value
            );

            // first time, register event listeners, unless it's a radio field
            if (!state.registered[name] || isType.radio) {
                field.addEventListener('blur', () => blur());
                field.addEventListener('focus', () => focus());

                // Radio buttons and hidden fields would not have a blur event
                // in some cases, instead we bind to change event
                if (isType.radio || isType.hidden) {

                    if (!field.value || field.labels === null) {

                        console.warn('RiotFinalForm: ', field.name, 'field does not have a value or a label', field);
                    }

                    // Get radio label text as Radio button value
                    field.addEventListener('change', ({ target }: FormElementEvent) => (
                        change(
                            target.value || (
                                target.labels[0] || {}
                            ).innerText
                        )
                    ));
                }
                else {
                    field.addEventListener('input', ({ target }: FormElementEvent) => change(
                        isType.checkbox
                            ? (target as HTMLInputElement).checked
                            : target.value
                    ));
                }

                state.registered[name] = true;
            }

            // update value
            if (isType.checkbox || isType.radio) {
                (field as HTMLInputElement).checked = field.value === value;
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

    state.registrations.set(field, () => {

        field.removeEventListener('blur', store.blur);
        field.removeEventListener('focus', store.focus);
        field.removeEventListener('change', store.change);
        field.removeEventListener('input', store.input);

        unregister();

        state.registrations.delete(field);
    });
}
