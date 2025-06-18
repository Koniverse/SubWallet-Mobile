import { ProcessTransactionData, ProcessType, ResponseSubscribeProcessById } from '@subwallet/extension-base/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps, TransactionSubmissionProps } from 'routes/index';
import { CheckCircle, ClockCounterClockwise, ProhibitInset, SpinnerGap } from 'phosphor-react-native';
import { cancelSubscription } from 'messaging/base';
import { subscribeProcess } from 'messaging/transaction';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, PageIcon, Typography } from 'components/design-system-ui';
import { isStepCompleted, isStepFailed, isStepFinal, isStepTimeout } from 'utils/transaction';
import { FontMedium, FontSemiBold, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SwapBaseTxData } from '@subwallet/extension-base/types/swap';
import { SwapTransactionBlock } from 'components/Swap/SwapTransactionBlock';
import { RollingIcon } from 'components/RollingIcon';
import { LoadingScreen } from 'screens/LoadingScreen';
import { getTokenPairFromStep } from '@subwallet/extension-base/services/swap-service/utils';

type SwapProcessingContentComponentProps = {
  processData: ProcessTransactionData;
};

const SwapProcessingContentComponent = (props: SwapProcessingContentComponentProps) => {
  const { processData } = props;
  const [messageIndex, setMessageIndex] = useState(0);
  const data = processData.combineInfo as SwapBaseTxData;
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);

  const originSwapPair = useMemo(() => {
    return getTokenPairFromStep(data.process.steps);
  }, [data.process.steps]);

  const messages = useMemo<string[]>(() => {
    return [
      'Transaction in process. Hit "View process" to view step-by-step details',
      'Hanging in there...',
      'Pro tip: You can hit "View process" to view step-by-step details of your transaction',
    ];
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, 10000); // 10s đổi message

    return () => clearInterval(interval); // Cleanup interval khi component unmount
  }, [messages.length]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: 'center', width: '100%' }}>
        <PageIcon
          customIcon={
            <RollingIcon
              icon={<Icon phosphorIcon={SpinnerGap} weight={'fill'} iconColor={'#D9A33E'} customSize={64} />}
            />
          }
          color={''}
        />

        <Typography.Title style={styles.transactionSubmissionTitle}>{'Do not close the app!'}</Typography.Title>
        <View style={{ minHeight: 44, width: '100%', paddingHorizontal: 40, marginBottom: 16 }}>
          <Typography.Text style={styles.transactionSubmissionMessage}>{messages[messageIndex]}</Typography.Text>
        </View>

        <SwapTransactionBlock
          fromAmount={data.quote.fromAmount}
          fromAssetSlug={originSwapPair?.from}
          logoSize={36}
          toAmount={data.quote.toAmount}
          toAssetSlug={originSwapPair?.to}
        />
      </View>
    </View>
  );
};

export const TransactionSubmission = ({ route: { params } }: TransactionSubmissionProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const transactionProcessId = params?.transactionProcessId || ''; // todo change this later
  const [processData, setProcessData] = useState<ProcessTransactionData | undefined>();
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);

  const viewProgress = useCallback(() => {
    navigation.navigate('Notification', {
      transactionProcess: { processId: transactionProcessId, triggerTime: `${Date.now()}` },
    });
  }, [navigation, transactionProcessId]);

  const isFinal = useMemo(() => {
    return isStepFinal(processData?.status);
  }, [processData]);

  const icon = useMemo<React.ReactNode>(() => {
    if (isStepCompleted(processData?.status)) {
      return <PageIcon icon={CheckCircle} weight={'fill'} color={theme.colorSuccess} />;
    }

    if (isStepFailed(processData?.status)) {
      return <PageIcon icon={ProhibitInset} weight={'fill'} color={theme.colorError} />;
    }

    if (isStepTimeout(processData?.status)) {
      return <PageIcon icon={ClockCounterClockwise} weight={'fill'} color={theme.gold} />;
    }

    return (
      <PageIcon
        customIcon={
          <RollingIcon
            icon={<Icon phosphorIcon={SpinnerGap} weight={'fill'} iconColor={'#D9A33E'} customSize={64} />}
          />
        }
        color={''}
      />
    );
  }, [processData?.status, theme.colorError, theme.colorSuccess, theme.gold]);

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

  const isSwapProcessing = processData?.type === ProcessType.SWAP;

  return (
    <ContainerWithSubHeader title={'Submitted'} showLeftBtn={false}>
      <View style={styles.transactionSubmissionContainer}>
        {!processData && <LoadingScreen />}

        {!!processData && isSwapProcessing && !isFinal && <SwapProcessingContentComponent processData={processData} />}

        {!!processData && (!isSwapProcessing || isFinal) && (
          <View style={styles.transactionSubmissionContentWrapper}>
            {icon}

            <Typography.Title style={styles.transactionSubmissionTitle}>{'Transaction submitted!'}</Typography.Title>
            <View style={styles.transactionSubmissionMessageWrapper}>
              <Typography.Text style={styles.transactionSubmissionMessage}>
                {'View transaction progress in the Notifications screen or go back to home'}
              </Typography.Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Button onPress={viewProgress}>{'View progress'}</Button>
          <Button type={'secondary'} onPress={goHome}>
            {i18n.buttonTitles.backToHome}
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
      paddingTop: theme.paddingXL + 4,
      alignItems: 'center',
      paddingHorizontal: theme.padding,
    },
    transactionSubmissionTitle: {
      paddingTop: theme.paddingXL + 4,
      paddingBottom: 16,
      fontSize: theme.fontSizeHeading3,
      lineHeight: theme.fontSizeHeading3 * theme.lineHeightHeading3,
      color: theme.colorTextLight1,
      ...FontSemiBold,
    },
    transactionSubmissionMessage: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight4,
      ...FontMedium,
      textAlign: 'center',
    },
    transactionSubmissionContentWrapper: { flex: 1, alignItems: 'center', width: '100%' },
    transactionSubmissionMessageWrapper: { minHeight: 44, width: '100%', paddingHorizontal: 40, marginBottom: 16 },
    footer: { width: '100%', ...MarginBottomForSubmitButton, gap: theme.padding },
  });
}
