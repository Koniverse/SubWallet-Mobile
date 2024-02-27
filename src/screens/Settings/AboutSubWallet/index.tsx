import React, { useRef, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { Linking, Platform, View } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { Globe, ArrowSquareOut, BookBookmark, Star } from 'phosphor-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updateAutoLockTime } from 'stores/MobileSettings';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { BackgroundIcon, Icon, SelectItem, SwModal } from 'components/design-system-ui';
import { useToast } from 'react-native-toast-notifications';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { saveAutoLockTime } from 'messaging/index';
import { LockTimeout } from 'stores/types';
import { TERMS_OF_USE_URL, TWITTER_URL, WEBSITE_URL } from 'constants/index';
import { SVGImages } from 'assets/index';

export const AboutSubWallet = () => {
  const theme = useSubWalletTheme().swThemes;
  const toast = useToast();
  const { timeAutoLock } = useSelector((state: RootState) => state.mobileSettings);
  const [iShowAutoLockModal, setIsShowAutoLockModal] = useState<boolean>(false);
  const navigation = useNavigation<RootNavigationProps>();
  const dispatch = useDispatch();
  const modalRef = useRef<SWModalRefProps>(null);

  const AUTO_LOCK_LIST: { text: string; value: number }[] = [
    {
      text: i18n.settings.alwaysRequire,
      value: LockTimeout.ALWAYS,
    },
    {
      text: i18n.settings.ifLeftFor1Minute,
      value: LockTimeout._1MINUTE,
    },
    {
      text: i18n.settings.ifLeftFor5Minutes,
      value: LockTimeout._5MINUTE,
    },
    {
      text: i18n.settings.ifLeftFor10Minutes,
      value: LockTimeout._10MINUTE,
    },
    {
      text: i18n.settings.ifLeftFor15Minutes,
      value: LockTimeout._15MINUTE,
    },
    {
      text: i18n.settings.ifLeftFor30Minutes,
      value: LockTimeout._30MINUTE,
    },
    {
      text: i18n.settings.ifLeftFor1Hour,
      value: LockTimeout._60MINUTE,
    },
    {
      text: i18n.settings.neverRequire,
      value: LockTimeout.NEVER,
    },
  ];

  const onChangeAutoLockTime = (value: number) => {
    if (value === LockTimeout.NEVER) {
      toast.show(i18n.notificationMessage.warningNeverRequirePassword, { type: 'warning', duration: 3500 });
    }
    saveAutoLockTime(value).then(() => dispatch(updateAutoLockTime(value)));
    modalRef?.current?.close();
  };

  return (
    <SubScreenContainer
      title={'About SubWallet'}
      navigation={navigation}
      onPressLeftBtn={() => {
        navigation.goBack();
      }}>
      <View style={{ ...sharedStyles.layoutContainer, paddingTop: 16 }}>
        <View style={{ gap: theme.paddingXS }}>
          <SelectItem
            icon={Globe}
            backgroundColor={theme['purple-7']}
            label={i18n.settings.website}
            onPress={() => Linking.openURL(WEBSITE_URL)}
            rightIcon={<Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />}
          />
          <SelectItem
            icon={BookBookmark}
            backgroundColor={theme['volcano-7']}
            label={i18n.settings.termOfUse}
            onPress={() => Linking.openURL(TERMS_OF_USE_URL)}
            rightIcon={<Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />}
          />
          <SelectItem
            leftItemIcon={
              <BackgroundIcon
                shape={'circle'}
                backgroundColor={theme.colorBgLayout}
                customIcon={<SVGImages.TwitterLogo width={16} height={16} color={theme.colorWhite} />}
              />
            }
            icon={BookBookmark}
            backgroundColor={theme['volcano-7']}
            label={i18n.settings.xTwitter}
            onPress={() => Linking.openURL(TWITTER_URL)}
            rightIcon={<Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />}
          />
          <SelectItem
            icon={Star}
            backgroundColor={theme['lime-6']}
            label={i18n.settings.rateOurApp}
            onPress={() => {
              Linking.openURL(
                Platform.OS === 'ios'
                  ? 'https://apps.apple.com/vn/app/subwallet-polkadot-wallet/id1633050285'
                  : 'https://play.google.com/store/apps/details?id=app.subwallet.mobile',
              );
            }}
            rightIcon={<Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />}
          />
        </View>

        <SwModal
          isUseModalV2
          modalBaseV2Ref={modalRef}
          setVisible={setIsShowAutoLockModal}
          modalVisible={iShowAutoLockModal}
          onBackButtonPress={() => modalRef?.current?.close()}
          modalTitle={i18n.settings.appLock}>
          <View style={{ width: '100%', gap: theme.paddingXS }}>
            {AUTO_LOCK_LIST.map(item => (
              <SelectItem
                key={item.text}
                isSelected={timeAutoLock === item.value}
                label={item.text}
                onPress={() => onChangeAutoLockTime(item.value)}
              />
            ))}
          </View>
        </SwModal>
      </View>
    </SubScreenContainer>
  );
};
