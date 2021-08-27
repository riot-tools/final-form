import type { WithFinalFormOpts } from './types';

export const isNotFunction = (fn: any) => fn.constructor !== Function;
export const requiredFnValidate = (fn: Function) => !fn || isNotFunction(fn);
export const optionalFnValidate = (fn: Function) => fn && isNotFunction(fn);

export const assertProperConfig = (component: WithFinalFormOpts) => {

    if (requiredFnValidate(component.formElement)) { throw TypeError('formElement is not a function'); }
    if (optionalFnValidate(component.validate)) { throw TypeError('validate is not a function'); }
    if (optionalFnValidate(component.onFieldChange)) { throw TypeError('onFieldChange is not a function'); }
    if (optionalFnValidate(component.onFormChange)) { throw TypeError('onFormChange is not a function'); }
    if (optionalFnValidate(component.onSubmit)) { throw TypeError('onSubmit is not a function'); }
    if (optionalFnValidate(component.onFormMutated)) { throw TypeError('onSubmit is not a function'); }
};
