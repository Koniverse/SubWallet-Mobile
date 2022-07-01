import { StyleProp, View, ViewProps } from 'react-native';
import React from 'react';
import { ColorMap } from 'styles/color';
import { SeedWord } from 'components/SeedWord';

interface SeedPhraseAreaProps extends ViewProps {
  onTapWord: (word: string) => void;
  originWords: string[];
  currentWords: string[];
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
};

const seedWordStyle = {
  margin: 2,
};

export const SeedPhraseArea = (seedPhraseAreaProps: SeedPhraseAreaProps) => {
  const { currentWords, originWords, onTapWord, style } = seedPhraseAreaProps;

  const _onTapWord = (word: string) => {
    return () => {
      onTapWord(word);
    };
  };

  const renderSeedWord = (word: string, index: number) => {
    return (
      <SeedWord
        style={seedWordStyle}
        backgroundColor={ColorMap.dark1}
        key={word}
        title={word}
        isError={index !== originWords.indexOf(word)}
        onPress={_onTapWord(word)}
      />
    );
  };

  return (
    <View style={getWrapperStyle(style)}>
      <View style={innerViewStyle}>{currentWords.map((word, index) => renderSeedWord(word, index))}</View>
    </View>
  );
};
