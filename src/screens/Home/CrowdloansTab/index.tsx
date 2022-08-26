import React, { useEffect, useState } from 'react';
import { SelectScreen } from 'components/SelectScreen';
import i18n from 'utils/i18n/i18n';
import { NetWorkGroup, NetWorkMetadataDef } from '@subwallet/extension-base/background/KoniTypes';
import { CrowdloanContributeValueType } from 'hooks/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import BigN from 'bignumber.js';
import { FlatList, ListRenderItemInfo, Text, View } from 'react-native';
import useCrowdloanNetworks from 'hooks/screen/Home/CrowdloanTab/useCrowdloanNetworks';
import useGetCrowdloanContributeMap from 'hooks/screen/Home/CrowdloanTab/useGetCrowdloanContributeMap';
import useGetNetworkMetadata from 'hooks/screen/useGetNetworkMetadata';
import { CrowdloanItem } from 'screens/Home/CrowdloansTab/CrowdloanItem';
import { CrowdloanItemType } from '../../../types';
import { emptyListContainerStyle, emptyListTextStyle, ScrollViewStyle } from 'styles/sharedStyles';
import { BN_ZERO } from 'utils/chainBalances';
import { Rocket } from 'phosphor-react-native';
import { ActivityLoading } from 'components/ActivityLoading';
import useFilteredCrowdloan from 'hooks/screen/Home/CrowdloanTab/useFilteredCrowdloan';

const GroupDisplayNameMap: Record<string, string> = {
  POLKADOT_PARACHAIN: 'Polkadot parachain',
  KUSAMA_PARACHAIN: 'Kusama parachain',
};

function getGroupDisplayName(groups: NetWorkGroup[]): string {
  for (const group of groups) {
    if (GroupDisplayNameMap[group]) {
      return GroupDisplayNameMap[group];
    }
  }

  return '';
}

function sliceArray(array: CrowdloanItemType[], pageNumber: number) {
  return array.slice(0, 15 * pageNumber);
}

const renderItem = ({ item }: ListRenderItemInfo<CrowdloanItemType>) => {
  return <CrowdloanItem item={item} />;
};

const renderListEmptyComponent = () => {
  return (
    <View style={emptyListContainerStyle}>
      <Rocket size={80} color={'rgba(255, 255, 255, 0.3)'} weight={'thin'} />
      <Text style={emptyListTextStyle}>{i18n.common.emptyCrowdloanListMessage}</Text>
    </View>
  );
};

export const CrowdloansTab = () => {
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const crowdloanNetworks = useCrowdloanNetworks('all');
  const crowdloanContributeMap = useGetCrowdloanContributeMap(crowdloanNetworks);
  const networkMetadataMap = useGetNetworkMetadata();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [lazyList, setLazyList] = useState<CrowdloanItemType[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [searchString, setSearchString] = useState('');

  const getItem = (
    networkKey: string,
    contributeValueInfo: CrowdloanContributeValueType,
    networkMetadata: NetWorkMetadataDef,
  ): CrowdloanItemType => {
    const groupDisplayName = getGroupDisplayName(networkMetadata.groups);
    const { balanceValue, convertedBalanceValue, symbol } = contributeValueInfo.contribute;

    return {
      contribute: balanceValue,
      contributeToUsd: convertedBalanceValue,
      logo: networkKey,
      networkDisplayName: networkMetadata.chain,
      networkKey,
      symbol,
      groupDisplayName,
      paraState: contributeValueInfo.paraState,
      crowdloanUrl: networkMap[networkKey].crowdloanUrl,
    };
  };

  const getItems = (
    networkKeys: string[],
    currentContributeMap: Record<string, CrowdloanContributeValueType>,
    currentNetworkMetadataMap: Record<string, NetWorkMetadataDef>,
    includeZeroBalance = false,
  ) => {
    const result: CrowdloanItemType[] = [];

    networkKeys.forEach(n => {
      const networkMetadata = currentNetworkMetadataMap[n];

      if (!networkMetadata) {
        return;
      }

      const contributeValueInfo: CrowdloanContributeValueType = currentContributeMap[n] || {
        contribute: {
          balanceValue: new BigN(0),
          convertedBalanceValue: new BigN(0),
          symbol: 'Unit',
        },
      };
      if (!includeZeroBalance && !BN_ZERO.lt(new BigN(contributeValueInfo.contribute.balanceValue))) {
        return;
      }

      result.push(getItem(n, contributeValueInfo, networkMetadata));
    });

    return result;
  };

  const items: CrowdloanItemType[] = getItems(crowdloanNetworks, crowdloanContributeMap, networkMetadataMap);
  const filteredItems: CrowdloanItemType[] = useFilteredCrowdloan(items, searchString);

  const dep = JSON.stringify(filteredItems);
  useEffect(() => {
    setLazyList(sliceArray(filteredItems, pageNumber));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, pageNumber]);

  const renderLoadingAnimation = () => {
    return isLoading ? <ActivityLoading /> : null;
  };

  const _onLoadMore = () => {
    if (lazyList.length === filteredItems.length) {
      return;
    }

    setLoading(true);
    const currentPageNumber = pageNumber + 1;
    setTimeout(() => {
      setLoading(false);
      setPageNumber(currentPageNumber);
    }, 300);
  };

  const onSearchCrowdloan = (text: string) => {
    setPageNumber(1);
    setSearchString(text);
  };

  return (
    <SelectScreen
      title={i18n.tabName.crowdloans}
      onChangeSearchText={onSearchCrowdloan}
      searchString={searchString}
      showLeftBtn={false}>
      <>
        {filteredItems.length ? (
          <FlatList
            style={{ ...ScrollViewStyle }}
            keyboardShouldPersistTaps={'handled'}
            data={lazyList}
            onEndReached={_onLoadMore}
            renderItem={renderItem}
            onEndReachedThreshold={0.7}
            ListFooterComponent={renderLoadingAnimation}
          />
        ) : (
          renderListEmptyComponent()
        )}
      </>
    </SelectScreen>
  );
};
