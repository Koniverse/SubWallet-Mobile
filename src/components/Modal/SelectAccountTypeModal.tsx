import { KeypairType } from '@polkadot/util-crypto/types';
import { SelectAccountType } from 'components/common/SelectAccountType';
import { Button, Icon } from 'components/design-system-ui';
import { EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import { CheckCircle } from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import { StyleProp, View } from 'react-native';
import Text from '../Text';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';

interface Props {
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  onModalHide?: () => void;
  onConfirm: (keyTypes: KeypairType[]) => void;
}

const modalTitle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontBold,
  color: ColorMap.light,
  paddingBottom: 16,
  textAlign: 'center',
};

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
    <SubWalletModal modalVisible={modalVisible} onModalHide={onModalHide} onChangeModalVisible={onChangeModalVisible}>
      <View style={{ width: '100%' }}>
        <Text style={modalTitle}>{i18n.header.selectAccType}</Text>
        <SelectAccountType selectedItems={keyTypes} setSelectedItems={setKeyTypes} />
        <Button icon={ButtonIcon} disabled={!keyTypes.length} onPress={_onConfirm(keyTypes)}>
          {i18n.common.confirm}
        </Button>
      </View>
    </SubWalletModal>
  );
};
