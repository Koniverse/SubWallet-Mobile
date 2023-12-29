import React, { useCallback, useEffect } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { View } from 'react-native';
import { Button, PageIcon, Typography } from 'components/design-system-ui';
import { CheckCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import TransactionDoneStyle from './style';
import { RootNavigationProps } from 'routes/index';
import { useNavigation } from '@react-navigation/native';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { TransactionDoneInfo } from 'hooks/screen/Transaction/useTransaction';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { mmkvStore } from 'utils/storage';
import InAppReview from 'react-native-in-app-review';
import { reformatAddress } from '@subwallet/extension-base/utils';

interface Props {
  transactionDoneInfo: TransactionDoneInfo;
  extrinsicType?: ExtrinsicType;
}

const SHOW_RATE_APP_SCREENS = [ExtrinsicType.STAKING_WITHDRAW];

export const TransactionDone = ({ extrinsicType, transactionDoneInfo }: Props) => {
  const { id, path, chain, address } = transactionDoneInfo;
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const _style = TransactionDoneStyle(theme);
  useHandlerHardwareBackPress(true);
  const isShowRateAppNoti = mmkvStore.getBoolean('isShowRateAppNoti');
  useEffect(() => {
    if (
      extrinsicType &&
      SHOW_RATE_APP_SCREENS.includes(extrinsicType) &&
      !isShowRateAppNoti &&
      InAppReview.isAvailable()
    ) {
      InAppReview.RequestInAppReview().then(hasFlowFinishedSuccessfully => {
        if (hasFlowFinishedSuccessfully) {
          mmkvStore.set('isShowRateAppNoti', true);
        }
      });
    }
  }, [extrinsicType, isShowRateAppNoti]);

  const viewTransaction = useCallback(() => {
    if (chain && id && address) {
      navigation.navigate('History', { chain, transactionId: id, address: reformatAddress(address) });
    } else {
      navigation.navigate('History', {});
    }
  }, [address, chain, id, navigation]);

  const goHome = useCallback(() => {
    if (path === 'Staking') {
      return navigation.reset({
        index: 0,
        routes: [{ name: 'Home', params: { screen: 'Staking', params: { screen: 'StakingBalances' } } }],
      });
    }

    if (path === 'NFT') {
      return navigation.reset({
        index: 0,
        routes: [{ name: 'Home', params: { screen: 'NFTs', params: { screen: 'CollectionList' } } }],
      });
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home', params: { screen: 'Tokens', params: { screen: 'TokenGroups' } } }],
    });
  }, [navigation, path]);

  return (
    <ContainerWithSubHeader onPressBack={goHome} title={i18n.header.successful}>
      <View style={_style.transactionDoneContainer}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <PageIcon icon={CheckCircle} color={theme.colorSuccess} />
          <Typography.Title style={_style.transactionDoneTitle}>{i18n.message.applyDoneTitle}</Typography.Title>

          <Typography.Text style={_style.transactionDoneMessage}>{i18n.message.transactionDoneMessage}</Typography.Text>
        </View>

        <View style={{ width: '100%', ...MarginBottomForSubmitButton }}>
          <Button onPress={viewTransaction} style={{ marginBottom: 16 }} type={'secondary'}>
            {i18n.buttonTitles.viewTransaction}
          </Button>

          <Button onPress={goHome}>{i18n.buttonTitles.backToHome}</Button>
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
