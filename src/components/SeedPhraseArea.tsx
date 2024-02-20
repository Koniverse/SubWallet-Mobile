import { StyleProp, View, ViewProps } from 'react-native';
import React, { useMemo } from 'react';
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
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
};

const wordRow: StyleProp<any> = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
};

const seedWordStyle = {
  flex: 1,
  margin: 2,
};

const convertCurrentWordArr = (currentWords: SelectedWordType[]): Array<Array<SelectedWordType>> => {
  const raw = [
    { word: '', wordKey: '1' },
    { word: '', wordKey: '2' },
    { word: '', wordKey: '3' },
    { word: '', wordKey: '4' },
    { word: '', wordKey: '5' },
    { word: '', wordKey: '6' },
    { word: '', wordKey: '7' },
    { word: '', wordKey: '8' },
    { word: '', wordKey: '9' },
    { word: '', wordKey: '10' },
    { word: '', wordKey: '11' },
    { word: '', wordKey: '12' },
  ];
  const result: Array<Array<SelectedWordType>> = [];
  let count = 0;
  let temp: Array<SelectedWordType> = [];

  raw.forEach((item, index) => {
    if (currentWords[index]) {
      temp.push(currentWords[index]);
    } else {
      temp.push(item);
    }
    count++;

    if (count === 3 || index === raw.length - 1) {
      result.push(temp);
      count = 0;
      temp = [];
    }
  });

  return result;
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

  const convertedCurrentWorld = useMemo(() => convertCurrentWordArr(currentWords), [currentWords]);

  const renderSeedWord = (item: SelectedWordType, index: number) => {
    const { wordKey, word } = item;

    return (
      <SeedWord
        style={seedWordStyle}
        backgroundColor={ColorMap.dark1}
        key={wordKey}
        title={word}
        isHidden={!word}
        isError={!isWordCorrect(word, index, originWords)}
        onPress={_onTapWord(word, wordKey)}
      />
    );
  };

  return (
    <View style={getWrapperStyle(style)}>
      <View style={innerViewStyle}>
        {convertedCurrentWorld.map((arr, index) => {
          return (
            <View key={index} style={wordRow}>
              {arr.map(renderSeedWord)}
            </View>
          );
        })}
      </View>
    </View>
  );
};
