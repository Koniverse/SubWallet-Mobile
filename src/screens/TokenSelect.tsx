import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { Warning } from 'components/Warning';
import { NetworkSelectItem } from 'components/NetworkSelectItem';
import { getSelectedTokenList, TokenArrayType } from 'utils/index';
import { SelectScreen } from 'components/SelectScreen';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';

interface Props {
  modalVisible: boolean;
  onPressBack: () => void;
  onChangeModalVisible: () => void;
  onChangeToken: (token: TokenArrayType) => void;
  selectedNetwork: string;
  selectedToken: string;
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
  const { networkBalanceMaps } = useAccountBalance(selectedNetwork, [selectedNetwork]);
  const tokenList = getSelectedTokenList(networkBalanceMaps);
  const [filteredOptions, setFilteredOption] = useState<TokenArrayType[]>(tokenList);

  const dep = tokenList.toString();

  useEffect(() => {
    if (searchString) {
      const lowerCaseSearchString = searchString.toLowerCase();
      setFilteredOption(
        tokenList.filter(token => token.tokenBalanceSymbol.toLowerCase().includes(lowerCaseSearchString)),
      );
    } else {
      setFilteredOption(tokenList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, searchString]);

  // @ts-ignore
  const renderItem = ({ item }) => {
    return (
      <NetworkSelectItem
        key={item.tokenBalanceSymbol}
        itemName={item.tokenBalanceSymbol}
        itemKey={item.selectNetworkKey}
        isSelected={item.tokenBalanceSymbol === selectedToken}
        onSelectNetwork={() => onChangeToken(item)}
      />
    );
  };

  const renderListEmptyComponent = () => {
    return <Warning title={'Warning'} message={'no network'} isDanger={false} />;
  };

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <SelectScreen
        onPressBack={onPressBack}
        title={'Select Network'}
        searchString={searchString}
        onChangeSearchText={setSearchString}>
        <FlatList
          style={{ ...ScrollViewStyle }}
          keyboardShouldPersistTaps={'handled'}
          data={filteredOptions}
          renderItem={renderItem}
          ListEmptyComponent={renderListEmptyComponent}
          keyExtractor={item => item.tokenBalanceSymbol}
        />
      </SelectScreen>
    </SubWalletFullSizeModal>
  );
};
