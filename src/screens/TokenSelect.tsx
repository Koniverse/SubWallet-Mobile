import React, { useState } from 'react';
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
  const tokenOptions = useTokenOptions(address, filteredNetworkKey);
  const filteredOptions = useFilteredOptions(tokenOptions, searchString);

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

  const renderListEmptyComponent = () => {
    return <Warning title={'Warning'} message={i18n.warningMessage.noTokenAvailable} isDanger={false} />;
  };

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <SelectScreen
        onPressBack={onPressBack || (() => {})}
        title={'Select Token'}
        searchString={searchString}
        onChangeSearchText={setSearchString}>
        <FlatList
          style={{ ...ScrollViewStyle }}
          keyboardShouldPersistTaps={'handled'}
          data={filteredOptions}
          renderItem={renderItem}
          ListEmptyComponent={renderListEmptyComponent}
        />
      </SelectScreen>
    </SubWalletFullSizeModal>
  );
};
