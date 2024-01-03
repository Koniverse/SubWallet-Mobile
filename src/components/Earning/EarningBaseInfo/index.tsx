import { _ChainAsset } from '@subwallet/chain-list/types';
import { YieldPoolInfo, YieldPositionInfo } from '@subwallet/extension-base/types';
import EarningPoolInfo from './parts/EarningPoolInfo';
import EarningAccountInfo from './parts/EarningAccountInfo';
import EarningNominationInfo from './parts/EarningNominationInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import createStyles from './styles';

type Props = {
  compound: YieldPositionInfo;
  list: YieldPositionInfo[];
  poolInfo: YieldPoolInfo;
  inputAsset: _ChainAsset;
};

const EarningBaseInfo: React.FC<Props> = (props: Props) => {
  const { compound, inputAsset, poolInfo, list } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.wrapper}>
      <EarningAccountInfo list={list} compound={compound} inputAsset={inputAsset} poolInfo={poolInfo} />
      <EarningNominationInfo poolInfo={poolInfo} compound={compound} inputAsset={inputAsset} />
      <EarningPoolInfo poolInfo={poolInfo} compound={compound} inputAsset={inputAsset} />
    </View>
  );
};

export default EarningBaseInfo;
