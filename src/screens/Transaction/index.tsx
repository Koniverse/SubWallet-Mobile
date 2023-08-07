import React, { useCallback } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { View } from 'react-native';
import { Button, PageIcon, Typography } from 'components/design-system-ui';
import { CheckCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import TransactionDoneStyle from './TransactionDone/style';
import { RootNavigationProps, TransactionDoneProps } from 'routes/index';
import { useNavigation } from '@react-navigation/native';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';

export const TransactionDone = ({
  route: {
    params: { chain, id, path },
  },
}: TransactionDoneProps) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const _style = TransactionDoneStyle(theme);
  useHandlerHardwareBackPress(true);

  const viewInExplorer = useCallback(() => {
    if (chain && id) {
      navigation.navigate('History', { chain, transactionId: id });
    } else {
      navigation.navigate('History', {});
    }
  }, [chain, id, navigation]);

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
          <Button onPress={viewInExplorer} style={{ marginBottom: 16 }} type={'secondary'}>
            {i18n.buttonTitles.viewTransaction}
          </Button>

          <Button onPress={goHome}>{i18n.buttonTitles.backToHome}</Button>
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
