import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, ListRenderItemInfo } from 'react-native';
import { FlatListScreen } from 'components/FlatListScreen';
import usePreviewYieldGroupInfo from 'hooks/earning/usePreviewYieldGroupInfo';
import { DataContext } from 'providers/DataContext';
import { NominationPoolInfo, YieldPoolInfo, YieldPoolTarget, YieldPoolType } from '@subwallet/extension-base/types';
import { fetchStaticCache } from '@subwallet/extension-base/utils/fetchStaticCache';
import { LoadingScreen } from 'screens/LoadingScreen';
import { YieldGroupInfo } from 'types/earning';
import EarningGroupItem from 'components/Item/Earning/EarningGroupItem';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { EarningPreviewProps, RootNavigationProps } from 'routes/index';
import { EarningValidatorDetailRWModal } from 'components/Modal/Earning/EarningValidatorDetailRWModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { fetchPoolTarget, saveCurrentAccountAddress } from 'messaging/index';
import { isAccountAll } from 'utils/accountAll';
import { getValidatorKey } from 'utils/transaction/stake';
import { ValidatorInfo } from '@subwallet/extension-base/types/yield/info/chain/target';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { getFilteredAccount } from '../../AppNavigator';
import { analysisAccounts } from 'hooks/screen/Home/Crypto/useGetChainSlugsByAccountType';
import { EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import { useHandleChainConnection } from 'hooks/earning/useHandleChainConnection';
import { isRelatedToAstar } from 'utils/earning';
import { isLendingPool, isLiquidPool } from '@subwallet/extension-base/services/earning-service/utils';
import { GettingDataModal } from 'components/Modal/GettingDataModal';
import { KeypairType } from '@polkadot/util-crypto/types';
import { useNavigation } from '@react-navigation/native';

interface EarningPreviewScreen {
  poolInfoMap: Record<string, YieldPoolInfo>;
  chainParam: string;
  targetParam: string;
  typeParam: YieldPoolType | undefined;
}

const groupOrdinal = (group: YieldGroupInfo): number => {
  if (group.group === 'DOT-Polkadot') {
    return 2;
  } else if (group.group === 'KSM-Kusama') {
    return 1;
  } else {
    return 0;
  }
};

const testnetOrdinal = (group: YieldGroupInfo): number => {
  return group.isTestnet ? 0 : 1;
};

const balanceOrdinal = (group: YieldGroupInfo): number => {
  return group.balance.value.toNumber();
};

const apyOrdinal = (group: YieldGroupInfo): number => {
  return !group.maxApy ? -1 : group.maxApy;
};

const getPoolInfoByChainAndType = (
  poolInfoMap: Record<string, YieldPoolInfo>,
  chain: string,
  type: YieldPoolType,
): YieldPoolInfo | undefined => {
  return Object.values(poolInfoMap).find(item => item.chain === chain && item.type === type);
};

const getStartEarningUrl = (slug: string, target: string) => {
  return `subwallet://drawer/transaction-action/earning?slug=${slug}&target=${target}&redirectFromPreview=true`;
};

const getEarningListUrl = (chain: string, accountType: KeypairType) => {
  return `subwallet://home/main/earning/earning-list?chain=${chain}&noAccountValid=true&accountType=${accountType}`;
};

const EarningPreviewScreen = ({ poolInfoMap, targetParam, typeParam, chainParam }: EarningPreviewScreen) => {
  const theme = useSubWalletTheme().swThemes;
  const data = usePreviewYieldGroupInfo(poolInfoMap);
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const { accounts, currentAccount, isNoAccount } = useSelector((state: RootState) => state.accountState);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [validator, setValidator] = useState<YieldPoolTarget>();
  const [selectedPoolInfoSlug, setSelectedPoolInfoSlug] = React.useState<string | undefined>(undefined);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isAlertWarningValidator, setIsAlertWarningValidator] = useState(false);
  const [initLoading, setInitLoading] = useState<boolean>(true);
  const [selectedChain, setSelectedChain] = useState<string>(chainParam);
  const [isContainOnlySubstrate] = analysisAccounts(accounts);
  const [defaultTarget, setDefaultTarget] = useState(targetParam);
  const [defaultSlug, setDefaultSlug] = useState('');
  const navigation = useNavigation<RootNavigationProps>();

  const getAltChain = useCallback(
    (poolInfo: YieldPoolInfo) => {
      if (isLiquidPool(poolInfo) || isLendingPool(poolInfo)) {
        const asset = assetRegistry[poolInfo?.metadata.altInputAssets || ''];

        return asset ? { chain: asset.originChain, name: asset.name } : { chain: '', name: '' };
      }

      return { chain: '', name: '' };
    },
    [assetRegistry],
  );

  const items = useMemo(() => {
    return [...data].sort((a, b) => {
      return (
        groupOrdinal(b) - groupOrdinal(a) ||
        testnetOrdinal(b) - testnetOrdinal(a) ||
        balanceOrdinal(b) - balanceOrdinal(a) ||
        apyOrdinal(b) - apyOrdinal(a)
      );
    });
  }, [data]);

  const transactionFromValue = useMemo(() => {
    if (isNoAccount) {
      return '';
    }

    return currentAccount?.address ? (isAccountAll(currentAccount.address) ? '' : currentAccount.address) : '';
  }, [currentAccount?.address, isNoAccount]);

  const checkIsAnyAccountValid = useCallback(
    (_accounts: AccountJson[]) => {
      const chainInfo = chainInfoMap[selectedChain];
      let accountList: AccountJson[] = [];

      if (!chainInfo) {
        return false;
      }

      accountList = _accounts.filter(getFilteredAccount(chainInfo));

      return !!accountList.length;
    },
    [chainInfoMap, selectedChain],
  );

  const onCloseModal = useCallback(() => {
    setDefaultTarget('');
  }, []);

  const navigateToEarnTransaction = useCallback(
    (slug: string, chain: string) => {
      if (isNoAccount) {
        Linking.openURL(getStartEarningUrl(slug || defaultSlug, defaultTarget));
      } else {
        const chainInfo = chainInfoMap[selectedChain];
        const isAnyAccountValid = checkIsAnyAccountValid(accounts);

        if (!isAnyAccountValid) {
          const accountType = isContainOnlySubstrate ? EVM_ACCOUNT_TYPE : SUBSTRATE_ACCOUNT_TYPE;
          Linking.openURL(getEarningListUrl(chain, accountType));
        } else {
          const accountList = accounts.filter(getFilteredAccount(chainInfo));

          if (accountList.length === 1) {
            saveCurrentAccountAddress(accountList[0])
              .then(() => Linking.openURL(getStartEarningUrl(slug || defaultSlug, defaultTarget)))
              .catch(() => console.error());
          } else {
            if (currentAccount && accountList.some(acc => acc.address === currentAccount.address)) {
              Linking.openURL(getStartEarningUrl(slug || defaultSlug, defaultTarget));

              return;
            }

            saveCurrentAccountAddress({ address: 'ALL' })
              .then(() => Linking.openURL(getStartEarningUrl(slug || defaultSlug, defaultTarget)))
              .catch(() => console.error());
          }
        }
      }
    },
    [
      accounts,
      chainInfoMap,
      checkIsAnyAccountValid,
      currentAccount,
      defaultSlug,
      defaultTarget,
      isContainOnlySubstrate,
      isNoAccount,
      selectedChain,
    ],
  );

  const onConnectChainSuccess = useCallback(() => {
    selectedPoolInfoSlug && navigateToEarnTransaction(selectedPoolInfoSlug, selectedChain);
  }, [navigateToEarnTransaction, selectedChain, selectedPoolInfoSlug]);

  const { checkChainConnected, onConnectChain, turnOnChain, setLoading, isLoading } = useHandleChainConnection(
    selectedChain,
    'Name',
    onConnectChainSuccess,
  );

  const onPressItem = useCallback(
    (item: YieldGroupInfo) => {
      return () => {
        if (isRelatedToAstar(item.group)) {
          Alert.alert(
            'Enter Astar portal',
            'You are navigating to Astar portal to view and manage your stake in Astar dApp staking v3. SubWallet will offer support for Astar dApp staking v3 soon.',
            [
              {
                text: 'Cancel',
                style: 'default',
              },
              {
                text: 'Enter Astar portal',
                style: 'default',
                isPreferred: false,
                onPress: () => {
                  Linking.openURL('subwallet://browser?url=portal.astar.network');
                },
              },
            ],
          );

          return;
        }

        if (item.poolListLength > 1) {
          Linking.openURL(`subwallet://home/main/earning/earning-pool-list?group=${item.group}&symbol=${item.symbol}`);
        } else if (item.poolListLength === 1) {
          const poolInfo = poolInfoMap[item.poolSlugs[0]];

          if (!poolInfo) {
            // will not happen

            return;
          }
          setSelectedChain(poolInfo.chain);
          setSelectedPoolInfoSlug(poolInfo.slug);
          const altChain = getAltChain(poolInfo);

          if (!checkChainConnected(item.chain)) {
            onConnectChain(item.chain, altChain.chain);
          } else if (!checkChainConnected(altChain.chain) && !!altChain.chain) {
            turnOnChain(altChain.chain);
            setLoading(true);
          } else {
            navigateToEarnTransaction(poolInfo.slug, poolInfo.chain);
          }
        }
      };
    },
    [checkChainConnected, getAltChain, navigateToEarnTransaction, onConnectChain, poolInfoMap, setLoading, turnOnChain],
  );

  useEffect(() => {
    let isSync = true;

    if (chainParam && typeParam) {
      const poolInfo = getPoolInfoByChainAndType(poolInfoMap, chainParam, typeParam);

      if (poolInfo) {
        fetchPoolTarget({ slug: poolInfo.slug })
          .then(rs => {
            if (isSync) {
              let _defaultTarget = targetParam;
              setDefaultSlug(poolInfo.slug);

              if (rs && rs.targets && rs.targets.length) {
                const isValidatorSupported = rs.targets.find(item => {
                  if (typeParam === YieldPoolType.NOMINATION_POOL) {
                    return (item as NominationPoolInfo).id.toString() === targetParam;
                  } else if (typeParam === YieldPoolType.NATIVE_STAKING) {
                    return item.address === targetParam;
                  } else {
                    return false;
                  }
                });

                if (!isValidatorSupported) {
                  _defaultTarget = 'not-support';
                  setIsAlertWarningValidator(true);
                } else {
                  if (typeParam === YieldPoolType.NATIVE_STAKING) {
                    _defaultTarget = getValidatorKey(
                      isValidatorSupported.address,
                      (isValidatorSupported as ValidatorInfo).identity,
                    );
                  }

                  setIsAlertWarningValidator(false);
                  setValidator(isValidatorSupported);
                }
              }

              setSelectedPoolInfoSlug(poolInfo.slug);
              setDefaultTarget(_defaultTarget);
              setDetailModalVisible(true);
              setInitLoading(false);
            }
          })
          .catch(e => {
            console.log('Error when fetching poolInfo.slug file', e);

            if (isSync) {
              setInitLoading(false);
            }
          });
      } else {
        if (isSync) {
          setInitLoading(false);
        }
      }
    } else {
      if (isSync) {
        setInitLoading(false);
      }
    }

    return () => {
      isSync = false;
    };
  }, [chainParam, poolInfoMap, targetParam, transactionFromValue, typeParam]);

  useEffect(() => {
    if (isAlertWarningValidator) {
      Alert.alert(
        'Unrecommended validator',
        'Your chosen validator is not recommended by SubWallet as staking with this validator won’t accrue any rewards. Select another validator and try again.',
        [
          {
            text: 'Dismiss',
            onPress: () => {
              setIsAlertWarningValidator(false);
            },
          },
        ],
      );
    }
  }, [isAlertWarningValidator]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<YieldGroupInfo>) => {
      return <EarningGroupItem poolGroup={item} isShowBalance={true} onPress={() => onPressItem(item)()} />;
    },
    [onPressItem],
  );

  return (
    <>
      {initLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <FlatListScreen
            onPressBack={() => navigation.navigate('Home')}
            style={{ flex: 1, paddingBottom: theme.padding }}
            items={items}
            renderListEmptyComponent={() => <></>}
            title={'Earning preview'}
            renderItem={renderItem}
            flatListStyle={{
              paddingHorizontal: theme.padding,
              gap: theme.sizeXS,
              paddingBottom: theme.paddingXS,
            }}
          />

          {selectedPoolInfoSlug && validator && (
            <EarningValidatorDetailRWModal
              modalVisible={detailModalVisible}
              setModalVisible={setDetailModalVisible}
              validatorItem={validator}
              bypassEarlyValidate={true}
              assetRegistry={assetRegistry}
              poolInfo={poolInfoMap[selectedPoolInfoSlug]}
              onStakeMore={navigateToEarnTransaction}
              onCancel={onCloseModal}
            />
          )}

          <GettingDataModal isLoading={isLoading} />
        </>
      )}
    </>
  );
};

export const EarningPreview = (props: EarningPreviewProps) => {
  const {
    route: {
      params: { chain, type, target },
    },
  } = props;

  const dataContext = useContext(DataContext);
  const [poolInfoMap, setPoolInfoMap] = useState<Record<string, YieldPoolInfo>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isSync = true;

    fetchStaticCache<{ data: Record<string, YieldPoolInfo> }>('earning/yield-pools.json', { data: {} })
      .then(rs => {
        if (isSync) {
          setPoolInfoMap(rs.data);
        }
      })
      .catch(e => {
        console.log('Error when fetching yield-pools.json', e);
      });

    return () => {
      isSync = false;
    };
  }, []);

  useEffect(() => {
    let isSync = true;

    if (!isReady) {
      dataContext
        .awaitStores(['price'])
        .then(rs => {
          if (rs && !!poolInfoMap && isSync) {
            setIsReady(true);
          }
        })
        .catch(console.log);
    }

    return () => {
      isSync = false;
    };
  }, [dataContext, isReady, poolInfoMap]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <EarningPreviewScreen
      poolInfoMap={poolInfoMap}
      chainParam={chain || ''}
      typeParam={type as YieldPoolType | undefined}
      targetParam={target || ''}
    />
  );
};
