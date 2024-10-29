import React, { useMemo } from 'react';
import { CirclesThreePlus, Eye, GitCommit, Needle, QrCode, Question, Strategy, Swatches } from 'phosphor-react-native';
import { AccountProxyType } from '@subwallet/extension-base/types';
import { Icon, Tag } from 'components/design-system-ui';
import { SWIconProps } from 'components/design-system-ui/icon';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ViewStyle } from 'react-native';
import { TagPropsType } from 'components/design-system-ui/tag/PropsType';

interface Props {
  type: AccountProxyType;
  style?: ViewStyle;
}

type TagType = {
  color?: TagPropsType['color'];
  bgColor?: TagPropsType['bgColor'];
  label: string;
  icon: {
    size?: SWIconProps['size'];
    customSize?: SWIconProps['customSize'];
    phosphorIcon?: SWIconProps['phosphorIcon'];
    weight?: SWIconProps['weight'];
    iconColor?: SWIconProps['iconColor'];
  };
};

export const AccountProxyTypeTag = ({ type, style }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const tag = useMemo<TagType>(() => {
    const result: TagType = {
      color: 'default',
      label: '',
      icon: {
        weight: 'fill',
        size: 'xxs',
      },
    };

    if (type === AccountProxyType.ALL_ACCOUNT) {
      result.label = 'All account';
      result.icon.phosphorIcon = CirclesThreePlus;
    } else if (type === AccountProxyType.SOLO) {
      result.color = 'blue';
      result.label = 'Solo account';
      result.icon.iconColor = theme['blue-7'];
      result.icon.phosphorIcon = GitCommit;
    } else if (type === AccountProxyType.UNIFIED) {
      result.color = 'success';
      result.label = 'Unified account';
      result.icon.phosphorIcon = Strategy;
      result.icon.iconColor = theme.colorSuccess;
    } else if (type === AccountProxyType.QR) {
      result.color = 'default';
      result.label = 'QR signer account';
      result.icon.phosphorIcon = QrCode;
      result.bgColor = 'rgba(217, 217, 217, 0.1)';
      result.color = 'gray';
    } else if (type === AccountProxyType.LEDGER) {
      result.label = 'Ledger account';
      result.color = 'gray';
      result.icon.phosphorIcon = Swatches;
      result.bgColor = 'rgba(217, 217, 217, 0.1)';
    } else if (type === AccountProxyType.READ_ONLY) {
      result.label = 'Watch-only account';
      result.icon.phosphorIcon = Eye;
      result.bgColor = 'rgba(217, 217, 217, 0.1)';
      result.color = 'gray';
    } else if (type === AccountProxyType.INJECTED) {
      result.label = 'injected account';
      result.icon.phosphorIcon = Needle;
      result.bgColor = 'rgba(217, 217, 217, 0.1)';
      result.color = 'gray';
    } else if (type === AccountProxyType.UNKNOWN) {
      result.label = 'Unknown account';
      result.icon.phosphorIcon = Question;
      result.bgColor = 'rgba(217, 217, 217, 0.1)';
      result.color = 'gray';
    }

    return result;
  }, [theme, type]);

  return (
    <Tag
      style={style}
      bgType={'default'}
      bgColor={tag.bgColor}
      color={tag.color}
      icon={
        <Icon
          phosphorIcon={tag.icon.phosphorIcon}
          size={tag.icon.size}
          iconColor={tag.icon.iconColor}
          weight={tag.icon.weight}
        />
      }>
      {tag.label}
    </Tag>
  );
};
