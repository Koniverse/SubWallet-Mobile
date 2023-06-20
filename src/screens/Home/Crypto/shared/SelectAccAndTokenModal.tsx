import React from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TokenItemType, TokenSelector } from 'components/Modal/common/TokenSelector';
import { AccountSelector } from 'components/Modal/common/AccountSelector';

interface Props {
  accountRef: React.Ref<any>;
  tokenRef: React.Ref<any>;
  accountItems: AccountJson[];
  tokenItems: TokenItemType[];
  openSelectAccount: (account: AccountJson) => void;
  openSelectToken: (value: TokenItemType) => void;
  selectedValueMap: Record<string, boolean>;
}

export const SelectAccAndTokenModal = ({
  accountItems,
  tokenItems,
  accountRef,
  tokenRef,
  openSelectAccount,
  openSelectToken,
  selectedValueMap,
}: Props) => {
  const isAllAccount = useSelector((state: RootState) => state.accountState.isAllAccount);
  return (
    <>
      <AccountSelector
        items={accountItems}
        selectedValueMap={selectedValueMap}
        onSelectItem={openSelectAccount}
        accountSelectorRef={accountRef}
        closeModalAfterSelect={false}
        isShowContent={isAllAccount}
        isShowInput={false}>
        <TokenSelector
          items={tokenItems}
          onSelectItem={openSelectToken}
          selectedValueMap={{}}
          tokenSelectorRef={tokenRef}
          closeModalAfterSelect={false}
          isShowInput={false}
        />
      </AccountSelector>
    </>
  );
};
