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
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
}

const searchContainerStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  borderRadius: 5,
  alignItems: 'center',
  paddingRight: 16,
  paddingLeft: 16,
  flexDirection: 'row',
  height: 44,
};

const SearchIcon = MagnifyingGlass;
const CancelIcon = XCircle;

export const Search = (searchProps: Props) => {
  const { onSearch, searchText, style, onClearSearchString, autoFocus, searchRef, onSubmitEditing, placeholder } =
    searchProps;

  return (
    <View style={[searchContainerStyle, style]}>
      <SearchIcon size={20} color={ColorMap.light} weight={'bold'} />
      <TextInput
        ref={searchRef}
        style={{
          marginHorizontal: 16,
          ...sharedStyles.mainText,
          lineHeight: 20,
          ...FontMedium,
          color: ColorMap.disabled,
          flexDirection: 'row',
          flex: 1,
        }}
        placeholder={placeholder}
        autoCorrect={false}
        autoFocus={autoFocus}
        onChangeText={text => onSearch(text)}
        placeholderTextColor={ColorMap.disabled}
        value={searchText}
        onSubmitEditing={onSubmitEditing}
      />
      {!!searchText && (
        <TouchableOpacity onPress={onClearSearchString}>
          <CancelIcon size={20} color={ColorMap.disabled} weight={'bold'} />
        </TouchableOpacity>
      )}
    </View>
  );
};
