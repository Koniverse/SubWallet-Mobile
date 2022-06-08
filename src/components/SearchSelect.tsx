import React, {useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons";
import {useSubWalletTheme} from "hooks/useSubWalletTheme";
import {useMemo} from "react";
import {sharedStyles, STATUS_BAR_HEIGHT} from "utils/sharedStyles";
import {SubWalletModal} from "components/SubWalletModal";
import {SearchBox} from "components/SearchBox";

interface Props {
  data: { id: string, label: string }[];
  onChangeSelect: (testVal: string) => void;
  value: string;
}


export const SearchSelect = ({ value, onChangeSelect, data }: Props) => {
  const theme = useSubWalletTheme().colors;
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const width = Dimensions.get("screen").width;
  const styles = useMemo(() => StyleSheet.create({
    searchSelectContainer: {
      ...sharedStyles.textInput,
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: theme.inputBackground,
      color: theme.textColor,
      alignItems: 'center',
      justifyContent: 'space-between',
      width: width,
    },
    searchSelectText: {
      ...sharedStyles.mainText,
      color: theme.textColor,
    },
    modalStyle: {
      backgroundColor: theme.background,
      height: '100%',
      marginTop: STATUS_BAR_HEIGHT + 40,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      padding: 16
    },
  }), [theme]);


  // @ts-ignore
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => {
        onChangeSelect(item.label);
        setModalVisible(false);
      }}>
        <Text style={{ backgroundColor: 'red' }}>{item.label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>
        <View style={styles.searchSelectContainer}>
          <Text style={styles.searchSelectText} >{value}</Text>
          <FontAwesomeIcon icon={faChevronDown} size={16} color={theme.textColor2} />
        </View>
      </TouchableWithoutFeedback>

      <SubWalletModal modalVisible={modalVisible} onChangeModalVisible={() => setModalVisible(false)}>
        <View style={styles.modalStyle}>
          <SearchBox autoFocus />
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
        </View>
      </SubWalletModal>
    </View>

  );
}
