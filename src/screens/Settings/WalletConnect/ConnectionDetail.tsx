import React, { useMemo, useRef, useState } from 'react';
import { useToast } from 'react-native-toast-notifications';
import { stripUrl } from '@subwallet/extension-base/utils';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import MetaInfo from 'components/MetaInfo';
import { Button, Icon, Image, SwModal, Typography } from 'components/design-system-ui';
import { WCNetworkAvatarGroup } from 'components/WalletConnect/Network/WCNetworkAvatarGroup';
import { WalletConnectChainInfo } from 'types/walletConnect';
import { chainsToWalletConnectChainInfos, getWCAccountList } from 'utils/walletConnect';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { ConnectDetailProps, RootNavigationProps } from 'routes/index';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium } from 'styles/sharedStyles';
import { AbstractAddressJson } from '@subwallet/extension-base/background/types';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import i18n from 'utils/i18n/i18n';
import { Globe, Info, Plugs } from 'phosphor-react-native';
import DeleteModal from 'components/common/Modal/DeleteModal';
import { disconnectWalletConnectConnection } from 'messaging/index';
import { EmptyList } from 'components/EmptyList';
import { SessionTypes } from '@walletconnect/types';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { WCNetworkItem } from 'components/WalletConnect/Network/WCNetworkItem';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

export const ConnectionDetail = ({
  route: {
    params: { topic },
  },
}: ConnectDetailProps) => {
  const { sessions } = useSelector((state: RootState) => state.walletConnect);
  const theme = useSubWalletTheme().swThemes;
  const currentSession: SessionTypes.Struct = sessions[topic];
  const networkDetailModalRef = useRef<SWModalRefProps>(null);

  const navigation = useNavigation<RootNavigationProps>();
  const toast = useToast();
  const [disconnectModalVisible, setDisconnectModalVisible] = useState<boolean>(false);
  const [networkModalVisible, setNetworkModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { accounts } = useSelector((state: RootState) => state.accountState);

  const domain = useMemo(() => {
    if (currentSession) {
      const _dAppInfo = currentSession.peer.metadata;
      try {
        return stripUrl(_dAppInfo.url);
      } catch (e) {
        return _dAppInfo.url;
      }
    }
  }, [currentSession]);

  const accountItems = useMemo(
    (): AbstractAddressJson[] => (currentSession ? getWCAccountList(accounts, currentSession.namespaces) : []),
    [accounts, currentSession],
  );

  const chains = useMemo((): WalletConnectChainInfo[] => {
    if (currentSession) {
      const _chains = Object.values(currentSession.namespaces)
        .map(namespace => namespace.chains || [])
        .flat();

      return chainsToWalletConnectChainInfos(chainInfoMap, _chains);
    } else {
      return [];
    }
  }, [currentSession, chainInfoMap]);

  const connectedChainsMap = useMemo(() => {
    return chains.reduce((o, key) => Object.assign(o, { [key.slug]: key.supported }), {});
  }, [chains]);

  const img = `https://icons.duckduckgo.com/ip2/${domain}.ico`;

  const onDisconnect = () => {
    setLoading(true);
    disconnectWalletConnectConnection(topic)
      .catch(() => {
        toast.show('Fail to disconnect', { type: 'danger' });
      })
      .finally(() => {
        setLoading(false);
        setDisconnectModalVisible(false);
        navigation.navigate('ConnectList', { isDelete: true });
      });
  };

  return (
    <ContainerWithSubHeader
      disabled={loading}
      onPressBack={() => navigation.goBack()}
      title={i18n.header.walletConnect}>
      <>
        {Object.keys(sessions) && Object.keys(sessions).length ? (
          <>
            <ScrollView
              style={{ paddingHorizontal: theme.padding, marginTop: 16, flex: 1 }}
              keyboardShouldPersistTaps={'handled'}
              showsVerticalScrollIndicator={false}>
              <MetaInfo hasBackgroundWrapper>
                <MetaInfo.Default label={i18n.inputLabel.dApp}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 24 }}>
                    <Image src={img} shape={'circle'} style={{ width: 20, height: 20 }} />
                    <Typography.Text ellipsis style={{ ...FontMedium, color: theme.colorTextTertiary }}>
                      {domain}
                    </Typography.Text>
                  </View>
                </MetaInfo.Default>
                <MetaInfo.Default label={i18n.inputLabel.network}>
                  <TouchableOpacity
                    activeOpacity={BUTTON_ACTIVE_OPACITY}
                    onPress={() => setNetworkModalVisible(true)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <WCNetworkAvatarGroup networks={chains} />
                    <Typography.Text
                      ellipsis
                      style={{
                        ...FontMedium,
                        color: theme.colorTextTertiary,
                      }}>
                      {i18n.message.connectedNetworks(chains.length)}
                    </Typography.Text>
                    <Icon phosphorIcon={Info} weight={'fill'} size={'sm'} iconColor={theme.colorTextTertiary} />
                  </TouchableOpacity>
                </MetaInfo.Default>
              </MetaInfo>

              <Typography.Text
                style={{
                  ...FontMedium,
                  color: theme.colorTextTertiary,
                  paddingTop: theme.padding,
                  paddingBottom: theme.paddingXXS,
                }}>
                {i18n.message.connectedAccounts(accountItems.length)}
              </Typography.Text>

              <View style={{ gap: theme.paddingXS }}>
                {accountItems.map(item => (
                  <AccountItemWithName key={item.address} address={item.address} accountName={item?.name} />
                ))}
              </View>
            </ScrollView>
            <Button
              onPress={() => setDisconnectModalVisible(true)}
              icon={<Icon phosphorIcon={Plugs} size={'lg'} weight={'fill'} />}
              style={{ margin: theme.padding }}
              type={'danger'}>
              {i18n.buttonTitles.disconnect}
            </Button>

            <DeleteModal
              title={i18n.header.disconnect}
              visible={disconnectModalVisible}
              message={i18n.message.disconnectModalMessage}
              onCompleteModal={onDisconnect}
              buttonTitle={i18n.buttonTitles.disconnect}
              buttonIcon={Plugs}
              loading={loading}
              setVisible={setDisconnectModalVisible}
            />

            <SwModal
              isUseModalV2
              modalBaseV2Ref={networkDetailModalRef}
              modalVisible={networkModalVisible}
              modalTitle={i18n.header.connectedNetworks}
              setVisible={setNetworkModalVisible}>
              <View style={{ width: '100%', gap: 8 }}>
                {chains.map(chain => (
                  <WCNetworkItem key={chain.slug} item={chain} selectedValueMap={connectedChainsMap} />
                ))}
              </View>
            </SwModal>
          </>
        ) : (
          <EmptyList
            title={i18n.emptyScreen.walletConnectDetailEmptyTitle}
            icon={Globe}
            message={i18n.emptyScreen.walletConnectEmptyDetailMessage}
          />
        )}
      </>
    </ContainerWithSubHeader>
  );
};
