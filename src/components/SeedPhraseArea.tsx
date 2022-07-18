import { StyleProp, View, ViewProps } from 'react-native';
import React from 'react';
import { ColorMap } from 'styles/color';
import { SeedWord } from 'components/SeedWord';

export type SelectedWordType = {
  wordKey: string;
  word: string;
};

interface SeedPhraseAreaProps extends ViewProps {
  onTapWord: (word: string, wordKey: string) => void;
  originWords: string[];
  currentWords: SelectedWordType[];
}

export function getWordKey(word: string, index: number) {
  return `${index}-${word}`;
}

function getWrapperStyle(style: StyleProp<any> = {}): StyleProp<any> {
  return {
    borderRadius: 5,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: ColorMap.dark2,
    minHeight: 170,
    ...style,
  };
}

const innerViewStyle: StyleProp<any> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const seedWordStyle = {
  margin: 2,
};

const isWordCorrect = (word: string, index: number, originWords: string[]) => {
  const currentOriginWord = originWords[index];

  return !!(currentOriginWord && currentOriginWord === word);
};

export const SeedPhraseArea = (seedPhraseAreaProps: SeedPhraseAreaProps) => {
  const { currentWords, originWords, onTapWord, style } = seedPhraseAreaProps;

  const _onTapWord = (word: string, wordKey: string) => {
    return () => {
      onTapWord(word, wordKey);
    };
  };

  const renderSeedWord = (item: SelectedWordType, index: number) => {
    const { wordKey, word } = item;

    return (
      <SeedWord
        style={seedWordStyle}
        backgroundColor={ColorMap.dark1}
        key={wordKey}
        title={word}
        isError={!isWordCorrect(word, index, originWords)}
        onPress={_onTapWord(word, wordKey)}
      />
    );
  };

  return (
    <View style={getWrapperStyle(style)}>
      <View style={innerViewStyle}>{currentWords.map(renderSeedWord)}</View>
    </View>
  );
};
