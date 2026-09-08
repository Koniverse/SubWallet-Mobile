import React, { useCallback, useMemo } from 'react';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { View } from 'react-native';
import { toShort } from 'utils/index';
import { CaretDownIcon } from 'phosphor-react-native';
import Typography from 'components/design-system-ui/typography';
import { AccountAddressItemType } from 'types/account';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';

interface Props {
  items: AccountAddressItemType[];
  value: string;
  disabled?: boolean;
  selectorRef?: React.RefObject<ModalRef | null>;
  onSelectItem?: (item: AccountAddressItemType) => void;
  // The Multisig tab starts with no account picked, so it opts out of the auto-pick
  // and shows a placeholder instead.
  autoSelectFirstItem?: boolean;
  placeholder?: string;
}

export const HistoryAccountSelector = ({
  items,
  value,
  onSelectItem,
  disabled,
  selectorRef,
  autoSelectFirstItem = true,
  placeholder,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;

  const renderSelected = useCallback(() => {
    const selectedItem = value ? items.find(i => i.address === value) : undefined;
    const accountName = selectedItem?.accountName || (value ? toShort(value, 7, 7) : '');

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
        {!!value && <AccountProxyAvatar value={value} size={20} />}
        <View style={{ flex: 1 }}>
          <Typography.Text ellipsis style={{ color: value ? theme.colorTextLight2 : theme.colorTextLight4 }}>
            {value ? accountName : placeholder || ''}
          </Typography.Text>
        </View>

        <View>
          <CaretDownIcon size={12} color={theme['gray-5']} weight={'bold'} />
        </View>
      </View>
    );
  }, [items, placeholder, theme, value]);

  const selectedValueMap = useMemo(() => {
    return value ? { [value]: true } : {};
  }, [value]);

  return (
    <AccountSelector
      items={items}
      autoSelectFirstItem={autoSelectFirstItem}
      selectedValueMap={selectedValueMap}
      onSelectItem={onSelectItem}
      renderSelected={renderSelected}
      disabled={disabled}
      accountSelectorRef={selectorRef}
    />
  );
};
