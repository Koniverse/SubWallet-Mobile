import React, { useState } from 'react';
import { NetworkField } from 'components/Field/Network';
import { TouchableOpacity } from 'react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { DestinationChainSelect } from 'screens/DestinationChainSelect';

interface Props {
  networkKey: string;
  label: string;
  networkOptions: { label: string; value: string }[];
  onChangeDestinationChain: (chain: string) => void;
}

export const DestinationChainSelectField = ({ networkKey, label, networkOptions, onChangeDestinationChain }: Props) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const _onChangeNetwork = (chain: string) => {
    onChangeDestinationChain(chain);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} onPress={() => setModalVisible(true)}>
        <NetworkField showIcon networkKey={networkKey} label={label} />
      </TouchableOpacity>

      <DestinationChainSelect
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
