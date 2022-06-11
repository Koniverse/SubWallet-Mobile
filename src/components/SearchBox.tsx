import React, {useMemo, useState} from "react";
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faMagnifyingGlass, faXmark} from "@fortawesome/free-solid-svg-icons";
import {useSubWalletTheme} from "hooks/useSubWalletTheme";
import {sharedStyles} from "styles/sharedStyles";

interface Props {
  autoFocus: boolean;
}

export const SearchBox = ({ autoFocus }: Props) => {
  const theme = useSubWalletTheme().colors;
  const [searchQuery, setSearchQuery] = useState<string | undefined>('');
  const styles = useMemo(() => StyleSheet.create({
    searchBoxContainer: {
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: theme.inputBackground,
      borderRadius: 8,
      height: 40,
      paddingLeft: 15,
      alignItems: 'center',
      width: '100%',
      position: 'relative'
    },
    searchBoxText: {
      fontSize: 14,
      color: theme.textColor2,
      paddingRight: 40
    },
    searchBoxCancelBtn: {
      width: 40,
      height: 40,
      position: 'absolute',
      top: 0,
      right: 0,
      justifyContent: 'center',
      alignItems: 'center',
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8
    },

  }), []);

  return (
    <View style={styles.searchBoxContainer}>
      <TextInput
        style={styles.searchBoxText}
        autoFocus={autoFocus || true}
        placeholder={'Search...'}
        placeholderTextColor={theme.textColor2}
        autoCapitalize="none"
        returnKeyType="search"
        selectionColor={theme.textColor2}
        onChangeText={(text) => {setSearchQuery(text)}}
        value={searchQuery}
      />
      <TouchableOpacity style={styles.searchBoxCancelBtn} onPress={() => setSearchQuery('')}>
        <FontAwesomeIcon icon={faXmark} size={16} color={theme.textColor2}/>
      </TouchableOpacity>
    </View>
  );
}
