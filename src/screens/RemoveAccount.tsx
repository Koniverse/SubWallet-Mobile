import React, { useState } from 'react';
import { StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { SubmitButton } from 'components/SubmitButton';
import { Trash } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { useNavigation } from '@react-navigation/native';
import { RemoveAccountProps, RootNavigationProps } from 'types/routes';
import { forgetAccount } from '../messaging';
import { toShort } from 'utils/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import i18n from 'utils/i18n/i18n';

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
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
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
        if (accounts && accounts.length === 2) {
          navigation.navigate('FirstScreen');
        } else {
          navigation.navigate('Home');
        }
      })
      .catch((error: Error) => {
        setIsBusy(false);
        console.error(error);
      });
  };

  return (
    <SubScreenContainer navigation={navigation} title={'Remove Account'}>
      <View style={layoutContainerStyle}>
        <View style={bodyAreaStyle}>
          <View style={bodyContentStyle}>
            <View style={iconWrapperStyle}>
              <Icon size={32} color={ColorMap.danger} />
            </View>
            <Text style={text1Style}>Remove Account</Text>
            <Text style={{ ...text1Style, marginBottom: 8 }}>({displayAddress})</Text>
            <Text style={text2Style}>{i18n.warningMessage.removeAccountWarning}</Text>
          </View>
        </View>

        <View style={footerAreaStyle}>
          <SubmitButton title={'Cancel'} backgroundColor={ColorMap.dark2} style={buttonStyle} onPress={onCancel} />
          <SubmitButton
            isBusy={isBusy}
            title={'Remove'}
            backgroundColor={ColorMap.danger}
            style={buttonStyle}
            onPress={onConfirm}
          />
        </View>
      </View>
    </SubScreenContainer>
  );
};
