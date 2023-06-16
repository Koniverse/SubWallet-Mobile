import { Icon, Typography } from 'components/design-system-ui';
import { toShort } from 'utils/index';
import Avatar from '../../avatar';
import Web3Block, { Web3BlockCustomStyle, Web3BlockProps } from '../Web3Block';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import createStyle from './styles';
import { CheckCircle } from 'phosphor-react-native';

interface CustomStyle extends Web3BlockCustomStyle {
  address?: StyleProp<TextStyle>;
}

export interface AccountItemProps extends Omit<Web3BlockProps, 'customStyle'> {
  address: string;
  avatarSize?: number;
  addressPreLength?: number;
  addressSufLength?: number;
  isSelected?: boolean;
  customStyle?: CustomStyle;
}

const AccountItem: React.FC<AccountItemProps> = (props: AccountItemProps) => {
  const {
    leftItem,
    rightItem,
    middleItem,
    address,
    avatarSize = 24,
    addressPreLength,
    addressSufLength,
    isSelected,
    customStyle,
    ...restProps
  } = props;
  const { address: addressStyle, container: containerStyle, ...restStyle } = customStyle || {};
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <Web3Block
      {...restProps}
      customStyle={{
        container: [styles.container, isSelected && styles.containerSelected, containerStyle],
        ...restStyle,
      }}
      leftItem={leftItem || <Avatar value={address} size={avatarSize} />}
      middleItem={
        middleItem || (
          <Typography.Text style={[addressStyle]}>
            {toShort(address || '', addressPreLength, addressSufLength)}
          </Typography.Text>
        )
      }
      rightItem={
        rightItem || (
          <>
            {isSelected && <Icon phosphorIcon={CheckCircle} size="sm" iconColor={theme.colorSecondary} weight="fill" />}
          </>
        )
      }
    />
  );
};

export default AccountItem;
