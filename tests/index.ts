// import 'mutationobserver-shim';
import { register, mount, unmount } from 'riot';

import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import sinon from 'sinon';

import withFinalForm, { FinalFormInitializedComponent } from '../lib';

import './RiotFile';
import OnSubmitForm from './on-submit-form.riot';
import DefaultBehaviorForm from './default-behavior-form.riot';
import InitializeLater from './initialize-later.riot';
import IgnoreFields from './ignore-fields.riot';
import FieldTypeEvents from './field-type-events.riot';
import FormMutations from './form-mutations.riot';

const sandbox = sinon.createSandbox();

const stub = {
    div: null,
    tmpl: null,
    _mutatorInstance: null,
    mocks: {
        element: sandbox.fake(),
        submit: sandbox.fake(),
        validate: sandbox.fake(),
        formState: sandbox.fake(),
        fieldState: sandbox.fake(),
        fieldConfig: sandbox.fake(),
        formMutated: sandbox.fake(),
        reset: sandbox.fake(),
        initializeLater: (self) => {

            expect(self.finalForm()).to.equal(null);
            stub.mocks.initalizeLaterWasCalled();
        },
        initalizeLaterWasCalled: sandbox.fake()
    },
    mutator: {
        _trigger: sandbox.fake(),
        instantiated: sandbox.fake(),
        observe: sandbox.fake(),
        disconnect: sandbox.fake(),
        trigger: (callback: Function, args: any[]) => {

            stub.mutator._trigger.apply(
                stub.mutator._trigger,
                args
            )

            callback.apply(callback, args);
        }
    },

    mutationObserver: class {

        _callback: Function = null;
        observe: Function = null;
        disconnect: Function = null;
        trigger: Function = null;

        constructor(callback: Function) {

            this._callback = callback;

            stub.mutator.instantiated();

            this.observe = stub.mutator.observe;
            this.disconnect = stub.mutator.disconnect;

            // Optionally add a trigger() method to manually trigger a change
            this.trigger = (mockedMutationsList) => {

                stub.mutator.trigger(callback, [mockedMutationsList, this])
            };

            stub._mutatorInstance = this;
        }
    }
};

const { Event } = window;


const mountForm = (componentName) => {

    const div = document.createElement('div');
    document.body.appendChild(div);
    const [tmpl] = mount(div, stub.mocks, componentName);

    return { div, tmpl };
};

before(() => {

    // JSDom has not yet implemented innerText property -_-
    // https://github.com/jsdom/jsdom/issues/1245#issuecomment-763535573
    Object.defineProperty(window.HTMLElement.prototype, 'innerText', {
        get() {
            return this.textContent;
        }
    });

    register('on-submit-form', OnSubmitForm);
    register('default-behavior-form', DefaultBehaviorForm);
    register('initialize-later', InitializeLater);
    register('ignore-fields', IgnoreFields);
    register('field-type-events', FieldTypeEvents);
    register('form-mutations', FormMutations);

    window.MutationObserver = stub.mutationObserver as any;
});


describe('config', () => {

    it('should throw if passed a bad config', () => {

        expect(() => withFinalForm({} as any)).to.throw();
        expect(() => withFinalForm({ formElement() {}, onSubmit: true } as any));
        expect(() => withFinalForm({ formElement() {}, onSubmit() {} } as any)).not.to.throw();
        expect(() => withFinalForm({ formElement() {}, onSubmit() {}, validate() {} } as any)).not.to.throw();
        expect(() => withFinalForm({ formElement() {}, onSubmit() {}, onFormChange() {} } as any)).not.to.throw();
        expect(() => withFinalForm({ formElement() {}, onSubmit() {}, onFieldChange() {} } as any)).not.to.throw();
    });

    it('should mount without error', () => {
        const { div, tmpl } = mountForm('on-submit-form');
        Object.assign(stub, { div, tmpl });
    });
})

