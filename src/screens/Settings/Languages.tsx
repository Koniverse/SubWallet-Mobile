import React, { useState } from 'react';
import { StyleProp, View } from 'react-native';
import getLanguageOptions, { LanguageOption } from 'utils/getLanguageOptions';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { updateLanguage } from 'stores/MobileSettings';
import { RootState } from 'stores/index';
import { Button, SelectItem } from 'components/design-system-ui';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  marginBottom: 18,
  paddingHorizontal: 16,
};

const searchFunc = (items: LanguageOption[], searchString: string) => {
  return items.filter(item => item.value.toLowerCase().includes(searchString.toLowerCase()));
};

export const Languages = () => {
  const language = useSelector((state: RootState) => state.mobileSettings.language);
  const navigation = useNavigation<RootNavigationProps>();
  const supportedLanguages = i18n.getAvailableLanguages();
  const languageOptions = getLanguageOptions().filter(lang => supportedLanguages.includes(lang.value));
  const dispatch = useDispatch();
  const [selectedLang, setSelectedLang] = useState<string>(language);

  const onPressDone = () => {
    if (language === selectedLang) {
      navigation.goBack();
    } else {
      i18n.setLanguage(selectedLang);
      navigation.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'GeneralSettings' }],
      });
      dispatch(updateLanguage(selectedLang));
    }
  };

  // @ts-ignore
  const renderItem = ({ item }) => {
    return (
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <SelectItem
          label={item.text}
          isSelected={item.value === selectedLang}
          onPress={() => setSelectedLang(item.value)}
        />
      </View>
    );
  };

  // Todo: use FlatListScreen instead of SelectScreen
  return (
    <FlatListScreen
      title={i18n.header.language}
      items={languageOptions}
      renderItem={renderItem}
      renderListEmptyComponent={() => (
        <EmptyList
          title={i18n.emptyScreen.selectorEmptyTitle}
          message={i18n.emptyScreen.selectorEmptyMessage}
          icon={MagnifyingGlass}
        />
      )}
      autoFocus={false}
      searchFunction={searchFunc}
      afterListItem={
        <View style={footerAreaStyle}>
          <Button onPress={onPressDone}>{i18n.buttonTitles.apply}</Button>
        </View>
      }
      onPressBack={() => navigation.goBack()}
    />
  );
};
