import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import { FlatListScreen } from 'components/FlatListScreen';
import { FlatListScreenPaddingTop, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { Linking, ListRenderItemInfo, Platform } from 'react-native';
import qs from 'querystring';
import reformatAddress, { PREDEFINED_TRANSAK_NETWORK } from 'utils/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import Toast from 'react-native-toast-notifications';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { ColorMap } from 'styles/color';
import { ServiceSelectItem } from 'components/ServiceSelectItem';
import ToastContainer from 'react-native-toast-notifications';
import { deviceHeight, HIDE_MODAL_DURATION } from 'constants/index';
import useAppLock from 'hooks/useAppLock';

interface Props {
  modalVisible: boolean;
  address: string;
  networkKey: string;
  networkPrefix: number;
  token?: string;
  onPressBack?: () => void;
  onChangeModalVisible: () => void;
}

const filterFunction = (items: { label: string; value: string; url: string }[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(item => item.label.toLowerCase().includes(lowerCaseSearchString));
};

const renderListEmptyComponent = () => {
  return (
    <Warning
      style={{ marginHorizontal: 16 }}
      title={i18n.warningTitle.warning}
      message={i18n.warningMessage.noServiceAvailable}
      isDanger={false}
    />
  );
};

const HOST = {
  STAGING: 'https://staging-global.transak.com',
  PRODUCTION: 'https://global.transak.com',
};

export const ServiceModal = ({
  onPressBack,
  modalVisible,
  onChangeModalVisible,
  networkKey,
  networkPrefix,
  address,
  token,
}: Props) => {
  const toastRef = useRef<ToastContainer>(null);
  const show = useCallback((text: string) => {
    if (toastRef.current) {
      // @ts-ignore
      toastRef.current.hideAll();
      // @ts-ignore
      toastRef.current.show(text);
    }
  }, []);
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const formatted = useMemo(() => {
    const networkInfo = networkMap[networkKey];
    if (address) {
      return reformatAddress(address, networkPrefix, networkInfo?.isEthereum);
    } else {
      return '';
    }
  }, [networkMap, networkKey, address, networkPrefix]);
  const { isLocked } = useAppLock();
  const url = useMemo((): string => {
    const host = HOST.PRODUCTION;

    const _network = PREDEFINED_TRANSAK_NETWORK[networkKey];

    if (!_network) {
      return '';
    }

    const networks = [..._network.networks];
    const tokenList = _network.tokens ? [..._network.tokens] : undefined;
    const defaultToken = tokenList ? tokenList[0] : undefined;

    if (token && token !== defaultToken) {
      return '';
    }

    const params = {
      apiKey: '4b3bfb00-7f7c-44b3-844f-d4504f1065be',
      defaultCryptoCurrency: defaultToken,
      cryptoCurrencyList: tokenList ? tokenList.join(',') : undefined,
      networks: networkKey !== 'shiden' ? networks.join(',') : undefined,
      walletAddress: formatted,
    };
    const query = qs.stringify(params);
    return `${host}?${query}`;
  }, [formatted, networkKey, token]);
  const [{ selectedService, isOpenInAppBrowser }, setSelectedService] = useState<{
    selectedService: string | undefined;
    isOpenInAppBrowser: boolean;
  }>({ selectedService: undefined, isOpenInAppBrowser: false });
  const SERVICE_OPTIONS = [
    { label: 'Transak', value: 'transak', url: url },
    { label: 'MoonPay', value: 'moonpay', url: '' },
    { label: 'Onramper', value: 'onramper', url: '' },
  ];
  const sleep = (timeout: number) => new Promise<void>(resolve => setTimeout(resolve, timeout));

  const openLink = useCallback(async (currentUrl: string, animated = true) => {
    try {
      if (await InAppBrowser.isAvailable()) {
        // A delay to change the StatusBar when the browser is opened
        await InAppBrowser.open(currentUrl, {
          // iOS Properties
          dismissButtonStyle: 'done',
          preferredBarTintColor: ColorMap.dark1,
          preferredControlTintColor: ColorMap.light,
          readerMode: true,
          animated,
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: true,
          toolbarColor: ColorMap.dark1,
          secondaryToolbarColor: ColorMap.dark1,
          navigationBarColor: ColorMap.dark1,
          navigationBarDividerColor: 'white',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right',
          },
          headers: {
            'my-custom-header': 'my custom header value',
          },
          hasBackButton: true,
          browserPackage: undefined,
          showInRecents: true,
          includeReferrer: true,
        });
        // A delay to show an alert when the browser is closed
        // await sleep(800);
        // if (result.type === 'cancel') {
        //   InAppBrowser.close();
        // }
        setSelectedService(prevState => ({
          ...prevState,
          isOpenInAppBrowser: false,
        }));
      } else {
        Linking.openURL(currentUrl);
      }
    } catch (error) {
      await sleep(50);
      const errorMessage = (error as Error).message || (error as string);
      console.log('error message for buy feature', errorMessage);
    }
  }, []);

  useEffect(() => {
    if (isLocked) {
      InAppBrowser.close();
    } else {
      if (selectedService && selectedService === 'transak' && !isOpenInAppBrowser && Platform.OS === 'ios') {
        setTimeout(() => openLink(url), HIDE_MODAL_DURATION);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked, openLink, selectedService, url]);

  const onPressItem = async (currentValue: string, currentUrl: string) => {
    setSelectedService({ selectedService: currentValue, isOpenInAppBrowser: true });
    if (currentUrl) {
      if (currentValue === 'transak') {
        show(i18n.common.unsupportedToken);
      } else {
        show(i18n.common.comingSoon);
      }
      await openLink(currentUrl);
    } else {
      if (currentValue === 'transak') {
        show(i18n.common.unsupportedToken);
      } else {
        show(i18n.common.comingSoon);
      }
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<{ label: string; value: string; url: string }>) => {
    return (
      <ServiceSelectItem
        url={item.url}
        serviceKey={item.value}
        serviceName={item.label}
        onPressItem={() => onPressItem(item.value, item.url)}
      />
    );
  };

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <FlatListScreen
        autoFocus={true}
        items={SERVICE_OPTIONS}
        style={FlatListScreenPaddingTop}
        title={i18n.title.serviceSelect}
        filterFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={() => {
          setSelectedService({ selectedService: undefined, isOpenInAppBrowser: false });
          onPressBack && onPressBack();
        }}
        renderListEmptyComponent={renderListEmptyComponent}
      />

      <Toast
        duration={1500}
        normalColor={ColorMap.notification}
        ref={toastRef}
        placement={'bottom'}
        offsetBottom={deviceHeight - STATUS_BAR_HEIGHT - 80}
      />
    </SubWalletFullSizeModal>
  );
};
