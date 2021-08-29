import type {
    Config,
    FieldConfig,
    FieldState,
    FieldSubscription,
    FormApi,
    FormSubscription
} from 'final-form';

import type { RiotComponent } from 'riot';

type RffFieldRegistrations = Map<HTMLElement, Function>;

type OnFormMutatedArgument = {
    mutationsList: MutationRecord[],
    observer: MutationObserver,
    registrations: RffFieldRegistrations,
    form: FormApi,
    registerField: (HTMLElement) => void
}

export type WithFinalFormOpts = RiotComponent & {

    initialValues: object;
    formConfig?: Config;
    formSubscriptions?: FormSubscription;
    manuallyInitializeFinalForm?: boolean;
    mutatorOptions?: MutationObserverInit;

    formElement: () => HTMLFormElement;
    validate?: (errors: object) => object;
    onSubmit?: (values: object) => void;
    onFormChange?: (formState: FormApi) => void;
    onFieldChange?: (field: HTMLElement, fieldState: FieldState<any>) => void;
    onFormMutated?: (opts: OnFormMutatedArgument) => void;

    fieldConfigs?: {
        [key: string]: FieldConfig<any>
    };

    fieldSubscriptions?: {
        [key: string]: FieldSubscription
    };
};

export type InitializedComponent = WithFinalFormOpts & {

    finalForm: () => FormApi
    initializeFinalForm: () => void
};

export type InitializeFormState = {
    form: FormApi;
    registered: {
        [key: string]: boolean
    };
    registrations: RffFieldRegistrations;
    enableDefaultBehavior?: boolean;
    observer?: MutationObserver;
    mutatorOptions?: MutationObserverInit;
    unsubscribe?: Function;
};
