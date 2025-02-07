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
  IconProps,
} from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Icon, SelectItem, SwModal, Typography, Image as SwImage } from 'components/design-system-ui';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { savePriceCurrency } from 'messaging/index';
import { CurrencyJson, CurrencyType } from '@subwallet/extension-base/background/KoniTypes';
import { staticData, StaticKey } from '@subwallet/extension-base/utils/staticData';
import { getCurrencySymbol } from 'utils/currency';
import { ImageLogosMap } from 'assets/logo';

type SelectionItemType = {
  key: string;
  leftIcon: React.ElementType<IconProps> | string;
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
  const { currency } = useSelector((state: RootState) => state.price);
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

  // const openNotificationSetting = useCallback(() => {
  //   navigation.navigate('NotificationSetting');
  // }, [navigation]);

  const onGoback = () => {
    navigation.dispatch(DrawerActions.openDrawer());
    navigation.goBack();
  };

  const staticDataCurrencySymbol = useMemo<Record<string, CurrencyJson> | undefined>(() => {
    return staticData[StaticKey.CURRENCY_SYMBOL] as Record<string, CurrencyJson>;
  }, []);

  const currencyItems = useMemo<SelectionItemType[]>(() => {
    return staticDataCurrencySymbol
      ? Object.keys(staticDataCurrencySymbol).map(item => ({
          key: item,
          leftIcon: getCurrencySymbol(item).icon,
          leftIconBgColor: theme.colorBgBorder,
          title: `${item} - ${staticDataCurrencySymbol[item].label}`,
          subTitle: staticDataCurrencySymbol[item].symbol,
        }))
      : [];
  }, [staticDataCurrencySymbol, theme]);

  const onSelectCurrency = useCallback((value: string) => {
    setCurrencyLoading(true);
    savePriceCurrency(value as CurrencyType).finally(() => {
      setCurrencyLoading(false);
      setIsShowCurrencyModal(false);
    });
  }, []);

  const getSymbolIcon = useCallback(
    (item: SelectionItemType) => {
      const getURLSymbol = (() => {
        if (typeof item.leftIcon === 'string') {
          return `currency_${item.leftIcon.toLowerCase()}`;
        }

        return undefined;
      })();

      // @ts-ignore
      const logoSrc = getURLSymbol ? ImageLogosMap[getURLSymbol] : undefined;

      return (
        <View
          style={{
            backgroundColor: 'rgba(217, 217, 217, 0.1)',
            borderRadius: theme.borderRadiusLG,
            width: 28,
            height: 28,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {typeof item.leftIcon === 'string' ? (
            <SwImage src={logoSrc} style={{ width: 20, height: 20 }} />
          ) : (
            <Icon phosphorIcon={item.leftIcon} size={'sm'} weight={'fill'} />
          )}
        </View>
      );
    },
    [theme.borderRadiusLG],
  );

  // @ts-ignore
  return (
    <SubScreenContainer navigation={navigation} title={i18n.header.generalSettings} onPressLeftBtn={onGoback}>
      <View style={containerStyle}>
        <SelectItem
          icon={Image}
          backgroundColor={theme['geekblue-6']}
          label={i18n.settings.walletTheme}
          onPress={showComingSoon}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme['gray-5']} />}
        />

        <SelectItem
          icon={CurrencyCircleDollar}
          backgroundColor={theme['gold-6']}
          label={i18n.settings.currency}
          onPress={() => setIsShowCurrencyModal(true)}
          rightItem={<Typography.Text style={{ color: theme.colorTextLight4 }}>{currency}</Typography.Text>}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme['gray-5']} />}
        />

        <SelectItem
          icon={GlobeHemisphereWest}
          backgroundColor={theme['green-6']}
          label={i18n.settings.language}
          onPress={openLanguageModal}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme['gray-5']} />}
        />

        <SelectItem
          icon={BellSimpleRinging}
          backgroundColor={theme['magenta-7']}
          label={'In-app notifications'}
          onPress={showComingSoon}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme['gray-5']} />}
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
              wrapperStyle={{ backgroundColor: 'transparent' }}
              leftItemIcon={getSymbolIcon(item)}
              key={item.key}
              disabled={currencyLoading}
              wrapperDisableStyle={{ opacity: 1 }}
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
