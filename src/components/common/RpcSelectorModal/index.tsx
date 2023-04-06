import React, { useCallback, useMemo } from 'react';
import { SelectItem, SwFullSizeModal } from 'components/design-system-ui';
import { FlatListScreen } from 'components/FlatListScreen';
import { ContainerHorizontalPadding, FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { ListRenderItemInfo, View } from 'react-native';
import { Warning } from 'components/Warning';
import i18n from 'utils/i18n/i18n';
import { ShareNetwork } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  chainInfo: _ChainInfo;
  modalVisible: boolean;
  selectedValue: string;
  onPressBack: () => void;
  renderEmptyList?: () => JSX.Element;
  onSelectItem?: (value: string) => void;
}

interface ProviderItemType {
  value: string;
  label: string;
}

const defaultRenderListEmptyComponent = () => {
  return (
    <Warning
      style={{ marginHorizontal: 16 }}
      title={i18n.warningTitle.warning}
      message={'No provider available'}
      isDanger={false}
    />
  );
};

const searchFunction = (items: { label: string; value: string }[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(item => item.label.toLowerCase().includes(lowerCaseSearchString));
};

export const RpcSelectorModal = ({
  modalVisible,
  chainInfo,
  selectedValue,
  renderEmptyList,
  onPressBack,
  onSelectItem,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const providerList = useMemo(() => {
    return Object.entries(chainInfo.providers).map(([key, provider]) => {
      return {
        value: key,
        label: provider,
      } as ProviderItemType;
    });
  }, [chainInfo.providers]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<{ label: string; value: string }>) => (
      <View style={{ ...ContainerHorizontalPadding }}>
        <SelectItem
          icon={ShareNetwork}
          backgroundColor={theme.colorTextLight4}
          label={item.label}
          isSelected={item.label === selectedValue}
          onPress={() => {
            onSelectItem && onSelectItem(item.label);
            onPressBack();
          }}
        />
      </View>
    ),
    [theme.colorTextLight4, selectedValue, onSelectItem, onPressBack],
  );

  return (
    <SwFullSizeModal modalVisible={modalVisible}>
      <FlatListScreen
        autoFocus={true}
        items={providerList}
        style={FlatListScreenPaddingTop}
        title={'Providers'}
        searchFunction={searchFunction}
        renderItem={renderItem}
        onPressBack={onPressBack}
        renderListEmptyComponent={renderEmptyList ? renderEmptyList : defaultRenderListEmptyComponent}
        isShowFilterBtn={false}
      />
    </SwFullSizeModal>
  );
};
