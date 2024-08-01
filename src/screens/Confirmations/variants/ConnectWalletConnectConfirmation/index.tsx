import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { WalletConnectSessionRequest } from '@subwallet/extension-base/services/wallet-connect-service/types';
import { approveWalletConnectSession, rejectWalletConnectSession } from 'messaging/index';
import { isAccountAll } from 'utils/accountAll';
import {
  WALLET_CONNECT_EIP155_NAMESPACE,
  WALLET_CONNECT_POLKADOT_NAMESPACE,
} from '@subwallet/extension-base/services/wallet-connect-service/constants';
import useSelectWalletConnectAccount from 'hooks/wallet-connect/useSelectWalletConnectAccount';
import { VoidFunction } from 'types/index';
import { useToast } from 'react-native-toast-notifications';
import { convertKeyTypes } from 'utils/index';
import { RootStackParamList } from 'routes/index';
import ConfirmationContent from '../../../../components/common/Confirmation/ConfirmationContent';
import ConfirmationGeneralInfo from '../../../../components/common/Confirmation/ConfirmationGeneralInfo';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { View } from 'react-native';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { ConfirmationFooter } from 'components/common/Confirmation';
import { CheckCircle, PlusCircle, XCircle } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { WCNetworkSelected } from 'components/WalletConnect/Network/WCNetworkSelected';
import { WCAccountSelect } from 'components/WalletConnect/Account/WCAccountSelect';
import createStyle from './styles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { WCNetworkSupported } from 'components/WalletConnect/Network/WCNetworkSupported';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { Minimizer } from '../../../../NativeModules';
import { updateIsDeepLinkConnect } from 'stores/base/Settings';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AddNetworkWCModal } from 'components/WalletConnect/Network/AddNetworkWCModal';
import { detectChanInfo } from 'utils/fetchNetworkByChainId';
import { useHandleInternetConnectionForConfirmation } from 'hooks/useHandleInternetConnectionForConfirmation';

