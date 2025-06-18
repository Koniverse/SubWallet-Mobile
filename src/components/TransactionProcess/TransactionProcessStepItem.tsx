import { TransactionProcessStepItemType } from 'types/component';
import React, { useMemo } from 'react';
import { isStepCompleted, isStepFailed, isStepPending, isStepProcessing, isStepTimeout } from 'utils/transaction';
import { Icon, Logo, Typography } from 'components/design-system-ui';
import { CheckCircle, ClockCounterClockwise, ProhibitInset, SpinnerGap } from 'phosphor-react-native';
import { RollingIcon } from 'components/RollingIcon';
import { LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';

type Props = TransactionProcessStepItemType & {
  heights: number[];
  handleLayout: (_index: number, event: LayoutChangeEvent) => void;
};

export const TransactionProcessStepItem = (props: Props) => {
  const { content, index, isLastItem, logoKey, status, heights, handleLayout } = props;
  const theme = useSubWalletTheme().swThemes;

  const color = useMemo(() => {
    if (isStepPending(status)) {
      return theme.colorTextLight7;
    }

    if (isStepProcessing(status)) {
      return '#D9A33E';
    }

    if (isStepCompleted(status)) {
      return theme.colorSuccess;
    }

    if (isStepFailed(status)) {
      return theme.colorError;
    }

    if (isStepTimeout(status)) {
      return theme.gold;
    }

    return 'transparent'; // can be change later
  }, [status, theme.colorError, theme.colorSuccess, theme.colorTextLight7, theme.gold]);
  const styles = useMemo(() => createStyle(theme, color), [color, theme]);

  const icon = useMemo(() => {
    if (logoKey) {
      if (isStepCompleted(status) || isStepFailed(status) || isStepTimeout(status)) {
        return <Icon customIcon={<Logo size={16} shape={'circle'} network={logoKey.toLowerCase()} />} />;
      }
    }

    if (isStepCompleted(status)) {
      return <Icon size={'xs'} phosphorIcon={CheckCircle} iconColor={theme.colorSuccess} weight={'fill'} />;
    } else if (isStepFailed(status)) {
      return <Icon phosphorIcon={ProhibitInset} size={'xs'} iconColor={theme.colorError} weight={'fill'} />;
    } else if (isStepProcessing(status)) {
      return <RollingIcon icon={<Icon phosphorIcon={SpinnerGap} size={'xs'} iconColor={'#D9A33E'} />} />;
    } else if (isStepTimeout(status)) {
      return <Icon phosphorIcon={ClockCounterClockwise} size={'xs'} iconColor={theme.gold} weight={'fill'} />;
    }

    return (
      <View style={styles.stepOrdinalWrapper}>
        <Typography.Text style={styles.stepOrdinal}>{index + 1}</Typography.Text>
      </View>
    );
  }, [
    index,
    logoKey,
    status,
    styles.stepOrdinal,
    styles.stepOrdinalWrapper,
    theme.colorError,
    theme.colorSuccess,
    theme.gold,
  ]);

  const verticalLineHeight = useMemo(() => {
    if (heights[index]) {
      const previousHeight = heights[index] - 24;
      const nextHeight = heights[index + 1] ? heights[index + 1] - 24 : 0;
      return previousHeight / 2 + nextHeight / 2;
    } else {
      return 0;
    }
  }, [heights, index]);

  return (
    <TouchableOpacity key={index} style={styles.row}>
      <View style={styles.stepContainer}>
        <View style={styles.circle}>{icon}</View>
        {!isLastItem && <View style={[styles.verticalLine, { height: verticalLineHeight }]} />}
      </View>
      <View style={styles.contentContainer} onLayout={e => handleLayout(index, e)}>
        {content}
      </View>
    </TouchableOpacity>
  );
};

function createStyle(theme: ThemeTypes, color: string) {
  return StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: '#000', // Match background
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    stepContainer: {
      width: 24,
      alignItems: 'center',
      position: 'relative',
    },
    circle: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: color,
    },
    stepText: {
      color: '#fff',
      fontSize: 12,
    },
    verticalLine: {
      position: 'absolute',
      top: 28,
      width: 1,
      height: '100%',
      backgroundColor: '#444',
    },
    contentContainer: {
      flex: 1,
      marginLeft: 12,
      padding: 12,
      backgroundColor: '#1c1c1e',
      borderRadius: 8,
    },
    contentText: {
      color: '#fff',
      fontSize: 14,
    },
    stepOrdinalWrapper: {
      width: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: color,
      borderRadius: 16,
    },
    stepOrdinal: {
      color: theme.colorWhite,
      fontSize: 10,
      lineHeight: 16,
    },
  });
}
