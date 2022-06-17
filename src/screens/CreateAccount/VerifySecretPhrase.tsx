import React, { useState } from 'react';
import { StyleProp, View } from 'react-native';
import { SeedWord } from 'components/SeedWord';
import { ColorMap } from 'styles/color';
import { sharedStyles } from 'styles/sharedStyles';
import { SeedPhraseArea } from 'components/SeedPhraseArea';

const phraseAreaStyle: StyleProp<any> = {
  paddingLeft: 14,
  paddingRight: 14,
  flexDirection: 'row',
  flexWrap: 'wrap',
  flex: 1,
};

const seedWordStyle = {
  margin: 2,
};

export const VerifySecretPhrase = () => {
  const [selectedWord, setSelectedWord] = useState<string[]>(['gadget', 'assist']);
  const phrase = 'gadget copy assist junior exhibit lazy educate brain used dust stay wink';
  const seedWords: string[] = phrase.split(' ');

  // todo: randomize seedWords

  const onSelectWord = (word: string) => {
    return () => {
      const newSelectedWord: string[] = [...selectedWord];
      newSelectedWord.push(word);
      setSelectedWord(newSelectedWord);
    };
  };

  const onUnSelectWord = (word: string) => {
    const newSelectedWord: string[] = selectedWord.filter(w => w !== word);

    setSelectedWord(newSelectedWord);
  };

  const renderSeedWord = (word: string) => {
    return (
      <SeedWord
        style={seedWordStyle}
        key={word}
        title={word}
        onPress={onSelectWord(word)}
        isActivated={selectedWord.includes(word)}
      />
    );
  };

  return (
    <View style={{ backgroundColor: ColorMap.dark1, flex: 1, ...sharedStyles.blockContent }}>
      <SeedPhraseArea currentWords={selectedWord} onTapWord={onUnSelectWord} originWords={seedWords} />
      <View style={phraseAreaStyle}>
        {seedWords.map((word) => renderSeedWord(word))}
      </View>
    </View>
  );
};
