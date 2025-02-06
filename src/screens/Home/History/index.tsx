import { HistoryDetailModal } from './Detail';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Aperture,
  ArrowDownLeft,
  ArrowsLeftRight,
  ArrowUpRight,
  ClockCounterClockwise,
  Database,
  FadersHorizontal,
  IconProps,
  ListBullets,
  Rocket,
  Spinner,
} from 'phosphor-react-native';
import {
  ExtrinsicStatus,
  ExtrinsicType,
  LanguageType,
  TransactionDirection,
  TransactionHistoryItem,
} from '@subwallet/extension-base/background/KoniTypes';
import { isTypeStaking, isTypeTransfer } from 'utils/transaction/detectType';
import { TransactionHistoryDisplayData, TransactionHistoryDisplayItem } from 'types/history';
import { customFormatDate, formatHistoryDate } from 'utils/customFormatDate';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { HistoryItem } from 'components/common/HistoryItem';
import { TxTypeNameMap } from 'screens/Home/History/shared';
import i18n from 'utils/i18n/i18n';
import { FontMedium } from 'styles/sharedStyles';
import { Keyboard, View } from 'react-native';
import Typography from '../../../components/design-system-ui/typography';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { EmptyList } from 'components/EmptyList';
import { HistoryProps, RootNavigationProps } from 'routes/index';
import { SortFunctionInterface } from 'types/ui-types';
import { LazySectionList, SectionItem } from 'components/LazySectionList';
import { useNavigation } from '@react-navigation/native';
import { useHistorySelection } from 'hooks/history';
import { ChainItemType } from 'types/index';
import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { ModalRef } from 'types/modalRef';
import { cancelSubscription, subscribeTransactionHistory } from 'messaging/index';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import FilterModal from 'components/common/FilterModal';
import { useFilterModal } from 'hooks/useFilterModal';
import { HistoryAccountSelector } from 'screens/Home/History/parts/HistoryAccountSelector';
import { HistoryChainSelector } from 'screens/Home/History/parts/HistoryChainSelector';
import LinearGradient from 'react-native-linear-gradient';
import { AccountAddressItemType } from 'types/account';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { isAddress } from '@subwallet/keyring';
import { reformatAddress } from '@subwallet/extension-base/utils';

type Props = {};

let IconMap: Record<string, React.ElementType<IconProps>>;
IconMap = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  claim_reward: ClockCounterClockwise,
  staking: Database,
  crowdloan: Rocket,
  nft: Aperture,
  processing: Spinner,
  swap: ArrowsLeftRight,
  default: ClockCounterClockwise,
};

function quickFormatAddressToCompare(address?: string) {
  if (!isAddress(address)) {
    return address;
  }

  return reformatAddress(address, 42).toLowerCase();
}

function getIcon(item: TransactionHistoryItem): React.ElementType<IconProps> {
  if (item.status === ExtrinsicStatus.PROCESSING || item.status === ExtrinsicStatus.SUBMITTING) {
    return IconMap.processing;
  }

  if (item.type === ExtrinsicType.SEND_NFT) {
    return IconMap.nft;
  }

  if (item.type === ExtrinsicType.CROWDLOAN) {
    return IconMap.crowdloan;
  }

  if (item.type === ExtrinsicType.STAKING_CLAIM_REWARD) {
    return IconMap.claim_reward;
  }

  if (item.type === ExtrinsicType.SWAP) {
    return IconMap.swap;
  }

  if (isTypeStaking(item.type)) {
    return IconMap.staking;
  }

  return IconMap.default;
}

