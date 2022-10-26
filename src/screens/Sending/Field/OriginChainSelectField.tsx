import React, { useState } from 'react';
import { NetworkField } from 'components/Field/Network';
import { TouchableOpacity } from 'react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { OriginChainSelect } from 'screens/OriginChainSelect';

interface Props {
  networkKey: string;
  label: string;
  networkOptions: { label: string; value: string }[];
  onChangeOriginChain: (chain: string) => void;
}

export const OriginChainSelectField = ({ networkKey, label, networkOptions, onChangeOriginChain }: Props) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const _onChangeNetwork = (chain: string) => {
    onChangeOriginChain(chain);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} onPress={() => setModalVisible(true)}>
        <NetworkField showIcon networkKey={networkKey} label={label} />
      </TouchableOpacity>

      <OriginChainSelect
        onPressBack={() => setModalVisible(false)}
        modalVisible={modalVisible}
        onChangeModalVisible={() => setModalVisible(false)}
        networkOptions={networkOptions}
        selectedNetworkKey={networkKey}
        onChangeNetwork={_onChangeNetwork}
      />
    </>
  );
};
