import React, { useCallback, useMemo, useState } from 'react';

interface SigningState {
  errors: string[];
  isCreating: boolean; // create transaction
  isLoading: boolean; // create or submit transaction or scanning signature
  isScanning: boolean; // scanning signature
  isSubmitting: boolean; // submit transaction
  isVisible: boolean; // visible modal info
  passwordError: boolean; // password error
}

const DEFAULT_SIGNING_STATE: SigningState = {
  errors: [],
  isCreating: false,
  isLoading: false,
  isScanning: false,
  isSubmitting: false,
  isVisible: false,
  passwordError: false,
};

interface SigningContextProviderProps {
  children?: React.ReactElement;
}

interface SigningContextType {
  cleanSigningState: () => void;
  clearError: () => void;
  clearLoading: () => void;
  onErrors: (errors: string[]) => void;
  setIsCreating: (val: boolean) => void;
  setIsScanning: (val: boolean) => void;
  setIsSubmitting: (val: boolean) => void;
  setIsVisible: (val: boolean) => void;
  setPasswordError: (val: boolean) => void;
  signingState: SigningState;
}

export const SigningContext = React.createContext({} as SigningContextType);

export const SigningContextProvider = ({ children }: SigningContextProviderProps) => {
  const [errors, setErrors] = useState<string[]>(DEFAULT_SIGNING_STATE.errors);
  const [isCreating, setIsCreating] = useState<boolean>(DEFAULT_SIGNING_STATE.isCreating);
  const [isScanning, setIsScanning] = useState<boolean>(DEFAULT_SIGNING_STATE.isScanning);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(DEFAULT_SIGNING_STATE.isSubmitting);
  const [isVisible, setIsVisible] = useState<boolean>(DEFAULT_SIGNING_STATE.isVisible);
  const [passwordError, setPasswordError] = useState<boolean>(DEFAULT_SIGNING_STATE.passwordError);

  const signingState = useMemo(
    (): SigningState => ({
      errors: errors,
      isCreating: isCreating,
      isLoading: isCreating || isSubmitting || isScanning,
      isSubmitting: isSubmitting,
      isScanning: isScanning,
      isVisible: isVisible,
      passwordError: passwordError,
    }),
    [errors, isCreating, isScanning, isSubmitting, isVisible, passwordError],
  );

  const cleanSigningState = useCallback(() => {
    setErrors(DEFAULT_SIGNING_STATE.errors);
    setIsCreating(DEFAULT_SIGNING_STATE.isCreating);
    setIsSubmitting(DEFAULT_SIGNING_STATE.isSubmitting);
    setIsVisible(DEFAULT_SIGNING_STATE.isVisible);
    setPasswordError(DEFAULT_SIGNING_STATE.passwordError);
    setIsScanning(DEFAULT_SIGNING_STATE.isScanning);
  }, []);

  const clearLoading = useCallback(() => {
    setIsCreating(false);
    setIsScanning(false);
    setIsSubmitting(false);
  }, []);

  const clearError = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <SigningContext.Provider
      value={{
        cleanSigningState: cleanSigningState,
        clearError: clearError,
        clearLoading: clearLoading,
        onErrors: setErrors,
        setIsCreating: setIsCreating,
        setIsScanning: setIsScanning,
        setIsSubmitting: setIsSubmitting,
        setIsVisible: setIsVisible,
        setPasswordError: setPasswordError,
        signingState: signingState,
      }}>
      {children}
    </SigningContext.Provider>
  );
};
