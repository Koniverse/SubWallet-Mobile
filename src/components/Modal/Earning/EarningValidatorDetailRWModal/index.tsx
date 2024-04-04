import { Avatar, Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MetaInfo from 'components/MetaInfo';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { NominationPoolInfo, YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { ValidatorInfo, YieldPoolTarget } from '@subwallet/extension-base/types/yield/info/chain/target';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Alert, ScrollView, View } from 'react-native';
import { PlusCircle } from 'phosphor-react-native';
import { toShort } from 'utils/index';
import { balanceFormatter, formatNumber } from 'utils/number';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import { FontSemiBold } from 'styles/sharedStyles';
import { earlyValidateJoin } from 'messaging/index';
import { deviceHeight } from 'constants/index';

interface Props {
  onCancel?: () => void;
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  assetRegistry: Record<string, _ChainAsset>;
  poolInfo: YieldPoolInfo | undefined;
  validatorItem: YieldPoolTarget;
  bypassEarlyValidate?: boolean;
  onStakeMore?: (slug: string, chain: string) => void;
}

export const EarningValidatorDetailRWModal = ({
  modalVisible,
  setModalVisible,
  validatorItem,
  poolInfo,
  assetRegistry,
  bypassEarlyValidate,
  onStakeMore,
  onCancel,
}: Props) => {
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const theme = useSubWalletTheme().swThemes;
  const {
    address: validatorAddress,
    commission,
    identity,
    minBond: minStake,
    name,
    nominatorCount,
    totalStake,
  } = validatorItem as ValidatorInfo & NominationPoolInfo;
  const [apy, setApy] = useState<string>();
  const [loading, setLoading] = useState(false);
  const checkRef = useRef<number>(Date.now());
  const asset = useMemo(() => {
    if (!poolInfo) {
      return;
    }

    const {
      metadata: { inputAsset },
    } = poolInfo;

    return assetRegistry[inputAsset];
  }, [assetRegistry, poolInfo]);

  const getApy = useCallback(
    (totalApy?: number, totalApr?: number) => {
      if (!(poolInfo && poolInfo.statistic)) {
        return undefined;
      }

      if (totalApy) {
        return totalApy;
      }

      if (totalApr) {
        const rs = calculateReward(totalApr);

        return rs.apy;
      }

      return undefined;
    },
    [poolInfo],
  );

  useEffect(() => {
    if (!(poolInfo && poolInfo.statistic && asset)) {
      return;
    }

    const { totalApr, totalApy } = poolInfo.statistic;
    const apyRaw = getApy(totalApy, totalApr);

    apyRaw !== undefined && setApy(formatNumber(apyRaw, 0, balanceFormatter));
  }, [asset, getApy, poolInfo]);

  const title = useMemo(() => {
    if (!poolInfo || !asset) {
      return '';
    }

    const { type } = poolInfo;
    const minJoinPool = poolInfo.statistic?.earningThreshold.join || '0';

    const getOrigin = () => {
      switch (type) {
        case YieldPoolType.NOMINATION_POOL:
        case YieldPoolType.NATIVE_STAKING:
        case YieldPoolType.LIQUID_STAKING:
          return 'Earn up to {{apy}} yearly from {{minActiveStake}} with {{shortName}}';
        case YieldPoolType.LENDING:
          return 'Earn up to {{apy}} yearly from {{minActiveStake}} with {{shortName}}';
      }
    };

    let result = getOrigin();
    const shortName = poolInfo.metadata.shortName;

    if (asset) {
      if (Number(minJoinPool) === 0 && !apy) {
        result = 'Earn {{token}} with {{network}}';
        result = result.replace('{{token}}', asset.symbol);
        result = result.replace('{{network}}', shortName);
      }

      if (Number(minJoinPool) === 0) {
        result = result.replace(' from {{minActiveStake}}', '');
      } else {
        const string = formatNumber(minJoinPool, asset.decimals || 0, balanceFormatter);

        result = result.replace('{{minActiveStake}}', `${string} ${asset.symbol}`);
      }
    } else {
      result = result.replace('from ', '');
    }

    if (apy) {
      result = result.replace('{{apy}}', `${apy}%`);
    } else {
      result = result.replace('up to {{apy}} ', '');
    }

    if (shortName) {
      result = result.replace('{{shortName}}', shortName);
    }

    return result;
  }, [apy, asset, poolInfo]);

  const onPressButton = useCallback(() => {
    if (!poolInfo) {
      return;
    }

    if (bypassEarlyValidate) {
      onStakeMore?.(poolInfo.slug, poolInfo.chain);

      return;
    }

    const time = Date.now();

    checkRef.current = time;
    setLoading(true);

    const isValid = () => {
      return time === checkRef.current;
    };

    const onError = (message: string) => {
      Alert.alert('Pay attention!', message, [
        {
          text: 'I undestand',
        },
      ]);
    };

    earlyValidateJoin({ slug: poolInfo.slug, address: validatorAddress || '' })
      .then(rs => {
        if (isValid()) {
          if (rs.passed) {
            setModalVisible(false);
            setTimeout(() => {
              onStakeMore?.(poolInfo.slug, poolInfo.chain);
            }, 300);
          } else {
            const message = rs.errorMessage || '';

            onError(message);
          }
        }
      })
      .catch(e => {
        if (isValid()) {
          const message = (e as Error).message || '';

          onError(message);
        }
      })
      .finally(() => {
        if (isValid()) {
          setLoading(false);
        }
      });
  }, [bypassEarlyValidate, onStakeMore, poolInfo, setModalVisible, validatorAddress]);

  const _onCancel = useCallback(() => {
    setModalVisible(false);

    onCancel && onCancel();
  }, [onCancel, setModalVisible]);

  const footer = useCallback(
    () => (
      <View style={{ width: '100%', marginTop: theme.margin }}>
        <Button
          disabled={loading}
          icon={<Icon phosphorIcon={PlusCircle} weight={'fill'} />}
          onPress={onPressButton}
          loading={loading}>
          {'Stake to earn'}
        </Button>
      </View>
    ),
    [loading, onPressButton, theme.margin],
  );

  return (
    <SwModal
      isUseModalV2
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      modalBaseV2Ref={modalBaseV2Ref}
      titleTextAlign={'center'}
      titleStyle={{ textAlign: 'center' }}
      footer={footer()}
      onBackButtonPress={_onCancel}
      onChangeModalVisible={_onCancel}
      modalTitle={title}>
      <MetaInfo
        hasBackgroundWrapper
        valueColorScheme={'light'}
        style={{
          width: '100%',
          alignItems: 'center',
          gap: theme.sizeXS,
        }}>
        <ScrollView
          style={{ width: '100%', maxHeight: deviceHeight * 0.5 }}
          contentContainerStyle={{ alignItems: 'center' }}
          showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', paddingTop: theme.paddingMD }}>
            <Avatar size={64} value={validatorAddress} />
            <View style={{ paddingTop: theme.paddingXS }}>
              <Typography.Text style={{ color: theme.colorTextTertiary, textAlign: 'center' }}>
                {'Validator'}
              </Typography.Text>
              <Typography.Text size={'lg'} style={{ color: theme.colorWhite, textAlign: 'center', ...FontSemiBold }}>
                {name || identity || toShort(validatorAddress)}
              </Typography.Text>
              <MetaInfo labelColorScheme={'success'} style={{ alignItems: 'center', paddingTop: theme.paddingXS }}>
                {!!apy && (
                  <MetaInfo.Number
                    size={'lg'}
                    valueColorSchema={'success'}
                    spaceBetween={false}
                    label={'APY:'}
                    value={apy}
                    suffix={'%'}
                    decimals={0}
                  />
                )}
              </MetaInfo>
            </View>
          </View>
          <View style={{ alignItems: 'center', paddingBottom: theme.paddingMD, width: '100%' }}>
            {!!commission && (
              <MetaInfo.Number
                spaceBetween={false}
                label={'Commission:'}
                value={commission}
                suffix={'%'}
                decimals={0}
              />
            )}
            {!!totalStake && (
              <MetaInfo.Number
                spaceBetween={false}
                label={'Total stake:'}
                value={totalStake}
                suffix={asset?.symbol}
                decimals={asset?.decimals || 0}
              />
            )}
            {!!nominatorCount && (
              <MetaInfo.Number spaceBetween={false} label={'Nominator count:'} value={nominatorCount} decimals={0} />
            )}
            {!!minStake && (
              <MetaInfo.Number
                spaceBetween={false}
                label={'Minimum active stake:'}
                value={minStake}
                decimals={asset?.decimals || 0}
                suffix={asset?.symbol}
              />
            )}
          </View>
        </ScrollView>
      </MetaInfo>
    </SwModal>
  );
};
