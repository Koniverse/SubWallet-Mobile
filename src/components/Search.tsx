import React from 'react';
import { StyleProp, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { FadersHorizontal, MagnifyingGlass, XCircle } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { Button, Icon } from 'components/design-system-ui';

interface Props extends TextInputProps {
  onSearch: (text: string) => void;
  searchText: string;
  onClearSearchString: () => void;
  autoFocus?: boolean;
  searchRef?: React.RefObject<TextInput>;
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  isShowFilterBtn?: boolean;
  onPressFilterBtn?: () => void;
}

const searchContainerStyle: StyleProp<any> = {
  backgroundColor: '#1A1A1A',
  borderRadius: 5,
  alignItems: 'center',
  paddingRight: 4,
  paddingLeft: 12,
  flexDirection: 'row',
  height: 44,
};

const SearchIcon = MagnifyingGlass;
const CancelIcon = XCircle;

export const Search = (searchProps: Props) => {
  const {
    onSearch,
    searchText,
    style,
    onClearSearchString,
    autoFocus,
    searchRef,
    onSubmitEditing,
    placeholder,
    isShowFilterBtn,
    onPressFilterBtn,
  } = searchProps;

  return (
    <View style={[searchContainerStyle, style]}>
      <SearchIcon size={20} color={ColorMap.light} weight={'bold'} />
      <TextInput
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
        placeholder={placeholder}
        autoCorrect={false}
        autoFocus={autoFocus}
        onChangeText={text => onSearch(text)}
        placeholderTextColor={ColorMap.disabled}
        value={searchText}
        onSubmitEditing={onSubmitEditing}
      />
      {!!searchText && (
        <Button
          size={'xs'}
          type={'ghost'}
          icon={<Icon phosphorIcon={CancelIcon} size={'sm'} iconColor={ColorMap.disabled} />}
          onPress={onClearSearchString}
        />
      )}

      {isShowFilterBtn && (
        <Button
          size={'xs'}
          type={'ghost'}
          icon={<Icon phosphorIcon={FadersHorizontal} size={'sm'} iconColor={'#A6A6A6'} />}
          onPress={onPressFilterBtn}
        />
      )}
    </View>
  );
};
