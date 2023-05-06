import { HistoryDetailModal } from './Detail';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Aperture,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  ClockCounterClockwise,
  Database,
  IconProps, ListBullets,
  Rocket,
  Spinner,
} from 'phosphor-react-native';
import {
  ExtrinsicStatus,
  ExtrinsicType,
  TransactionDirection,
  TransactionHistoryItem,
} from '@subwallet/extension-base/background/KoniTypes';
import { isTypeStaking, isTypeTransfer } from 'utils/transaction/detectType';
import { TransactionHistoryDisplayData, TransactionHistoryDisplayItem } from 'types/history';
import { customFormatDate } from 'utils/customFormatDate';
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
import { HistoryProps } from 'routes/index';
import { SortFunctionInterface } from 'types/ui-types';
import { SectionItem } from 'components/LazySectionList';

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
  if (item.status === ExtrinsicStatus.PROCESSING) {
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

  const displayStatus = item.status === ExtrinsicStatus.FAIL ? 'fail' : '';

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
        typeName: `${nameMap.receive} ${displayStatus} - ${time}`,
        icon: IconMap.receive,
      };
    } else {
      displayData = {
        className: `-send -${item.status}`,
        title: titleMap.send,
        name: nameMap.send,
        typeName: `${nameMap.send} ${displayStatus} - ${time}`,
        icon: IconMap.send,
      };
    }
  } else {
    const typeName = nameMap[item.type] || nameMap.default;

    displayData = {
      className: `-${item.type} -${item.status}`,
      title: titleMap[item.type],
      typeName: `${typeName} ${displayStatus} - ${time}`,
      name: nameMap[item.type],
      icon: getIcon(item),
    };
  }

  const isProcessing = item.status === ExtrinsicStatus.PROCESSING;

  if (isProcessing) {
    displayData.className = '-processing';
    displayData.typeName = nameMap.processing;
  }

  return displayData;
}

function getHistoryItemKey(item: Pick<TransactionHistoryItem, 'chain' | 'address' | 'extrinsicHash'>) {
  return `${item.chain}-${item.address}-${item.extrinsicHash}`;
}

const typeTitleMap: Record<string, string> = {
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
};

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

const FILTER_OPTIONS = [
  { label: 'Send token transaction', value: FilterValue.SEND },
  { label: 'Receive token transaction', value: FilterValue.RECEIVED },
  { label: 'NFT transaction', value: FilterValue.NFT },
  { label: 'Stake transaction', value: FilterValue.STAKE },
  { label: 'Claim reward transaction', value: FilterValue.CLAIM },
  // { labe t('Crowdloan transaction', value: FilterValue.CROWDLOAN }, // support crowdloan later
  { label: 'Successful transaction', value: FilterValue.SUCCESSFUL },
  { label: 'Failed transaction', value: FilterValue.FAILED },
];

const filterFunction = (items: TransactionHistoryDisplayItem[], filters: string[]) => {
  const filteredChainList: TransactionHistoryDisplayItem[] = [];

  items.forEach(item => {
    let isValidationPassed = true;

    for (const filter of filters) {
      switch (filter) {
        case FilterValue.SEND:
          isValidationPassed = isTypeTransfer(item.type) && item.direction === TransactionDirection.SEND;
          break;
        case FilterValue.RECEIVED:
          isValidationPassed = isTypeTransfer(item.type) && item.direction === TransactionDirection.RECEIVED;
          break;
        case FilterValue.NFT:
          isValidationPassed = item.type === ExtrinsicType.SEND_NFT;
          break;
        case FilterValue.STAKE:
          isValidationPassed = isTypeStaking(item.type);
          break;
        case FilterValue.CLAIM:
          isValidationPassed = item.type === ExtrinsicType.STAKING_CLAIM_REWARD;
          break;
        case FilterValue.CROWDLOAN:
          isValidationPassed = item.type === ExtrinsicType.CROWDLOAN;
          break;
        case FilterValue.SUCCESSFUL:
          isValidationPassed = item.status === ExtrinsicStatus.SUCCESS;
          break;
        case FilterValue.FAILED:
          isValidationPassed = item.status === ExtrinsicStatus.FAIL;
          break;
        default:
          isValidationPassed = false;
          break;
      }
    }

    if (isValidationPassed) {
      filteredChainList.push(item);
    }
  });

  return filteredChainList;
};

function History({
  route: {
    params: { extrinsicHash, chain },
  },
}: HistoryProps): React.ReactElement<Props> {
  // const dataContext = useContext(DataContext);
  const theme = useSubWalletTheme().swThemes;
  const accounts = useSelector((root: RootState) => root.accountState.accounts);
  const currentAccount = useSelector((root: RootState) => root.accountState.currentAccount);
  const rawHistoryList = useSelector((root: RootState) => root.transactionHistory.historyList);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [isOpenByLink, setIsOpenByLink] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const accountMap = useMemo(() => {
    return accounts.reduce((accMap, cur) => {
      accMap[cur.address.toLowerCase()] = cur.name || '';

      return accMap;
    }, {} as Record<string, string>);
  }, [accounts]);

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

      finalHistoryMap[key] = {
        ...item,
        fromName,
        toName,
        displayData: getDisplayData(item, TxTypeNameMap, typeTitleMap),
      };
    });

    return finalHistoryMap;
  }, [accountMap, rawHistoryList, currentAccount?.address]);

  useEffect(() => {
    setLoading(true);
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
    if (extrinsicHash && chain && !isOpenByLink) {
      const existed = historyList.find(item => item.chain === chain && item.extrinsicHash === extrinsicHash);

      setTimeout(() => {
        if (existed) {
          setSelectedItem(existed);
          setIsOpenByLink(true);
          setDetailModalVisible(true);
        }
      }, 300);
    }
  }, [chain, extrinsicHash, historyList, isOpenByLink]);

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
          key={`${item.extrinsicHash}-${item.address}`}
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

    return items.filter(
      item =>
        (!!item.fromName && item.fromName.toLowerCase().includes(searchTextLowerCase)) ||
        (!!item.toName && item.toName.toLowerCase().includes(searchTextLowerCase)),
    );
  }, []);

  const groupBy = useCallback((item: TransactionHistoryDisplayItem) => {
    return customFormatDate(item.time, '#YYYY#-#MM#-#DD#') + '|' + customFormatDate(item.time, '#MMM# #DD#, #YYYY#');
  }, []);

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
    //todo: i18n
    return (
      <EmptyList icon={ListBullets} title={'No transactions yet'} message={'Your transactions history will appear here!'} />
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
        items={historyList}
        title={i18n.title.history}
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

      <HistoryDetailModal data={selectedItem} onChangeModalVisible={onCloseDetail} modalVisible={detailModalVisible} />
    </>
  );
}

export default History;
