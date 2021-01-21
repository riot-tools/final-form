import {
    FormApi,
    SubmissionErrors,
    FormSubscriber,
    FieldState,
    FormSubscription,
    Config,
    FieldSubscription,
    FieldConfig
} from 'final-form';


interface FormElementFunction {
    (): HTMLFormElement
}

interface OnSubmitFunction {
    (
        values: object,
        form: FormApi,
        callback?: (errors?: SubmissionErrors) => any
    ): void;
}

interface ValidateFunction {
    (values: object): Object | Promise<Object>;
}

interface OnFieldChangeFunction {
    (field: string, fieldState: FieldState<Object>): any;
}

interface RiotFinalFormConfig {
    formElement: FormElementFunction;
    onSubmit: OnSubmitFunction;
    enableDefaultBehavior: boolean;
    manuallyInitializeFinalForm: boolean;
    initialValues: object;
    validate: ValidateFunction;
    onFormChange: FormSubscriber<Object>;
    formSubscriptions: FormSubscription;
    formConfig: Config;
    onFieldChange: OnFieldChangeFunction;
    fieldSubscriptions: {
        [name: string]: FieldSubscription;
    };
    fieldConfigs: {
        [name: string]: FieldConfig<any>
    };
}

interface WithFinalForm {
    (config: RiotFinalFormConfig): any
}

export default WithFinalForm