function getDisplayData(
  item: TransactionHistoryItem,
  nameMap: Record<string, string>,
  titleMap: Record<string, string>,
): TransactionHistoryDisplayData {
  let displayData: TransactionHistoryDisplayData;
  const time = customFormatDate(item.time, '#hhhh#:#mm#');

  const displayStatus = item.status === ExtrinsicStatus.FAIL ? i18n.historyScreen.label.transactionFail : '';

  if (
    item.type === ExtrinsicType.TRANSFER_BALANCE ||
    item.type === ExtrinsicType.TRANSFER_TOKEN ||
    item.type === ExtrinsicType.TRANSFER_XCM ||
    item.type === ExtrinsicType.EVM_EXECUTE
  ) {
    if (item.direction === TransactionDirection.RECEIVED) {
      displayData = {
        title: titleMap.receive,
        name: nameMap.receive,
        typeName: `${nameMap.receive}${displayStatus} - ${time}`,
        icon: IconMap.receive,
      };
    } else {
      displayData = {
        title: titleMap.send,
        name: nameMap.send,
        typeName: `${nameMap.send}${displayStatus} - ${time}`,
        icon: IconMap.send,
      };
    }
  } else {
    const typeName = nameMap[item.type] || nameMap.default;

    displayData = {
      title: titleMap[item.type],
      typeName: `${typeName}${displayStatus} - ${time}`,
      name: nameMap[item.type],
      icon: getIcon(item),
    };
  }

  if (item.status === ExtrinsicStatus.PROCESSING) {
    displayData.typeName = nameMap.processing;
  }

  if (item.status === ExtrinsicStatus.SUBMITTING) {
    displayData.typeName = nameMap.submitting;
  }

  return displayData;
}

function getHistoryItemKey(
  item: Pick<TransactionHistoryItem, 'chain' | 'address' | 'extrinsicHash' | 'transactionId'>,
) {
  return `${item.chain}-${item.address}-${item.transactionId || item.extrinsicHash}`;
}

enum FilterValue {
  SEND = 'send',
  RECEIVED = 'received',
  NFT = 'nft',
  STAKE = 'stake',
  CLAIM = 'claim',
  CROWDLOAN = 'crowdloan',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  SWAP = 'swap',
}

const filterFunction = (items: TransactionHistoryDisplayItem[], filters: string[]) => {
  if (!filters.length) {
    return items;
  }

  return items.filter(item => {
    if (!filters.length) {
      return true;
    }

    for (const filter of filters) {
      if (filter === '') {
        return true;
      }

      switch (filter) {
        case FilterValue.SEND:
          if (isTypeTransfer(item.type) && item.direction === TransactionDirection.SEND) {
            return true;
          }
          break;
        case FilterValue.RECEIVED:
          if (isTypeTransfer(item.type) && item.direction === TransactionDirection.RECEIVED) {
            return true;
          }
          break;
        case FilterValue.NFT:
          if (item.type === ExtrinsicType.SEND_NFT) {
            return true;
          }
          break;
        case FilterValue.STAKE:
          if (isTypeStaking(item.type)) {
            return true;
          }
          break;
        case FilterValue.CLAIM:
          if (item.type === ExtrinsicType.STAKING_CLAIM_REWARD) {
            return true;
          }
          break;
        case FilterValue.CROWDLOAN:
          if (item.type === ExtrinsicType.CROWDLOAN) {
            return true;
          }
          break;
        case FilterValue.SWAP:
          if (item.type === ExtrinsicType.SWAP) {
            return true;
          }
          break;
        case FilterValue.SUCCESSFUL:
          if (item.status === ExtrinsicStatus.SUCCESS) {
            return true;
          }
          break;
        case FilterValue.FAILED:
          if (item.status === ExtrinsicStatus.FAIL) {
            return true;
          }
          break;
      }
    }

    return false;
  });
};

function filterDuplicateItems(items: TransactionHistoryItem[]): TransactionHistoryItem[] {
  const result: TransactionHistoryItem[] = [];

  const exclusionMap: Record<string, boolean> = {};

  const getExclusionKey = (i: TransactionHistoryItem): string => {
    return `${i.direction}_${i.blockNumber}_${i.type}_${i.from}_${i.to}`.toLowerCase();
  };

  items.forEach(i => {
    if (i.origin === 'app' && i.blockNumber > 0 && i.type === ExtrinsicType.TRANSFER_BALANCE) {
      exclusionMap[getExclusionKey(i)] = true;
    }
  });

  if (!Object.keys(exclusionMap).length) {
    return items;
  }

  items.forEach(i => {
    if (i.origin === 'subscan' && exclusionMap[getExclusionKey(i)]) {
      return;
    }

    result.push(i);
  });

  return result;
}

