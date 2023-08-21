import { HistoryDetailModal } from './Detail';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Aperture,
  ArrowDownLeft,
  ArrowUpRight,
  ClockCounterClockwise,
  Database,
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
import { isAccountAll } from 'utils/accountAll';
import reformatAddress from 'utils/index';
import { isAddress } from '@polkadot/util-crypto';
import { HistoryItem } from 'components/common/HistoryItem';
import { TxTypeNameMap } from 'screens/Home/History/shared';
import i18n from 'utils/i18n/i18n';
import { FlatListScreen } from 'components/FlatListScreen';
import { FontMedium } from 'styles/sharedStyles';
import { ListRenderItemInfo, View } from 'react-native';
import { SectionListData } from 'react-native/Libraries/Lists/SectionList';
import Typography from '../../../components/design-system-ui/typography';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { EmptyList } from 'components/EmptyList';
import { HistoryProps, RootNavigationProps } from 'routes/index';
import { SortFunctionInterface } from 'types/ui-types';
import { SectionItem } from 'components/LazySectionList';
import { useNavigation } from '@react-navigation/native';

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
        className: `-receive -${item.status}`,
        title: titleMap.receive,
        name: nameMap.receive,
        typeName: `${nameMap.receive}${displayStatus} - ${time}`,
        icon: IconMap.receive,
      };
    } else {
      displayData = {
        className: `-send -${item.status}`,
        title: titleMap.send,
        name: nameMap.send,
        typeName: `${nameMap.send}${displayStatus} - ${time}`,
        icon: IconMap.send,
      };
    }
  } else {
    const typeName = nameMap[item.type] || nameMap.default;

    displayData = {
      className: `-${item.type} -${item.status}`,
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
}

const filterFunction = (items: TransactionHistoryDisplayItem[], filters: string[]) => {
  const filteredChainList: TransactionHistoryDisplayItem[] = [];

  if (!filters.length) {
    return items;
  }

  items.forEach(item => {
    for (const filter of filters) {
      switch (filter) {
        case FilterValue.SEND:
          if (isTypeTransfer(item.type) && item.direction === TransactionDirection.SEND) {
            filteredChainList.push(item);
          }
          break;
        case FilterValue.RECEIVED:
          if (isTypeTransfer(item.type) && item.direction === TransactionDirection.RECEIVED) {
            filteredChainList.push(item);
          }
          break;
        case FilterValue.NFT:
          if (item.type === ExtrinsicType.SEND_NFT) {
            filteredChainList.push(item);
          }
          break;
        case FilterValue.STAKE:
          if (isTypeStaking(item.type)) {
            filteredChainList.push(item);
          }
          break;
        case FilterValue.CLAIM:
          if (item.type === ExtrinsicType.STAKING_CLAIM_REWARD) {
            filteredChainList.push(item);
          }
          break;
        case FilterValue.CROWDLOAN:
          if (item.type === ExtrinsicType.CROWDLOAN) {
            filteredChainList.push(item);
          }
          break;
        case FilterValue.SUCCESSFUL:
          if (item.status === ExtrinsicStatus.SUCCESS) {
            filteredChainList.push(item);
          }
          break;
        case FilterValue.FAILED:
          if (item.status === ExtrinsicStatus.FAIL) {
            filteredChainList.push(item);
          }
      }
    }
  });

  return filteredChainList;
};

function History({
  route: {
    params: { chain, transactionId },
  },
}: HistoryProps): React.ReactElement<Props> {
  const theme = useSubWalletTheme().swThemes;
  const accounts = useSelector((root: RootState) => root.accountState.accounts);
  const currentAccount = useSelector((root: RootState) => root.accountState.currentAccount);
  const rawHistoryList = useSelector((root: RootState) => root.transactionHistory.historyList);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [isOpenByLink, setIsOpenByLink] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const language = useSelector((state: RootState) => state.mobileSettings.language) as LanguageType;
  const navigation = useNavigation<RootNavigationProps>();

  const accountMap = useMemo(() => {
    return accounts.reduce((accMap, cur) => {
      accMap[cur.address.toLowerCase()] = cur.name || '';

      return accMap;
    }, {} as Record<string, string>);
  }, [accounts]);
  const FILTER_OPTIONS = [
    { label: i18n.filterOptions.sendToken, value: FilterValue.SEND },
    { label: i18n.filterOptions.receiveToken, value: FilterValue.RECEIVED },
    { label: i18n.filterOptions.nftTransaction, value: FilterValue.NFT },
    { label: i18n.filterOptions.stakeTransaction, value: FilterValue.STAKE },
    { label: i18n.filterOptions.claimStakingReward, value: FilterValue.CLAIM },
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
      [ExtrinsicType.EVM_EXECUTE]: i18n.historyScreen.title.evmTransaction,
    }),
    [],
  );

  const [historyMap, setHistoryMap] = useState<Record<string, TransactionHistoryDisplayItem>>({});

  // Fill display data to history list
  const getHistoryMap = useCallback(() => {
    const currentAddress = currentAccount?.address || '';
    const currentAddressLowerCase = currentAddress.toLowerCase();
    const isFilterByAddress = currentAccount?.address && !isAccountAll(currentAddress);
    const finalHistoryMap: Record<string, TransactionHistoryDisplayItem> = {};

    rawHistoryList.forEach((item: TransactionHistoryItem) => {
      // Filter account by current account
      if (isFilterByAddress && currentAddressLowerCase !== quickFormatAddressToCompare(item.address)) {
        return;
      }

      // Format display name for account by address
      const fromName = accountMap[quickFormatAddressToCompare(item.from) || ''];
      const toName = accountMap[quickFormatAddressToCompare(item.to) || ''];
      const key = getHistoryItemKey(item);

      const txtTypeNameMap = TxTypeNameMap();
      finalHistoryMap[key] = {
        ...item,
        fromName,
        toName,
        displayData: getDisplayData(item, txtTypeNameMap, typeTitleMap),
      };
    });

    return finalHistoryMap;
  }, [currentAccount?.address, rawHistoryList, accountMap, typeTitleMap]);

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      setHistoryMap(getHistoryMap());
      setLoading(false);
    });
    return () => clearTimeout(timeoutID);
  }, [getHistoryMap]);

  const historyList = useMemo<TransactionHistoryDisplayItem[]>(() => {
    return Object.values(historyMap);
  }, [historyMap]);

  const [curAdr] = useState(currentAccount?.address);

  // Handle detail modal
  // const { chain, extrinsicHash } = useParams();
  const [selectedItem, setSelectedItem] = useState<TransactionHistoryDisplayItem | null>(null);
  // const [openDetailLink, setOpenDetailLink] = useState<boolean>(!!chain && !!extrinsicHash);

  const onOpenDetail = useCallback((item: TransactionHistoryDisplayItem) => {
    return () => {
      setSelectedItem(item);
      setDetailModalVisible(true);
    };
  }, []);

  const onCloseDetail = useCallback(() => {
    setDetailModalVisible(false);
    setSelectedItem(null);
    // setOpenDetailLink(false);
  }, []);

  useEffect(() => {
    if (transactionId && chain && !isOpenByLink) {
      const existed = historyList.find(
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
  }, [chain, transactionId, historyList, isOpenByLink]);

  useEffect(() => {
    if (currentAccount?.address !== curAdr) {
      setDetailModalVisible(false);
      setSelectedItem(null);
    }
  }, [curAdr, currentAccount?.address]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TransactionHistoryDisplayItem>) => {
      return (
        <HistoryItem
          style={{ marginTop: theme.marginXS }}
          item={item}
          key={`${item.transactionId || item.extrinsicHash}-${item.address}-${item.direction}`}
          onPress={onOpenDetail(item)}
        />
      );
    },
    [onOpenDetail, theme.marginXS],
  );

  const searchFunc = useCallback((items: TransactionHistoryDisplayItem[], searchText: string) => {
    if (!searchText) {
      return items;
    }

    const searchTextLowerCase = searchText.toLowerCase();

    return items.filter(item => {
      if (
        item.direction === TransactionDirection.SEND &&
        !!item.fromName &&
        item.fromName.toLowerCase().includes(searchTextLowerCase)
      ) {
        return true;
      }

      if (
        item.direction === TransactionDirection.RECEIVED &&
        !!item.toName &&
        item.toName.toLowerCase().includes(searchTextLowerCase)
      ) {
        return true;
      }

      return false;
    });
  }, []);

  const groupBy = useCallback(
    (item: TransactionHistoryDisplayItem) => {
      return customFormatDate(item.time, '#YYYY#-#MM#-#DD#') + '|' + formatHistoryDate(item.time, language, 'list');
    },
    [language],
  );

  const renderSectionHeader: (info: {
    section: SectionListData<TransactionHistoryDisplayItem>;
  }) => React.ReactElement | null = useCallback(
    (info: { section: SectionListData<TransactionHistoryDisplayItem> }) => {
      return (
        <View
          style={{
            paddingTop: theme.sizeXS,
            backgroundColor: theme.colorBgDefault,
            marginBottom: -theme.sizeXS,
            paddingBottom: theme.sizeXS,
          }}>
          <Typography.Text size={'sm'} style={{ color: theme.colorTextLight3, ...FontMedium }}>
            {info.section.title.split('|')[1]}
          </Typography.Text>
        </View>
      );
    },
    [theme.colorBgDefault, theme.colorTextLight3, theme.sizeXS],
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

  return (
    <>
      <FlatListScreen
        autoFocus={false}
        showLeftBtn={true}
        onPressBack={() => navigation.goBack()}
        items={historyList}
        title={i18n.header.history}
        placeholder={i18n.placeholder.searchHistory}
        searchFunction={searchFunc}
        renderItem={renderItem}
        isShowFilterBtn
        renderListEmptyComponent={emptyList}
        grouping={grouping}
        filterOptions={FILTER_OPTIONS}
        filterFunction={filterFunction}
        sortFunction={sortFunction}
        loading={loading}
        flatListStyle={{ paddingHorizontal: theme.padding, paddingBottom: theme.padding }}
      />

      <HistoryDetailModal
        data={selectedItem}
        onChangeModalVisible={onCloseDetail}
        modalVisible={detailModalVisible}
        setDetailModalVisible={setDetailModalVisible}
      />
    </>
  );
}

export default History;
