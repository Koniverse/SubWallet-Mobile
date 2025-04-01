import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { StepStatus } from '@subwallet/extension-base/types';
import { CheckCircle, ClockCounterClockwise, ProhibitInset, SpinnerGap } from 'phosphor-react-native';
import { Icon, Typography } from 'components/design-system-ui';
import { isStepCompleted, isStepFailed, isStepPending, isStepProcessing, isStepTimeout } from 'utils/transaction';
import { RollingIcon } from 'components/RollingIcon';

export type ProcessStepItemType = {
  status: StepStatus;
  text: React.JSX.Element | '';
  index: number;
  isLastItem?: boolean;
  isFirstItem?: boolean;
};

type Props = ProcessStepItemType;

const ProcessStepItem: React.FC<Props> = (props: Props) => {
  const { index, isLastItem, isFirstItem, status, text } = props;
  const theme = useSubWalletTheme().swThemes;
  const [textHeight, setTextHeight] = useState(0);
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
  const styles = useMemo(
    () => createStyle(theme, color, !!isLastItem, !!isFirstItem, textHeight),
    [color, isFirstItem, isLastItem, textHeight, theme],
  );

  const icon = useMemo(() => {
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
  }, [index, status, styles.stepOrdinal, styles.stepOrdinalWrapper, theme.colorError, theme.colorSuccess, theme.gold]);

  return (
    <TouchableOpacity style={[styles.container]}>
      <View style={{ alignItems: 'center', gap: theme.sizeXXS }}>
        <View style={styles.iconWrapper}>{icon}</View>

        {!isLastItem && <View style={styles.line} />}
      </View>

      <View
        style={styles.textWrapper}
        onLayout={event => {
          const { height } = event.nativeEvent.layout;
          setTextHeight(height);
        }}>
        {text}
      </View>
    </TouchableOpacity>
  );
};

function createStyle(theme: ThemeTypes, color: string, isLastItem: boolean, isFirstItem: boolean, textHeight: number) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
      marginTop: isFirstItem ? (textHeight - 24) / 2 : 0,
    },
    iconWrapper: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: color,
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
    line: {
      width: 1,
      backgroundColor: color,
      marginTop: 2,
      marginBottom: 2,
      flexGrow: 1,
    },
    textWrapper: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      paddingHorizontal: theme.padding,
      paddingVertical: theme.paddingXS + 2,
      marginBottom: !isLastItem ? 12 : 0,
      marginTop: !isLastItem ? -(textHeight - 24) / 2 : 0,
      flex: 1,
    },
    text: {
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      color: theme.colorTextLight3,
    },
  });
}

export default ProcessStepItem;
