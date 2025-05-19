import { VoidFunction } from 'types/index';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';
import { CheckCircle, IconProps, Lightning, Tree, Wind } from 'phosphor-react-native';
import { SwIconProps } from '@subwallet/react-ui';
import { TouchableOpacity, View } from 'react-native';
import { Icon, Typography, Number, BackgroundIcon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

export type FeeOption = 'slow' | 'average' | 'fast';

type Props = {
  time: number; // in milliseconds
  feeValueInfo: {
    value: string | number | BigNumber;
    decimals: number;
    symbol: string;
  };
  type: FeeOption;
  isSelected?: boolean;
  onPress?: VoidFunction;
};

interface IconOption {
  icon: React.ElementType<IconProps>;
  weight: SwIconProps['weight'];
  backgroundColor: string;
}

export const FeeOptionItem = ({ feeValueInfo, isSelected, onPress, time, type }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const feeTypeNameMap = useMemo<Record<FeeOption, string>>(
    () => ({
      slow: 'Low',
      average: 'Medium',
      fast: 'High',
    }),
    [],
  );

  const timeText = useMemo((): string => {
    if (time >= 0) {
      const seconds = time / 1000;
      const days = Math.floor(seconds / 86400); // 86400 seconds in a day
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      let timeString = '';

      if (days > 0) {
        timeString += `${days} ${days === 1 ? 'day' : 'days'}`;
      }

      if (hours > 0) {
        timeString += ` ${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
      }

      if (minutes > 0) {
        timeString += ` ${minutes} ${minutes === 1 ? 'min' : 'mins'}`;
      }

      timeString = timeString.trim();

      return timeString ? `~ ${timeString}` : `${seconds} sec`; // Return '0 minutes' if time is 0
    } else {
      return 'Unknown time';
    }
  }, [time]);

  const IconMap: Record<FeeOption, IconOption> = {
    slow: {
      icon: Tree,
      weight: 'fill',
      backgroundColor: theme['green-7'],
    },
    average: {
      icon: Wind,
      weight: 'fill',
      backgroundColor: theme.colorPrimary,
    },
    fast: {
      icon: Lightning,
      weight: 'fill',
      backgroundColor: theme['gold-6'],
    },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 12,
        backgroundColor: theme.colorBgSecondary,
        borderRadius: theme.borderRadiusLG,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizeSM,
      }}>
      <BackgroundIcon
        shape={'circle'}
        backgroundColor={IconMap[type].backgroundColor}
        phosphorIcon={IconMap[type].icon}
        weight={IconMap[type].weight}
        size={'sm'}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Typography.Text size={'md'} style={{ color: theme.colorWhite }}>
              {feeTypeNameMap[type]}
            </Typography.Text>
            <Typography.Text style={{ color: theme.colorWhite }}>{' - '}</Typography.Text>
            <Number decimal={feeValueInfo.decimals} value={feeValueInfo.value} suffix={feeValueInfo.symbol} />
          </View>
          <View>
            <Typography.Text style={{ color: theme.colorSecondary }}>{timeText}</Typography.Text>
          </View>
        </View>
        {isSelected && <Icon phosphorIcon={CheckCircle} weight={'fill'} size={'sm'} iconColor={theme.colorSuccess} />}
      </View>
    </TouchableOpacity>
  );
};
