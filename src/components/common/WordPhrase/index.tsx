import { Button, Icon } from 'components/design-system-ui';
import { SeedWord } from 'components/SeedWord';
import Text from 'components/Text';
import useCopyClipboard from 'hooks/common/useCopyClipboard';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CopySimple } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { SeedWordDataType } from 'screens/Account/CreateAccount/types';
import createStyles from './styles';
import i18n from 'utils/i18n/i18n';

interface Props {
  seedPhrase: string;
}

const convertToWords = (seedPhrase: string): Array<Array<SeedWordDataType>> => {
  const raw = seedPhrase.split(' ');
  const result: Array<Array<SeedWordDataType>> = [];
  let count = 0;
  let temp: Array<SeedWordDataType> = [];

  raw.forEach((item, index) => {
    temp.push({ key: `${index}-${item}`, title: item, prefixText: `${index + 1}`.padStart(2, '0') });
    count++;

    if (count === 3 || index === raw.length - 1) {
      result.push(temp);
      count = 0;
      temp = [];
    }
  });

  return result;
};

const WordPhrase: React.FC<Props> = (props: Props) => {
  const { seedPhrase } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const seedItems = useMemo(() => convertToWords(seedPhrase), [seedPhrase]);

  const onCopy = useCopyClipboard(seedPhrase);

  return (
    <React.Fragment>
      <View style={styles.contentContainer}>
        {seedItems.map((arr, index) => {
          return (
            <View key={index} style={styles.wordRow}>
              {arr.map(item => {
                return (
                  <SeedWord
                    style={styles.seedWord}
                    key={item.key}
                    prefixText={item.prefixText}
                    title={item.title}
                    disabled
                  />
                );
              })}
            </View>
          );
        })}
      </View>
      <View style={styles.copyWrapper}>
        <Button
          type={'ghost'}
          size={'xs'}
          icon={<Icon phosphorIcon={CopySimple} size={'lg'} iconColor={theme.colorTextLight4} />}
          onPress={onCopy}>
          <Text style={styles.copyText}>{i18n.common.copyToClipboard}</Text>
        </Button>
      </View>
    </React.Fragment>
  );
};

export default WordPhrase;
