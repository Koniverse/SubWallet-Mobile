import React, { useMemo, useState } from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { StyleSheet } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface Props {
  placeholder: string;
}

export const Dropdown = ({ placeholder }: Props) => {
  const [dropdownValue, setDropdownValue] = useState('football');
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        inputIOS: {
          ...sharedStyles.textInput,
          backgroundColor: theme.inputBackground,
          color: theme.textColor,
        },
        inputAndroid: {
          ...sharedStyles.textInput,
          backgroundColor: theme.inputBackground,
          color: theme.textColor,
        },
        iconContainer: {
          top: 16,
          right: 12,
        },
      }),
    [theme],
  );
  return (
    <RNPickerSelect
      style={styles}
      items={[
        { label: 'Football', value: 'football' },
        { label: 'Baseball', value: 'baseball' },
        { label: 'Hockey', value: 'hockey' },
      ]}
      useNativeAndroidPickerStyle={false}
      onValueChange={val => setDropdownValue(val)}
      value={dropdownValue}
      placeholder={placeholder ? { label: placeholder, value: '' } : {}}
      Icon={() => {
        return <FontAwesomeIcon icon={faChevronDown} size={16} color={theme.textColor2} />;
      }}
    />
  );
};
