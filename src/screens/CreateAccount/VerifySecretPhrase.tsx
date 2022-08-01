import React, { useEffect, useState } from 'react';
import { GestureResponderEvent, StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { SeedWord } from 'components/SeedWord';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { getWordKey, SeedPhraseArea, SelectedWordType } from 'components/SeedPhraseArea';
import { SubmitButton } from 'components/SubmitButton';
import { shuffleArray } from 'utils/index';

interface Props {
  onPressSubmit: (event: GestureResponderEvent) => void;
  seed: string;
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

export const VerifySecretPhrase = ({ onPressSubmit, seed }: Props) => {
  const [selectedWords, setSelectedWords] = useState<SelectedWordType[]>([]);
  const [shuffleWords, setShuffleWords] = useState<string[] | null>(null);
  const seedWords: string[] = seed.split(' ');

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

  return (
    <View style={sharedStyles.layoutContainer}>
      <View style={bodyAreaStyle}>
        <View style={infoBlockStyle}>
          <Text style={infoTextStyle}>
            Fill in the words in the correct order to prove that you have saved your secret phrase.
          </Text>
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
        <SubmitButton disabled={!isCorrectWord(selectedWords, seed)} title={'Continue'} onPress={onPressSubmit} />
      </View>
    </View>
  );
};
