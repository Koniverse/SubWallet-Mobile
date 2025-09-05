import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthUrlInfo, AuthUrls } from '@subwallet/extension-base/services/request-service/types';
import { Keyboard, ScrollView, TouchableOpacity, View } from 'react-native';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { changeAuthorizationBlock, changeAuthorizationPerSite } from 'messaging/index';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { CheckCircle, GlobeHemisphereWest, ShieldCheck, ShieldSlash, XCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ConfirmationGeneralInfo } from 'components/Confirmation/ConfirmationGeneralInfo';
import { isAccountAll } from 'utils/accountAll';
import SwModal from 'components/design-system-ui/modal/SwModal';
import { ButtonPropsType } from 'components/design-system-ui/button/PropsType';
import createStylesheet from './style/ConnectWebsiteModal';
import i18n from 'utils/i18n/i18n';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { convertAuthorizeTypeToChainTypes, filterAuthorizeAccountProxies } from 'utils/accountProxy';
import { isAddressAllowedWithAuthType } from 'utils/account/account';
import { AccountProxyItem } from 'components/AccountProxy/AccountProxyItem';
import { AccountProxy } from '@subwallet/extension-base/types';
import { updateAuthUrls } from 'stores/utils';
import SwitchNetworkAuthorizeModal from 'components/Modal/SwitchNetworkAuthorizeModal';
import { ModalRef } from 'types/modalRef';
import { FontSemiBold } from 'styles/sharedStyles';
import { NetworkItem } from 'components/NetworkItem';

interface Props {
  modalVisible: boolean;
  isNotConnected: boolean;
  isBlocked: boolean;
  authInfo?: AuthUrlInfo;
  url: string;
  setVisible: (arg: boolean) => void;
}

type ConnectIcon = {
  linkIcon?: React.ReactNode;
  linkIconBg?: string;
};

const ButtonIconMap = {
  XCircle: (color: string) => <Icon phosphorIcon={XCircle} size={'lg'} iconColor={color} weight={'fill'} />,
  ShieldCheck: (color: string) => <Icon phosphorIcon={ShieldCheck} size={'lg'} iconColor={color} weight={'fill'} />,
  CheckCircle: (color: string) => <Icon phosphorIcon={CheckCircle} size={'lg'} iconColor={color} weight={'fill'} />,
};

