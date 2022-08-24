import { RefObject, useReducer, useRef } from 'react';
import { Keyboard } from 'react-native';
import i18n from 'utils/i18n/i18n';

type FormItemKey = string;

interface FormControlItem {
  name: string;
  value: string;
  validateFunc?: (value: string, formValue: Record<FormItemKey, string>) => string[];
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
  validateFormTypes: Record<FormItemKey, string[]>;
  onSubmitForm?: (formState: FormState) => void;
}

interface FormControlAction {
  type: string;
  payload: { fieldName: string; value: string };
}

function initForm(initData: Record<FormItemKey, FormControlItem>, onSubmitForm?: (formState: FormState) => void) {
  const formState: FormState = {
    config: initData,
    index: 0,
    requireItems: {},
    isValidated: {},
    refs: {},
    labels: {},
    data: {},
    errors: {},
    validateFormTypes: {},
    onSubmitForm: onSubmitForm,
  };

  Object.entries(initData).forEach(([k, d]) => {
    formState.refs[k] = useRef(null);
    formState.labels[k] = d.name;
    formState.data[k] = d.value;
    formState.errors[k] = [];
    formState.requireItems[k] = !!d.require;
    formState.validateFormTypes[k] = d.validateOn || ['change_value'];
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
  const { fieldName, value } = action.payload;
  switch (action.type) {
    case 'update_errors':
      const convertedValue = JSON.parse(value);
      if (convertedValue && convertedValue.length) {
        state.errors[fieldName] = convertedValue;
        state.isValidated[fieldName] = false;
      } else {
        state.errors[fieldName] = [];
        state.isValidated[fieldName] = true;
      }

      return { ...state };
    case 'change_value':
      let fireUpdate = false;
      let isValidated = false;
      const validateFunction = state.config[fieldName].validateFunc;
      if (state.validateFormTypes[fieldName].includes('change_value')) {
        isValidated = checkFieldValidation(state, fieldName, value, validateFunction);
      }

      if (state.isValidated[fieldName] !== isValidated) {
        state.isValidated[fieldName] = isValidated;
        fireUpdate = true;
      }

      if (state.errors[fieldName]) {
        fireUpdate = true;
      }
      state.data[fieldName] = value;
      return fireUpdate ? { ...state } : state;
    case 'submit':
      state.index = Object.keys(state.refs).indexOf(fieldName) + 1;
      const refList = Object.values(state.refs);
      if (state.validateFormTypes[fieldName].includes('submit')) {
        state.isValidated[fieldName] = checkFieldValidation(
          state,
          fieldName,
          state.data[fieldName],
          state.config[fieldName].validateFunc,
        );
      }
      if (state.index === refList.length) {
        const _onSubmitForm = state.onSubmitForm;
        Keyboard.dismiss();
        _onSubmitForm && _onSubmitForm(state);
      } else {
        refList[state.index].current?.focus();
      }

      return { ...state };
    default:
      throw new Error();
  }
}

export default function useFormControl(
  formConfig: Record<FormItemKey, FormControlItem>,
  onSubmitForm?: (formState: FormState) => void,
) {
  const [formState, dispatchForm] = useReducer(formReducer, initForm(formConfig, onSubmitForm));

  const onChangeValue = (fieldName: string) => {
    return (currentValue: string) => {
      dispatchForm({ type: 'change_value', payload: { fieldName, value: currentValue } });
    };
  };

  const onUpdateErrors = (fieldName: string) => {
    return (error: string) => {
      dispatchForm({ type: 'update_errors', payload: { fieldName, value: error } });
    };
  };

  const onSubmitField = (fieldName: string) => {
    return () => dispatchForm({ type: 'submit', payload: { fieldName, value: '' } });
  };
  return {
    formState,
    onUpdateErrors,
    onChangeValue,
    onSubmitField,
  };
}
