import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ProcessTransactionData, ProcessType } from '@subwallet/extension-base/types';
import { Typography } from 'components/design-system-ui';
import { FontSemiBold } from 'styles/sharedStyles';
import { useGetTransactionProcessSteps } from 'hooks/transaction/process';
import useGetSwapProcessSteps from 'hooks/transaction/process/useGetSwapProcessSteps';
import { SwapBaseTxData } from '@subwallet/extension-base/types/swap';
import { TransactionProcessStepItem } from 'components/TransactionProcess';

interface Props {
  processData: ProcessTransactionData;
}

const ProcessStepList: React.FC<Props> = (props: Props) => {
  const { processData } = props;
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const [heights, setHeights] = useState<number[]>([]);

  const handleLayout = useCallback(
    (_index: number, event: LayoutChangeEvent) => {
      const newHeights = [...heights];
      newHeights[_index] = event.nativeEvent.layout.height;

      setHeights(newHeights);
    },
    [heights],
  );

  const getTransactionProcessSteps = useGetTransactionProcessSteps();
  const getSwapProcessSteps = useGetSwapProcessSteps();

  const stepItems = useMemo(() => {
    if (processData.type === ProcessType.SWAP) {
      const data = processData.combineInfo as SwapBaseTxData;

      return getSwapProcessSteps(data.process, data.quote, true, processData.steps, false);
    }

    return getTransactionProcessSteps(processData.steps, processData.combineInfo);
  }, [processData.type, processData.steps, processData.combineInfo, getTransactionProcessSteps, getSwapProcessSteps]);

  return (
    <View>
      <Typography.Text style={styles.heading}>{'Transaction process'}</Typography.Text>

      <View style={styles.stepListContainer}>
        {stepItems.map(item => (
          <TransactionProcessStepItem heights={heights} handleLayout={handleLayout} {...item} key={item.index} />
        ))}
      </View>
    </View>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    heading: {
      color: theme.colorWhite,
      ...FontSemiBold,
      marginBottom: theme.marginLG,
    },
    stepListContainer: {
      paddingHorizontal: theme.paddingSM,
    },
  });
}

export default ProcessStepList;
