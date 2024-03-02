// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BackgroundIcon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CheckCircle, PlusCircle, Spinner, XCircle } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import { EarningStepStatus } from 'reducers/earning';
import { convertHexColorToRGBA } from 'utils/color';
import createStyles from './style';

interface Props {
  index: number;
  stepName: string;
  stepStatus?: EarningStepStatus;
}

const EarningProcessItem = ({ index, stepName, stepStatus }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const stepStatusIcon = useMemo(() => {
    switch (stepStatus) {
      case EarningStepStatus.SUBMITTING:
        return (
          <BackgroundIcon
            backgroundColor={convertHexColorToRGBA(theme['gold-6'], 0.1)}
            iconColor={theme['gold-6']}
            phosphorIcon={Spinner}
            size="lg"
            weight="fill"
            shape="circle"
          />
        );
      case EarningStepStatus.ERROR:
        return (
          <BackgroundIcon
            backgroundColor={theme.colorErrorBg}
            iconColor={theme.colorError}
            phosphorIcon={XCircle}
            size="lg"
            weight="fill"
            shape="circle"
          />
        );
      case EarningStepStatus.SUCCESS:
        return (
          <BackgroundIcon
            backgroundColor={convertHexColorToRGBA(theme.colorSuccess, 0.1)}
            iconColor={theme.colorSuccess}
            phosphorIcon={CheckCircle}
            size="lg"
            weight="fill"
            shape="circle"
          />
        );
      case EarningStepStatus.PROCESSING:
        return (
          <BackgroundIcon
            backgroundColor={convertHexColorToRGBA(theme['gray-6'], 0.1)}
            iconColor={theme['gray-6']}
            phosphorIcon={PlusCircle}
            size="lg"
            weight="fill"
            shape="circle"
          />
        );
      case EarningStepStatus.QUEUED:
      default:
        return (
          <BackgroundIcon
            backgroundColor={convertHexColorToRGBA(theme['gray-6'], 0.1)}
            iconColor={theme['gray-3']}
            phosphorIcon={PlusCircle}
            size="lg"
            weight="fill"
            shape="circle"
          />
        );
    }
  }, [theme, stepStatus]);

  const textStyle = useMemo((): StyleProp<TextStyle> => {
    const result: StyleProp<TextStyle> = [styles.text];
    const getColor = () => {
      switch (stepStatus) {
        case EarningStepStatus.SUBMITTING:
          return theme['gold-6'];
        case EarningStepStatus.ERROR:
          return theme.colorError;
        case EarningStepStatus.SUCCESS:
          return theme.colorSuccess;
        case EarningStepStatus.PROCESSING:
          return theme['gray-6'];
        case EarningStepStatus.QUEUED:
        default:
          return theme['gray-3'];
      }
    };

    result.push({
      color: getColor(),
    });

    return result;
  }, [stepStatus, styles.text, theme]);

  return (
    <View style={styles.wrapper}>
      {stepStatusIcon}
      <View style={styles.container}>
        <Typography.Text style={textStyle}>
          {'Step {{stepNumb}}:'.replace('{{stepNumb}}', (index + 1).toString())}
        </Typography.Text>
        <Typography.Text style={textStyle}>{stepName}</Typography.Text>
      </View>
    </View>
  );
};

export default EarningProcessItem;
