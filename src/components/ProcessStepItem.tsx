import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { StepStatus } from '@subwallet/extension-base/types';
import { SWIconProps } from 'components/design-system-ui/icon';
import { CheckCircle, ProhibitInset, SpinnerGap } from 'phosphor-react-native';
import { Icon, Typography } from 'components/design-system-ui';
import { isStepCompleted, isStepFailed, isStepPending, isStepProcessing } from 'utils/transaction';

export type ProcessStepItemType = {
  status: StepStatus;
  text: string;
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

    return 'transparent'; // can be change later
  }, [status, theme.colorError, theme.colorSuccess, theme.colorTextLight7]);
  const styles = useMemo(
    () => createStyle(theme, color, !!isLastItem, !!isFirstItem, textHeight),
    [color, isFirstItem, isLastItem, textHeight, theme],
  );

  const iconProp = useMemo<SWIconProps>(() => {
    const iconInfo: SWIconProps = (() => {
      if (isStepCompleted(status)) {
        return {
          phosphorIcon: CheckCircle,
          weight: 'fill',
          iconColor: theme.colorSuccess,
        };
      } else if (isStepFailed(status)) {
        return {
          phosphorIcon: ProhibitInset,
          weight: 'fill',
          iconColor: theme.colorError,
        };
      } else if (isStepProcessing(status)) {
        return {
          phosphorIcon: SpinnerGap,
          weight: 'fill',
          iconColor: '#D9A33E',
        };
      }

      return {
        type: 'customIcon',
        customIcon: (
          <View style={styles.stepOrdinalWrapper}>
            <Typography.Text style={styles.stepOrdinal}>{index + 1}</Typography.Text>
          </View>
        ),
      };
    })();

    return {
      ...iconInfo,
      size: 'xs',
    };
  }, [index, status, styles.stepOrdinal, styles.stepOrdinalWrapper, theme.colorError, theme.colorSuccess]);

  return (
    <TouchableOpacity style={[styles.container]}>
      <View style={{ alignItems: 'center', gap: theme.sizeXXS }}>
        <View style={styles.iconWrapper}>
          <Icon {...iconProp} />
        </View>

        {!isLastItem && <View style={styles.line} />}
      </View>

      <View
        style={styles.textWrapper}
        onLayout={event => {
          const { height } = event.nativeEvent.layout;
          setTextHeight(height);
        }}>
        <Typography.Text style={styles.text}>{text}</Typography.Text>
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
