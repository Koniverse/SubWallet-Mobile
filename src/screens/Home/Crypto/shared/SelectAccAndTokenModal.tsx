import { SelectModal } from 'components/common/SelectModal';
import i18n from 'utils/i18n/i18n';
import React from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TokenItemType } from 'components/Modal/common/TokenSelector';

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
    <SelectModal
      items={accountItems}
      selectedValueMap={selectedValueMap}
      onSelectItem={openSelectAccount}
      selectModalType={'single'}
      selectModalItemType={'account'}
      title={i18n.header.selectAccount}
      ref={accountRef}
      closeModalAfterSelect={false}
      isShowContent={isAllAccount}
      isShowInput={false}>
      <SelectModal
        items={tokenItems}
        onSelectItem={openSelectToken}
        selectedValueMap={{}}
        selectModalType={'single'}
        selectModalItemType={'token'}
        title={i18n.header.selectToken}
        ref={tokenRef}
        closeModalAfterSelect={false}
        isShowInput={false}
      />
    </SelectModal>
  );
};
