import React, { useEffect, useState } from 'react';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { Warning } from 'components/Warning';
import { NetworkSelectItem } from 'components/NetworkSelectItem';
import { SelectScreen } from 'components/SelectScreen';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getTokenItemOptions } from 'utils/index';
import { isAccountAll } from '@subwallet/extension-koni-base/utils/utils';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { TokenItemType } from 'types/ui-types';
import i18n from "utils/i18n/i18n";

interface Props {
  modalVisible: boolean;
  onPressBack?: () => void;
  onChangeModalVisible: () => void;
  onChangeToken?: (item: TokenItemType) => void;
  filteredNetworkKey?: string;
  selectedNetworkKey?: string;
  selectedToken?: string;
}

export const TokenSelect = ({
  onPressBack,
  onChangeToken,
  filteredNetworkKey,
  selectedNetworkKey,
  selectedToken,
  modalVisible,
  onChangeModalVisible,
}: Props) => {
  const [searchString, setSearchString] = useState('');
  const {
    chainRegistry: chainRegistryMap,
    networkMap,
    accounts: { currentAccountAddress },
  } = useSelector((state: RootState) => state);

  const tokenOptionsType = isAccountAll(currentAccountAddress)
    ? undefined
    : isEthereumAddress(currentAccountAddress)
    ? 'ETHEREUM'
    : 'SUBSTRATE';

  const tokenOptions = getTokenItemOptions(chainRegistryMap, networkMap, tokenOptionsType, filteredNetworkKey);
  const [filteredOptions, setFilteredOption] = useState<TokenItemType[]>(tokenOptions);

  const dep = tokenOptions.toString();

  useEffect(() => {
    if (searchString) {
      const lowerCaseSearchString = searchString.toLowerCase();
      setFilteredOption(
        tokenOptions.filter(
          ({ displayedSymbol, networkDisplayName }) =>
            displayedSymbol.toLowerCase().includes(lowerCaseSearchString) ||
            networkDisplayName.toLowerCase().includes(lowerCaseSearchString),
        ),
      );
    } else {
      setFilteredOption(tokenOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, searchString]);

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
