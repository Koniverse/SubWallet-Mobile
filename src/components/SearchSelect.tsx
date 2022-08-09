import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Dimensions, FlatList, StyleProp, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Text from 'components/Text';
import { sharedStyles, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { SubWalletModal } from 'components/SubWalletModal';
import { SearchBox } from 'components/SearchBox';
import { ColorMap } from 'styles/color';

interface Props {
  data: { id: string; label: string }[];
  onChangeSelect: (testVal: string) => void;
  value: string;
}

const width = Dimensions.get('screen').width;

const searchSelectContainer: StyleProp<any> = {
  ...sharedStyles.textInput,
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: ColorMap.inputBackground,
  color: ColorMap.light,
  alignItems: 'center',
  justifyContent: 'space-between',
  width: width,
};
const searchSelectText: StyleProp<any> = {
  ...sharedStyles.smallText,
  color: ColorMap.light,
};
const modalStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark1,
  height: '100%',
  marginTop: STATUS_BAR_HEIGHT + 40,
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  padding: 16,
};

export const SearchSelect = ({ value, onChangeSelect, data }: Props) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // @ts-ignore
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          onChangeSelect(item.label);
          setModalVisible(false);
        }}>
        <Text style={{ backgroundColor: 'red' }}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>
        <View style={searchSelectContainer}>
          <Text style={searchSelectText}>{value}</Text>
          <FontAwesomeIcon icon={faChevronDown} size={16} color={ColorMap.disabled} />
        </View>
      </TouchableWithoutFeedback>

      <SubWalletModal modalVisible={modalVisible} onChangeModalVisible={() => setModalVisible(false)}>
        <View style={modalStyle}>
          <SearchBox autoFocus />
          <FlatList data={data} renderItem={renderItem} keyExtractor={item => item.id} />
        </View>
      </SubWalletModal>
    </View>
  );
};
