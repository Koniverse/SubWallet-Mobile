import { ProcessTransactionData, ProcessType, ResponseSubscribeProcessById } from '@subwallet/extension-base/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps, TransactionSubmissionProps } from 'routes/index';
import { CheckCircle, IconProps, ProhibitInset, SpinnerGap } from 'phosphor-react-native';
import { cancelSubscription } from 'messaging/base';
import { subscribeProcess } from 'messaging/transaction';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { StyleSheet, View } from 'react-native';
import { Button, PageIcon, Typography } from 'components/design-system-ui';
import { isStepCompleted, isStepFailed } from 'utils/transaction';
import { FontMedium, FontSemiBold, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SwapBaseTxData } from '@subwallet/extension-base/types/swap';
import { SwapTransactionBlock } from 'components/Swap/SwapTransactionBlock';

export const TransactionSubmission = ({ route: { params } }: TransactionSubmissionProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const transactionProcessId = params?.transactionProcessId || ''; // todo change this later
  const [processData, setProcessData] = useState<ProcessTransactionData | undefined>();
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const swapData = processData?.combineInfo as SwapBaseTxData | undefined;

  const viewProgress = useCallback(() => {
    navigation.navigate('Notification', {
      transactionProcess: { processId: transactionProcessId, triggerTime: `${Date.now()}` },
    });
  }, [navigation, transactionProcessId]);

  const viewInHistory = useCallback(() => {
    if (processData?.address && processData?.lastTransactionChain && processData?.lastTransactionId) {
      navigation.navigate('History', {
        address: reformatAddress(processData?.address),
        chain: processData?.lastTransactionChain,
        transactionId: processData?.lastTransactionId,
      });
    } else {
      navigation.navigate('History', {});
    }
  }, [navigation, processData?.address, processData?.lastTransactionChain, processData?.lastTransactionId]);

  const isFinal = useMemo(() => {
    return isStepCompleted(processData?.status) || isStepFailed(processData?.status);
  }, [processData]);

  const icon = useMemo<React.ElementType<IconProps>>(() => {
    if (isStepCompleted(processData?.status)) {
      return CheckCircle;
    }

    if (isStepFailed(processData?.status)) {
      return ProhibitInset;
    }

    return SpinnerGap;
  }, [processData?.status]);

  const iconColor = useMemo(() => {
    if (isStepCompleted(processData?.status)) {
      return theme.colorSuccess;
    }

    if (isStepFailed(processData?.status)) {
      return theme.colorError;
    }

    return '#D9A33E';
  }, [processData?.status, theme.colorError, theme.colorSuccess]);

  useEffect(() => {
    let cancel = false;
    let id = '';

    const onCancel = () => {
      if (id) {
        cancelSubscription(id).catch(console.error);
      }
    };

    if (transactionProcessId) {
      const updateProcess = (data: ResponseSubscribeProcessById) => {
        if (!cancel) {
          id = data.id;
          setProcessData(data.process);
        } else {
          onCancel();
        }
      };

      subscribeProcess({ processId: transactionProcessId }, updateProcess).then(updateProcess).catch(console.error);
    }

    return () => {
      cancel = true;
      onCancel();
    };
  }, [transactionProcessId]);

  const goHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home', params: { screen: 'Tokens', params: { screen: 'TokenGroups' } } }],
    });
  }, [navigation]);

  return (
    <ContainerWithSubHeader onPressBack={goHome} title={'Do not close the app!'}>
      <View style={styles.transactionSubmissionContainer}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <PageIcon icon={icon} weight={'fill'} color={iconColor} />

          <Typography.Title style={styles.transactionSubmissionTitle}>{'Transaction submitted!'}</Typography.Title>
          <Typography.Text style={styles.transactionSubmissionMessage}>
            {isFinal
              ? 'View transaction progress in the History tab or go back to home'
              : 'View transaction progress in the Notifications screen or go back to home'}
          </Typography.Text>
          {processData && processData.type === ProcessType.SWAP && swapData && (
            <View style={{ width: '100%' }}>
              <SwapTransactionBlock quote={swapData.quote} logoSize={36} />
            </View>
          )}
        </View>

        <View style={{ width: '100%', ...MarginBottomForSubmitButton, gap: theme.padding }}>
          <Button onPress={goHome}>{i18n.buttonTitles.backToHome}</Button>
          <Button onPress={isFinal ? viewInHistory : viewProgress} style={{ marginBottom: 16 }} type={'secondary'}>
            {isFinal ? i18n.buttonTitles.viewTransaction : 'View progress'}
          </Button>
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    transactionSubmissionContainer: {
      flex: 1,
      paddingTop: theme.padding,
      alignItems: 'center',
      paddingHorizontal: theme.padding,
    },
    transactionSubmissionTitle: {
      paddingVertical: 16,
      fontSize: theme.fontSizeHeading3,
      lineHeight: theme.fontSizeHeading3 * theme.lineHeightHeading3,
      color: theme.colorTextLight2,
      ...FontSemiBold,
    },
    transactionSubmissionMessage: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorTextLight3,
      ...FontMedium,
      textAlign: 'center',
      paddingHorizontal: 40,
      paddingBottom: 16,
    },
  });
}
