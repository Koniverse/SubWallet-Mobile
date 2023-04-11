import React from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { View } from 'react-native';
import { PageIcon, Typography } from 'components/design-system-ui';
import { CheckCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import TransactionDoneStyle from './TransactionDone/style';

export const TransactionDone = () => {
  const theme = useSubWalletTheme().swThemes;
  const _style = TransactionDoneStyle(theme);

  return (
    <ContainerWithSubHeader onPressBack={() => {}} title={'Successful'}>
      <View style={_style.transactionDoneContainer}>
        <PageIcon icon={CheckCircle} color={theme.colorSuccess} />
        <Typography.Title style={_style.transactionDoneTitle}>{'You’re all done!'}</Typography.Title>

        <Typography.Text style={_style.transactionDoneMessage}>
          {'Your request has been sent. You can track its progress on the Transaction History page.'}
        </Typography.Text>
      </View>
    </ContainerWithSubHeader>
  );
};
