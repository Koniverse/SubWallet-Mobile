import { Images, Logo } from 'assets/index';
import { FileArrowDown, PlusCircle, Swatches } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  EmitterSubscription,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleProp,
  View,
} from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import Text from 'components/Text';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import AccountActionButton from 'components/common/AccountActionButton';
import { AccountCreationArea } from 'components/common/AccountCreationArea';
import { SelectedActionType } from 'stores/types';
import { updateSelectedAction } from 'stores/PasswordModalState';
import { useDispatch } from 'react-redux';
import useCheckLogin from 'hooks/common/useCheckLogin';

const imageBackgroundStyle: StyleProp<any> = {
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingBottom: Platform.OS === 'ios' ? 56 : 20,
  position: 'relative',
};

const logoStyle: StyleProp<any> = {
  width: '100%',
  flex: 1,
  justifyContent: 'flex-end',
  position: 'relative',
  alignItems: 'center',
  paddingBottom: 22,
};

const logoTextStyle: StyleProp<any> = {
  fontSize: 38,
  lineHeight: 46,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingTop: 9,
};

const logoSubTextStyle: StyleProp<any> = {
  fontSize: 16,
  lineHeight: 24,
  ...FontMedium,
  color: 'rgba(255, 255, 255, 0.65)',
  paddingTop: 12,
};

const firstScreenNotificationStyle: StyleProp<any> = {
  ...sharedStyles.smallText,
  color: 'rgba(255, 255, 255, 0.45)',
  textAlign: 'center',
  paddingHorizontal: 16,
  paddingTop: 0,
  ...FontMedium,
};

export const FirstScreen = () => {
  const [selectedAction, setSelectedAction] = useState<SelectedActionType | undefined>(undefined);
  const [importAccountModalVisible, setImportAccountModalVisible] = useState<boolean>(false);
  const [attachAccountModalVisible, setAttachAccountModalVisible] = useState<boolean>(false);
  const [createAccountModalVisible, setCreateAccountModalVisible] = useState<boolean>(false);
  const theme = useSubWalletTheme().swThemes;
  const checkLogin = useCheckLogin();
  const dispatch = useDispatch();
  useEffect(() => {
    let event: EmitterSubscription;
    if (selectedAction) {
      event = DeviceEventEmitter.addListener(selectedAction, () => {
        if (selectedAction === 'createAcc') {
          setCreateAccountModalVisible(true);
        } else if (selectedAction === 'importAcc') {
          setImportAccountModalVisible(true);
        } else if (selectedAction === 'attachAcc') {
          setAttachAccountModalVisible(true);
        }
      });
    }

    return () => {
      selectedAction && event.remove();
    };
  }, [selectedAction]);

  const actionList = [
    {
      key: 'create',
      icon: PlusCircle,
      title: 'Create a new account',
      subTitle: 'Create a new account with SubWallet',
      onPress: () => {
        setSelectedAction('createAcc');
        dispatch(updateSelectedAction('createAcc'));
        checkLogin(() => setCreateAccountModalVisible(true))();
      },
    },
    {
      key: 'import',
      icon: FileArrowDown,
      title: 'Import an account',
      subTitle: 'Import an existing account',
      onPress: () => {
        setSelectedAction('importAcc');
        dispatch(updateSelectedAction('importAcc'));
        checkLogin(() => setImportAccountModalVisible(true))();
      },
    },
    {
      key: 'attach',
      icon: Swatches,
      title: 'Attach an account',
      subTitle: 'Attach an account from external wallet',
      onPress: () => {
        setSelectedAction('attachAcc');
        dispatch(updateSelectedAction('attachAcc'));
        checkLogin(() => setAttachAccountModalVisible(true))();
      },
    },
  ];

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      <ImageBackground source={Images.backgroundImg} resizeMode={'cover'} style={imageBackgroundStyle}>
        <SafeAreaView />
        <View style={logoStyle}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              marginBottom: 16,
              paddingTop: 40,
              alignItems: 'center',
            }}>
            <Image source={Logo.SubWallet} />
            <Text style={logoTextStyle}>SubWallet</Text>
            <Text style={logoSubTextStyle}>Polkadot, Substrate & Ethereum wallet</Text>
          </View>

          <View style={{ width: '100%' }}>
            {actionList.map(item => (
              <AccountActionButton key={item.key} item={item} />
            ))}
          </View>
        </View>

        {/*//TODO: add hyperlink for T&C and Privacy Policy*/}
        <Text style={firstScreenNotificationStyle}>{i18n.common.firstScreenMessagePart1}</Text>
        <Text style={firstScreenNotificationStyle}>
          <Text style={{ color: theme.colorTextLight1 }}>{i18n.common.termAndConditions}</Text>
          <Text>{i18n.common.and}</Text>
          <Text style={{ color: theme.colorTextLight1 }}>{i18n.common.privacyPolicy}</Text>
        </Text>

        <AccountCreationArea
          createAccountModalVisible={createAccountModalVisible}
          importAccountModalVisible={importAccountModalVisible}
          attachAccountModalVisible={attachAccountModalVisible}
          onChangeCreateAccountModalVisible={setCreateAccountModalVisible}
          onChangeImportAccountModalVisible={setImportAccountModalVisible}
          onChangeAttachAccountModalVisible={setAttachAccountModalVisible}
        />
        <SafeAreaView />
      </ImageBackground>
    </View>
  );
};
