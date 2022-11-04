import React, { useMemo, useRef, useState } from 'react';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import { ContainerHorizontalPadding, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { ScrollView, StyleProp, Text, TextInput } from 'react-native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Search } from 'components/Search';
import { ColorMap } from 'styles/color';
import { NetworkSelectItem } from 'components/NetworkSelectItem';

const GroupTitleTextStyle: StyleProp<any> = { ...sharedStyles.mainText, ...FontSemiBold, color: ColorMap.disabled };

interface Props {
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  onPressBack: () => void;
  networkOptions: { label: string; value: string }[];
  selectedNetworkKey: string;
  onChangeNetwork: (chain: string) => void;
}

const filterFunction = (items: { label: string; value: string }[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(item => item.label.toLowerCase().includes(lowerCaseSearchString));
};

const renderListEmptyComponent = () => {
  return (
    <Warning title={i18n.warningTitle.warning} message={i18n.warningMessage.noNetworkAvailable} isDanger={false} />
  );
};

export const DestinationChainSelect = ({
  modalVisible,
  onChangeModalVisible,
  onPressBack,
  networkOptions,
  selectedNetworkKey,
  onChangeNetwork,
}: Props) => {
  const [searchString, setSearchString] = useState<string>('');
  const searchRef = useRef<TextInput>(null);
  const onChainNetworkOptions = useMemo(() => {
    return filterFunction([networkOptions[0]], searchString);
  }, [networkOptions, searchString]);
  const crossChainNetworkOptions = useMemo(() => {
    return filterFunction(networkOptions.slice(1), searchString);
  }, [networkOptions, searchString]);
  const isOnChainNetworkOptionsExist = !!(onChainNetworkOptions && onChainNetworkOptions.length);
  const isCrossChainNetworkOptionsExist = !!(crossChainNetworkOptions && crossChainNetworkOptions.length);

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <ContainerWithSubHeader onPressBack={onPressBack} title={i18n.sendAssetScreen.destinationChain}>
        <>
          <Search
            autoFocus={false}
            placeholder={i18n.common.search}
            onClearSearchString={() => setSearchString('')}
            onSearch={setSearchString}
            searchText={searchString}
            style={{ marginBottom: 8, marginTop: 10, marginHorizontal: 16 }}
            searchRef={searchRef}
          />
          <ScrollView style={{ ...ContainerHorizontalPadding }} keyboardShouldPersistTaps={'handled'}>
            {isOnChainNetworkOptionsExist && (
              <>
                <Text style={GroupTitleTextStyle}>{i18n.sendAssetScreen.onChain}</Text>
                {onChainNetworkOptions.map(item => {
                  return (
                    <NetworkSelectItem
                      key={item.value}
                      itemKey={item.value}
                      itemName={item.label}
                      isSelected={item.value === selectedNetworkKey}
                      onSelectNetwork={() => onChangeNetwork(item.value)}
                      showSeparator={false}
                      iconSize={20}
                    />
                  );
                })}
              </>
            )}

            {isCrossChainNetworkOptionsExist && (
              <>
                <Text style={GroupTitleTextStyle}>{i18n.sendAssetScreen.crossChain}</Text>
                {crossChainNetworkOptions.map(item => {
                  return (
                    <NetworkSelectItem
                      key={item.value}
                      itemKey={item.value}
                      itemName={item.label}
                      isSelected={item.value === selectedNetworkKey}
                      onSelectNetwork={() => onChangeNetwork(item.value)}
                      showSeparator={false}
                      iconSize={20}
                    />
                  );
                })}
              </>
            )}

            {!isCrossChainNetworkOptionsExist && !isOnChainNetworkOptionsExist && renderListEmptyComponent()}
          </ScrollView>
        </>
      </ContainerWithSubHeader>
    </SubWalletFullSizeModal>
  );
};
