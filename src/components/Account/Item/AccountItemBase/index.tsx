import { AccountItem, Icon } from 'components/design-system-ui';
import createStyle from './styles';
import useAccountAvatarInfo from 'hooks/account/useAccountAvatarInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { CheckCircle } from 'phosphor-react-native';

import { AccountItemProps } from 'components/design-system-ui';
import { KeypairType } from '@polkadot/util-crypto/types';

export interface AccountItemBaseProps extends AccountItemProps {
  genesisHash?: string | null;
  type?: KeypairType;
  accountName?: string;
  showUnselectIcon?: boolean;
  preventPrefix?: boolean;
}

const AccountItemBase: React.FC<AccountItemBaseProps> = (props: AccountItemBaseProps) => {
  const { address, genesisHash, isSelected, preventPrefix, rightItem, showUnselectIcon, customStyle, ...restProps } =
    props;
  const { address: avatarAddress } = useAccountAvatarInfo(address ?? '', preventPrefix, genesisHash);

  const theme = useSubWalletTheme().swThemes;

  const { container: containerStyle, middle: middleStyle, right: rightStyle, ...restStyle } = customStyle || {};
  const styles = useMemo(() => createStyle(theme), [theme]);

  const _rightItem = rightItem || (
    <>
      {(showUnselectIcon || isSelected) && (
        <Icon
          iconColor={isSelected ? theme.colorSuccess : theme.colorTextLight4}
          phosphorIcon={CheckCircle}
          size="sm"
          type="phosphor"
          weight="fill"
        />
      )}
    </>
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
