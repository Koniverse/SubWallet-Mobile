import { _ChainAsset } from '@subwallet/chain-list/types';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { YieldPoolInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { Avatar, Button, Icon, Number, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretDown, CaretUp } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { isAccountAll } from 'utils/accountAll';
import { toShort } from 'utils/index';
import createStyles from './styles';

type Props = {
  compound: YieldPositionInfo;
  poolInfo: YieldPoolInfo;
  inputAsset: _ChainAsset;
};

const EarningNominationInfo: React.FC<Props> = (props: Props) => {
  const { inputAsset, poolInfo, compound } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const isAllAccount = useMemo(() => isAccountAll(compound.address), [compound.address]);

  const [showDetail, setShowDetail] = useState(false);

  const isRelayChain = useMemo(() => _STAKING_CHAIN_GROUP.relay.includes(poolInfo.chain), [poolInfo.chain]);
  const haveNomination = useMemo(() => {
    return [YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING].includes(poolInfo.type);
  }, [poolInfo.type]);
  const noNomination = useMemo(
    () => !haveNomination || isAllAccount || !compound.nominations.length,
    [compound.nominations.length, haveNomination, isAllAccount],
  );

  const toggleDetail = useCallback(() => {
    setShowDetail(old => !old);
  }, []);

  if (noNomination) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.header, showDetail ? undefined : styles.headerBottom]}
        onPress={toggleDetail}
        activeOpacity={1}>
        <Typography.Text style={styles.headerText}>Nomination info</Typography.Text>
        <Button
          type="ghost"
          size="xs"
          icon={<Icon phosphorIcon={showDetail ? CaretUp : CaretDown} size="sm" iconColor={theme['gray-5']} />}
          onPress={toggleDetail}
        />
      </TouchableOpacity>
      {showDetail && (
        <MetaInfo style={styles.infoContainer}>
          {compound.nominations.map(item => {
            return (
              <View style={styles.infoRow} key={item.validatorAddress}>
                <View style={styles.accountRow}>
                  <Avatar value={item.validatorAddress} size={theme.sizeLG} />
                  <Typography.Text style={styles.accountText} ellipsis={true} numberOfLines={1}>
                    {item.validatorIdentity || toShort(item.validatorAddress)}
                  </Typography.Text>
                </View>
                {!isRelayChain && (
                  <Number
                    size={theme.fontSizeHeading6}
                    textStyle={styles.infoText}
                    value={item.activeStake}
                    decimal={inputAsset?.decimals || 0}
                    suffix={inputAsset?.symbol}
                    decimalOpacity={0.45}
                  />
                )}
              </View>
            );
          })}
        </MetaInfo>
      )}
    </>
  );
};

export default EarningNominationInfo;
