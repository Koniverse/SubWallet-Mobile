import { _ChainAsset } from '@subwallet/chain-list/types';
import { YieldPoolInfo, YieldPositionInfo } from '@subwallet/extension-base/types';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import createStyles from './styles';
import AccountInfoPart from './parts/AccountInfoPart';
import NominationInfoPart from './parts/NominationInfoPart';

type Props = {
  compound: YieldPositionInfo;
  list: YieldPositionInfo[];
  poolInfo: YieldPoolInfo;
  inputAsset: _ChainAsset;
};

const AccountAndNominationInfoPart: React.FC<Props> = (props: Props) => {
  const { compound, inputAsset, poolInfo, list } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.wrapper}>
      <AccountInfoPart list={list} compound={compound} inputAsset={inputAsset} poolInfo={poolInfo} />
      <NominationInfoPart poolInfo={poolInfo} compound={compound} inputAsset={inputAsset} />
    </View>
  );
};

export default AccountAndNominationInfoPart;
