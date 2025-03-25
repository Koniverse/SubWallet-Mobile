import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ProcessTransactionData } from '@subwallet/extension-base/types';
import { Typography } from 'components/design-system-ui';
import Item from 'components/Modal/TransactionProcessDetailModal/parts/ProcessStepList/item';

interface Props {
  processData: ProcessTransactionData;
}

const ProcessStepList: React.FC<Props> = (props: Props) => {
  const { processData } = props;
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <View>
      <Typography.Text style={styles.heading}>{'Transaction process'}</Typography.Text>

      <View style={styles.stepListContainer}>
        {processData.steps.map((step, index) => (
          <Item
            index={index}
            processStep={step}
            combineInfo={processData.combineInfo}
            isLastItem={index === processData.steps.length - 1}
            key={step.id}
          />
        ))}
      </View>
    </View>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    heading: {
      fontSize: theme.fontSizeHeading5,
      lineHeight: theme.fontSizeHeading5 * theme.lineHeightHeading5,
      color: theme.colorWhite,
      marginBottom: theme.marginLG,
    },
    stepListContainer: {
      paddingLeft: theme.padding,
    },
  });
}

export default ProcessStepList;
