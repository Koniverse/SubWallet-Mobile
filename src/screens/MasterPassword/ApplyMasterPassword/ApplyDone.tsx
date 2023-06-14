import React from 'react';
import { View } from 'react-native';
import { Icon, PageIcon, Typography } from 'components/design-system-ui';
import { CheckCircle } from 'phosphor-react-native';
import AccountInfoField from 'components/common/Field/AccountInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ApplyMasterPasswordStyle from './style';
import { AccountJson } from '@subwallet/extension-base/background/types';
import i18n from 'utils/i18n/i18n';

interface Props {
  accounts: AccountJson[];
}

export const ApplyDone = ({ accounts }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = ApplyMasterPasswordStyle(theme);

  return (
    <View style={_style.applyDoneContainer}>
      <PageIcon icon={CheckCircle} color={theme.colorSuccess} />
      <Typography.Title style={_style.applyDoneTitle}>{i18n.message.applyDoneTitle}</Typography.Title>

      <Typography.Text style={_style.applyDoneMessage}>{i18n.message.applyDoneMessage}</Typography.Text>

      {accounts.slice(0, 2).map(acc => (
        <AccountInfoField
          key={acc.address}
          address={acc.address}
          name={acc.name || ''}
          rightIcon={<Icon size={'sm'} phosphorIcon={CheckCircle} iconColor={theme.colorSuccess} weight={'fill'} />}
          style={{ marginBottom: 8 }}
        />
      ))}

      {accounts.length > 2 && (
        <Typography.Text style={_style.applyDoneText}>
          {i18n.applyMasterPassword.andOther}
          {
            <Typography.Text style={{ paddingHorizontal: theme.paddingXXS, color: theme.colorTextLight1 }}>{`${
              accounts.length - 2
            }`}</Typography.Text>
          }
          {i18n.applyMasterPassword.accounts.toLowerCase()}
        </Typography.Text>
      )}
    </View>
  );
};
