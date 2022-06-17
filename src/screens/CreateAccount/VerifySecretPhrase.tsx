import React, { useState } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { SeedWord } from 'components/SeedWord';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, sharedStyles } from 'styles/sharedStyles';
import { SeedPhraseArea } from 'components/SeedPhraseArea';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { SubmitButton } from 'components/SubmitButton';

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
  flexWrap: 'wrap',
  marginBottom: 24,
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
    <ContainerWithSubHeader onPressBack={() => {}} title={'Verify Secret Phrase'}>
      <View style={sharedStyles.layoutContainer}>
        <View style={bodyAreaStyle}>
          <View style={infoBlockStyle}>
            <Text style={infoTextStyle}>
              Write down your wallet’s secret phrase and keep it in a safe place. Keep it carefully to not lose your
              assets.
            </Text>
          </View>
          <SeedPhraseArea
            currentWords={selectedWord}
            onTapWord={onUnSelectWord}
            originWords={seedWords}
            style={phraseAreaStyle}
          />
          <View style={phraseBlockStyle}>{seedWords.map(word => renderSeedWord(word))}</View>
        </View>
        <View style={footerAreaStyle}>
          <SubmitButton title={'Continue'} onPress={() => {}} />
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
