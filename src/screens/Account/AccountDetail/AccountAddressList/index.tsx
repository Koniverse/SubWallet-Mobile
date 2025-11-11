import React from 'react';
import { AccountProxy } from '@subwallet/extension-base/types';
import AccountChainAddressList from 'components/AccountProxy/list/AccountChainAddressList';

interface Props {
  accountProxy: AccountProxy;
}

export const AccountAddressList = ({ accountProxy }: Props) => {
  return <AccountChainAddressList accountProxy={accountProxy} />;
};
