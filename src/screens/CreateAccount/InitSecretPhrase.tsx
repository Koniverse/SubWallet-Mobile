import React from 'react';
import { StyleProp, View } from 'react-native';
import { SeedWord } from 'components/SeedWord';
import { ColorMap } from 'styles/color';
import { sharedStyles } from 'styles/sharedStyles';

const phraseAreaStyle: StyleProp<any> = {
  paddingLeft: 14,
  paddingRight: 14,
  flexDirection: 'row',
  flexWrap: 'wrap',
};

const seedWordStyle = {
  margin: 2,
};

const renderSeedWord = (word: string, index: number) => {
  return (
    <SeedWord style={seedWordStyle} key={word} prefixText={`${index + 1}`.padStart(2, '0')} title={word} disabled />
  );
};

export const InitSecretPhrase = () => {
  const phrase = 'gadget copy assist junior exhibit lazy educate brain used dust stay wink';

  return (
    <View style={{ backgroundColor: ColorMap.dark1, flex: 1, ...sharedStyles.blockContent }}>
      <View style={phraseAreaStyle}>{phrase.split(' ').map(renderSeedWord)}</View>
    </View>
  );
};
