import React, { useState } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { AuthorizeRequest } from 'screens/Home/Browser/ConfirmationPopup/AuthorizeRequest';
import { getHostName } from 'utils/browser';
import { IconButton } from 'components/IconButton';
import { ArrowLeft, ArrowRight } from 'phosphor-react-native';
import useConfirmations from 'hooks/useConfirmations';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';

const subWalletModalSeparator: StyleProp<any> = {
  width: 56,
  height: 4,
  borderRadius: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
};

const confirmationPopupWrapper: StyleProp<any> = {
  height: '66%',
  width: '100%',
  backgroundColor: ColorMap.dark2,
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  alignItems: 'center',
  paddingTop: 8,
  paddingHorizontal: 16,
};

const confirmationHeader: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  alignItems: 'center',
  marginTop: 8,
  marginBottom: 16,
};

const authorizeIndexTextStyle: StyleProp<any> = { ...sharedStyles.mainText, ...FontMedium, color: ColorMap.light };

const requestListLength = 3;

export const ConfirmationPopup = () => {
  const url = 'https://portal.astar.network';
  const hostName = getHostName(url);
  const {} = useConfirmations();
  const [confirmationIndex, setConfirmationIndex] = useState<number>(1);
  const onPressPrevButton = () => {
    if (confirmationIndex > 1) {
      setConfirmationIndex(confirmationIndex - 1);
    }
  };

  const onPressNextButton = () => {
    if (confirmationIndex < requestListLength) {
      setConfirmationIndex(confirmationIndex + 1);
    }
  };

  return (
    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
      <View style={confirmationPopupWrapper}>
        <View style={subWalletModalSeparator} />
        <View style={confirmationHeader}>
          <IconButton icon={ArrowLeft} color={ColorMap.disabled} onPress={onPressPrevButton} />
          <Text style={authorizeIndexTextStyle}>
            <Text>{confirmationIndex}</Text>/<Text>{requestListLength}</Text>
          </Text>
          <IconButton icon={ArrowRight} color={ColorMap.disabled} onPress={onPressNextButton} />
        </View>
        <AuthorizeRequest request={{ origin: hostName }} />
      </View>
    </View>
  );
};
