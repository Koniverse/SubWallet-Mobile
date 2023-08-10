import useUnlockModal from 'hooks/modal/useUnlockModal';
import React, { useEffect, useState } from 'react';
import { StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { SeedWord } from 'components/SeedWord';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { getWordKey, SeedPhraseArea, SelectedWordType } from 'components/SeedPhraseArea';
import { shuffleArray } from 'utils/index';
import i18n from 'utils/i18n/i18n';
import { Button, Icon } from 'components/design-system-ui';
import { ArrowCircleRight } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';

interface Props {
  onPressSubmit: () => void;
  seed: string;
  isBusy: boolean;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
};

const footerAreaStyle: StyleProp<any> = {
  ...MarginBottomForSubmitButton,
};

const infoBlockStyle: StyleProp<any> = {
  ...ContainerHorizontalPadding,
  marginBottom: 24,
};

const infoTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  textAlign: 'center',
};

const phraseAreaStyle: StyleProp<any> = {
  marginBottom: 24,
};

const phraseBlockStyle: StyleProp<any> = {
  paddingLeft: 14,
  paddingRight: 14,
  flexDirection: 'row',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginBottom: 24,
};

const seedWordStyle = {
  margin: 2,
};

const isCorrectWord = (selectedWords: SelectedWordType[], seed: string) => {
  return selectedWords.map(item => item.word).join(' ') === seed;
};

export const VerifySecretPhrase = ({ onPressSubmit, seed, isBusy, navigation }: Props) => {
  const [selectedWords, setSelectedWords] = useState<SelectedWordType[]>([]);
  const [shuffleWords, setShuffleWords] = useState<string[] | null>(null);
  const seedWords: string[] = seed.split(' ');
  const theme = useSubWalletTheme().swThemes;

  useEffect((): void => {
    const words = seed.split(' ');
    shuffleArray(words);
    setShuffleWords(words);
  }, [seed]);

  const onSelectWord = (word: string, wordKey: string) => {
    return () => {
      const newSelectedWord: SelectedWordType[] = [...selectedWords];
      newSelectedWord.push({ word, wordKey });
      setSelectedWords(newSelectedWord);
    };
  };

  const onUnSelectWord = (word: string, wordKey: string) => {
    const newSelectedWord: SelectedWordType[] = selectedWords.filter(
      item => !(item.word === word && item.wordKey === wordKey),
    );

    setSelectedWords(newSelectedWord);
  };

  const renderSeedWord = (word: string, index: number) => {
    const wordKey = getWordKey(word, index);

    return (
      <SeedWord
        style={seedWordStyle}
        key={wordKey}
        title={word}
        onPress={onSelectWord(word, wordKey)}
        isActivated={selectedWords.some(item => item.word === word && item.wordKey === wordKey)}
      />
    );
  };

  const { onPress: onSubmit } = useUnlockModal(navigation);

  const getCreateAccBtn = (color: string) => {
    return <Icon phosphorIcon={ArrowCircleRight} size={'lg'} iconColor={color} />;
  };

  return (
    <View style={sharedStyles.layoutContainer}>
      <View style={bodyAreaStyle}>
        <View style={infoBlockStyle}>
          <Text style={infoTextStyle}>{i18n.warningMessage.initSecretPhrase}</Text>
        </View>
        <SeedPhraseArea
          currentWords={selectedWords}
          onTapWord={onUnSelectWord}
          originWords={seedWords}
          style={phraseAreaStyle}
        />
        <View style={phraseBlockStyle}>{shuffleWords && shuffleWords.map(renderSeedWord)}</View>
      </View>
      <View style={footerAreaStyle}>
        <Button
          icon={getCreateAccBtn(
            !isCorrectWord(selectedWords, seed) || isBusy ? theme.colorTextLight5 : theme.colorWhite,
          )}
          disabled={!isCorrectWord(selectedWords, seed) || isBusy}
          onPress={onSubmit(onPressSubmit)}
          loading={isBusy}>
          {i18n.common.continue}
        </Button>
      </View>
    </View>
  );
};
