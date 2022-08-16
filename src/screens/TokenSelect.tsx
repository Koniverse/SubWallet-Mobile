import React, { useEffect, useState } from 'react';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { Warning } from 'components/Warning';
import { NetworkSelectItem } from 'components/NetworkSelectItem';
import { SelectScreen } from 'components/SelectScreen';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';
import { TokenItemType } from 'types/ui-types';
import i18n from 'utils/i18n/i18n';
import useTokenOptions from 'hooks/screen/TokenSelect/useTokenOptions';
import useFilteredOptions from 'hooks/screen/TokenSelect/useFilteredOptions';
import { ActivityLoading } from 'components/ActivityLoading';

interface Props {
  address: string;
  modalVisible: boolean;
  onPressBack?: () => void;
  onChangeModalVisible: () => void;
  onChangeToken?: (item: TokenItemType) => void;
  filteredNetworkKey?: string;
  selectedNetworkKey?: string;
  selectedToken?: string;
}

function sliceArray(array: TokenItemType[], pageNumber: number) {
  return array.slice(0, 15 * pageNumber);
}

export const TokenSelect = ({
  address,
  onPressBack,
  onChangeToken,
  filteredNetworkKey,
  selectedNetworkKey,
  selectedToken,
  modalVisible,
  onChangeModalVisible,
}: Props) => {
  const [searchString, setSearchString] = useState('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [lazyList, setLazyList] = useState<TokenItemType[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const tokenOptions = useTokenOptions(address, filteredNetworkKey);
  const filteredOptions = useFilteredOptions(tokenOptions, searchString);
  const dep = JSON.stringify(filteredOptions);

  useEffect(() => {
    if (modalVisible) {
      setLazyList(sliceArray(filteredOptions, pageNumber));
    }
  }, [dep, modalVisible, pageNumber]);

  const renderItem = ({ item }: ListRenderItemInfo<TokenItemType>) => {
    const { symbol, networkKey, displayedSymbol, isMainToken, networkDisplayName } = item;

    return (
      <NetworkSelectItem
        key={`${symbol}-${networkKey}`}
        itemName={`${displayedSymbol} (${networkDisplayName})`}
        itemKey={isMainToken ? networkKey : symbol.toLowerCase()}
        isSelected={
          !!selectedToken && !!selectedNetworkKey && symbol === selectedToken && networkKey === selectedNetworkKey
        }
        onSelectNetwork={() => onChangeToken && onChangeToken(item)}
        defaultItemKey={networkKey}
      />
    );
  };

  const _onPressBack = () => {
    setSearchString('');
    setPageNumber(1);
    onPressBack && onPressBack();
  };

  const renderListEmptyComponent = () => {
    return (
      <Warning title={i18n.warningTitle.warning} message={i18n.warningMessage.noTokenAvailable} isDanger={false} />
    );
  };

  const _onLoadMore = () => {
    if (lazyList.length === filteredOptions.length) {
      return;
    }
    setLoading(true);
    const currentPageNumber = pageNumber + 1;
    setTimeout(() => {
      setLoading(false);
      setPageNumber(currentPageNumber);
    }, 2000);
  };

  const renderLoadingAnimation = () => {
    return isLoading ? <ActivityLoading /> : null;
  };

  const _onSearchToken = (text: string) => {
    setPageNumber(1);
    setSearchString(text);
  };

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <SelectScreen
        style={{ paddingTop: 0 }}
        onPressBack={_onPressBack}
        title={i18n.title.selectToken}
        searchString={searchString}
        onChangeSearchText={_onSearchToken}>
        <FlatList
          style={{ ...ScrollViewStyle }}
          keyboardShouldPersistTaps={'handled'}
          data={lazyList}
          onEndReached={_onLoadMore}
          renderItem={renderItem}
          onEndReachedThreshold={0.7}
          ListEmptyComponent={renderListEmptyComponent}
          ListFooterComponent={renderLoadingAnimation}
        />
      </SelectScreen>
    </SubWalletFullSizeModal>
  );
};
