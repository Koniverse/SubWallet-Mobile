import { StyleProp, View, ViewProps } from 'react-native';
import React, { useCallback, useMemo, useRef } from 'react';
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
  alignItems: 'flex-start',
  gap: 8,
};

const wordRow: StyleProp<any> = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
};

const convertWordArr = (currentWords: SelectedWordType[]): Array<Array<SelectedWordType>> => {
  const result: Array<Array<SelectedWordType>> = [];
  let count = 0;
  let temp: Array<SelectedWordType> = [];

  currentWords.forEach((item, index) => {
    if (currentWords[index]) {
      temp.push(currentWords[index]);
    } else {
      temp.push(item);
    }
    count++;

    if (count === 3 || index === currentWords.length - 1) {
      result.push(temp);
      count = 0;
      temp = [];
    }
  });

  return result;
};

const convertOriginWordArr = (currentWords: string[]): Array<Array<string>> => {
  const result: Array<Array<string>> = [];
  let count = 0;
  let temp: Array<string> = [];

  currentWords.forEach((item, index) => {
    if (currentWords[index]) {
      temp.push(currentWords[index]);
    } else {
      temp.push(item);
    }
    count++;

    if (count === 3 || index === currentWords.length - 1) {
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
  const seedWordWidthRef = useRef(0);

  const _onTapWord = (word: string, wordKey: string) => {
    return () => {
      onTapWord(word, wordKey);
    };
  };

  const getSeedWordStyle = useCallback(() => {
    return {
      width: seedWordWidthRef.current,
      margin: 2,
    };
  }, []);

  const convertedCurrentWorld = useMemo(() => convertWordArr(currentWords), [currentWords]);
  const convertedOriginWorld = useMemo(() => convertOriginWordArr(originWords), [originWords]);

  const renderSeedWord = (item: SelectedWordType, rowIndex: number, itemIndex: number) => {
    const { wordKey, word } = item;
    return (
      <SeedWord
        style={getSeedWordStyle()}
        backgroundColor={ColorMap.dark1}
        key={wordKey}
        title={word}
        isHidden={!word}
        isError={!isWordCorrect(word, itemIndex, convertedOriginWorld[rowIndex])}
        onPress={_onTapWord(word, wordKey)}
      />
    );
  };

  return (
    <View
      style={getWrapperStyle(style)}
      onLayout={event => {
        const { width } = event.nativeEvent.layout;
        seedWordWidthRef.current = (width - 60) / 3;
      }}>
      <View style={innerViewStyle}>
        {convertedCurrentWorld.map((arr, rowIndex) => {
          return (
            <View key={rowIndex} style={wordRow}>
              {arr.map((item, itemIndex) => renderSeedWord(item, rowIndex, itemIndex))}
            </View>
          );
        })}
      </View>
    </View>
  );
};
