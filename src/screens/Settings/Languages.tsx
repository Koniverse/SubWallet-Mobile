import React, { useState } from 'react';
import { SelectScreen } from 'components/SelectScreen';
import { FlatList, StyleProp, View } from 'react-native';
import getLanguageOptions from 'utils/getLanguageOptions';
import { SelectItem } from 'components/SelectItem';
import { SubmitButton } from 'components/SubmitButton';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import RNRestart from 'react-native-restart';
import i18n from 'utils/i18n/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { updateLanguage } from 'stores/SettingData';
import { RootState } from 'stores/index';
import { ScrollViewStyle } from 'styles/sharedStyles';

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  marginBottom: 18,
};

export const Languages = () => {
  const {
    settingData: { language },
  } = useSelector((state: RootState) => state);
  const navigation = useNavigation<RootNavigationProps>();
  const languageOptions = getLanguageOptions();
  const dispatch = useDispatch();
  const [searchString, setSearchString] = useState<string>('');
  const filteredLanguageOption = languageOptions.filter(opt => opt.text.includes(searchString));

  // @ts-ignore
  const renderItem = ({ item }) => {
    return (
      <SelectItem
        label={item.text}
        isSelected={item.value === language}
        onPress={() => {
          dispatch(updateLanguage(item.value));
          i18n.setLanguage(item.value);
          setTimeout(() => {
            RNRestart.Restart();
          }, 500);
        }}
      />
    );
  };

  return (
    <SelectScreen title={'Languages'} searchString={searchString} onChangeSearchText={setSearchString}>
      <View style={{ flex: 1 }}>
        <FlatList data={filteredLanguageOption} renderItem={renderItem} style={{ ...ScrollViewStyle }} />
        <View style={footerAreaStyle}>
          <SubmitButton
            title={'Done'}
            onPress={() => {
              navigation.navigate('Settings');
            }}
          />
        </View>
      </View>
    </SelectScreen>
  );
};
