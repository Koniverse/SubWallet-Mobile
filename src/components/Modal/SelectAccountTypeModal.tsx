import { KeypairType } from '@polkadot/util-crypto/types';
import { SelectAccountType } from 'components/common/SelectAccountType';
import { Button, Icon, SwModal } from 'components/design-system-ui';
import { EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import { CheckCircle } from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import i18n from 'utils/i18n/i18n';

interface Props {
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  onModalHide?: () => void;
  onConfirm: (keyTypes: KeypairType[]) => void;
}

const defaultKeyTypes: KeypairType[] = [SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE];

const ButtonIcon = (color: string) => {
  return <Icon phosphorIcon={CheckCircle} size={'lg'} iconColor={color} />;
};

export const SelectAccountTypeModal = ({ modalVisible, onChangeModalVisible, onModalHide, onConfirm }: Props) => {
  const [keyTypes, setKeyTypes] = useState<KeypairType[]>(defaultKeyTypes);

  const _onConfirm = useCallback(
    (_keyTypes: KeypairType[]) => {
      return () => {
        onConfirm(_keyTypes);
      };
    },
    [onConfirm],
  );

  useEffect(() => {
    if (!modalVisible) {
      setKeyTypes(defaultKeyTypes);
    }
  }, [modalVisible]);

  return (
    <SwModal
      modalVisible={modalVisible}
      onModalHide={onModalHide}
      onChangeModalVisible={onChangeModalVisible}
      modalTitle={i18n.header.selectAccType}>
      <View style={{ width: '100%' }}>
        <SelectAccountType selectedItems={keyTypes} setSelectedItems={setKeyTypes} />
        <Button icon={ButtonIcon} disabled={!keyTypes.length} onPress={_onConfirm(keyTypes)}>
          {i18n.common.confirm}
        </Button>
      </View>
    </SwModal>
  );
};
