import React, { useEffect, useMemo, useState } from 'react';
import i18n from 'utils/i18n/i18n';
import { Image, ListRenderItemInfo, Platform } from 'react-native';
import qs from 'querystring';
import reformatAddress from 'utils/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { ServiceSelectItem } from 'components/ServiceSelectItem';
import { HIDE_MODAL_DURATION } from 'constants/index';
import useAppLock from 'hooks/useAppLock';
import { PREDEFINED_TRANSAK_TOKEN, PREDEFINED_TRANSAK_TOKEN_BY_SLUG } from '../../../predefined/transak';
import { _getChainSubstrateAddressPrefix } from '@subwallet/extension-base/services/chain-service/utils';
import { ImageLogosMap } from 'assets/logo';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';
import { ServiceSelectField } from 'components/Field/ServiceSelect';

interface Props {
  address?: string;
  token?: string;
  serviceRef?: React.MutableRefObject<ModalRef | undefined>;
  disabled?: boolean;
  onPressItem: (currentValue: string, currentUrl: string) => void;
  selectedService?: string;
  isOpenInAppBrowser: boolean;
  onBuyToken: (currentUrl?: string, animated?: boolean) => Promise<void>;
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

export const ServiceModal = ({
  address,
  token,
  serviceRef,
  disabled,
  onPressItem,
  selectedService,
  isOpenInAppBrowser,
  onBuyToken,
}: Props) => {
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const [isCloseByLockScreen, setIsCloseBuyLockScreen] = useState(false);
  const networkPrefix = useMemo(() => {
    if (!token) {
      return -1;
    }

    const chain = PREDEFINED_TRANSAK_TOKEN_BY_SLUG[token].chain;
    return _getChainSubstrateAddressPrefix(chainInfoMap[chain]);
  }, [chainInfoMap, token]);

  const formatted = useMemo(() => {
    if (!token || !address) {
      return '';
    }

    return tokenKeyMapIsEthereum[token]
      ? address
      : reformatAddress(address, networkPrefix === undefined ? -1 : networkPrefix);
  }, [token, address, networkPrefix]);
  const { isLocked } = useAppLock();

  const url = useMemo((): string => {
    const host = HOST.PRODUCTION;
    if (!token || !PREDEFINED_TRANSAK_TOKEN_BY_SLUG[token]) {
      return '';
    }

    const { symbol, transakNetwork } = PREDEFINED_TRANSAK_TOKEN_BY_SLUG[token];

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

  const SERVICE_OPTIONS = useMemo(
    () => [
      { label: 'Transak', value: 'transak', url: url, icon: ImageLogosMap.transak },
      { label: 'MoonPay (Coming soon)', value: 'moonpay', url: '', icon: ImageLogosMap.moonpay },
      { label: 'Onramper (Coming soon)', value: 'onramper', url: '', icon: ImageLogosMap.onramper },
    ],
    [url],
  );

  const selectedValue = useMemo(() => {
    return SERVICE_OPTIONS.find(ser => ser.value === selectedService);
  }, [SERVICE_OPTIONS, selectedService]);

  useEffect(() => {
    if (isLocked) {
      setIsCloseBuyLockScreen(true);
      InAppBrowser.close();
    } else {
      if (
        selectedService &&
        selectedService === 'transak' &&
        !isOpenInAppBrowser &&
        Platform.OS === 'ios' &&
        isCloseByLockScreen
      ) {
        setTimeout(() => onBuyToken(url), HIDE_MODAL_DURATION);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked, onBuyToken, selectedService, url, isCloseByLockScreen]);

  useEffect(() => {
    onPressItem('transak', url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const renderItem = ({ item }: ListRenderItemInfo<{ label: string; value: string; url: string; icon: any }>) => {
    return (
      <ServiceSelectItem
        url={item.url}
        logo={<Image source={item.icon} style={{ width: 24, height: 24 }} />}
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
      disabled={disabled}
      renderSelected={() => (
        <ServiceSelectField
          source={selectedValue ? selectedValue.icon : ''}
          serviceName={selectedValue ? selectedValue.label : ''}
          value={selectedService || ''}
          showIcon
        />
      )}
      ref={serviceRef}
    />
  );
};
