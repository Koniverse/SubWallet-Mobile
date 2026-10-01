import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';
import { Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { timeframeLabelMap, timeframes } from './shared';

interface Props {
  selectedTimeframe: PriceChartTimeframe;
  onSelect: (timeframe: PriceChartTimeframe) => void;
}

interface ItemProps {
  timeframe: PriceChartTimeframe;
  isSelected: boolean;
  onSelect: (timeframe: PriceChartTimeframe) => void;
  styles: ReturnType<typeof createStyles>;
  theme: ThemeTypes;
}

const TimeframeItem = ({ isSelected, onSelect, styles, theme, timeframe }: ItemProps) => {
  const onPress = useCallback(() => onSelect(timeframe), [onSelect, timeframe]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.item, isSelected && styles.itemSelected]}>
      <Typography.Text
        size={'sm'}
        style={{ color: isSelected ? theme.colorTextLight1 : theme.colorTextLight4 }}>
        {timeframeLabelMap[timeframe]}
      </Typography.Text>
    </TouchableOpacity>
  );
};

export const TimeframeSelector = ({ onSelect, selectedTimeframe }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {timeframes.map(timeframe => (
        <TimeframeItem
          isSelected={selectedTimeframe === timeframe}
          key={timeframe}
          onSelect={onSelect}
          styles={styles}
          theme={theme}
          timeframe={timeframe}
        />
      ))}
    </View>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: theme.padding,
    },
    item: {
      flex: 1,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 50,
    },
    itemSelected: {
      backgroundColor: theme.colorBgInput,
    },
  });
}