// todo: i18n;
export const ConnectWebsiteModal = ({ setVisible, modalVisible, isNotConnected, isBlocked, authInfo, url }: Props) => {
  const chainSelectorRef = useRef<ModalRef>();
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const [allowedMap, setAllowedMap] = useState<Record<string, boolean>>(authInfo?.isAllowedMap || {});
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);
  const [loading, setLoading] = useState(false);
  const _isNotConnected = isNotConnected || !authInfo;
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const isEvmAuthorize = useMemo(() => !!authInfo?.accountAuthTypes.includes('evm'), [authInfo?.accountAuthTypes]);
  const currentEvmNetworkInfo = useMemo(
    () => authInfo?.currentNetworkMap.evm && chainInfoMap[authInfo?.currentNetworkMap.evm],
    [authInfo?.currentNetworkMap.evm, chainInfoMap],
  );
  Keyboard.dismiss();

  const onChangeModalVisible = useCallback(() => modalBaseV2Ref?.current?.close(), []);

  const handlerUpdateMap = useCallback(
    (accountProxy: AccountProxy, oldValue: boolean) => {
      return () => {
        setAllowedMap(values => {
          const newValues = { ...values };

          const listAddress = accountProxy.accounts.map(({ address }) => address);

          listAddress.forEach(address => {
            const addressIsValid = isAddressAllowedWithAuthType(address, authInfo?.accountAuthTypes || []);

            addressIsValid && (newValues[address] = !oldValue);
          });

          return newValues;
        });
      };
    },
    [authInfo?.accountAuthTypes],
  );

  const onComplete = useCallback((list: AuthUrls) => {
    updateAuthUrls(list);
  }, []);

  const handlerSubmit = useCallback(() => {
    if (!loading && authInfo?.id) {
      setLoading(true);
      changeAuthorizationPerSite({ values: allowedMap, id: authInfo.id })
        .catch(e => {
          console.log('changeAuthorizationPerSite error', e);
        })
        .finally(() => {
          onChangeModalVisible();
          setLoading(false);
        });
    }
  }, [allowedMap, authInfo?.id, loading, onChangeModalVisible]);

  const handlerUnblock = useCallback(() => {
    if (!loading && authInfo?.id) {
      setLoading(true);
      changeAuthorizationBlock({ connectedValue: true, id: authInfo.id })
        .then(() => {
          setLoading(false);
        })
        .catch(console.error);
    }
  }, [authInfo?.id, loading]);

  useEffect(() => {
    if (!!authInfo?.isAllowedMap && !!authInfo?.accountAuthTypes) {
      const types = authInfo.accountAuthTypes;
      const _allowedMap = authInfo.isAllowedMap;

      const filterType = (address: string) => {
        return isAddressAllowedWithAuthType(address, types);
      };

      const result: Record<string, boolean> = {};

      Object.entries(_allowedMap)
        .filter(([address]) => filterType(address))
        .forEach(([address, value]) => {
          result[address] = value;
        });

      setAllowedMap(result);
    } else {
      setAllowedMap({});
    }
  }, [authInfo?.accountAuthTypes, authInfo?.isAllowedMap]);

  const actionButtons = useMemo(() => {
    const cancelButton = (type?: ButtonPropsType['type']) => (
      <Button
        block
        type={type}
        icon={ButtonIconMap.XCircle}
        disabled={loading}
        style={{ flex: 1 }}
        onPress={onChangeModalVisible}>
        {i18n.common.close}
      </Button>
    );

    if (_isNotConnected) {
      return cancelButton();
    }

    if (isBlocked) {
      return (
        <>
          {cancelButton('secondary')}
          <Button
            icon={ButtonIconMap.ShieldCheck}
            loading={loading}
            disabled={loading}
            onPress={handlerUnblock}
            style={{ flex: 1 }}>
            {i18n.buttonTitles.unblock}
          </Button>
        </>
      );
    }

    return (
      <>
        {cancelButton('secondary')}
        <Button
          icon={ButtonIconMap.CheckCircle}
          style={{ flex: 1 }}
          loading={loading}
          disabled={loading || Object.values(allowedMap).every(value => !value)}
          onPress={handlerSubmit}>
          {i18n.buttonTitles.confirm}
        </Button>
      </>
    );
  }, [_isNotConnected, allowedMap, handlerSubmit, handlerUnblock, isBlocked, loading, onChangeModalVisible]);

  const connectIconProps = useMemo<ConnectIcon>(() => {
    if (_isNotConnected) {
      return {
        linkIcon: <Icon size="md" phosphorIcon={GlobeHemisphereWest} />,
        linkIconBg: theme.colorWarning,
      };
    }

    if (isBlocked) {
      return {
        linkIcon: <Icon size="md" phosphorIcon={ShieldSlash} />,
        linkIconBg: theme.colorError,
      };
    }

    return {};
  }, [_isNotConnected, isBlocked, theme]);

  const renderContent = () => {
    if (_isNotConnected) {
      return (
        <>
          <Typography.Title level={4} style={stylesheet.title}>
            {i18n.confirmation.siteNotConnected}
          </Typography.Title>
          <Typography.Text style={stylesheet.message}>{i18n.confirmation.siteNotConnectedMessage}</Typography.Text>
        </>
      );
    }

    if (isBlocked) {
      return (
        <>
          <Typography.Title level={4} style={stylesheet.title}>
            {i18n.confirmation.siteBlocked}
          </Typography.Title>
          <Typography.Text style={stylesheet.message}>{i18n.confirmation.siteBlockedMessage}</Typography.Text>
        </>
      );
    }

    const listAccountProxy = filterAuthorizeAccountProxies(accountProxies, authInfo?.accountAuthTypes || []).map(
      proxy => {
        const value = proxy.accounts.some(({ address }) => allowedMap[address]);

        return {
          ...proxy,
          value,
        };
      },
    );

    const current = listAccountProxy.find(({ id }) => id === currentAccountProxy?.id);

    if (current) {
      const idx = listAccountProxy.indexOf(current);

      listAccountProxy.splice(idx, 1);
      listAccountProxy.unshift(current);
    }

    return (
      <>
        <Typography.Text style={stylesheet.connectAccountMessage}>{i18n.confirmation.siteConnected}</Typography.Text>

        <View style={{ gap: theme.sizeXS }}>
          {listAccountProxy.map(ap => {
            if (isAccountAll(ap.id)) {
              return null;
            }

            return (
              <AccountProxyItem
                key={ap.id}
                accountProxy={ap}
                chainTypes={convertAuthorizeTypeToChainTypes(authInfo?.accountAuthTypes, ap.chainTypes)}
                isSelected={ap.value}
                onPress={handlerUpdateMap(ap, ap.value)}
              />
            );
          })}
        </View>
      </>
    );
  };

  return (
    <SwModal
      isUseModalV2
      setVisible={setVisible}
      modalTitle={i18n.header.connectWebsite}
      modalVisible={modalVisible}
      titleTextAlign="center"
      isAllowSwipeDown={false}
      modalBaseV2Ref={modalBaseV2Ref}
      onBackButtonPress={onChangeModalVisible}
      contentContainerStyle={stylesheet.modalContentContainerStyle}
      footer={<View style={stylesheet.footer}>{actionButtons}</View>}>
      <ScrollView style={stylesheet.scrollView} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {isEvmAuthorize && !!currentEvmNetworkInfo && authInfo && (
          <SwitchNetworkAuthorizeModal
            selectorRef={chainSelectorRef}
            onComplete={onComplete}
            authUrlInfo={authInfo}
            onCancel={() => chainSelectorRef?.current?.onCloseModal()}
            needsTabAuthCheck={true}
            renderSelectModalBtn={(onOpenModal: React.Dispatch<React.SetStateAction<boolean>>) => {
              return (
                <View style={stylesheet.switchNetworkLabelWrapper}>
                  <Typography.Text style={{ color: theme.colorTextLight1, ...FontSemiBold }}>
                    {'Switch network'}
                  </Typography.Text>
                  <NetworkItem
                    itemName={currentEvmNetworkInfo?.name}
                    itemKey={currentEvmNetworkInfo?.slug}
                    iconSize={20}
                    onSelectNetwork={() => onOpenModal(true)}
                  />
                </View>
              );
            }}
          />
        )}
        <TouchableOpacity activeOpacity={1}>
          <ConfirmationGeneralInfo
            request={{
              id: url,
              url: url,
            }}
            {...connectIconProps}
          />
          {renderContent()}
        </TouchableOpacity>
      </ScrollView>
    </SwModal>
  );
};
