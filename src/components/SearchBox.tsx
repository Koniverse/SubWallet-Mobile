import React, { useState } from 'react';
import { StyleProp, TextInput, TouchableOpacity, View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ColorMap } from 'styles/color';

interface Props {
  autoFocus: boolean;
}

const searchBoxContainer: StyleProp<any> = {
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: ColorMap.inputBackground,
  borderRadius: 8,
  height: 40,
  paddingLeft: 15,
  alignItems: 'center',
  width: '100%',
  position: 'relative',
};
const searchBoxText: StyleProp<any> = {
  fontSize: 14,
  color: ColorMap.disabled,
  paddingRight: 40,
};
const searchBoxCancelBtn: StyleProp<any> = {
  width: 40,
  height: 40,
  position: 'absolute',
  top: 0,
  right: 0,
  justifyContent: 'center',
  alignItems: 'center',
  borderTopRightRadius: 8,
  borderBottomRightRadius: 8,
};

export const SearchBox = ({ autoFocus }: Props) => {
  const theme = useSubWalletTheme().colors;
  const [searchQuery, setSearchQuery] = useState<string | undefined>('');

  return (
    <View style={searchBoxContainer}>
      <TextInput
        autoCorrect={false}
        style={searchBoxText}
        autoFocus={autoFocus || true}
        placeholder={'Search...'}
        placeholderTextColor={theme.textColor2}
        autoCapitalize="none"
        returnKeyType="search"
        selectionColor={theme.textColor2}
        onChangeText={text => {
          setSearchQuery(text);
        }}
        value={searchQuery}
      />
      <TouchableOpacity style={searchBoxCancelBtn} onPress={() => setSearchQuery('')}>
        <FontAwesomeIcon icon={faXmark} size={16} color={theme.textColor2} />
      </TouchableOpacity>
    </View>
  );
};
