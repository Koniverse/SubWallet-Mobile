import React, { ForwardedRef, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Image, Linking, ListRenderItemInfo, Platform } from 'react-native';
import qs from 'querystring';
import reformatAddress from 'utils/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import Toast from 'react-native-toast-notifications';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { ColorMap } from 'styles/color';
import { ServiceSelectItem } from 'components/ServiceSelectItem';
import ToastContainer from 'react-native-toast-notifications';
import { deviceHeight, HIDE_MODAL_DURATION, TOAST_DURATION } from 'constants/index';
import useAppLock from 'hooks/useAppLock';
import { PREDEFINED_TRANSAK_TOKEN } from '../../../predefined/transak';
import { _getChainSubstrateAddressPrefix } from '@subwallet/extension-base/services/chain-service/utils';
import { ImageLogosMap } from 'assets/logo';
import { FullSizeSelectModal } from 'components/common/SelectModal';

interface Props {
  address: string;
  token: string;
  ref?: React.Ref<any>;
}

const filterFunction = (items: { label: string; value: string; url: string }[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(item => item.label.toLowerCase().includes(lowerCaseSearchString));
};

const HOST = {
  STAGING: 'https://staging-global.transak.com',
  PRODUCTION: 'https://global.transak.com',
};

const tokenKeyMapIsEthereum: Record<string, boolean> = (() => {
  const result: Record<string, boolean> = {};

  Object.values(PREDEFINED_TRANSAK_TOKEN).forEach(info => {
    result[info.slug] = info.support === 'ETHEREUM';
  });

  return result;
})();

function _ServiceModal({ address, token }: Props, ref: ForwardedRef<any>) {
  const toastRef = useRef<ToastContainer>(null);
  const show = useCallback((text: string) => {
    if (toastRef.current) {
      // @ts-ignore
      toastRef.current.hideAll();
      // @ts-ignore
      toastRef.current.show(text);
    }
  }, []);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const networkPrefix = useMemo(() => {
    const chain = PREDEFINED_TRANSAK_TOKEN[token].chain;
    return _getChainSubstrateAddressPrefix(chainInfoMap[chain]);
  }, [chainInfoMap, token]);

  const formatted = useMemo(() => {
    return tokenKeyMapIsEthereum[token]
      ? address
      : reformatAddress(address, networkPrefix === undefined ? -1 : networkPrefix);
  }, [token, address, networkPrefix]);
  const { isLocked } = useAppLock();

  const url = useMemo((): string => {
    const host = HOST.PRODUCTION;
    if (!token || !PREDEFINED_TRANSAK_TOKEN[token]) {
    }

    const { symbol, transakNetwork } = PREDEFINED_TRANSAK_TOKEN[token];

    const params = {
      apiKey: '4b3bfb00-7f7c-44b3-844f-d4504f1065be',
      defaultCryptoCurrency: symbol,
      networks: transakNetwork,
      cryptoCurrencyList: symbol,
      walletAddress: formatted,
    };
    const query = qs.stringify(params);
    return `${host}?${query}`;
  }, [formatted, token]);

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
      if (currentValue !== 'transak') {
        show(i18n.notificationMessage.comingSoon);
      }
      await openLink(currentUrl);
    } else {
      if (currentValue === 'transak') {
        show(i18n.common.unsupportedToken);
      } else {
        show(i18n.notificationMessage.comingSoon);
      }
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<{ label: string; value: string; url: string }>) => {
    let logo = <Image source={ImageLogosMap.transak} style={{ width: 24, height: 24 }} />;

    if (item.value === 'moonpay') {
      logo = <Image source={ImageLogosMap.moonpay} style={{ width: 24, height: 24 }} />;
    }

    if (item.value === 'onramper') {
      logo = <Image source={ImageLogosMap.onramper} style={{ width: 24, height: 24 }} />;
    }

    return (
      <ServiceSelectItem
        url={item.url}
        logo={logo}
        serviceName={item.label}
        onPressItem={() => onPressItem(item.value, item.url)}
      />
    );
  };

  return (
    <FullSizeSelectModal
      items={SERVICE_OPTIONS}
      selectedValueMap={{}}
      title={i18n.title.serviceSelect}
      renderCustomItem={renderItem}
      searchFunc={filterFunction}
      closeModalAfterSelect={false}
      selectModalType={'single'}
      isShowInput={false}
      ref={ref}>
      <Toast
        duration={TOAST_DURATION}
        normalColor={ColorMap.notification}
        ref={toastRef}
        placement={'bottom'}
        offsetBottom={deviceHeight - STATUS_BAR_HEIGHT - 80}
      />
    </FullSizeSelectModal>
  );
}

export const ServiceModal = forwardRef(_ServiceModal);