const gradientBackground = ['rgba(76, 234, 172, 0.10)', 'rgba(76, 234, 172, 0.00)'];

function History({
  route: {
    params: { address: propAddress, chain, transactionId },
  },
}: HistoryProps): React.ReactElement<Props> {
  const theme = useSubWalletTheme().swThemes;
  const { selectedAddress, selectedChain, setSelectedAddress, setSelectedChain, chainItems, accountAddressItems } =
    useHistorySelection(chain, propAddress);
  const { accounts, currentAccountProxy, isAllAccount } = useSelector((root: RootState) => root.accountState);
  const [rawHistoryList, setRawHistoryList] = useState<TransactionHistoryItem[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [isOpenByLink, setIsOpenByLink] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const language = useSelector((state: RootState) => state.settings.language) as LanguageType;
  const navigation = useNavigation<RootNavigationProps>();
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);
  const { filterSelectionMap, openFilterModal, onApplyFilter, onChangeFilterOption, selectedFilters, filterModalRef } =
    useFilterModal();
  const accountMap = useMemo(() => {
    return accounts.reduce((accMap, cur) => {
      accMap[cur.address.toLowerCase()] = cur.name || '';

      return accMap;
    }, {} as Record<string, string>);
  }, [accounts]);
  const accountSelectorRef = useRef<ModalRef>();
  const chainSelectorRef = useRef<ModalRef>();
  const FILTER_OPTIONS = [
    { label: i18n.filterOptions.sendToken, value: FilterValue.SEND },
    { label: i18n.filterOptions.receiveToken, value: FilterValue.RECEIVED },
    { label: i18n.filterOptions.nftTransaction, value: FilterValue.NFT },
    { label: i18n.filterOptions.stakeTransaction, value: FilterValue.STAKE },
    { label: i18n.filterOptions.claimStakingReward, value: FilterValue.CLAIM },
    { label: 'Swap', value: FilterValue.SWAP },
    // { labe t('Crowdloan transaction', value: FilterValue.CROWDLOAN }, // support crowdloan later
    { label: i18n.filterOptions.successful, value: FilterValue.SUCCESSFUL },
    { label: i18n.filterOptions.failed, value: FilterValue.FAILED },
  ];
  const typeTitleMap: Record<string, string> = useMemo(
    () => ({
      default: i18n.historyScreen.title.transaction,
      send: i18n.historyScreen.title.sendTransaction,
      receive: i18n.historyScreen.title.receiveTransaction,
      [ExtrinsicType.SEND_NFT]: i18n.historyScreen.title.nftTransaction,
      [ExtrinsicType.CROWDLOAN]: i18n.historyScreen.title.crowdloanTransaction,
      [ExtrinsicType.STAKING_JOIN_POOL]: i18n.historyScreen.title.stakeTransaction,
      [ExtrinsicType.STAKING_LEAVE_POOL]: i18n.historyScreen.title.unstakeTransaction,
      [ExtrinsicType.STAKING_BOND]: i18n.historyScreen.title.bondTransaction,
      [ExtrinsicType.STAKING_UNBOND]: i18n.historyScreen.title.unbondTransaction,
      [ExtrinsicType.STAKING_CLAIM_REWARD]: i18n.historyScreen.title.claimRewardTransaction,
      [ExtrinsicType.STAKING_WITHDRAW]: i18n.historyScreen.title.withdrawTransaction,
      [ExtrinsicType.STAKING_CANCEL_UNSTAKE]: i18n.historyScreen.title.cancelUnstakeTransaction,
      [ExtrinsicType.MINT_VDOT]: i18n.historyScreen.title.mintVDOTTransaction,
      [ExtrinsicType.MINT_VMANTA]: i18n.historyScreen.title.mintVMANTATransaction,
      [ExtrinsicType.MINT_LDOT]: i18n.historyScreen.title.mintLDOTTransaction,
      [ExtrinsicType.MINT_SDOT]: i18n.historyScreen.title.mintSDOTTransaction,
      [ExtrinsicType.MINT_QDOT]: i18n.historyScreen.title.mintQDOTTransaction,
      [ExtrinsicType.MINT_STDOT]: i18n.historyScreen.title.mintSTDOTTransaction,
      [ExtrinsicType.REDEEM_VDOT]: i18n.historyScreen.title.redeemVDOTTransaction,
      [ExtrinsicType.REDEEM_VMANTA]: i18n.historyScreen.title.redeemVMANTATransaction,
      [ExtrinsicType.REDEEM_LDOT]: i18n.historyScreen.title.redeemLDOTTransaction,
      [ExtrinsicType.REDEEM_SDOT]: i18n.historyScreen.title.redeemSDOTTransaction,
      [ExtrinsicType.REDEEM_QDOT]: i18n.historyScreen.title.redeemQDOTTransaction,
      [ExtrinsicType.REDEEM_STDOT]: i18n.historyScreen.title.redeemSTDOTTransaction,
      [ExtrinsicType.JOIN_YIELD_POOL]: i18n.historyScreen.title.bondTransaction,
      [ExtrinsicType.UNSTAKE_VDOT]: i18n.historyScreen.title.unstakeVDOTTransaction,
      [ExtrinsicType.UNSTAKE_VMANTA]: i18n.historyScreen.title.unstakeVMANTATransaction,
      [ExtrinsicType.UNSTAKE_LDOT]: i18n.historyScreen.title.unstakeLDOTTransaction,
      [ExtrinsicType.UNSTAKE_SDOT]: i18n.historyScreen.title.unstakeSDOTTransaction,
      [ExtrinsicType.UNSTAKE_STDOT]: i18n.historyScreen.title.unstakeSTDOTTransaction,
      [ExtrinsicType.UNSTAKE_QDOT]: i18n.historyScreen.title.unstakeQDOTTransaction,
      [ExtrinsicType.TOKEN_SPENDING_APPROVAL]: i18n.historyScreen.title.tokenApproveTransaction,
      [ExtrinsicType.EVM_EXECUTE]: i18n.historyScreen.title.evmTransaction,
      [ExtrinsicType.SWAP]: 'Swap transaction',
      [ExtrinsicType.CLAIM_BRIDGE]: 'Claim token transaction',
    }),
    [],
  );

  const historyMap = useMemo(() => {
    const txtTypeNameMap = TxTypeNameMap();
    const finalHistoryMap: Record<string, TransactionHistoryDisplayItem> = {};

    rawHistoryList.forEach((item: TransactionHistoryItem) => {
      // Format display name for account by address
      const fromName = accountMap[quickFormatAddressToCompare(item.from) || ''];
      const toName = accountMap[quickFormatAddressToCompare(item.to) || ''];
      const key = getHistoryItemKey(item);

      finalHistoryMap[key] = {
        ...item,
        fromName,
        toName,
        displayData: getDisplayData(item, txtTypeNameMap, typeTitleMap),
      };
    });

    return finalHistoryMap;
  }, [accountMap, rawHistoryList, typeTitleMap]);

  // Fill display data to history list
  const getHistoryItems = useCallback(() => {
    return Object.values(historyMap).sort((a, b) => b.time - a.time);
  }, [historyMap]);

  const [historyItems, setHistoryItems] = useState<TransactionHistoryDisplayItem[]>(getHistoryItems());

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      setHistoryItems(getHistoryItems());
    });
    return () => clearTimeout(timeoutID);
  }, [getHistoryItems]);

  const [currentAccountProxyId] = useState(currentAccountProxy?.id);

  // Handle detail modal
  // const { chain, extrinsicHash } = useParams();
  const [selectedItem, setSelectedItem] = useState<TransactionHistoryDisplayItem | null>(null);
  // const [openDetailLink, setOpenDetailLink] = useState<boolean>(!!chain && !!extrinsicHash);

  const onOpenDetail = useCallback((item: TransactionHistoryDisplayItem) => {
    return () => {
      Keyboard.dismiss();
      setSelectedItem(item);
      setTimeout(() => setDetailModalVisible(true), 200);
    };
  }, []);

  const onCloseDetail = useCallback(() => {
    setDetailModalVisible(false);
    setSelectedItem(null);
    // setOpenDetailLink(false);
  }, []);

  useEffect(() => {
    if (transactionId && chain && !isOpenByLink) {
      const existed = historyItems.find(
        item => item.chain === chain && (item.transactionId === transactionId || item.extrinsicHash === transactionId),
      );

      setTimeout(() => {
        if (existed) {
          setSelectedItem(existed);
          setIsOpenByLink(true);
          setDetailModalVisible(true);
        }
      }, 300);
    }
  }, [chain, transactionId, historyItems, isOpenByLink]);

  useEffect(() => {
    if (currentAccountProxy?.id !== currentAccountProxyId) {
      setDetailModalVisible(false);
      setSelectedItem(null);
    }
  }, [currentAccountProxyId, currentAccountProxy?.id]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TransactionHistoryDisplayItem>) => {
      return (
        <HistoryItem
          style={{ marginBottom: theme.marginXS }}
          item={item}
          key={`${item.transactionId || item.extrinsicHash}-${item.address}-${item.direction}`}
          onPress={onOpenDetail(item)}
          isShowBalance={isShowBalance}
        />
      );
    },
    [isShowBalance, onOpenDetail, theme.marginXS],
  );

  const groupBy = useCallback(
    (item: TransactionHistoryDisplayItem) => {
      return customFormatDate(item.time, '#YYYY#-#MM#-#DD#') + '|' + formatHistoryDate(item.time, language, 'list');
    },
    [language],
  );

  const renderSectionHeader: (item: string) => React.ReactElement | null = useCallback(
    item => {
      return (
        <View style={{ paddingBottom: theme.sizeXS }}>
          <Typography.Text size={'sm'} style={{ color: theme.colorTextLight3, ...FontMedium }}>
            {item.split('|')[1]}
          </Typography.Text>
        </View>
      );
    },
    [theme.colorTextLight3, theme.sizeXS],
  );

  const sortSection = useCallback<SortFunctionInterface<SectionItem<TransactionHistoryDisplayItem>>>((a, b) => {
    return b.title.localeCompare(a.title);
  }, []);

  const grouping = useMemo(() => {
    return { groupBy, sortSection, renderSectionHeader };
  }, [groupBy, renderSectionHeader, sortSection]);

  const sortFunction = useCallback((a: TransactionHistoryDisplayItem, b: TransactionHistoryDisplayItem) => {
    return b.time - a.time;
  }, []);

  const emptyList = useCallback(() => {
    return (
      <EmptyList
        icon={ListBullets}
        title={i18n.emptyScreen.historyEmptyTitle}
        message={i18n.emptyScreen.historyEmptyMessage}
      />
    );
  }, []);

  const onSelectAccount = useCallback(
    (item: AccountAddressItemType) => {
      setSelectedAddress(item.address);
    },
    [setSelectedAddress],
  );

  const onSelectChain = useCallback(
    (item: ChainItemType) => {
      setSelectedChain(item.slug);
    },
    [setSelectedChain],
  );

  useEffect(() => {
    if (detailModalVisible) {
      setSelectedItem(selected => {
        if (selected) {
          const key = getHistoryItemKey(selected);

          return historyMap[key] || null;
        } else {
          return selected;
        }
      });
    }
  }, [detailModalVisible, historyMap]);

  const isChainSelectorEmpty = !chainItems.length;

  const chainSelectorDisabled = useMemo(
    () => loading || !selectedAddress || isChainSelectorEmpty,
    [loading, selectedAddress, isChainSelectorEmpty],
  );

  const isSelectedChainEvm = useMemo(() => {
    const selectedChainInfo = chainInfoMap[selectedChain];

    return selectedChainInfo && _isChainEvmCompatible(selectedChainInfo);
  }, [chainInfoMap, selectedChain]);

  useEffect(() => {
    let id: string;
    let isSubscribed = true;

    setLoading(true);

    subscribeTransactionHistory(selectedChain, selectedAddress, (items: TransactionHistoryItem[]) => {
      if (isSubscribed) {
        setRawHistoryList(isSelectedChainEvm ? filterDuplicateItems(items) : items);
      }

      setTimeout(() => {
        if (isSubscribed) {
          setLoading(false);
        }
      }, 400);
    })
      .then(res => {
        id = res.id;

        if (isSubscribed) {
          setRawHistoryList(isSelectedChainEvm ? filterDuplicateItems(res.items) : res.items);
        } else {
          cancelSubscription(id).catch(console.log);
        }
      })
      .catch(e => {
        console.log('subscribeTransactionHistory error:', e);
      });

    return () => {
      isSubscribed = false;

      if (id) {
        cancelSubscription(id).catch(console.log);
      }
    };
  }, [isSelectedChainEvm, selectedAddress, selectedChain]);

  return (
    <>
      <ContainerWithSubHeader
        showLeftBtn={true}
        onPressBack={() => navigation.goBack()}
        title={i18n.header.history}
        titleTextAlign={'center'}
        showRightBtn={true}
        rightIcon={FadersHorizontal}
        onPressRightIcon={() => {
          Keyboard.dismiss();
          setTimeout(() => openFilterModal(), 100);
        }}>
        <View style={{ position: 'relative', flex: 1 }}>
          <LinearGradient
            locations={[0, 0.5]}
            colors={gradientBackground}
            style={{
              height: 388,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          />

          <View
            style={{
              position: 'relative',
              backgroundColor: theme.colorBgDefault,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              padding: theme.padding,
              gap: theme.sizeSM,
              zIndex: 10,
              flexDirection: 'row',
            }}>
            <View style={{ flex: 1 }}>
              <HistoryChainSelector
                items={chainItems}
                value={selectedChain}
                onSelectItem={onSelectChain}
                disabled={chainSelectorDisabled}
                selectorRef={chainSelectorRef}
                loading={loading}
              />
            </View>

            {isAllAccount && (
              <View style={{ flex: 1 }}>
                <HistoryAccountSelector
                  items={accountAddressItems}
                  value={selectedAddress}
                  onSelectItem={onSelectAccount}
                  disabled={loading}
                  selectorRef={accountSelectorRef}
                />
              </View>
            )}
          </View>

          <LazySectionList
            listStyle={{
              paddingLeft: theme.padding,
              paddingRight: theme.padding,
              paddingTop: theme.paddingXS,
              paddingBottom: theme.paddingXS,
            }}
            items={historyItems}
            renderItem={renderItem}
            renderListEmptyComponent={emptyList}
            filterFunction={filterFunction}
            selectedFilters={selectedFilters}
            sortItemFunction={sortFunction}
            sortSectionFunction={grouping.sortSection}
            groupBy={grouping.groupBy}
            renderSectionHeader={grouping.renderSectionHeader}
            estimatedItemSize={76}
            stickyHeader={false}
          />
        </View>
      </ContainerWithSubHeader>

      <HistoryDetailModal
        data={selectedItem}
        onChangeModalVisible={onCloseDetail}
        modalVisible={detailModalVisible}
        setDetailModalVisible={setDetailModalVisible}
      />

      <FilterModal
        filterModalRef={filterModalRef}
        options={FILTER_OPTIONS}
        onChangeOption={onChangeFilterOption}
        optionSelectionMap={filterSelectionMap}
        onApplyFilter={onApplyFilter}
      />
    </>
  );
}

export default History;
