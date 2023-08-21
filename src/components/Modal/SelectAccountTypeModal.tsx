import { KeypairType } from '@polkadot/util-crypto/types';
import { AccountTypeItem } from 'components/common/SelectAccountType';
import { Logo, SelectItem } from 'components/design-system-ui';
import { EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import { CheckCircle } from 'phosphor-react-native';
import React, { useCallback, useState } from 'react';
import i18n from 'utils/i18n/i18n';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import { ModalRef } from 'types/modalRef';

interface Props {
  onConfirm: (keyTypes: KeypairType[]) => void;
  selectTypeRef: React.MutableRefObject<ModalRef | undefined>;
}

export interface AccountTypeModalItem {
  label: string;
  key: KeypairType;
  icon: string;
}

const defaultValueMap = { sr25519: true, ethereum: true };

export const SelectAccountTypeModal = ({ onConfirm, selectTypeRef }: Props) => {
  const [selectedValueMap, setSelectedValueMap] = useState<Record<string, boolean>>(defaultValueMap);
  const items: AccountTypeModalItem[] = [
    {
      icon: 'polkadot',
      key: SUBSTRATE_ACCOUNT_TYPE,
      label: i18n.createAccount.substrate,
    },
    {
      icon: 'ethereum',
      key: EVM_ACCOUNT_TYPE,
      label: i18n.createAccount.ethereum,
    },
  ];

  const onChangeOption = useCallback((value: string, isCheck?: boolean) => {
    setSelectedValueMap(prev => ({
      ...prev,
      [value]: !!isCheck,
    }));
  }, []);

  const _onConfirm = useCallback(
    (_keyTypes: KeypairType[]) => {
      return () => {
        onConfirm(_keyTypes);
      };
    },
    [onConfirm],
  );

  const renderAccountTypeItem = (item: AccountTypeItem) => {
    return (
      <SelectItem
        key={item.label}
        label={item.label}
        leftItemIcon={<Logo size={28} network={item.icon} shape={'circle'} />}
        isSelected={selectedValueMap[item.key]}
        onPress={() => onChangeOption(item.key, !selectedValueMap[item.key])}
        showUnselect={true}
      />
    );
  };

  return (
    <>
      <BasicSelectModal
        level={2}
        ref={selectTypeRef}
        onBackButtonPress={() => selectTypeRef?.current?.onCloseModal()}
        selectedValueMap={selectedValueMap}
        title={i18n.header.selectAccType}
        items={items}
        selectModalType={'multi'}
        isShowInput={false}
        renderCustomItem={renderAccountTypeItem}
        applyBtn={{
          label: i18n.common.confirm,
          onPressApplyBtn: () => {
            const currentKeyTypes: KeypairType[] = Object.keys(selectedValueMap).filter(
              o => selectedValueMap[o],
            ) as KeypairType[];
            setSelectedValueMap(defaultValueMap);
            _onConfirm(currentKeyTypes)();
          },
          icon: CheckCircle,
          disabled: Object.values(selectedValueMap).every(item => !item),
        }}
        onChangeModalVisible={() => {
          setSelectedValueMap(defaultValueMap);
        }}
      />
    </>
  );
};
