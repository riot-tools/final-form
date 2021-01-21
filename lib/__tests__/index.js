import { register, mount, unmount } from 'riot';

import withFinalForm from '..';
import OnSubmitForm from './on-submit-form.riot';
import DefaultBehaviorForm from './default-behavior-form.riot';
import InitializeLater from './initialize-later.riot';
import IgnoreFields from './ignore-fields.riot';
import FieldTypeEvents from './field-type-events.riot';

const stub = {
    mocks: {
        element: jest.fn(),
        submit: jest.fn(),
        validate: jest.fn(),
        formState: jest.fn(),
        fieldState: jest.fn(),
        fieldConfig: jest.fn(),
        reset: jest.fn(),
        initializeLater: (self) => {

            expect(self.finalForm()).toBe(null);
            stub.mocks.initalizeLaterWasCalled();
        },
        initalizeLaterWasCalled: jest.fn()
    }
};

const mountForm = (componentName) => {

    const div = document.createElement('div');
    document.body.appendChild(div);
    const [tmpl] = mount(div, stub.mocks, componentName);

    return { div, tmpl };
};

const defineInnerText = (EL) => {

}

beforeAll(() => {

    // JSDom has not yet implemented innerText property -_-
    // https://github.com/jsdom/jsdom/issues/1245#issuecomment-763535573
    Object.defineProperty(HTMLElement.prototype, 'innerText', {
        get() {
            return this.textContent;
        }
    });

    register('on-submit-form', OnSubmitForm);
    register('default-behavior-form', DefaultBehaviorForm);
    register('initialize-later', InitializeLater);
    register('ignore-fields', IgnoreFields);
    register('field-type-events', FieldTypeEvents);

});

test('it should throw if passed a bad config', () => {

    expect(() => withFinalForm({})).toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit: true })).toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit() {}, validate: true })).toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit() {}, onFormChange: true })).toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit() {}, onFieldChange: true })).toThrow();
});

test('it should not throw if passed a good config', () => {

    expect(() => withFinalForm({ formElement() {} })).not.toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit() {} })).not.toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit() {}, validate() {} })).not.toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit() {}, onFormChange() {} })).not.toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit() {}, onFieldChange() {} })).not.toThrow();
});

test('it should mount without error', () => {

    expect(() => {
        const { div, tmpl } = mountForm('on-submit-form');
        Object.assign(stub, { div, tmpl });
    }).not.toThrow();
});

test('it should have triggered formElement callback', () => {

    expect(stub.mocks.element).toHaveBeenCalled();
    jest.resetAllMocks();
});

test('it should call trigger onFormChange callback when form changes', () => {

    expect(stub.mocks.formState).not.toHaveBeenCalled();
    const age = stub.div.querySelector('[name="age"]');
    age.value = 10;
    age.dispatchEvent(new Event('input'));

    expect(stub.mocks.formState).toHaveBeenCalled();
});

test('it should have triggered validate callback when form changes', () => {

    expect(stub.mocks.validate).toHaveBeenCalled();
});

test('it should have triggered onFieldChange callback when field changes', () => {

    expect(stub.mocks.fieldState).toHaveBeenCalled();
});

test('it should return the final form object', () => {

    const finalForm = stub.tmpl.finalForm();

    expect(Object.keys(finalForm)).toEqual(
        expect.arrayContaining(['batch', 'registerField', 'getState', 'subscribe'])
    );
});


test('it should reset final form when html form resets', () => {

    const finalForm = stub.tmpl.finalForm();
    const form = stub.tmpl.formElement();

    const { age: currentAge } = finalForm.getState().values;

    expect(currentAge).toBe('10');

    form.addEventListener('reset', () => {
        stub.mocks.reset();
    });

    form.dispatchEvent(new Event('reset'));
    expect(stub.mocks.reset).toHaveBeenCalled();

    const { age: resetAge } = finalForm.getState().values;
    expect(resetAge).toBe(null);
});

test('it should submit the form', () => {

    const form = stub.tmpl.formElement();

    const name = stub.div.querySelector('[name="name"]');
    const age = stub.div.querySelector('[name="age"]');
    const address = stub.div.querySelector('[name="address"]');

    name.value = 'totes'
    age.value = 14;
    address.value = 'tests'

    age.dispatchEvent(new Event('input'));
    name.dispatchEvent(new Event('input'));
    address.dispatchEvent(new Event('input'));

    form.dispatchEvent(new Event('submit'));

    expect(stub.mocks.submit).toHaveBeenCalledWith('/stuff', {
        name: 'totes',
        address: 'tests',
        age: "14"
    });

    expect(stub.mocks.fieldConfig).toHaveBeenCalled();
});
test('it should unsubscribe final form on unmount', () => {

    expect(stub.tmpl.finalForm()).not.toBe(null);
    unmount(stub.div);
    expect(stub.tmpl.finalForm()).toBe(null);
});

test('it should mount with default behavior', () => {

    stub.mocks.submit.mockClear();

    const { tmpl } = mountForm('default-behavior-form');

    const form = tmpl.formElement();
    form.dispatchEvent(new Event('submit'));

    expect(stub.mocks.submit).not.toHaveBeenCalled();
});

test('it should initialize later', () => {

    stub.mocks.submit.mockClear();

    const { div } = mountForm('initialize-later');

    expect(stub.mocks.initalizeLaterWasCalled).toHaveBeenCalled();

    const { value } = div.querySelector('[name=name]');

    expect(value).toBe('tutu')
});

test('it should ignore fields', () => {

    stub.mocks.submit.mockClear();

    const { tmpl, div } = mountForm('ignore-fields');

    const form = tmpl.formElement();

    const name = div.querySelector('[name="name"]');
    const age = div.querySelector('[name="age"]');
    const address = div.querySelector('[name="address"]');

    name.value = 'totes'
    age.value = 14;
    address.value = 'tests'

    age.dispatchEvent(new Event('input'));
    name.dispatchEvent(new Event('input'));
    address.dispatchEvent(new Event('input'));

    form.dispatchEvent(new Event('submit'));

    expect(stub.mocks.submit).not.toHaveBeenCalledWith('/stuff', {
        name: 'totes',
        address: 'tests',
        age: "14"
    });

    expect(stub.mocks.submit).toHaveBeenCalledWith('/stuff', {
        name: 'totes',
        address: '',
        age: null
    });
});

test('it capture events on special fields', () => {

    stub.mocks.submit.mockClear();

    const { tmpl, div } = mountForm('field-type-events');

    const form = tmpl.formElement();

    const name = div.querySelector('[name="name"]');
    const music = div.querySelector('[name="music"]');
    const gender = div.querySelector('[name="gender"]');
    const captcha = div.querySelector('[name="captcha"]');

    name.value = 'totes'
    music.checked = true;
    gender.checked = true;
    captcha.value = 'tites'

    name.dispatchEvent(new Event('input'));
    music.dispatchEvent(new Event('input'));

    gender.dispatchEvent(new Event('change'));
    captcha.dispatchEvent(new Event('change'));

    form.dispatchEvent(new Event('submit'));

    expect(stub.mocks.submit).toHaveBeenCalledWith('/stuff', {
        name: 'totes',
        music: true,
        gender: 'Male',
        captcha: 'tites'
    });

});
