import React, { useCallback, useContext, useMemo } from 'react';
import { AppOnlineContentContext } from 'providers/AppOnlineContentProvider';
import { View } from 'react-native';
import { Button } from 'components/design-system-ui';

const useGetConfirmationByScreen = (screen: string) => {
  const { appConfirmationMap, checkPositionParam, updateConfirmationHistoryMap } = useContext(AppOnlineContentContext);

  const confirmations = useMemo(() => {
    return appConfirmationMap[screen] || [];
  }, [appConfirmationMap, screen]);

  const getCurrentConfirmation = useCallback(
    (compareVal: string) => {
      return confirmations.filter(item => {
        return checkPositionParam(screen, item.position_params, compareVal);
      });
    },
    [checkPositionParam, confirmations, screen],
  );

  const renderConfirmationButtons = useCallback(
    (onPressCancel: () => void, onPressOk: () => void) => {
      if (!confirmations || !confirmations.length) {
        return <></>;
      }
      const confirmationId = `${confirmations[0].position}-${confirmations[0].id}`;
      return (
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <Button
            block
            type={'secondary'}
            onPress={() => {
              updateConfirmationHistoryMap(confirmationId);
              onPressCancel();
            }}>
            {confirmations[0].cancel_label}
          </Button>
          <Button
            block
            type={'primary'}
            onPress={() => {
              updateConfirmationHistoryMap(confirmationId);
              onPressOk();
            }}>
            {confirmations[0].confirm_label}
          </Button>
        </View>
      );
    },
    [confirmations, updateConfirmationHistoryMap],
  );

  return { confirmations, renderConfirmationButtons, getCurrentConfirmation };
};

export default useGetConfirmationByScreen;
