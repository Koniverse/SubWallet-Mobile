import React, { useCallback, useMemo } from 'react';
import { ModalRef } from 'types/modalRef';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { View } from 'react-native';
import { getNetworkLogo } from 'utils/index';
import { CaretDown } from 'phosphor-react-native';
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
  selectorRef?: React.MutableRefObject<ModalRef | undefined>;
  onSelectItem?: (item: ChainItemType) => void;
}

//todo: i18n Loading...

export const HistoryChainSelector = ({ items, value, onSelectItem, disabled, selectorRef, loading }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const chainName = useMemo(() => {
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
        {value && <View>{getNetworkLogo(value, 20)}</View>}
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
          {!loading && <CaretDown size={12} color={theme['gray-5']} weight={'bold'} />}
        </View>
      </View>
    );
  }, [chainName, loading, theme, value]);

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
      chainSelectorRef={selectorRef}
    />
  );
};
