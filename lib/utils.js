export const isNotFunction = fn => fn.constructor !== Function;
export const requiredFnValidate = (fn) => !fn || isNotFunction(fn);
export const optionalFnValidate = (fn) => fn && isNotFunction(fn);

export const assertProperConfig = (component) => {

    if (requiredFnValidate(component.formElement)) { throw TypeError('formElement is not a function'); }
    if (optionalFnValidate(component.validate)) { throw TypeError('validate is not a function'); }
    if (optionalFnValidate(component.onFieldChange)) { throw TypeError('onFieldChange is not a function'); }
    if (optionalFnValidate(component.onFormChange)) { throw TypeError('onFormChange is not a function'); }
    if (optionalFnValidate(component.onSubmit)) { throw TypeError('onSubmit is not a function'); }
};