interface Props {
  request: WalletConnectSessionRequest;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const handleConfirm = async ({ id }: WalletConnectSessionRequest, selectedAccounts: string[]) => {
  return await approveWalletConnectSession({
    id,
    accounts: selectedAccounts.filter(item => !isAccountAll(item)),
  });
};

const handleCancel = async ({ id }: WalletConnectSessionRequest) => {
  return await rejectWalletConnectSession({
    id,
  });
};

export const ConnectWalletConnectConfirmation = ({ request, navigation }: Props) => {
  const { params } = request.request;
  const toast = useToast();
  const { hasMasterPassword } = useSelector((state: RootState) => state.accountState);
  const { isDeepLinkConnect } = useSelector((state: RootState) => state.settings);
  const nameSpaceNameMap = useMemo(
    (): Record<string, string> => ({
      [WALLET_CONNECT_EIP155_NAMESPACE]: i18n.common.evmNetworks,
      [WALLET_CONNECT_POLKADOT_NAMESPACE]: i18n.common.substrateNetworks,
    }),
    [],
  );
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const dispatch = useDispatch();
  const [addNetworkModalVisible, setAddNetworkModalVisible] = useState(false);
  const [blockAddNetwork, setBlockAddNetwork] = useState(false);
  const [networkNeedToImport, setNetworkNeedToImport] = useState<string[]>([]);

  const {
    isExitedAnotherUnsupportedNamespace,
    isExpired,
    isUnSupportCase,
    missingType,
    noNetwork,
    namespaceAccounts,
    onApplyAccounts,
    onCancelSelectAccounts,
    onSelectAccount,
    supportOneChain,
    supportOneNamespace,
    supportedChains,
  } = useSelectWalletConnectAccount(params);

  const allowSubmit = useMemo(() => {
    return Object.values(namespaceAccounts).every(({ appliedAccounts }) => appliedAccounts.length);
  }, [namespaceAccounts]);

  const [loading, setLoading] = useState(false);
  const checkNetworksConnected = useMemo((): string[] => {
    let needConnectedNetwork: string[] = [];

    Object.values(namespaceAccounts).forEach(value => {
      const { networks } = value;
      const [unsupportedNetworks, supportedNetworks] = networks.reduce<[string[], string[]]>(
        ([unsupportedNetworks_, supportedNetworks_], { slug, supported }) => {
          if (supported) {
            supportedNetworks_.push(slug);
          } else {
            const chainData = slug.split(':');

            if (chainData.length > 1) {
              const [namespace, chainId] = chainData;

              if (namespace === WALLET_CONNECT_EIP155_NAMESPACE) {
                unsupportedNetworks_.push(chainId);
              } else if (namespace === WALLET_CONNECT_POLKADOT_NAMESPACE) {
                setBlockAddNetwork(true);
              }
            }
          }

          return [unsupportedNetworks_, supportedNetworks_];
        },
        [[], []],
      );

      // When the network to be imported is a required network, only one network import is allowed.
      if (isUnSupportCase && unsupportedNetworks.length === 1) {
        needConnectedNetwork = [...unsupportedNetworks];
      } else if (!isUnSupportCase && supportedNetworks.length === 0) {
        // When networks to be imported are optional networks, and only allow the import if there is no network required by the Dapp that the extension supports.
        needConnectedNetwork = [...unsupportedNetworks];
      }
    });

    return needConnectedNetwork;
  }, [isUnSupportCase, namespaceAccounts]);
  const _onSelectAccount = useCallback(
    (namespace: string): ((address: string, applyImmediately?: boolean) => VoidFunction) => {
      return (address: string, applyImmediately = false) => {
        return () => {
          onSelectAccount(namespace, address, applyImmediately)();
        };
      };
    },
    [onSelectAccount],
  );

  const onCancel = useCallback(() => {
    setLoading(true);
    handleCancel(request).finally(() => {
      setLoading(false);
      dispatch(updateIsDeepLinkConnect(false));
    });
  }, [dispatch, request]);

  const onConfirm = useCallback(() => {
    setLoading(true);
    const selectedAccounts = Object.values(namespaceAccounts)
      .map(({ appliedAccounts }) => appliedAccounts)
      .flat();

    handleConfirm(request, selectedAccounts)
      .then(() => {
        toast.show(i18n.message.connectSuccessfully, { type: 'success' });
        isDeepLinkConnect && Minimizer.goBack();
      })
      .catch(e => {
        toast.show((e as Error).message, { type: 'danger' });
      })
      .finally(() => {
        dispatch(updateIsDeepLinkConnect(false));
        setLoading(false);
      });
  }, [dispatch, isDeepLinkConnect, namespaceAccounts, request, toast]);

  const onAddAccount = useCallback(() => {
    if (hasMasterPassword) {
      navigation.replace('CreateAccount', { keyTypes: convertKeyTypes(missingType), isBack: true });
    } else {
      navigation.replace('CreatePassword', { pathName: 'CreateAccount', state: convertKeyTypes(missingType) });
    }
  }, [hasMasterPassword, missingType, navigation]);

  const onApplyModal = useCallback(
    (namespace: string) => {
      return () => {
        onApplyAccounts(namespace);
      };
    },
    [onApplyAccounts],
  );

  const onCancelModal = useCallback(
    (namespace: string) => {
      return () => {
        onCancelSelectAccounts(namespace);
      };
    },
    [onCancelSelectAccounts],
  );

  const isSupportCase = !isUnSupportCase && !isExpired;

  useEffect(() => {
    if (checkNetworksConnected.length > 0 && !blockAddNetwork && !isExitedAnotherUnsupportedNamespace) {
      detectChanInfo(checkNetworksConnected)
        .then(rs => {
          if (rs) {
            setNetworkNeedToImport([rs]);
            setAddNetworkModalVisible(true);
          } else {
            setBlockAddNetwork(true);
          }
        })
        .catch(() => {
          setBlockAddNetwork(true);
        });
    }
  }, [blockAddNetwork, checkNetworksConnected, isExitedAnotherUnsupportedNamespace]);

  useHandleInternetConnectionForConfirmation(onCancel);

  return (
    <React.Fragment>
      <ConfirmationContent>
        <ConfirmationGeneralInfo request={request} gap={0} />
        {(isUnSupportCase || blockAddNetwork) && (
          <View>
            <View style={{ paddingBottom: 8 }}>
              <AlertBox
                title={i18n.warningTitle.unsupportedNetworkTitle}
                description={i18n.warningMessage.unsupportedNetworkMessage}
                type={'warning'}
              />
            </View>

            <WCNetworkSupported networks={supportedChains} />
          </View>
        )}
        {!isUnSupportCase && isExpired && !noNetwork && (
          <>
            <AlertBox
              description={i18n.warningMessage.expiredConnectionMessage}
              title={i18n.warningTitle.expiredConnectionTitle}
              type="warning"
            />
          </>
        )}
        {isSupportCase && !blockAddNetwork && (
          <View style={{ gap: theme.padding }}>
            {Object.entries(namespaceAccounts).map(([namespace, value]) => {
              const { appliedAccounts, availableAccounts, networks, selectedAccounts } = value;

              return (
                <View key={namespace}>
                  {!supportOneChain && (
                    <>
                      <Typography.Text style={styles.text}>
                        {supportOneNamespace ? i18n.common.networks : nameSpaceNameMap[namespace]}
                      </Typography.Text>
                      <WCNetworkSelected networks={networks} />
                    </>
                  )}
                  {supportOneNamespace && (
                    <Typography.Text style={styles.text}>{i18n.common.chooseAccount}</Typography.Text>
                  )}

                  <WCAccountSelect
                    selectedAccounts={selectedAccounts}
                    appliedAccounts={appliedAccounts}
                    availableAccounts={availableAccounts}
                    useModal={!supportOneNamespace}
                    onApply={onApplyModal(namespace)}
                    onCancel={onCancelModal(namespace)}
                    onSelectAccount={_onSelectAccount(namespace)}
                    namespace={namespace}
                  />
                </View>
              );
            })}
          </View>
        )}
        {noNetwork && (
          <AlertBox
            description={'We are unable to detect any network from the dApp through WalletConnect'}
            title={'Network undetected'}
            type="warning"
          />
        )}
      </ConfirmationContent>
      <ConfirmationFooter>
        {!isSupportCase && (
          <Button
            style={{ width: '100%' }}
            disabled={loading}
            icon={
              <Icon
                phosphorIcon={XCircle}
                weight={'fill'}
                iconColor={loading ? theme.colorTextLight5 : theme.colorWhite}
              />
            }
            onPress={onCancel}
            type={'secondary'}>
            {i18n.buttonTitles.cancel}
          </Button>
        )}
        {isSupportCase && !missingType.length && (
          <>
            <Button
              block
              disabled={loading}
              icon={color => <Icon phosphorIcon={XCircle} weight={'fill'} iconColor={color} />}
              onPress={onCancel}
              type={'secondary'}>
              {i18n.buttonTitles.cancel}
            </Button>
            <Button
              block
              disabled={!allowSubmit || loading}
              loading={loading}
              icon={color => <Icon phosphorIcon={CheckCircle} weight={'fill'} iconColor={color} />}
              onPress={onConfirm}>
              {i18n.buttonTitles.approve}
            </Button>
          </>
        )}
        {isSupportCase && !!missingType.length && (
          <>
            <Button
              block
              disabled={loading}
              icon={<Icon phosphorIcon={XCircle} weight={'fill'} />}
              onPress={onCancel}
              type={'secondary'}>
              {i18n.buttonTitles.cancel}
            </Button>
            <Button
              block
              disabled={loading}
              icon={<Icon phosphorIcon={PlusCircle} weight={'fill'} />}
              onPress={onAddAccount}>
              {i18n.buttonTitles.createOne}
            </Button>
          </>
        )}
      </ConfirmationFooter>
      <AddNetworkWCModal
        networkToAdd={networkNeedToImport}
        setVisible={setAddNetworkModalVisible}
        visible={addNetworkModalVisible}
        cancelRequest={onCancel}
        requestId={request.id}
      />
    </React.Fragment>
  );
};
