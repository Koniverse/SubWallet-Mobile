import React, { useEffect, useState } from 'react';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { Warning } from 'components/Warning';
import { NetworkSelectItem } from 'components/NetworkSelectItem';
import { NetworkSelectOption } from 'hooks/useGenesisHashOptions';
import { SelectScreen } from 'components/SelectScreen';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';

interface Props {
  modalVisible: boolean;
  genesisOptions: NetworkSelectOption[];
  onPressBack?: () => void;
  onChangeNetwork?: (item: NetworkSelectOption) => void;
  selectedNetwork: string;
  onChangeModalVisible: () => void;
}

export const NetworkSelect = ({
  genesisOptions,
  onPressBack,
  onChangeNetwork,
  selectedNetwork,
  modalVisible,
  onChangeModalVisible,
}: Props) => {
  const [searchString, setSearchString] = useState('');
  const [filteredGenesisOptions, setFilteredGenesisOption] = useState<NetworkSelectOption[]>(genesisOptions);
  const dep = genesisOptions.toString();

  useEffect(() => {
    if (searchString) {
      const lowerCaseSearchString = searchString.toLowerCase();
      setFilteredGenesisOption(
        genesisOptions.filter(network => network.text.toLowerCase().includes(lowerCaseSearchString)),
      );
    } else {
      setFilteredGenesisOption(genesisOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, searchString]);

  const renderItem = ({ item }: ListRenderItemInfo<NetworkSelectOption>) => {
    return (
      <NetworkSelectItem
        key={item.value}
        itemName={item.text}
        itemKey={item.networkKey}
        isSelected={item.networkKey === selectedNetwork}
        onSelectNetwork={() => onChangeNetwork && onChangeNetwork(item)}
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
        title={'Select Network'}
        searchString={searchString}
        onChangeSearchText={setSearchString}>
        <FlatList
          style={{ ...ScrollViewStyle }}
          keyboardShouldPersistTaps={'handled'}
          data={filteredGenesisOptions}
          renderItem={renderItem}
          ListEmptyComponent={renderListEmptyComponent}
          keyExtractor={item => item.networkKey}
        />
      </SelectScreen>
    </SubWalletFullSizeModal>
  );
};
