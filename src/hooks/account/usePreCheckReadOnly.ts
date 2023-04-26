import { useCallback } from 'react';
import useIsReadOnlyAccount from '../useIsReadOnlyAccount';
import { useToast } from 'react-native-toast-notifications';

type VoidFunction = () => void;

const usePreCheckReadOnly = (address?: string, message?: string): ((onClick: VoidFunction) => VoidFunction) => {
  const { show } = useToast();
  const isReadOnlyAccount = useIsReadOnlyAccount(address);

  return useCallback(
    (onClick: VoidFunction) => {
      return () => {
        if (isReadOnlyAccount) {
          show(message ?? 'The account you are using is read-only, you cannot use this feature with it');
        } else {
          onClick();
        }
      };
    },
    [isReadOnlyAccount, message, show],
  );
};

export default usePreCheckReadOnly;