describe('functionality', () => {

    it('should have triggered formElement callback', () => {

        sinon.assert.calledOnce(stub.mocks.element);
        sandbox.resetHistory();
    });

    it('should call trigger onFormChange callback when form changes', () => {

        sinon.assert.notCalled(stub.mocks.formState);
        const age = stub.div.querySelector('[name="age"]');
        age.value = 10;
        age.dispatchEvent(new Event('input'));

        sinon.assert.calledOnce(stub.mocks.formState);
    });

    it('should have triggered validate callback when form changes', () => {

        sinon.assert.calledOnce(stub.mocks.validate);
    });

    it('should have triggered onFieldChange callback when field changes', () => {

        sinon.assert.calledOnce(stub.mocks.fieldState);
    });

    it('should return the final form object', () => {

        const finalForm = stub.tmpl.finalForm();

        expect(Object.keys(finalForm)).to.contain.members(['batch', 'registerField', 'getState', 'subscribe']);
    });


    it('should reset final form when html form resets', () => {

        const finalForm = stub.tmpl.finalForm();
        const form = stub.tmpl.formElement();

        const { age: currentAge } = finalForm.getState().values;

        expect(currentAge).to.equal('10');

        form.addEventListener('reset', () => {
            stub.mocks.reset();
        });

        form.dispatchEvent(new Event('reset'));
        sinon.assert.calledOnce(stub.mocks.reset);

        const { age: resetAge } = finalForm.getState().values;
        expect(resetAge).to.equal(null);
    });

    it('should submit the form', () => {

        const form = stub.tmpl.formElement();

        const name = stub.div.querySelector('[name="name"]');
        const age = stub.div.querySelector('[name="age"]');
        const address = stub.div.querySelector('[name="address"]');
        const shouldntfail = stub.div.querySelector('[name="shouldntfail"]');

        name.value = 'totes'
        age.value = 14;
        address.value = 'tests'
        shouldntfail.checked = true;

        age.dispatchEvent(new Event('input'));
        name.dispatchEvent(new Event('input'));
        address.dispatchEvent(new Event('input'));
        shouldntfail.dispatchEvent(new Event('change'));

        form.dispatchEvent(new Event('submit'));

        sinon.assert.calledOnce(stub.mocks.submit);

        stub.mocks.submit.calledWith(
            '/stuff',
            {
                name: 'totes',
                address: 'tests',
                age: "14"
            }
        );

        sinon.assert.calledOnce(stub.mocks.fieldConfig);
    });

    it('should unsubscribe final form on unmount', () => {

        expect(stub.tmpl.finalForm()).not.to.equal(null);
        unmount(stub.div);
        expect(stub.tmpl.finalForm()).to.equal(null);
    });

    it('should mount with default behavior', () => {

        stub.mocks.submit.resetHistory();

        const { tmpl } = mountForm('default-behavior-form');

        const form = (tmpl as FinalFormInitializedComponent<any>).formElement();
        form.dispatchEvent(new Event('submit'));

        sinon.assert.notCalled(stub.mocks.submit);
    });

    it('should initialize later', () => {

        stub.mocks.submit.resetHistory();

        const { div } = mountForm('initialize-later');

        sinon.assert.calledOnce(stub.mocks.initalizeLaterWasCalled);

        const { value } = div.querySelector('[name=name]') as HTMLInputElement;

        expect(value).to.equal('tutu')
    });

    it('should ignore fields', () => {

        stub.mocks.submit.resetHistory();

        const { tmpl, div } = mountForm('ignore-fields');

        const form = (tmpl as FinalFormInitializedComponent<any>).formElement();

        const name = div.querySelector('[name="name"]') as HTMLInputElement;
        const age = div.querySelector('[name="age"]') as HTMLInputElement;
        const address = div.querySelector('[name="address"]') as HTMLInputElement;

        name.value = 'totes'
        age.value = '14';
        address.value = 'tests'

        age.dispatchEvent(new Event('input'));
        name.dispatchEvent(new Event('input'));
        address.dispatchEvent(new Event('input'));

        form.dispatchEvent(new Event('submit'));

        stub.mocks.submit.calledWith(
            '/stuff',
            {
                name: 'totes',
                address: '',
                age: null
            }
        );
    });

    it('capture events on special fields', () => {

        stub.mocks.submit.resetHistory();

        const { tmpl, div } = mountForm('field-type-events');

        const form = (tmpl as FinalFormInitializedComponent<any>).formElement();

        const name = div.querySelector('[name="name"]') as HTMLInputElement;
        const music = div.querySelector('[name="music"]') as HTMLInputElement;
        const gender = div.querySelector('[name="gender"]') as HTMLInputElement;
        const captcha = div.querySelector('[name="captcha"]') as HTMLInputElement;

        name.value = 'totes'
        music.checked = true;
        gender.checked = true;
        captcha.value = 'tites'

        name.dispatchEvent(new Event('input'));
        music.dispatchEvent(new Event('input'));

        gender.dispatchEvent(new Event('change'));
        captcha.dispatchEvent(new Event('change'));

        form.dispatchEvent(new Event('submit'));

        stub.mocks.submit.calledWith(
            '/stuff',
            {
                name: 'totes',
                music: true,
                gender: 'm',
                captcha: 'tites'
            }
        );
    });

    it('capture form mutations', () => {

        stub.mocks.submit.resetHistory();

        const { tmpl, div } = mountForm('form-mutations');

        sinon.assert.calledOnce(stub.mutator.instantiated);
        sinon.assert.calledOnce(stub.mutator.observe);

        const mockedMutationsList = {};

        stub._mutatorInstance.trigger(mockedMutationsList);
        sinon.assert.calledOnce(stub.mocks.formMutated);

        const { args: [arg] } = stub.mocks.formMutated.getCall(0);

        expect(
            Object.keys(arg)
        ).to.contain.members([
            'mutationsList',
            'observer',
            'registrations',
            'form',
            'registerField'
        ]);

        sinon.assert.notCalled(stub.mutator.disconnect)

        tmpl.unmount();

        sinon.assert.calledOnce(stub.mutator.disconnect);
    });
})
