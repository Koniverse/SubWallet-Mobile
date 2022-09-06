import React from 'react';
import { StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { Header } from 'screens/Home/Browser/ConfirmationPopup/Header';
import { AuthorizeRequest } from 'screens/Home/Browser/ConfirmationPopup/AuthorizeRequest';
import { getHostName } from 'utils/index';
import { ConfirmationFooter } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationFooter';
import i18n from 'utils/i18n/i18n';

const subWalletModalSeparator: StyleProp<any> = {
  width: 56,
  height: 4,
  borderRadius: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  marginBottom: 19,
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

export const ConfirmationPopup = () => {
  const url = 'https://portal.astar.network';
  const hostName = getHostName(url);
  return (
    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
      <View style={confirmationPopupWrapper}>
        <View style={subWalletModalSeparator} />
        <Header title={'Approve Request'} hostName={hostName} />
        <AuthorizeRequest request={{ origin: hostName }} />
        <ConfirmationFooter
          isShowBlockButton={true}
          cancelButtonTitle={i18n.common.cancel}
          submitButtonTitle={i18n.common.connect}
          onPressCancelButton={() => {}}
          onPressSubmitButton={() => {}}
        />
      </View>
    </View>
  );
};
