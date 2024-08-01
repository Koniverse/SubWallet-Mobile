import { useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { WebRunnerContext } from 'providers/contexts';

export const useHandleInternetConnectionForConfirmation = (onCancel?: () => void) => {
  const { isNetConnected } = useContext(WebRunnerContext);
  useEffect(() => {
    if (!isNetConnected) {
      Alert.alert(i18n.warningTitle.noInternetTitle, i18n.warningMessage.reCheckInternetConnection, [
        { text: i18n.buttonTitles.iUnderstand },
      ]);
      onCancel && onCancel();
    }
  }, [isNetConnected, onCancel]);
};
