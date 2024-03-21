import React, { useCallback, useContext, useMemo } from 'react';
import { AppOnlineContentContext } from 'providers/AppOnlineContentProvider';
import { View } from 'react-native';
import { Button } from 'components/design-system-ui';

const useGetConfirmationByScreen = (screen: string, compareValue?: string) => {
  const {
    appConfirmationMap,
    checkPositionParam,
    checkBannerVisible,
    confirmationHistoryMap,
    updateConfirmationHistoryMap,
  } = useContext(AppOnlineContentContext);

  const confirmations = useMemo(() => {
    const displayedConfirmation = appConfirmationMap[screen];

    if (displayedConfirmation && displayedConfirmation.length) {
      return displayedConfirmation.filter(confirmation => {
        const confirmationHistory = confirmationHistoryMap[`${confirmation.position}-${confirmation.id}`];
        const isConfirmationVisible = checkBannerVisible(confirmationHistory.showTimes);
        if (compareValue) {
          return checkPositionParam(screen, confirmation.position_params, compareValue) && isConfirmationVisible;
        } else {
          return isConfirmationVisible;
        }
      });
    } else {
      return [];
    }
  }, [appConfirmationMap, screen, confirmationHistoryMap, checkBannerVisible, compareValue, checkPositionParam]);

  const renderConfirmationButtons = useCallback(
    (onPressCancel: () => void, onPressOk: () => void) => {
      if (!confirmations || !confirmations.length) {
        return <></>;
      }
      const confirmationId = `${confirmations[0].position}-${confirmations[0].id}`;
      return (
        <View style={{ flexDirection: 'row', gap: 12 }}>
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

  return { confirmations, renderConfirmationButtons };
};

export default useGetConfirmationByScreen;
