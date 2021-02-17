# Riot Final Form <!-- omit in toc -->

Easily implement final form in your Riot components.

- [Usage](#usage)
      - [Example:](#example)
- [withFinalForm(component)](#withfinalformcomponent)
- [onFormChange : `function`](#onformchange--function)
- [onFormMutated : `function`](#onformmutated--function)
- [onFieldChange : `function`](#onfieldchange--function)

## Usage

```sh
npm i -S riot-final-form
```

***Your riot component:***
```html
<some-form>

    <form>

        <div class="field">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" />
            <div class="error"></div>
        </div>
        <div class="field">
            <label for="age">Age</label>
            <input type="text" id="age" name="age" />
            <div class="error"></div>
        </div>

        <div class="field">
            <label for="address">Address</label>
            <input type="text" id="address" name="address" />
            <div class="error"></div>
        </div>

        <div class="field">
            <label for="password">This element will be ignored</label>
            <input type="password" id="password" name="password" ignore />
            <div class="error"></div>
        </div>

        <div>
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

<a name="manuallyInitializeFinalForm"></a>

***Manually initialize final form:***

There may be cases where you want to manually initialize FF, such as when you depend on an XHR request to load initial values. For these scenarios, you can use the `manuallyInitializeFinalForm` flag on your component, and manually trigger `component.initializeFinalForm();` inside of a lifecycle hook. Be cautious not to lose the lexical `this` of the `initializeFinalForm()` function. If you need to deeply nest or pass a callback that later calls this, you can do so by extracting into self `const self = this;` and binding it `initializeFinalForm.bind(self)`.

##### Example:

```html
<some-form>

    ...

    <script>

        export default withFinalForm({
            manuallyInitializeFinalForm: true,

            // Simple async or sync usage
            async onMounted() {

                this.initialValues = await getStateFromSomewhere();

                if (specificCondition) {

                    this.validate = otherValidationFunction
                }

                this.initializeFinalForm();
            }

            // Nested lexical this
            onMounted() {

                // Reference component
                const self = this;

                getData().then((data) => {

                    getMoreData().then(data2 => {

                        self.initialValues = someData;

                        // Must pass component for cases where you cannot
                        // depend on lexical this
                        self.initializeFinalForm.apply(self);
                    })
                });
            }

            // External configuration
            onMounted() {

                const self = this;

                const callback = () => self.initializeFinalForm.apply(self);

                // Dynamically configure any final form configs before applyings
                dynamicallyConfigure(self, callback);
            }
        })
    </script>
</some-form>
```

***Notes:***

> `e.preventDefault()` is called on submit unless explicitly specified otherwise. [See this](#enableDefaultBehaviorOption)

> Input fields can have an `ignore` attribute attached to them which will flag them to be skipped for registration by final form. For example:
> ```html
> <input type='hidden' name='csrf_token' value='abc123' ignore />
> <input type='hidden' name='post_id' value='1' ignore />
> ```


---

## withFinalForm(component)
Creates a final form wrapper for a component. Automatically unsubscribes and removes form when component unmounts. Configuration callbacks are all called bound to the riot component, so the lexical `this` will be the same as `onMounted`. The following configuration options are available:

| Param                                 | Type                              | Description                                                                                                                                       |
| ------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| component.formElement                 | `function`                        | Required function that returns the form element to bind to                                                                                        |
| component.onSubmit                    | `function`                        | Final Form submit function. Prevents defeault behavior. If undefined, default DOM behavior will occur. <a name="enableDefaultBehaviorOption"></a> |
| component.initialValues               | `object`                          | Final Form initialValues                                                                                                                          |
| component.validate                    | `function`                        | Form validate function                                                                                                                            |
| component.onFormChange                | [`onFormChange`](#onFormChange)   | Final Form listener that passes form state                                                                                                        |
| component.onFormMutated               | [`onFormMutated`](#onFormMutated) | MutationObserver that listens for changes in the HTML form                                                                                        |
| component.formSubscriptions           | `object`                          | Final Form subscriptions                                                                                                                          |
| component.formConfig                  | `object`                          | Final Form configs                                                                                                                                |
| component.onFieldChange               | [`onFieldChange`](#onFieldChange) | Callback ran when a field changes                                                                                                                 |
| component.fieldSubscriptions          | `object`                          | Final Form field subscriptions                                                                                                                    |
| component.fieldConfigs                | `object`                          | Final Form field configs                                                                                                                          |
| component.manuallyInitializeFinalForm | `boolean`                         | In case you want to manually initialize final form after some async event. [Read more about this flag](#manuallyInitializeFinalForm).             |

---

<a name="onFormChange"></a>
## onFormChange : `function`
Form change callback

| Param     | Type     | Description      |
| --------- | -------- | ---------------- |
| formState | `object` | final form state |

---

<a name="onFormMutated"></a>
## onFormMutated : `function`
Mutation observer callback

| Param               | Type     | Description                                    |
| ------------------- | -------- | ---------------------------------------------- |
| formMutationOptions | `object` | Options to perform changes to final form state |

```html
<script>

    withFinalForm({

        ...

        onFormMutated(formMutationOptions) {

            const {
                // Mutation observer callback
                mutationsList: { target, addedNodes, removedNodes },
                observer,

                // Map of registrations (Map<HTMLElement, deregisterFunction()>)
                registrations,

                // Final form API
                form,

                // registerField(field: HTMLFormInputElement)
                registerField
            } = opts;

            if (registrations.has(target) && somethingElse) {

                const deregister = registration.get(target);
                deregister();
            }

            if (addedNodes) {

                addedNodes.forEach((el) => {

                    if (someDomHelper.isFormElement(el)) {
                        registerField(el);
                    }
                });
            }
        }

        ...

    });
</script>
```


---

<a name="onFieldChange"></a>
## onFieldChange : `function`
Field change callback

| Param      | Type          | Description            |
| ---------- | ------------- | ---------------------- |
| field      | `HTMLElement` | form field             |
| fieldState | `object`      | final form field state |
