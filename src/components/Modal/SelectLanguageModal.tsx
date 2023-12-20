import { Icon, SelectItem, SwModal, Typography } from 'components/design-system-ui';
import i18n from 'utils/i18n/i18n';
import { TouchableOpacity, View } from 'react-native';
import { LanguageType } from '@subwallet/extension-base/background/KoniTypes';
import React, { Suspense, useCallback, useMemo } from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { CaretDown } from 'phosphor-react-native';
import { ImageLogosMap } from 'assets/logo';
import getLanguageOptions from 'utils/getLanguageOptions';
import { saveLanguage } from 'messaging/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

interface Props {
  showLanguageModal: boolean;
  setShowLanguageModal: (value: boolean) => void;
}

export const SelectLanguageModal = ({ showLanguageModal, setShowLanguageModal }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const language = useSelector((state: RootState) => state.settings.language);
  const supportedLanguages = i18n.getAvailableLanguages();
  const languageOptions = getLanguageOptions().filter(lang => supportedLanguages.includes(lang.value));
  const currentLanguageOpt = useMemo(
    () => languageOptions.find(item => item.value === language),
    [language, languageOptions],
  );

  const getLanguageLogo = useCallback((val: string, size = 24) => {
    if (val === 'en') {
      return (
        <Suspense>
          <ImageLogosMap.en width={size} height={size} />
        </Suspense>
      );
    }

    if (val === 'vi') {
      return (
        <Suspense>
          <ImageLogosMap.vi width={size} height={size} />
        </Suspense>
      );
    }

    if (val === 'zh') {
      return (
        <Suspense>
          <ImageLogosMap.chi width={size} height={size} />
        </Suspense>
      );
    }

    if (val === 'ja') {
      return (
        <Suspense>
          <ImageLogosMap.ja width={size} height={size} />
        </Suspense>
      );
    }

    if (val === 'ru') {
      return (
        <Suspense>
          <ImageLogosMap.ru width={size} height={size} />
        </Suspense>
      );
    }

    return (
      <Suspense>
        <ImageLogosMap.en width={size} height={size} />
      </Suspense>
    );
  }, []);

  const onSelectLanguage = (currentLanguage: string) => {
    if (currentLanguage === language) {
      setShowLanguageModal(false);
    } else {
      i18n.setLanguage(currentLanguage);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      saveLanguage(currentLanguage as LanguageType);
      setShowLanguageModal(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={BUTTON_ACTIVE_OPACITY}
        onPress={() => setShowLanguageModal(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 40,
          gap: theme.paddingXXS,
          paddingHorizontal: theme.padding,
          marginTop: theme.marginXS,
        }}>
        {getLanguageLogo(language, 16)}
        <Typography.Text size={'sm'} style={{ color: theme.colorTextLight3 }}>
          {currentLanguageOpt ? currentLanguageOpt.text : ''}
        </Typography.Text>
        <Icon phosphorIcon={CaretDown} size={'xxs'} weight={'bold'} iconColor={theme.colorTextLight3} />
      </TouchableOpacity>

      <SwModal
        modalTitle={i18n.header.language}
        isUseModalV2
        modalVisible={showLanguageModal}
        setVisible={setShowLanguageModal}>
        <View style={{ gap: theme.paddingXS }}>
          {languageOptions.map(item => (
            <SelectItem
              key={item.value}
              leftItemIcon={getLanguageLogo(item.value)}
              label={item.text}
              isSelected={item.value === language}
              onPress={() => onSelectLanguage(item.value as LanguageType)}
            />
          ))}
        </View>
      </SwModal>
    </>
  );
};
