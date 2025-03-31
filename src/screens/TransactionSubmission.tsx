import { ProcessTransactionData, ProcessType, ResponseSubscribeProcessById } from '@subwallet/extension-base/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps, TransactionSubmissionProps } from 'routes/index';
import { CheckCircle, ProhibitInset, SpinnerGap } from 'phosphor-react-native';
import { cancelSubscription } from 'messaging/base';
import { subscribeProcess } from 'messaging/transaction';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, PageIcon, Typography } from 'components/design-system-ui';
import { isStepCompleted, isStepFailed } from 'utils/transaction';
import { FontMedium, FontSemiBold, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SwapBaseTxData } from '@subwallet/extension-base/types/swap';
import { SwapTransactionBlock } from 'components/Swap/SwapTransactionBlock';
import { RollingIcon } from 'components/RollingIcon';

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

  const icon = useMemo<React.ReactNode>(() => {
    if (isStepCompleted(processData?.status)) {
      return <PageIcon icon={CheckCircle} weight={'fill'} color={theme.colorSuccess} />;
    }

    if (isStepFailed(processData?.status)) {
      return <PageIcon icon={ProhibitInset} weight={'fill'} color={theme.colorError} />;
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
  }, [processData?.status, theme.colorError, theme.colorSuccess]);

  const messages = useMemo<string[]>(() => {
    return [
      'Transaction in process. Hit "View process" to view step-by-step details',
      'Hanging in there...',
      'Pro tip: You can hit "View process" to view step-by-step details of your transaction',
    ];
  }, []);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, 10000); // 10s đổi message

    return () => clearInterval(interval); // Cleanup interval khi component unmount
  }, [messages.length]);

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

  const isShowSwapInfoBlock = useMemo(
    () => processData && processData.type === ProcessType.SWAP && !isFinal,
    [isFinal, processData],
  );

  const goHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home', params: { screen: 'Tokens', params: { screen: 'TokenGroups' } } }],
    });
  }, [navigation]);

  return (
    <ContainerWithSubHeader title={'Submitted'} showLeftBtn={false}>
      <View style={styles.transactionSubmissionContainer}>
        <View style={{ flex: 1, alignItems: 'center', width: '100%' }}>
          {icon}

          <Typography.Title style={styles.transactionSubmissionTitle}>
            {isFinal ? 'Transaction submitted!' : 'Do not close the app!'}
          </Typography.Title>
          <View style={{ minHeight: 44, width: '100%', paddingHorizontal: 40, marginBottom: 16 }}>
            <Typography.Text style={styles.transactionSubmissionMessage}>
              {isFinal
                ? 'Track transaction progress by clicking “View transaction” or go back to home'
                : messages[index]}
            </Typography.Text>
          </View>

          {isShowSwapInfoBlock && swapData && (
            <View style={{ width: '100%' }}>
              <SwapTransactionBlock quote={swapData.quote} logoSize={36} />
            </View>
          )}
        </View>

        <View style={{ width: '100%', ...MarginBottomForSubmitButton, gap: theme.padding }}>
          <Button onPress={isFinal ? viewInHistory : viewProgress}>
            {isFinal ? i18n.buttonTitles.viewTransaction : 'View progress'}
          </Button>
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
  });
}
