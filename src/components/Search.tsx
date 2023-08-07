import React from 'react';
import {
  Platform,
  StyleProp,
  TextInput,
  TextInputProps,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { FadersHorizontal, MagnifyingGlass, XCircle } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { Button, Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props extends TextInputProps {
  onSearch: (text: string) => void;
  searchText: string;
  onClearSearchString: () => void;
  autoFocus?: boolean;
  searchRef?: React.RefObject<TextInput>;
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  isShowFilterBtn?: boolean;
  onPressFilterBtn?: () => void;
  style?: StyleProp<ViewStyle>;
}

const searchContainerStyle: StyleProp<any> = {
  backgroundColor: '#1A1A1A',
  borderRadius: 8,
  alignItems: 'center',
  flexDirection: 'row',
  height: 48,
  position: 'relative',
};

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
    ...restProps
  } = searchProps;
  const theme = useSubWalletTheme().swThemes;

  return (
    <TouchableWithoutFeedback onPress={() => searchRef?.current?.focus()}>
      <View style={[searchContainerStyle, style]}>
        <View style={{ position: 'absolute', margin: 'auto', left: 12 }}>
          <Icon phosphorIcon={MagnifyingGlass} iconColor={theme.colorWhite} size={'md'} />
        </View>

        <TextInput
          ref={searchRef}
          numberOfLines={1}
          style={{
            ...sharedStyles.mainText,
            lineHeight: 20,
            ...FontMedium,
            color: ColorMap.disabled,
            flexDirection: 'row',
            flex: 1,
            paddingLeft: 44,
            paddingRight: isShowFilterBtn ? 84 : 44,
            height: '100%',
            maxHeight: Platform.OS === 'android' ? undefined : 20,
          }}
          placeholder={placeholder}
          autoCorrect={false}
          autoFocus={autoFocus}
          onChangeText={text => onSearch(text)}
          placeholderTextColor={theme.colorTextTertiary}
          value={searchText}
          onSubmitEditing={onSubmitEditing}
          {...restProps}
        />
        {!!searchText && (
          <Button
            style={{ position: 'absolute', right: isShowFilterBtn ? 44 : 4 }}
            size={'xs'}
            type={'ghost'}
            icon={<Icon phosphorIcon={CancelIcon} size={'sm'} iconColor={'#A6A6A6'} />}
            onPress={onClearSearchString}
          />
        )}

        {isShowFilterBtn && (
          <Button
            style={{ position: 'absolute', right: 4, marginVertical: 'auto' }}
            size={'xs'}
            type={'ghost'}
            icon={<Icon phosphorIcon={FadersHorizontal} size={'sm'} iconColor={'#A6A6A6'} />}
            onPress={onPressFilterBtn}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};
