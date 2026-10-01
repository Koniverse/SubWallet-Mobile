import React, { useCallback, useMemo } from 'react';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { ALL_NETWORK_KEY } from '@subwallet/extension-base/constants';
import { NetworkSelectItem } from 'components/NetworkSelectItem';
import { ModalRef } from 'types/modalRef';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { View } from 'react-native';
import { getNetworkLogo } from 'utils/index';
import { CaretDownIcon } from 'phosphor-react-native';
import Typography from 'components/design-system-ui/typography';
import { ChainSelector } from 'components/Modal/common/ChainSelector';
import { ChainItemType } from 'types/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import i18n from 'utils/i18n/i18n';
import { ActivityIndicator } from 'components/design-system-ui';

interface Props {
  items: ChainItemType[];
  value: string;
  disabled?: boolean;
  loading?: boolean;
  selectorRef?: React.RefObject<ModalRef | null>;
  onSelectItem?: (item: ChainItemType) => void;
}

//todo: i18n Loading...

export const HistoryChainSelector = ({ items, value, onSelectItem, disabled, selectorRef, loading }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const chainName = useMemo(() => {
    if (value === ALL_NETWORK_KEY) {
      return i18n.inputLabel.allNetworks;
    }

    return chainInfoMap[value] ? _getChainName(chainInfoMap[value]) : i18n.placeholder.selectChain;
  }, [chainInfoMap, value]);

  const renderSelected = useCallback(() => {
    return (
      <View
        style={[
          {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.sizeXS,
            paddingLeft: theme.padding,
            paddingRight: theme.padding,
            borderRadius: 32,
            height: 40,
            backgroundColor: theme.colorBgSecondary,
          },
        ]}>
        {!!value && value !== ALL_NETWORK_KEY && <View>{getNetworkLogo(value, 20)}</View>}
        <View style={{ flex: 1 }}>
          {loading && (
            <Typography.Text ellipsis style={{ color: theme.colorTextLight4 }}>
              Loading...
            </Typography.Text>
          )}
          {!loading && (
            <Typography.Text ellipsis style={{ color: theme.colorTextLight2 }}>
              {chainName}
            </Typography.Text>
          )}
        </View>

        <View>
          {loading && <ActivityIndicator size={16} />}
          {!loading && <CaretDownIcon size={12} color={theme['gray-5']} weight={'bold'} />}
        </View>
      </View>
    );
  }, [chainName, loading, theme, value]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChainItemType>) => (
      <NetworkSelectItem
        itemName={item.slug === ALL_NETWORK_KEY ? i18n.inputLabel.allNetworks : item.name}
        itemKey={item.slug}
        hideLogo={item.slug === ALL_NETWORK_KEY}
        isSelected={item.slug === value}
        showSeparator={false}
        iconSize={28}
        onSelectNetwork={() => {
          onSelectItem?.(item);
          selectorRef?.current?.onCloseModal();
        }}
      />
    ),
    [onSelectItem, selectorRef, value],
  );

  const selectedValueMap = useMemo(() => {
    return value ? { [value]: true } : {};
  }, [value]);

  return (
    <ChainSelector
      items={items}
      selectedValueMap={selectedValueMap}
      onSelectItem={onSelectItem}
      disabled={disabled}
      renderSelected={renderSelected}
      renderCustomItem={renderItem}
      chainSelectorRef={selectorRef}
    />
  );
};
