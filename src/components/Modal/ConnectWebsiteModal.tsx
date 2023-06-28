import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthUrlInfo } from '@subwallet/extension-base/background/handlers/State';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { changeAuthorizationBlock, changeAuthorizationPerSite } from 'messaging/index';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { CheckCircle, GlobeHemisphereWest, ShieldCheck, ShieldSlash, XCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ConfirmationGeneralInfo } from 'components/Confirmation/ConfirmationGeneralInfo';
import { isAccountAll } from 'utils/accountAll';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import SwModal from 'components/design-system-ui/modal/SwModal';
import { ButtonPropsType } from 'components/design-system-ui/button/PropsType';
import createStylesheet from './style/ConnectWebsiteModal';

interface Props {
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  isNotConnected: boolean;
  isBlocked: boolean;
  authInfo?: AuthUrlInfo;
  url: string;
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
export const ConnectWebsiteModal = ({
  modalVisible,
  onChangeModalVisible,
  isNotConnected,
  isBlocked,
  authInfo,
  url,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);

  const [allowedMap, setAllowedMap] = useState<Record<string, boolean>>(authInfo?.isAllowedMap || {});
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const [loading, setLoading] = useState(false);
  const _isNotConnected = isNotConnected || !authInfo;

  const handlerUpdateMap = useCallback((address: string, oldValue: boolean) => {
    return () => {
      setAllowedMap(values => ({
        ...values,
        [address]: !oldValue,
      }));
    };
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
    if (!!authInfo?.isAllowedMap && !!authInfo?.accountAuthType) {
      const type = authInfo.accountAuthType;
      const _allowedMap = authInfo.isAllowedMap;

      const filterType = (address: string) => {
        if (type === 'both') {
          return true;
        }

        const _type = type || 'substrate';

        return _type === 'substrate' ? !isEthereumAddress(address) : isEthereumAddress(address);
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
  }, [authInfo?.accountAuthType, authInfo?.isAllowedMap]);

  const actionButtons = useMemo(() => {
    const cancelButton = (type?: ButtonPropsType['type']) => (
      <Button
        block
        type={type}
        icon={ButtonIconMap.XCircle}
        disabled={loading}
        style={{ flex: 1 }}
        onPress={onChangeModalVisible}>
        {'Close'}
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
            {'Unblock'}
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
          disabled={loading}
          onPress={handlerSubmit}>
          {'Confirm'}
        </Button>
      </>
    );
  }, [_isNotConnected, handlerSubmit, handlerUnblock, isBlocked, loading, onChangeModalVisible]);

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
            Not connected to this site
          </Typography.Title>
          <Typography.Text style={stylesheet.message}>
            SubWallet is not connected to this site. Please find and press in the website the "Connect Wallet" button to
            connect.
          </Typography.Text>
        </>
      );
    }

    if (isBlocked) {
      return (
        <>
          <Typography.Title level={4} style={stylesheet.title}>
            This site has been blocked
          </Typography.Title>
          <Typography.Text style={stylesheet.message}>
            This site has been previously blocked. Do you wish to unblock and grant access to it?
          </Typography.Text>
        </>
      );
    }

    const list = Object.entries(allowedMap).map(([address, value]) => ({ address, value }));

    const current = list.find(({ address }) => address === currentAccount?.address);

    if (current) {
      const idx = list.indexOf(current);

      list.splice(idx, 1);
      list.unshift(current);
    }

    return (
      <>
        <Typography.Text style={stylesheet.connectAccountMessage}>
          Your following account(s) are connected to this site
        </Typography.Text>

        <View style={stylesheet.accountsContainer}>
          {list.map(({ address, value }) => {
            const account = accounts.find(acc => acc.address === address);

            if (!account || isAccountAll(account.address)) {
              return null;
            }

            return (
              <AccountItemWithName
                accountName={account.name}
                address={account.address}
                avatarSize={24}
                isSelected={value}
                key={account.address}
                onPress={handlerUpdateMap(address, value)}
                showUnselectIcon
              />
            );
          })}
        </View>
      </>
    );
  };

  return (
    <SwModal
      modalTitle={'Connect website'}
      modalVisible={modalVisible}
      onChangeModalVisible={onChangeModalVisible}
      contentContainerStyle={stylesheet.modalContentContainerStyle}
      footer={<View style={stylesheet.footer}>{actionButtons}</View>}>
      <ScrollView style={stylesheet.scrollView}>
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
