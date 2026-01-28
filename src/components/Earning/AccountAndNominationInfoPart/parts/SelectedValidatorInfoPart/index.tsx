import React, { useCallback, useMemo } from 'react';
import { YieldPoolInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { TouchableOpacity, View } from 'react-native';
import { Icon, Typography } from 'components/design-system-ui';
import { PencilSimpleLine } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

interface Props {
  compound: YieldPositionInfo;
  poolInfo: YieldPoolInfo;
  inputAsset?: _ChainAsset;
  maxValidator?: number;
  totalValidator?: number;
  addresses?: string[];
}

const SelectedValidatorInfoPart = ({ compound, poolInfo }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;

  const onPress = useCallback(() => {
    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'ChangeEarningValidator',
        params: {
          slug: poolInfo.slug,
          chain: poolInfo.chain,
          from: compound.address,
          displayType: 'nomination',
          compound: compound,
          nominations: compound.nominations,
        },
      },
    });
  }, [compound, navigation, poolInfo.chain, poolInfo.slug]);

  const isAllAccount = useMemo(() => isAccountAll(compound.address), [compound.address]);

  const haveNomination = useMemo(() => {
    return [YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING, YieldPoolType.SUBNET_STAKING].includes(
      poolInfo.type,
    );
  }, [poolInfo.type]);

  const noNomination = useMemo(() => {
    return !haveNomination || isAllAccount || !compound.nominations.length;
  }, [compound.nominations.length, haveNomination, isAllAccount]);

  if (noNomination) {
    return null;
  }

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: theme.padding,
      }}
      onPress={onPress}>
      <Typography.Text style={{ color: theme.colorTextLight1 }}>{'Your validators'}</Typography.Text>
      <View style={{ width: 40, alignItems: 'center', justifyContent: 'center', marginRight: -theme.padding }}>
        <Icon phosphorIcon={PencilSimpleLine} size={'sm'} iconColor={theme['gray-5']} />
      </View>
    </TouchableOpacity>
  );
};

export default SelectedValidatorInfoPart;
