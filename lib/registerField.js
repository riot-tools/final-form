// Register field with form
export default function (state, field) {

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
};
