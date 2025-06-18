import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import {
  BaseStepType,
  ProcessStep,
  ProcessTransactionData,
  ProcessType,
  StepStatus,
  SwapStepType,
  YieldStepType,
} from '@subwallet/extension-base/types';
import { Icon, Typography } from 'components/design-system-ui';
import { CheckCircle, ClockCounterClockwise, ProhibitInset, SpinnerGap } from 'phosphor-react-native';
import { CommonStepType } from '@subwallet/extension-base/types/service-base';
import { isStepCompleted, isStepFailed, isStepTimeout } from 'utils/transaction';
import { convertHexColorToRGBA } from 'utils/color';
import { FontSemiBold } from 'styles/sharedStyles';
import { RollingIcon } from 'components/RollingIcon';

interface Props {
  processData: ProcessTransactionData;
}

const CurrentProcessStep: React.FC<Props> = (props: Props) => {
  const { processData } = props;
  const theme = useSubWalletTheme().swThemes;
  const textColor = useMemo(() => {
    if (isStepCompleted(processData.status)) {
      return theme.colorSuccess;
    } else if (isStepFailed(processData.status)) {
      return theme.colorError;
    } else if (isStepTimeout(processData.status)) {
      return theme.gold;
    }

    return '#D9A33E';
  }, [processData.status, theme.colorError, theme.colorSuccess, theme.gold]);
  const styles = useMemo(() => createStyle(theme, textColor), [textColor, theme]);

  const icon = useMemo(() => {
    if (isStepCompleted(processData.status)) {
      return <Icon phosphorIcon={CheckCircle} weight={'fill'} iconColor={theme.colorSuccess} />;
    } else if (isStepFailed(processData.status)) {
      return <Icon size={'md'} phosphorIcon={ProhibitInset} weight={'fill'} iconColor={theme.colorError} />;
    } else if (isStepTimeout(processData.status)) {
      return <Icon phosphorIcon={ClockCounterClockwise} iconColor={theme.gold} weight={'fill'} />;
    }

    return <RollingIcon icon={<Icon phosphorIcon={SpinnerGap} iconColor={'#D9A33E'} />} />;
  }, [processData.status, theme.colorError, theme.colorSuccess, theme.gold]);

  const currentStep: ProcessStep | undefined = useMemo(() => {
    const first = processData.steps.find(s => s.id === processData.currentStepId);

    if (first) {
      return first;
    }

    const second = processData.steps
      .slice()
      .reverse()
      .find(s => [StepStatus.COMPLETE, StepStatus.FAILED, StepStatus.TIMEOUT, StepStatus.CANCELLED].includes(s.status));

    if (second) {
      return second;
    }

    return processData.steps[0];
  }, [processData.currentStepId, processData.steps]);

  const title = useMemo(() => {
    if (isStepCompleted(processData.status)) {
      if (processData.type === ProcessType.SWAP) {
        return 'Swap success';
      } else if (processData.type === ProcessType.EARNING) {
        return 'Stake success';
      }

      return 'Transaction success';
    }

    if (isStepFailed(processData.status)) {
      if (processData.type === ProcessType.SWAP) {
        return 'Swap failed';
      } else if (processData.type === ProcessType.EARNING) {
        return 'Stake failed';
      }

      return 'Transaction failed';
    }

    if (isStepTimeout(processData.status)) {
      return 'Transaction timeout';
    }

    if (!currentStep) {
      return '';
    }

    if (([CommonStepType.XCM, YieldStepType.XCM] as BaseStepType[]).includes(currentStep.type)) {
      return 'Transfer token cross-chain';
    }

    if (currentStep.type === SwapStepType.SWAP) {
      return 'Swap token';
    }

    if (([CommonStepType.TOKEN_APPROVAL, YieldStepType.TOKEN_APPROVAL] as BaseStepType[]).includes(currentStep.type)) {
      return 'Approve token';
    }

    if (
      (
        [
          YieldStepType.NOMINATE,
          YieldStepType.JOIN_NOMINATION_POOL,
          YieldStepType.MINT_VDOT,
          YieldStepType.MINT_VMANTA,
          YieldStepType.MINT_LDOT,
          YieldStepType.MINT_QDOT,
          YieldStepType.MINT_SDOT,
          YieldStepType.MINT_STDOT,
        ] as BaseStepType[]
      ).includes(currentStep.type)
    ) {
      return 'Stake token';
    }

    return '';
  }, [currentStep, processData.status, processData.type]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>{icon}</View>

      <Typography.Text style={styles.stepText}>{title}</Typography.Text>
    </View>
  );
};

function createStyle(theme: ThemeTypes, textColor: string) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: theme.sizeSM,
      flexDirection: 'row',
      paddingTop: 8,
    },
    iconWrapper: {
      minWidth: 32,
      height: 32,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: convertHexColorToRGBA(textColor, 0.1),
    },
    stepText: {
      color: textColor,
      ...FontSemiBold,
    },
  });
}

export default CurrentProcessStep;
