import { register, mount } from 'riot';

import withFinalForm from '..';
import SomeForm from './some-form.riot';

const mountForm = () => {

    const div = document.createElement('div');
    const [tmpl] = mount(div, {}, 'some-form');

    return { div, tmpl };
};

const stub = {};

beforeAll(() => {

    register('some-form', SomeForm);
});

test('it should mount without error', () => {


    const { div, tmpl } = mountForm();
    document.body.appendChild(div);

    Object.assign(stub, { div, tmpl });
})