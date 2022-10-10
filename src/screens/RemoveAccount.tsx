import React, { useState } from 'react';
import { StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { SubmitButton } from 'components/SubmitButton';
import { Trash } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { useNavigation } from '@react-navigation/native';
import { RemoveAccountProps, RootNavigationProps } from 'routes/index';
import { forgetAccount } from '../messaging';
import { toShort } from 'utils/index';
import i18n from 'utils/i18n/i18n';
import { backToHome } from 'utils/navigation';
import useGoHome from 'hooks/screen/useGoHome';

const layoutContainerStyle: StyleProp<any> = {
  ...ContainerHorizontalPadding,
  flex: 1,
};

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
  justifyContent: 'center',
};

const bodyContentStyle: StyleProp<any> = {
  alignItems: 'center',
};

const footerAreaStyle: StyleProp<any> = {
  marginLeft: -4,
  marginRight: -4,
  flexDirection: 'row',
  paddingTop: 12,
  paddingBottom: 38,
};

const iconWrapperStyle: StyleProp<any> = {
  width: 80,
  height: 80,
  borderRadius: 80,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: ColorMap.dangerOverlay,
  marginBottom: 8,
};

const text1Style: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
};

const text2Style: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  textAlign: 'center',
};

const buttonStyle: StyleProp<any> = {
  margin: 4,
  flex: 1,
};

const Icon = Trash;

export const RemoveAccount = ({
  route: {
    params: { address },
  },
}: RemoveAccountProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const [isBusy, setIsBusy] = useState(false);
  //todo: reformat address base on Current network
  const displayAddress = toShort(address, 10, 10);

  const onCancel = () => {
    navigation.goBack();
  };

  const onConfirm = () => {
    setIsBusy(true);
    forgetAccount(address)
      .then(() => {
        backToHome(goHome, true);
      })
      .catch((error: Error) => {
        setIsBusy(false);
        console.error(error);
      });
  };

  return (
    <SubScreenContainer navigation={navigation} title={i18n.title.removeAccount} disabled={isBusy}>
      <View style={layoutContainerStyle}>
        <View style={bodyAreaStyle}>
          <View style={bodyContentStyle}>
            <View style={iconWrapperStyle}>
              <Icon size={32} color={ColorMap.danger} />
            </View>
            <Text style={text1Style}>{i18n.title.removeAccount}</Text>
            <Text style={{ ...text1Style, marginBottom: 8 }}>({displayAddress})</Text>
            <Text style={text2Style}>{i18n.warningMessage.removeAccountWarning}</Text>
          </View>
        </View>

        <View style={footerAreaStyle}>
          <SubmitButton
            disabled={isBusy}
            disabledColor={ColorMap.buttonOverlayButtonColor}
            title={i18n.common.cancel}
            backgroundColor={ColorMap.dark2}
            style={buttonStyle}
            onPress={onCancel}
          />
          <SubmitButton
            isBusy={isBusy}
            title={i18n.common.remove}
            backgroundColor={ColorMap.danger}
            style={buttonStyle}
            onPress={onConfirm}
          />
        </View>
      </View>
    </SubScreenContainer>
  );
};
