import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { ModalRef } from 'types/modalRef';
import { AccountAddressItemType } from 'types/account';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { sortTokensByStandard } from 'utils/sort/token';
import { TokenSelector } from 'components/Modal/SelectAccAndTokenModal/TokenSelector';

interface Props {
  accountRef: React.MutableRefObject<ModalRef | undefined>;
  tokenRef: React.MutableRefObject<ModalRef | undefined>;
  accountItems: AccountAddressItemType[];
  tokenItems: _ChainAsset[];
  openSelectAccount: (account: AccountAddressItemType) => void;
  openSelectToken: (value: _ChainAsset) => void;
}

export const SelectAccAndTokenModal = ({
  accountItems,
  tokenItems,
  accountRef,
  tokenRef,
  openSelectAccount,
  openSelectToken,
}: Props) => {
  const isAllAccount = useSelector((state: RootState) => state.accountState.isAllAccount);
  const priorityTokens = useSelector((state: RootState) => state.chainStore.priorityTokens);

  const sortedItems = useMemo(() => {
    sortTokensByStandard(tokenItems, priorityTokens);

    return tokenItems;
  }, [priorityTokens, tokenItems]);
  return (
    <>
      <TokenSelector
        items={sortedItems}
        onSelectItem={openSelectToken}
        selectedValueMap={{}}
        tokenSelectorRef={tokenRef}
        closeModalAfterSelect={false}
        isShowInput={false}
        onCloseAccountSelector={() => accountRef.current?.onCloseModal()}
      />

      <AccountSelector
        items={accountItems}
        selectedValueMap={{}}
        onSelectItem={openSelectAccount}
        accountSelectorRef={accountRef}
        closeModalAfterSelect={false}
        isShowContent={isAllAccount}
        isShowInput={false}
      />
    </>
  );
};
