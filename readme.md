# Riot Final Form

Easily implement final form in your Riot components.


* [Usage](#usage)
* [withFinalForm(component)](#withfinalformcomponent)
* [onFormChange : function](#onformchange--function)
* [onFieldChange : function](#onfieldchange--function)

## Usage

```sh
npm i -S riot-final-form
```


Your riot component
```html
<some-form>

    <form class='grid wrap'>

        <div class="field col w-70 pr-md">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" />
            <div class="error"></div>
        </div>
        <div class="field col w-30">
            <label for="age">Age</label>
            <input type="text" id="age" name="age" />
            <div class="error"></div>
        </div>
        <div class="field col w-100">
            <label for="address">Address</label>
            <input type="text" id="address" name="address" />
            <div class="error"></div>
        </div>

        <div class="actions grid">
            <div class="col w-50">
                <button type='reset'>Reset</button>
            </div>
            <div class="col w-50 text-right">
                <button type="submit">Submit</button>
            </div>
        </div>
    </form>

    <script>

        import withFinalForm from '..';

        export default withFinalForm({

            onUpdated() {

                // this.finalForm becomes available after
                // component has mounted. This gives direct
                // access to the instantiated final form object
                const form = this.finalForm();

                if (this.state.likesCheese) {
                    form.batch(() => {
                        form.change('name', 'pepe');
                        form.change('age', 66);
                    })
                }
            },

            formElement() {
                return this.$('form');
            },

            // https://final-form.org/docs/final-form/types/Config#onsubmit
            onSubmit(values) {
                $api.post('/stuff', values);
            },

            // https://final-form.org/docs/final-form/types/Config#initialvalues
            initialValues: {
                name: '',
                age: null,
                address: ''
            },

            // https://final-form.org/docs/final-form/types/Config#validate
            validate(values) {
                const errors = {};
                if (!values.name) errors.name = 'name is required';
                if (!values.age) errors.age = 'age is required';
                if (!/^\d+$/.test(values.age)) errors.age = 'age must be a number';
                return errors;
            },

            // https://final-form.org/docs/final-form/types/FormApi#subscribe
            // https://final-form.org/docs/final-form/types/FormState
            onFormChange(formState) {
                const submit = this.formElement().querySelector('[type=submit]');
                submit.disabled = !formState.valid;
            },

            // https://final-form.org/docs/final-form/types/FormApi#registerfield
            // `subscriber: FieldState => void`
            // Omits `blur, change, focus` keys
            onFieldChange(field, { touched, error, valid, visited, dirty }) {

                const errorEl = field.parentElement.querySelector('.error');

                if (touched && error) {
                    if (errorEl) errorEl.innerHTML = error;
                    field.parentElement.classList.add('error');
                } else {
                    if (errorEl) errorEl.innerHTML = '';
                    field.parentElement.classList.remove('error');
                }
            },

            // https://final-form.org/docs/final-form/types/Config
            // validate, initialValues, onSubmit, and destroyOnUnregister cannot be overwritten. `destroyOnUnregister` is always true.
            formConfig: {
                debug: true
            },

            // can be one of: active, dirty, dirtyFields, dirtySinceLastSubmit, error, errors, hasSubmitErrors, hasValidationErrors, initialValues, invalid, modified, pristine, submitting, submitError, submitErrors, submitFailed, submitSucceeded, touched, valid, validating, values, visited
            formSubscriptions: {
                visited: true,
                dirty: true
            },

            // https://final-form.org/docs/final-form/types/FormApi#registerfield
            // `subscription: { [string]: boolean }`
            fieldSubscriptions: {
                name: {
                    pristine: true,
                    valid: true
                },
                age: {
                    submitFailed: true,
                    valid: true
                }
            },
            // https://final-form.org/docs/final-form/types/FieldConfig
            // Based on a name basis. If your field name is `nested.stuff[0]`, then your config is `{ 'nested.stuff[0]': { ... } }`
            fieldConfigs: {
                address: {
                    afterSubmit: () => console.log('afterSubmit yay!!')
                }
            }
        });
    </script>
</some-form>
```

---

## withFinalForm(component)
Creates a final form wrapper for a component. Automatically unsubscribes and removes form when component unmounts. Configuration callbacks are all called bound to the riot component, so the lexical `this` will be the same as `onMounted`. The following configuration options are available:

| Param | Type | Description |
| --- | --- | --- |
| component.formElement | `function` | required function that returns the form element to bind to |
| component.onSubmit | `function` | required onSubmit function |
| component.validate | `function` | final form validate function |
| component.onFormChange | [`onFormChange`](#onFormChange) | form listener; passes final form state |
| component.initialValues | `object` | final form initialValues |
| component.formSubscriptions | `object` | final form subscriptions |
| component.formConfig | `object` | final form configs |
| component.onFieldChange | [`onFieldChange`](#onFieldChange) | callback ran when a field changes |
| component.fieldSubscriptions | `object` | a map of field subscriptions |
| component.fieldConfigs | `object` | a map of field configs |


---

<a name="onFormChange"></a>
## onFormChange : `function`
Form change callback

| Param | Type | Description |
| --- | --- | --- |
| formState | `object` | final form state |


---

<a name="onFieldChange"></a>
## onFieldChange : `function`
Field change callback

| Param | Type | Description |
| --- | --- | --- |
| field | `HTMLElement` | form field |
| fieldState | `object` | final form field state |
