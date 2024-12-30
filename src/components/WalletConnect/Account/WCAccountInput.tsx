import React, { useMemo } from 'react';
import AccountItemBase from 'components/common/Account/Item/AccountItemBase';
import { Icon, Typography } from 'components/design-system-ui';
import { DotsThree } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium } from 'styles/sharedStyles';
import { AccountJson } from '@subwallet/extension-base/types';
import { AccountProxyAvatarGroup } from 'components/design-system-ui/avatar/account-proxy-avatar-group';
import { isSameAddress } from '@subwallet/extension-base/utils';

interface Props {
  accounts: AccountJson[];
  selected: string[];
}

export const WCAccountInput = ({ accounts, selected }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const selectedAccounts = useMemo(
    () => accounts.filter(account => selected.some(address => isSameAddress(address, account.address))),
    [accounts, selected],
  );
  const basicAccountProxiesInfo = useMemo(() => {
    return selectedAccounts.map(account => {
      return {
        id: account.proxyId || '',
        name: account.name,
      };
    });
  }, [selectedAccounts]);

  const countSelected = selectedAccounts.length;

  return (
    <AccountItemBase
      customStyle={{ left: { paddingRight: countSelected ? 8 : 0 }, right: { marginRight: -2 } }}
      address={''}
      leftItem={<AccountProxyAvatarGroup accountProxies={basicAccountProxiesInfo} />}
      middleItem={
        <Typography.Text style={{ color: theme.colorWhite, ...FontMedium }}>
          {countSelected
            ? countSelected === 1
              ? i18n.formatString(i18n.message.connectedAccount, 1)
              : i18n.formatString(i18n.message.connectedAccounts, countSelected)
            : i18n.inputLabel.selectAcc}
        </Typography.Text>
      }
      rightItem={<Icon phosphorIcon={DotsThree} weight={'fill'} />}
    />
  );
};
