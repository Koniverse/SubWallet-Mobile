import React, { useCallback, useMemo, useRef, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { View } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import {
  CaretRight,
  GlobeHemisphereWest,
  Image,
  BellSimpleRinging,
  CurrencyCircleDollar,
  Coins,
  IconProps,
} from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Icon, SelectItem, SwModal, Typography } from 'components/design-system-ui';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { savePriceCurrency } from 'messaging/index';
import { CurrencyType } from '@subwallet/extension-base/background/KoniTypes';

type SelectionItemType = {
  key: string;
  leftIcon: React.ElementType<IconProps>;
  leftIconBgColor: string;
  title: string;
  subTitle?: string;
  disabled?: boolean;
};

const containerStyle = { ...sharedStyles.layoutContainer, paddingTop: 16, gap: 8 };
export const GeneralSettings = () => {
  const theme = useSubWalletTheme().swThemes;
  const toast = useToast();
  const navigation = useNavigation<RootNavigationProps>();
  const { currency, exchangeRateMap } = useSelector((state: RootState) => state.price);
  const [iShowCurrencyModal, setIsShowCurrencyModal] = useState<boolean>(false);
  const [currencyLoading, setCurrencyLoading] = useState<boolean>(false);
  const modalRef = useRef<SWModalRefProps>(null);
  const showComingSoon = () => {
    toast.hideAll();
    toast.show(i18n.notificationMessage.comingSoon);
  };

  const openLanguageModal = () => {
    navigation.navigate('Languages');
  };

  const onGoback = () => {
    navigation.dispatch(DrawerActions.openDrawer());
    navigation.goBack();
  };

  const currencyItems = useMemo<SelectionItemType[]>(() => {
    return exchangeRateMap
      ? Object.keys(exchangeRateMap).map(item => ({
          key: item,
          leftIcon: Coins,
          leftIconBgColor: theme['yellow-5'],
          title: exchangeRateMap[item].label,
          subTitle: item,
        }))
      : [];
  }, [exchangeRateMap, theme]);

  const onSelectCurrency = useCallback((value: string) => {
    setCurrencyLoading(true);
    savePriceCurrency(value as CurrencyType).finally(() => {
      setCurrencyLoading(false);
      setIsShowCurrencyModal(false);
    });
  }, []);

  return (
    <SubScreenContainer navigation={navigation} title={i18n.header.generalSettings} onPressLeftBtn={onGoback}>
      <View style={containerStyle}>
        <SelectItem
          icon={Image}
          backgroundColor={theme['geekblue-6']}
          label={i18n.settings.walletTheme}
          onPress={showComingSoon}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />}
        />

        <SelectItem
          icon={CurrencyCircleDollar}
          backgroundColor={theme['gold-6']}
          label={i18n.settings.currency}
          onPress={() => setIsShowCurrencyModal(true)}
          rightItem={<Typography.Text style={{ color: theme.colorTextLight4 }}>{currency}</Typography.Text>}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />}
        />

        <SelectItem
          icon={GlobeHemisphereWest}
          backgroundColor={theme['green-6']}
          label={i18n.settings.language}
          onPress={openLanguageModal}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />}
        />

        <SelectItem
          icon={BellSimpleRinging}
          backgroundColor={theme['volcano-6']}
          label={i18n.settings.notifications}
          onPress={showComingSoon}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />}
        />
      </View>

      <SwModal
        isUseModalV2
        modalBaseV2Ref={modalRef}
        setVisible={setIsShowCurrencyModal}
        modalVisible={iShowCurrencyModal}
        onBackButtonPress={() => modalRef?.current?.close()}
        modalTitle={'Select a currency'}>
        <View style={{ width: '100%', gap: theme.paddingXS }}>
          {currencyItems.map(item => (
            <SelectItem
              key={item.key}
              disabled={currencyLoading}
              isSelected={currency === item.key}
              label={item.title}
              onPress={() => onSelectCurrency(item.key)}
            />
          ))}
        </View>
      </SwModal>
    </SubScreenContainer>
  );
};
