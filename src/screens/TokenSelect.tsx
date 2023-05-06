import React from 'react';
import { ListRenderItemInfo } from 'react-native';
import { Warning } from 'components/Warning';
import { NetworkSelectItem } from 'components/NetworkSelectItem';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import { TokenItemType } from 'types/ui-types';
import i18n from 'utils/i18n/i18n';
import useTokenOptions from 'hooks/screen/TokenSelect/useTokenOptions';
import { FlatListScreen } from 'components/FlatListScreen';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import {EmptyList} from "components/EmptyList";
import {Coins} from "phosphor-react-native";

interface Props {
  address: string;
  isOnlyShowMainToken?: boolean;
  modalVisible: boolean;
  onPressBack?: () => void;
  onChangeModalVisible: () => void;
  onChangeToken?: (item: TokenItemType) => void;
  filteredNetworkKey?: string;
  selectedNetworkKey?: string;
  selectedToken?: string;
  externalTokenOptions?: TokenItemType[];
  title?: string;
}

const filterFunction = (items: TokenItemType[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(
    ({ displayedSymbol, networkDisplayName }) =>
      displayedSymbol.toLowerCase().includes(lowerCaseSearchString) ||
      networkDisplayName.toLowerCase().includes(lowerCaseSearchString),
  );
};

const renderListEmptyComponent = () => {
  return <EmptyList icon={Coins} title={'No tokens found'} message={'Add tokens to get started.'} />;
};

export const TokenSelect = ({
  address,
  onPressBack,
  onChangeToken,
  filteredNetworkKey,
  selectedNetworkKey,
  selectedToken,
  modalVisible,
  onChangeModalVisible,
  externalTokenOptions,
  isOnlyShowMainToken,
  title = i18n.title.token,
}: Props) => {
  const defaultTokenOptions = useTokenOptions(address, filteredNetworkKey);
  const mainTokenOptions = defaultTokenOptions.filter(item => item.isMainToken);
  const tokenOptions = externalTokenOptions
    ? externalTokenOptions
    : isOnlyShowMainToken
    ? mainTokenOptions
    : defaultTokenOptions;

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

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <FlatListScreen
        autoFocus={true}
        items={tokenOptions}
        style={FlatListScreenPaddingTop}
        title={title}
        searchFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={onPressBack}
        renderListEmptyComponent={renderListEmptyComponent}
      />
    </SubWalletFullSizeModal>
  );
};
