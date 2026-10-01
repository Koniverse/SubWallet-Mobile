import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ListChecksIcon, TrashIcon, TreeStructureIcon, XCircleIcon } from 'phosphor-react-native';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { _chainInfoToAccountChainType } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountProxy, AccountProxyType, SubstrateProxyAccountItem } from '@subwallet/extension-base/types';
import { ActivityIndicator, Button, Icon } from 'components/design-system-ui';
import { EmptyList } from 'components/EmptyList';
import { NetworkField } from 'components/Field/Network';
import { ChainSelector } from 'components/Modal/common/ChainSelector';
import { SubstrateProxyAccountSelectorItem } from 'components/SubstrateProxyAccount';
import { CURRENT_CHAIN_SUBSTRATE_PROXY } from 'constants/localStorage';
import useChainChecker from 'hooks/chain/useChainChecker';
import useCreateGetChainAndExcludedTokenByAccountProxy from 'hooks/chain/useCreateGetChainAndExcludedTokenByAccountProxy';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { getSubstrateProxyAccountGroup } from 'messaging/transaction/substrateProxy';
import { RootNavigationProps } from 'routes/index';
import { RootState } from 'stores/index';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { ChainInfo } from 'types/index';
import { ModalRef } from 'types/modalRef';
import { getReformatedAddressRelatedToChain } from 'utils/account';
import i18n from 'utils/i18n/i18n';
import { mmkvStore } from 'utils/storage';
import { getSubstrateProxyAddressKey } from 'utils/substrateProxy';

interface SubstrateProxyItemSelector extends SubstrateProxyAccountItem {
  isSelected: boolean;
}

interface Props {
  accountProxy: AccountProxy;
}

const REFRESH_INTERVAL_MS = 10_000;

