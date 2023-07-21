import React, { useMemo } from 'react';
import AccountItemBase from 'components/common/Account/Item/AccountItemBase';
import AvatarGroup from 'components/common/AvatarGroup';
import { Icon, Typography } from 'components/design-system-ui';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { DotsThree } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';

interface Props {
  accounts: AccountJson[];
  selected: string[];
}

export const WCAccountInput = ({ accounts, selected }: Props) => {
  const selectedAccounts = useMemo(
    () => accounts.filter(account => selected.some(address => isSameAddress(address, account.address))),
    [accounts, selected],
  );

  const countSelected = selectedAccounts.length;

  return (
    <AccountItemBase
      address={''}
      leftItem={<AvatarGroup addresses={selectedAccounts.map(acc => acc.address)} />}
      middleItem={
        <Typography.Text>
          {countSelected ? i18n.message.connectedAccounts(countSelected) : i18n.inputLabel.selectAcc}
        </Typography.Text>
      }
      rightItem={<Icon phosphorIcon={DotsThree} weight={'fill'} />}
    />
  );
};
