import { register, mount, unmount } from 'riot';

import withFinalForm from '..';
import SomeForm from './some-form.riot';

const stub = {
    mocks: {
        element: jest.fn(),
        submit: jest.fn(),
        validate: jest.fn(),
        formState: jest.fn(),
        fieldState: jest.fn(),
        fieldConfig: jest.fn(),
        reset: jest.fn()
    }
};

const mountForm = () => {

    const div = document.createElement('div');
    document.body.appendChild(div);
    const [tmpl] = mount(div, stub.mocks, 'some-form');

    return { div, tmpl };
};

beforeAll(() => {

    register('some-form', SomeForm);
});

test('it should throw if passed a bad config', () => {

    expect(() => withFinalForm({})).toThrow();
    expect(() => withFinalForm({ formElement() {} })).toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit() {}, validate: true })).toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit() {}, onFormChange: true })).toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit() {}, onFieldChange: true })).toThrow();
});

test('it should not throw if passed a good config', () => {

    expect(() => withFinalForm({ formElement() {}, onSubmit() {} })).not.toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit() {}, validate() {} })).not.toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit() {}, onFormChange() {} })).not.toThrow();
    expect(() => withFinalForm({ formElement() {}, onSubmit() {}, onFieldChange() {} })).not.toThrow();
});

test('it should mount without error', () => {

    expect(() => {
        const { div, tmpl } = mountForm();
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


test('it should unsubscribe final form on unmount', () => {

    expect(stub.tmpl.finalForm()).not.toBe(null);
    unmount(stub.div);
    expect(stub.tmpl.finalForm()).toBe(null);
});

