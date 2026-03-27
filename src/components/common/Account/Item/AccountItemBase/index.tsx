import { AccountItem, Icon } from 'components/design-system-ui';
import createStyle from './styles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { CheckCircleIcon, EyeIcon, IconProps, QrCodeIcon, SwatchesIcon } from 'phosphor-react-native';
import useAccountAvatarInfo from 'hooks/account/useAccountAvatarInfo';
import { AccountItemProps } from 'components/design-system-ui';
import { KeypairType } from '@polkadot/util-crypto/types';
import useGetAccountSignModeByAddress from 'hooks/screen/useGetAccountSignModeByAddress';
import { View } from 'react-native';
import { AccountSignMode } from '@subwallet/extension-base/types';

export interface AccountItemBaseProps extends AccountItemProps {
  genesisHash?: string | null;
  type?: KeypairType;
  accountName?: string;
  showUnselectIcon?: boolean;
  preventPrefix?: boolean;
  showAccountSignModeIcon?: boolean;
}

const AccountItemBase: React.FC<AccountItemBaseProps> = (props: AccountItemBaseProps) => {
  const {
    address,
    genesisHash,
    isSelected,
    preventPrefix,
    rightItem,
    showUnselectIcon,
    customStyle,
    showAccountSignModeIcon = false,
    ...restProps
  } = props;
  const { address: avatarAddress } = useAccountAvatarInfo(address ?? '', preventPrefix, genesisHash);
  const signMode = useGetAccountSignModeByAddress(address);
  const accountSignModeIcon = useMemo((): React.ElementType<IconProps> | undefined => {
    switch (signMode) {
      case AccountSignMode.GENERIC_LEDGER:
      case AccountSignMode.LEGACY_LEDGER:
        return SwatchesIcon;
      case AccountSignMode.QR:
        return QrCodeIcon;
      case AccountSignMode.READ_ONLY:
        return EyeIcon;
    }

    return undefined;
  }, [signMode]);

  const theme = useSubWalletTheme().swThemes;

  const { container: containerStyle, middle: middleStyle, right: rightStyle, ...restStyle } = customStyle || {};
  const styles = useMemo(() => createStyle(theme), [theme]);

  const _rightItem = rightItem || (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.paddingSM - 2 }}>
      {accountSignModeIcon && showAccountSignModeIcon && (
        <View>
          <Icon phosphorIcon={accountSignModeIcon} size={'sm'} iconColor={theme.colorTextTertiary} />
        </View>
      )}

      {(showUnselectIcon || isSelected) && (
        <Icon
          iconColor={isSelected ? theme.colorSuccess : theme.colorTextLight4}
          phosphorIcon={CheckCircleIcon}
          size="sm"
          type="phosphor"
          weight="fill"
        />
      )}
    </View>
  );

  return (
    <AccountItem
      customStyle={{
        container: [styles.container, containerStyle],
        middle: [styles.middle, middleStyle],
        right: [styles.right, rightStyle],
        ...restStyle,
      }}
      {...restProps}
      address={avatarAddress ?? ''}
      rightItem={_rightItem}
    />
  );
};

export default AccountItemBase;
