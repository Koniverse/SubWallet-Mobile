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
import { updateLanguage } from 'stores/MobileSettings';
import { RootState } from 'stores/index';
import { ScrollViewStyle } from 'styles/sharedStyles';
import moment from 'moment';

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  marginBottom: 18,
};

export const Languages = () => {
  const language = useSelector((state: RootState) => state.mobileSettings.language);
  const navigation = useNavigation<RootNavigationProps>();
  const languageOptions = getLanguageOptions();
  const dispatch = useDispatch();
  const [searchString, setSearchString] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<string>(language);
  const filteredLanguageOption = languageOptions.filter(opt => opt.text.includes(searchString));

  const onPressDone = () => {
    if (language === selectedLang) {
      navigation.navigate('Settings');
    } else {
      i18n.setLanguage(selectedLang);
      moment.locale(selectedLang);
      dispatch(updateLanguage(selectedLang));
      setTimeout(() => {
        RNRestart.Restart();
      }, 500);
    }
  };

  // @ts-ignore
  const renderItem = ({ item }) => {
    return (
      <SelectItem
        label={item.text}
        isSelected={item.value === selectedLang}
        onPress={() => setSelectedLang(item.value)}
      />
    );
  };

  return (
    <SelectScreen
      style={{ paddingTop: 0 }}
      title={'Language'}
      searchString={searchString}
      onChangeSearchText={setSearchString}
      onPressBack={() => navigation.goBack()}>
      <View style={{ flex: 1 }}>
        <FlatList data={filteredLanguageOption} renderItem={renderItem} style={{ ...ScrollViewStyle }} />
        <View style={footerAreaStyle}>
          <SubmitButton title={'Done'} onPress={onPressDone} />
        </View>
      </View>
    </SelectScreen>
  );
};
