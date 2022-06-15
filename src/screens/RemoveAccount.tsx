import React, { useState } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { SubmitButton } from 'components/SubmitButton';
import { Trash } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootNavigationProps, RootRouteProps } from 'types/routes';
import { forgetAccount } from '../messaging';
import { toShort } from 'utils/index';

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

export const RemoveAccount = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const route = useRoute<RootRouteProps>();
  const [isBusy, setIsBusy] = useState(false);
  // @ts-ignore
  const { address } = route.params;
  //todo: reformat address base on Current network
  const displayAddress = toShort(address, 10, 10);

  const onCancel = () => {
    navigation.goBack();
  };

  const onConfirm = () => {
    setIsBusy(true);
    forgetAccount(address)
      .then(() => {
        navigation.navigate('Home');
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
            <Text style={text2Style}>
              You are about to remove the account. This means that you will not be able to access it via this app
              anymore. anymore. If you wish to recover it, you would need to use the seed.
            </Text>
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
