import React, { useEffect, useState } from 'react';
import { GestureResponderEvent, StyleProp, Text, View } from 'react-native';
import { SeedWord } from 'components/SeedWord';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, sharedStyles } from 'styles/sharedStyles';
import { SeedPhraseArea } from 'components/SeedPhraseArea';
import { SubmitButton } from 'components/SubmitButton';
import { shuffleArray } from 'utils/index';

interface Props {
  onPressSubmit: (event: GestureResponderEvent) => void;
  seed: string;
}

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
};

const footerAreaStyle: StyleProp<any> = {};

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

const isCorrectWord = (selectedWords: string[], seed: string) => {
  return selectedWords.join(' ') === seed;
};

export const VerifySecretPhrase = ({ onPressSubmit, seed }: Props) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffleWords, setShuffleWords] = useState<string[] | null>(null);
  const seedWords: string[] = seed.split(' ');

  useEffect((): void => {
    const words = seed.split(' ');
    shuffleArray(words);
    setShuffleWords(words);
  }, [seed]);

  const onSelectWord = (word: string) => {
    return () => {
      const newSelectedWord: string[] = [...selectedWords];
      newSelectedWord.push(word);
      setSelectedWords(newSelectedWord);
    };
  };

  const onUnSelectWord = (word: string) => {
    const newSelectedWord: string[] = selectedWords.filter(w => w !== word);

    setSelectedWords(newSelectedWord);
  };

  const renderSeedWord = (word: string) => {
    return (
      <SeedWord
        style={seedWordStyle}
        key={word}
        title={word}
        onPress={onSelectWord(word)}
        isActivated={selectedWords.includes(word)}
      />
    );
  };

  return (
    <View style={sharedStyles.layoutContainer}>
      <View style={bodyAreaStyle}>
        <View style={infoBlockStyle}>
          <Text style={infoTextStyle}>
            Write down your wallet’s secret phrase and keep it in a safe place. Keep it carefully to not lose your
            assets.
          </Text>
        </View>
        <SeedPhraseArea
          currentWords={selectedWords}
          onTapWord={onUnSelectWord}
          originWords={seedWords}
          style={phraseAreaStyle}
        />
        <View style={phraseBlockStyle}>{shuffleWords && shuffleWords.map(word => renderSeedWord(word))}</View>
      </View>
      <View style={footerAreaStyle}>
        <SubmitButton disabled={!isCorrectWord(selectedWords, seed)} title={'Continue'} onPress={onPressSubmit} />
      </View>
    </View>
  );
};
