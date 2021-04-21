import { isNotRegisterableField } from './utils';

// Register field with form
export default function (state, field) {

    if (isNotRegisterableField(field)) {
        return false;
    }

    // Lexical this = mounted component
    const self = this;

    const {
        fieldSubscriptions = {},
        fieldConfigs = {},
        onFieldChange
    } = self;

    const { name } = field;

    const store = {};

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
            if (!state.registered[name] || field.type === 'radio') {

                field.addEventListener('blur', store.blur);
                field.addEventListener('focus', store.focus);

                // Radio buttons and hidden fields would not have a blur event
                // in some cases, instead we bind to change event
                if (field.type === 'radio' || field.type === 'hidden') {

                    if (!field.value || field.labels === null) {

                        console.warn('RiotFinalForm: ', field.name, 'field does not have a value or a label', field);
                    }

                    // Get radio label text as Radio button value
                    field.addEventListener('change', store.change);
                }
                else {
                    field.addEventListener('input', store.input);
                }

                state.registered[name] = true;
            }

            // update value
            if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = field.value === value;
            } else {
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

    state.registrations.set(field, () => {

        field.removeEventListener('blur', store.blur);
        field.removeEventListener('focus', store.focus);
        field.removeEventListener('change', store.change);
        field.removeEventListener('input', store.input);

        unregister();

        state.registrations.delete(field);
    });

    return true;
};
