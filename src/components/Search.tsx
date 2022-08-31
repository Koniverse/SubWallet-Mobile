import React from 'react';
import { StyleProp, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { MagnifyingGlass, XCircle } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';

interface Props extends TextInputProps {
  onSearch: (text: string) => void;
  searchText: string;
  onClearSearchString: () => void;
  autoFocus?: boolean;
  searchRef?: React.RefObject<TextInput>;
}

const searchContainerStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  borderRadius: 5,
  alignItems: 'center',
  paddingRight: 12,
  paddingLeft: 16,
  flexDirection: 'row',
  height: 48,
};

export const Search = (searchProps: Props) => {
  const { onSearch, searchText, style, onClearSearchString, autoFocus, searchRef } = searchProps;
  const SearchIcon = MagnifyingGlass;
  const CancelIcon = XCircle;

  return (
    <View style={[searchContainerStyle, style]}>
      <SearchIcon size={20} color={ColorMap.light} weight={'bold'} />
      <TextInput
        {...searchProps}
        ref={searchRef}
        style={{
          marginHorizontal: 8,
          ...sharedStyles.mainText,
          lineHeight: 20,
          ...FontMedium,
          color: ColorMap.disabled,
          flexDirection: 'row',
          flex: 1,
        }}
        autoCorrect={false}
        autoFocus={autoFocus}
        onChangeText={text => onSearch(text)}
        placeholderTextColor={ColorMap.disabled}
        value={searchText}
      />
      {!!searchText && (
        <TouchableOpacity onPress={onClearSearchString}>
          <CancelIcon size={20} color={ColorMap.disabled} weight={'bold'} />
        </TouchableOpacity>
      )}
    </View>
  );
};
