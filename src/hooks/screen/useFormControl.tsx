import { RefObject, useCallback, useReducer, useRef } from 'react';
import { Keyboard } from 'react-native';
import i18n from 'utils/i18n/i18n';

type FormItemKey = string;

interface FormControlItem {
  name: string;
  value: string;
  validateFunc?: (value: string, formValue: Record<FormItemKey, string>) => string[];
  transformFunc?: (value: string, formValue: Record<FormItemKey, string>) => string;
  require?: boolean;
  validateOn?: string[];
}

export interface FormState {
  index: number;
  requireItems: Record<string, boolean>;
  isValidated: Record<FormItemKey, boolean>;
  config: Record<FormItemKey, FormControlItem>;
  refs: Record<FormItemKey, RefObject<any>>;
  labels: Record<FormItemKey, string>;
  data: Record<FormItemKey, string>;
  errors: Record<FormItemKey, string[]>;
  validateFieldsOn: Record<FormItemKey, string[]>;
  onSubmitForm?: (formState: FormState) => void | Promise<void>;
}

interface FormControlAction {
  type: string;
  payload: { fieldName: string; value?: string; errors?: string[] };
}

export interface FormControlOption {
  onSubmitForm?: (formState: FormState) => void;
}

function initForm(initData: Record<FormItemKey, FormControlItem>, formControlOption: FormControlOption) {
  const formState: FormState = {
    config: initData,
    index: 0,
    requireItems: {},
    isValidated: {},
    refs: {},
    labels: {},
    data: {},
    errors: {},
    validateFieldsOn: {},
    onSubmitForm: formControlOption.onSubmitForm,
  };

  Object.entries(initData).forEach(([k, d]) => {
    formState.refs[k] = useRef(null);
    formState.labels[k] = d.name;
    formState.data[k] = d.value;
    formState.errors[k] = [];
    formState.requireItems[k] = !!d.require;
    formState.validateFieldsOn[k] = d.validateOn || ['change_value'];
  });

  return formState;
}

function checkFormRequired(state: FormState, fieldName: string) {
  if (state.requireItems[fieldName]) {
    state.errors[fieldName] = [i18n.warningMessage.requireMessage];
    return false;
  } else {
    return true;
  }
}

function checkFieldValidation(
  state: FormState,
  fieldName: string,
  value: string,
  validateFunction?: (value: string, formValue: Record<FormItemKey, string>) => string[],
) {
  if (value && value.length) {
    if (validateFunction) {
      state.errors[fieldName] = validateFunction(value, state.data);
      return !state.errors[fieldName].length;
    } else {
      state.errors[fieldName] = [];
      return true;
    }
  } else {
    return checkFormRequired(state, fieldName);
  }
}

function formReducer(state: FormState, action: FormControlAction) {
  const { fieldName, value, errors } = action.payload;
  const { validateFunc, transformFunc } = state.config[fieldName];
  switch (action.type) {
    case 'update_errors':
      if (errors && errors.length) {
        state.errors[fieldName] = errors;
        state.isValidated[fieldName] = false;
      } else {
        state.errors[fieldName] = [];
        state.isValidated[fieldName] = true;
      }

      return { ...state };
    case 'change_value':
      if (value === undefined) {
        return state;
      }

      const _value = transformFunc ? transformFunc(value, state.data) : value;
      let fireUpdate = false;
      // Validation check
      let isValidated = false;
      if (state.validateFieldsOn[fieldName].includes('change_value')) {
        isValidated = checkFieldValidation(state, fieldName, _value, validateFunc);
      }

      if (state.isValidated[fieldName] !== isValidated) {
        state.isValidated[fieldName] = isValidated;
        fireUpdate = true;
      }

      if (state.errors[fieldName]) {
        fireUpdate = true;
      }
      state.data[fieldName] = _value;
      return fireUpdate ? { ...state } : state;
    case 'submit':
      if (value !== undefined) {
        state.data[fieldName] = value;
      }
      state.index = Object.keys(state.refs).indexOf(fieldName) + 1;
      const refList = Object.values(state.refs);
      if (state.validateFieldsOn[fieldName].includes('submit')) {
        state.isValidated[fieldName] = checkFieldValidation(state, fieldName, state.data[fieldName], validateFunc);
      }
      if (state.index === refList.length) {
        let valid = true;
        for (const [key, val] of Object.entries(state.isValidated)) {
          if (!val) {
            valid = false;
            const index = Object.keys(state.refs).indexOf(key);
            refList[index].current?.focus();
            break;
          }
        }
        if (valid) {
          const _onSubmitForm = state.onSubmitForm;
          Keyboard.dismiss();
          _onSubmitForm && _onSubmitForm(state);
        }
      } else {
        refList[state.index].current?.focus();
      }

      return { ...state };
    case 'focus':
      state.index = Object.keys(state.refs).indexOf(fieldName);
      Object.values(state.refs)[state.index].current?.focus();

      return { ...state };
    case 'blur':
      state.index = Object.keys(state.refs).indexOf(fieldName);
      Object.values(state.refs)[state.index].current?.blur();

      return { ...state };
    default:
      throw new Error('Invalid form action');
  }
}

export type FormControlConfig = Record<FormItemKey, FormControlItem>;

export default function useFormControl(formConfig: FormControlConfig, formControlOption: FormControlOption) {
  const [formState, dispatchForm] = useReducer(formReducer, initForm(formConfig, formControlOption));

  const onChangeValue = useCallback((fieldName: string) => {
    return (currentValue: string) => {
      dispatchForm({ type: 'change_value', payload: { fieldName, value: currentValue } });
    };
  }, []);

  const onUpdateErrors = useCallback((fieldName: string) => {
    return (errors?: string[]) => {
      dispatchForm({ type: 'update_errors', payload: { fieldName, errors: errors } });
    };
  }, []);

  const onSubmitField = useCallback((fieldName: string, value?: string) => {
    return () => dispatchForm({ type: 'submit', payload: { fieldName, value: value } });
  }, []);

  const focus = useCallback(
    (target: string | number) => {
      const fieldName = typeof target === 'string' ? target : Object.keys(formState.refs)[target];
      return () => dispatchForm({ type: 'focus', payload: { fieldName } });
    },
    [formState.refs],
  );

  const blur = useCallback(
    (target: string | number) => {
      const fieldName = typeof target === 'string' ? target : Object.keys(formState.refs)[target];
      return () => dispatchForm({ type: 'blur', payload: { fieldName } });
    },
    [formState.refs],
  );

  return {
    formState,
    onUpdateErrors,
    onChangeValue,
    onSubmitField,
    focus,
    blur,
  };
}
