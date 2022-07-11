import React, { useEffect, useState } from 'react';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { Warning } from 'components/Warning';
import { NetworkSelectItem } from 'components/NetworkSelectItem';
import { SelectScreen } from 'components/SelectScreen';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ChainRegistry, TokenInfo } from '@subwallet/extension-base/background/KoniTypes';

interface Props {
  modalVisible: boolean;
  onPressBack?: () => void;
  onChangeModalVisible: () => void;
  onChangeToken?: (token: TokenInfo) => void;
  selectedNetwork: string;
  selectedToken: string;
}

function getTokenList(networkKey: string, chainRegistryMap: Record<string, ChainRegistry>): TokenInfo[] {
  if (!chainRegistryMap[networkKey]) {
    return [];
  }

  return Object.values(chainRegistryMap[networkKey].tokenMap);
}

export const TokenSelect = ({
  onPressBack,
  onChangeToken,
  selectedNetwork,
  selectedToken,
  modalVisible,
  onChangeModalVisible,
}: Props) => {
  const [searchString, setSearchString] = useState('');
  const { chainRegistry: chainRegistryMap } = useSelector((state: RootState) => state);
  const tokenList = getTokenList(selectedNetwork, chainRegistryMap);
  const [filteredOptions, setFilteredOption] = useState<TokenInfo[]>(tokenList);

  const dep = tokenList.toString();

  useEffect(() => {
    if (searchString) {
      const lowerCaseSearchString = searchString.toLowerCase();
      setFilteredOption(tokenList.filter(token => token.symbol.toLowerCase().includes(lowerCaseSearchString)));
    } else {
      setFilteredOption(tokenList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, searchString]);

  const renderItem = ({ item }: ListRenderItemInfo<TokenInfo>) => {
    return (
      <NetworkSelectItem
        key={item.symbol}
        itemName={item.symbolAlt || item.symbol}
        itemKey={item.isMainToken ? selectedNetwork : item.symbol.toLowerCase()}
        isSelected={item.symbol === selectedToken}
        onSelectNetwork={() => onChangeToken && onChangeToken(item)}
        defaultItemKey={selectedNetwork}
      />
    );
  };

  const renderListEmptyComponent = () => {
    return <Warning title={'Warning'} message={'no network'} isDanger={false} />;
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
          keyExtractor={item => item.symbol}
        />
      </SelectScreen>
    </SubWalletFullSizeModal>
  );
};
