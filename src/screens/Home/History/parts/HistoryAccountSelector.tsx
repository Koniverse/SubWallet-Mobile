import React, { useCallback, useMemo } from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { View } from 'react-native';
import { toShort } from 'utils/index';
import { Avatar } from 'components/design-system-ui';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { CaretDown } from 'phosphor-react-native';
import Typography from 'components/design-system-ui/typography';

interface Props {
  items: AccountJson[];
  value: string;
  disabled?: boolean;
  selectorRef?: React.MutableRefObject<ModalRef | undefined>;
  onSelectItem?: (item: AccountJson) => void;
}

export const HistoryAccountSelector = ({ items, value, onSelectItem, disabled, selectorRef }: Props) => {
  const theme = useSubWalletTheme().swThemes;

  const renderSelected = useCallback(() => {
    const selectedItem = value ? items.find(i => i.address === value) : undefined;
    const accountName = selectedItem?.name || (value ? toShort(value, 7, 7) : '');

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
        <Avatar value={value} size={20} theme={isEthereumAddress(value) ? 'ethereum' : 'polkadot'} />
        <View style={{ flex: 1 }}>
          {!!value && (
            <Typography.Text ellipsis style={{ color: theme.colorTextLight2 }}>
              {accountName}
            </Typography.Text>
          )}
        </View>

        <View>
          <CaretDown size={12} color={theme['gray-5']} weight={'bold'} />
        </View>
      </View>
    );
  }, [items, theme, value]);

  const selectedValueMap = useMemo(() => {
    return value ? { [value]: true } : {};
  }, [value]);

  return (
    <AccountSelector
      items={items}
      selectedValueMap={selectedValueMap}
      onSelectItem={onSelectItem}
      renderSelected={renderSelected}
      disabled={disabled}
      accountSelectorRef={selectorRef}
    />
  );
};