export const SubstrateProxyAccountArea = ({ accountProxy }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<RootNavigationProps>();

  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const { turnOnChain, checkChainConnected } = useChainChecker();
  const getChainAndExcludedTokenByAccountProxy = useCreateGetChainAndExcludedTokenByAccountProxy();

  // Persisted so re-opening the tab lands back on the chain the user was last managing.
  const [networkSelected, setNetworkSelected] = useState<string>(
    () => mmkvStore.getString(CURRENT_CHAIN_SUBSTRATE_PROXY) || '',
  );
  const [substrateProxyAccountsSelected, setSubstrateProxyAccountsSelected] = useState<
    Record<string, SubstrateProxyItemSelector>
  >({});
  const [loading, setLoading] = useState(false);
  const chainSelectorRef = useRef<ModalRef | null>(null);

  const isReadOnly = accountProxy.accountType === AccountProxyType.READ_ONLY;

  const { allowedChains } = useMemo(
    () => getChainAndExcludedTokenByAccountProxy(accountProxy),
    [accountProxy, getChainAndExcludedTokenByAccountProxy],
  );

  // Only chains that support the proxy pallet, are usable by this account proxy, and —
  // for a multisig account — also support the multisig pallet.
  const chainItems = useMemo<ChainInfo[]>(() => {
    const result: ChainInfo[] = [];

    Object.values(chainInfoMap).forEach((c: _ChainInfo) => {
      if (!c.substrateInfo?.supportProxy || !allowedChains.includes(c.slug)) {
        return;
      }

      if (accountProxy.accountType === AccountProxyType.MULTISIG && !c.substrateInfo.supportMultisig) {
        return;
      }

      result.push({ name: c.name, slug: c.slug });
    });

    return result;
  }, [accountProxy.accountType, allowedChains, chainInfoMap]);

  const addressFormated = useMemo(() => {
    if (!networkSelected) {
      return undefined;
    }

    const chainInfoSelected = chainInfoMap[networkSelected];

    if (!chainInfoSelected?.substrateInfo) {
      return undefined;
    }

    const compatibleChainTypes = _chainInfoToAccountChainType(chainInfoSelected);
    const accountSubstrate = accountProxy.accounts.find(({ chainType }) => chainType === compatibleChainTypes);

    if (!accountSubstrate) {
      return undefined;
    }

    return getReformatedAddressRelatedToChain(accountSubstrate, chainInfoSelected);
  }, [accountProxy.accounts, chainInfoMap, networkSelected]);

  const proxyIdSet = useMemo(() => new Set(accountProxies.map(({ id }) => id)), [accountProxies]);

  // Proxies that this wallet actually holds keys for come first.
  const sortedProxyAccounts = useMemo<SubstrateProxyItemSelector[]>(() => {
    return Object.values(substrateProxyAccountsSelected).sort((a, b) => {
      const aOwned = proxyIdSet.has(a.proxyId || '') ? 1 : 0;
      const bOwned = proxyIdSet.has(b.proxyId || '') ? 1 : 0;

      return bOwned - aOwned;
    });
  }, [proxyIdSet, substrateProxyAccountsSelected]);

  const selectedProxyAccounts = useMemo(
    () => sortedProxyAccounts.filter(({ isSelected }) => isSelected),
    [sortedProxyAccounts],
  );

  // `turnOnChain` is async; querying before the chain is active makes the backend blow
  // up on `getSubstrateApi(chain).isReady` with an undefined api.
  const isChainConnected = !!networkSelected && !!checkChainConnected(networkSelected);

  const fetchProxyAccounts = useCallback(
    async (showLoading: boolean) => {
      if (!addressFormated || !networkSelected || !isChainConnected) {
        return;
      }

      if (showLoading) {
        setLoading(true);
      }

      try {
        const { substrateProxyAccounts } = await getSubstrateProxyAccountGroup({
          chain: networkSelected,
          address: addressFormated,
        });

        setSubstrateProxyAccountsSelected(prev => {
          const next: Record<string, SubstrateProxyItemSelector> = {};

          substrateProxyAccounts.forEach(p => {
            const key = getSubstrateProxyAddressKey(p.substrateProxyAddress, p.substrateProxyType);

            next[key] = { ...p, isSelected: !!prev[key]?.isSelected };
          });

          // Keep the previous object identity when the set of proxies is unchanged, so
          // the 10s refresh does not reset the user's selection or re-render the list.
          const prevKeys = Object.keys(prev);
          const nextKeys = Object.keys(next);

          if (prevKeys.length !== nextKeys.length) {
            return next;
          }

          for (const k of nextKeys) {
            if (!prev[k]) {
              return next;
            }
          }

          return prev;
        });
      } catch (e) {
        console.error(e);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [addressFormated, isChainConnected, networkSelected],
  );

  const onSelectSubstrateProxyAccount = useCallback(
    (item: SubstrateProxyAccountItem) => () => {
      const key = getSubstrateProxyAddressKey(item.substrateProxyAddress, item.substrateProxyType);

      setSubstrateProxyAccountsSelected(prev => ({
        ...prev,
        [key]: { ...item, isSelected: !prev[key]?.isSelected },
      }));
    },
    [],
  );

  const onCancelRemove = useCallback(() => {
    setSubstrateProxyAccountsSelected(prev => {
      const next: Record<string, SubstrateProxyItemSelector> = {};

      Object.keys(prev).forEach(key => {
        next[key] = { ...prev[key], isSelected: false };
      });

      return next;
    });
  }, []);

  const onAddSubstrateProxyAccount = useCallback(() => {
    if (!addressFormated || !networkSelected) {
      return;
    }

    // TransactionAction lives inside the Drawer navigator, so it has to be reached
    // through it — navigating to it directly is not handled by any navigator.
    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'AddSubstrateProxy',
        params: { chain: networkSelected, from: addressFormated, accountProxyId: accountProxy.id },
      },
    });
  }, [accountProxy.id, addressFormated, navigation, networkSelected]);

  const onRemoveSubstrateProxyAccounts = useCallback(() => {
    if (!addressFormated || !networkSelected || !selectedProxyAccounts.length) {
      return;
    }

    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'RemoveSubstrateProxy',
        params: {
          chain: networkSelected,
          from: addressFormated,
          accountProxyId: accountProxy.id,
          selectedSubstrateProxyAccounts: selectedProxyAccounts.map(
            ({ delay, proxyId, substrateProxyAddress, substrateProxyType }): SubstrateProxyAccountItem => ({
              delay,
              proxyId,
              substrateProxyAddress,
              substrateProxyType,
            }),
          ),
        },
      },
    });
  }, [accountProxy.id, addressFormated, navigation, networkSelected, selectedProxyAccounts]);

  const onSelectNetwork = useCallback(
    (item: ChainInfo) => {
      setNetworkSelected(prevState => {
        if (prevState !== item.slug) {
          setSubstrateProxyAccountsSelected({});

          return item.slug;
        }

        return prevState;
      });
      chainSelectorRef.current?.onCloseModal();
    },
    [],
  );

  // Default to the first supported chain, and recover if the current one disappears.
  useEffect(() => {
    if (!chainItems.length) {
      setNetworkSelected('');

      return;
    }

    const hasSelectedInList = chainItems.some(item => item.slug === networkSelected);

    if (!networkSelected || !hasSelectedInList) {
      setNetworkSelected(chainItems[0].slug);
    }
  }, [chainItems, networkSelected]);

  useEffect(() => {
    mmkvStore.set(CURRENT_CHAIN_SUBSTRATE_PROXY, networkSelected);
  }, [networkSelected]);

  useEffect(() => {
    if (networkSelected && !checkChainConnected(networkSelected)) {
      turnOnChain(networkSelected);
    }
  }, [checkChainConnected, networkSelected, turnOnChain]);

  useEffect(() => {
    fetchProxyAccounts(true).catch(console.error);
  }, [fetchProxyAccounts]);

  useEffect(() => {
    if (!addressFormated || !networkSelected || !isChainConnected) {
      return;
    }

    const interval = setInterval(() => {
      fetchProxyAccounts(false).catch(console.error);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [addressFormated, fetchProxyAccounts, isChainConnected, networkSelected]);

  const renderFooter = () => {
    if (!sortedProxyAccounts.length) {
      return null;
    }

    if (selectedProxyAccounts.length) {
      return (
        <View style={styles.footer}>
          <Button
            block
            style={styles.footerButton}
            type={'secondary'}
            icon={<Icon phosphorIcon={XCircleIcon} weight={'fill'} size={'lg'} />}
            onPress={onCancelRemove}>
            {i18n.substrateProxy.cancel}
          </Button>
          <Button
            block
            style={styles.footerButton}
            type={'danger'}
            icon={<Icon phosphorIcon={TrashIcon} weight={'fill'} size={'lg'} />}
            onPress={onRemoveSubstrateProxyAccounts}>
            {i18n.substrateProxy.remove}
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.footer}>
        <Button
          block
          disabled={isReadOnly}
          icon={
            <Icon
              phosphorIcon={TreeStructureIcon}
              weight={'fill'}
              size={'lg'}
              iconColor={isReadOnly ? theme.colorTextLight5 : theme.colorWhite}
            />
          }
          onPress={onAddSubstrateProxyAccount}>
          {i18n.substrateProxy.addProxy}
        </Button>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.chainSelectorWrapper}>
        <ChainSelector
          items={chainItems}
          selectedValueMap={{ [networkSelected]: true }}
          chainSelectorRef={chainSelectorRef}
          disabled={!chainItems.length}
          onSelectItem={onSelectNetwork}
          renderSelected={() => (
            <NetworkField
              networkKey={networkSelected}
              placeholder={i18n.placeholder.selectChain}
              outerStyle={styles.networkField}
              showIcon
            />
          )}
        />
      </View>

      {loading || !isChainConnected ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={32} />
        </View>
      ) : sortedProxyAccounts.length ? (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {sortedProxyAccounts.map(item => {
            const key = getSubstrateProxyAddressKey(item.substrateProxyAddress, item.substrateProxyType);

            return (
              <SubstrateProxyAccountSelectorItem
                key={key}
                substrateProxyAccount={item}
                isSelected={item.isSelected}
                showCheckedIcon={!isReadOnly}
                showUnselectIcon
                onPress={onSelectSubstrateProxyAccount(item)}
              />
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyList
            icon={ListChecksIcon}
            title={i18n.substrateProxy.noProxiesFound}
            message={i18n.substrateProxy.setupProxyAccounts}
            iconButton={TreeStructureIcon}
            addBtnLabel={isReadOnly ? undefined : i18n.substrateProxy.addProxy}
            onPressAddBtn={isReadOnly ? undefined : onAddSubstrateProxyAccount}
          />
        </View>
      )}

      {renderFooter()}
    </View>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      // The parent tab container centres its children, so the area has to claim the
      // full width itself or every row collapses to its content width.
      width: '100%',
      flex: 1,
    },
    chainSelectorWrapper: {
      width: '100%',
    },
    networkField: {
      marginBottom: 0,
    },
    list: {
      flex: 1,
      marginTop: theme.marginSM,
    },
    listContent: {
      gap: theme.sizeXS,
      paddingBottom: theme.padding,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyContainer: {
      flex: 1,
      width: '100%',
    },
    footer: {
      width: '100%',
      flexDirection: 'row',
      gap: theme.sizeSM,
      paddingTop: theme.paddingSM,
      ...MarginBottomForSubmitButton,
    },
    footerButton: {
      flex: 1,
    },
  });
}

export default SubstrateProxyAccountArea;
