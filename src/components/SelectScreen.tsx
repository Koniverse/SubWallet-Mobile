import React, { useEffect, useRef } from 'react';
import { StyleProp, TextInput, View } from 'react-native';
import { Search } from 'components/Search';
import { sharedStyles } from 'styles/sharedStyles';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { HIDE_MODAL_DURATION } from 'constants/index';
import { IconProps } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';

interface Props {
  children: JSX.Element;
  title: string;
  searchString: string;
  onPressBack?: () => void;
  onChangeSearchText: (text: string) => void;
  autoFocus?: boolean;
  style?: StyleProp<any>;
  showLeftBtn?: boolean;
  showRightBtn?: boolean;
  rightIcon?: (iconProps: IconProps) => JSX.Element;
  onPressRightIcon?: () => void;
}

// Todo: Remove this component
export const SelectScreen = ({
  children,
  title,
  searchString,
  onChangeSearchText,
  onPressBack,
  autoFocus = true,
  showLeftBtn = true,
  showRightBtn = false,
  rightIcon,
  onPressRightIcon,
  style,
}: Props) => {
  const searchRef = useRef<TextInput>(null);
  useEffect(() => {
    setTimeout(() => {
      if (autoFocus && searchRef && searchRef.current) {
        searchRef.current.focus();
      }
    }, HIDE_MODAL_DURATION);
  }, [autoFocus, searchRef]);

  const _onPressBack = () => {
    searchRef && searchRef.current && searchRef.current.blur();
    onPressBack && onPressBack();
  };

  return (
    <ContainerWithSubHeader
      showLeftBtn={showLeftBtn}
      onPressBack={_onPressBack}
      title={title}
      style={[{ width: '100%' }, style]}
      showRightBtn={showRightBtn}
      rightIcon={rightIcon}
      onPressRightIcon={onPressRightIcon}>
      <View style={{ ...sharedStyles.layoutContainer }}>
        <Search
          placeholder={i18n.common.search}
          autoFocus={false}
          onClearSearchString={() => onChangeSearchText('')}
          onSearch={onChangeSearchText}
          searchText={searchString}
          style={{ marginBottom: 8 }}
          searchRef={searchRef}
        />
        {children}
      </View>
    </ContainerWithSubHeader>
  );
};
