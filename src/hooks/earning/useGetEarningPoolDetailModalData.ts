import { useCallback, useMemo } from 'react';
import { YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { getInputValuesFromString } from 'components/Input/InputAmount';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { BoxProps, StaticDataProps } from 'components/Modal/Earning/EarningPoolDetailModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getEarningTimeText } from 'utils/earning';

export const useGetEarningPoolDetailModalData = (earningStaticData: StaticDataProps[], poolInfo?: YieldPoolInfo) => {
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);

  const replaceEarningValue = useCallback((target: BoxProps, searchString: string, replaceValue: string) => {
    if (target.title.includes(searchString)) {
      target.title = target.title.replace(searchString, replaceValue);
    }

    if (typeof target.description === 'string' && target.description?.includes(searchString)) {
      // @ts-ignore
      target.description = target.description.replaceAll(searchString, replaceValue);
    }
  }, []);

  const unBondedTime = useMemo((): string => {
    let time: number | undefined;
    if (poolInfo?.statistic && 'unstakingPeriod' in poolInfo?.statistic) {
      time = poolInfo?.statistic.unstakingPeriod;
    }

    return getEarningTimeText(time);
  }, [poolInfo?.statistic]);

  const data: BoxProps[] = useMemo(() => {
    if (!poolInfo) {
      return [];
    }

    switch (poolInfo?.type) {
      case YieldPoolType.NOMINATION_POOL: {
        const _label = getValidatorLabel(poolInfo?.chain);
        const label = _label.slice(0, 1).toLowerCase().concat(_label.slice(1)).concat('s');
        const maxCandidatePerFarmer = poolInfo?.statistic?.maxCandidatePerFarmer || 0;
        const inputAsset = assetRegistry[poolInfo?.metadata.inputAsset];
        const maintainAsset = assetRegistry[poolInfo?.metadata.maintainAsset];
        const paidOut = poolInfo?.statistic?.eraTime;

        if (inputAsset && maintainAsset) {
          const { symbol: maintainSymbol, decimals: maintainDecimals } = maintainAsset;
          const maintainBalance = getInputValuesFromString(
            poolInfo?.metadata.maintainBalance || '0',
            maintainDecimals || 0,
          );
          const earningData =
            earningStaticData.find(item => item.slug === YieldPoolType.NOMINATION_POOL)?.instructions || [];
          return earningData.map(item => {
            const _item: BoxProps = { ...item, icon: item.icon };
            replaceEarningValue(_item, '{validatorNumber}', maxCandidatePerFarmer.toString());
            replaceEarningValue(_item, '{validatorType}', label);
            replaceEarningValue(_item, '{periodNumb}', unBondedTime);
            replaceEarningValue(_item, '{maintainBalance}', maintainBalance);
            replaceEarningValue(_item, '{maintainSymbol}', maintainSymbol);
            if (paidOut !== undefined) {
              replaceEarningValue(_item, '{paidOut}', paidOut.toString());
              replaceEarningValue(_item, '{paidOutTimeUnit}', paidOut > 1 ? 'hours' : 'hour');
            }

            return _item;
          });
        } else {
          return [];
        }
      }
      case YieldPoolType.SUBNET_STAKING:
      case YieldPoolType.NATIVE_STAKING: {
        const _label = getValidatorLabel(poolInfo?.chain);
        const label = _label.slice(0, 1).toLowerCase().concat(_label.slice(1)).concat('s');
        const maxCandidatePerFarmer = poolInfo?.statistic?.maxCandidatePerFarmer || 0;
        const inputAsset = assetRegistry[poolInfo?.metadata.inputAsset];
        const maintainAsset = assetRegistry[poolInfo?.metadata.maintainAsset];
        const paidOut = poolInfo?.statistic?.eraTime;

        if (inputAsset && maintainAsset) {
          const { symbol: maintainSymbol, decimals: maintainDecimals } = maintainAsset;
          const maintainBalance = getInputValuesFromString(
            poolInfo?.metadata.maintainBalance || '0',
            maintainDecimals || 0,
          );

          if (_STAKING_CHAIN_GROUP.astar.includes(poolInfo?.chain)) {
            const earningData = earningStaticData.find(item => item.slug === 'DAPP_STAKING')?.instructions || [];
            return earningData.map(item => {
              const _item: BoxProps = { ...item, icon: item.icon };
              replaceEarningValue(_item, '{validatorNumber}', maxCandidatePerFarmer.toString());
              replaceEarningValue(_item, '{periodNumb}', unBondedTime);
              replaceEarningValue(_item, '{maintainBalance}', maintainBalance);
              replaceEarningValue(_item, '{maintainSymbol}', maintainSymbol);

              if (paidOut !== undefined) {
                replaceEarningValue(_item, '{paidOut}', paidOut.toString());
                replaceEarningValue(_item, '{paidOutTimeUnit}', paidOut > 1 ? 'hours' : 'hour');
              }

              return _item;
            });
          }

          if (_STAKING_CHAIN_GROUP.bittensor.includes(poolInfo.chain)) {
            const earningData = earningStaticData.find(item => item.slug === 'SUBNET_STAKING')?.instructions || [];
            return earningData.map(item => {
              const _item: BoxProps = { ...item, icon: item.icon };

              replaceEarningValue(_item, '{validatorNumber}', maxCandidatePerFarmer.toString());
              replaceEarningValue(_item, '{validatorType}', label);
              replaceEarningValue(_item, '{periodNumb}', unBondedTime);
              replaceEarningValue(_item, '{maintainBalance}', maintainBalance);
              replaceEarningValue(_item, '{maintainSymbol}', maintainSymbol);

              if (paidOut !== undefined) {
                replaceEarningValue(_item, '{paidOut}', paidOut >= 1 ? paidOut.toString() : (paidOut * 60).toString());
                replaceEarningValue(
                  _item,
                  '{paidOutTimeUnit}',
                  paidOut > 1 ? 'hours' : paidOut === 1 ? 'hour' : 'minutes',
                );
              }

              return _item;
            });
          }

          const earningData =
            earningStaticData.find(item => item.slug === YieldPoolType.NATIVE_STAKING)?.instructions || [];
          return earningData.map(item => {
            const _item: BoxProps = { ...item, icon: item.icon };

            replaceEarningValue(_item, '{validatorNumber}', maxCandidatePerFarmer.toString());
            replaceEarningValue(_item, '{validatorType}', label);
            replaceEarningValue(_item, '{periodNumb}', unBondedTime);
            replaceEarningValue(_item, '{maintainBalance}', maintainBalance);
            replaceEarningValue(_item, '{maintainSymbol}', maintainSymbol);
            if (paidOut !== undefined) {
              replaceEarningValue(_item, '{paidOut}', paidOut >= 1 ? paidOut.toString() : (paidOut * 60).toString());
              replaceEarningValue(
                _item,
                '{paidOutTimeUnit}',
                paidOut > 1 ? 'hours' : paidOut === 1 ? 'hour' : 'minutes',
              );
            }
            return _item;
          });
        } else {
          return [];
        }
      }
      case YieldPoolType.LIQUID_STAKING: {
        const derivativeSlug = poolInfo?.metadata.derivativeAssets?.[0] || '';
        const derivative = assetRegistry[derivativeSlug];
        const inputAsset = assetRegistry[poolInfo?.metadata.inputAsset];
        const maintainAsset = assetRegistry[poolInfo?.metadata.maintainAsset];

        if (derivative && inputAsset && maintainAsset) {
          const { symbol: maintainSymbol, decimals: maintainDecimals } = maintainAsset;
          const maintainBalance = getInputValuesFromString(
            poolInfo?.metadata.maintainBalance || '0',
            maintainDecimals || 0,
          );
          const earningData =
            earningStaticData.find(item => item.slug === YieldPoolType.LIQUID_STAKING)?.instructions || [];
          return earningData.map(item => {
            const _item: BoxProps = { ...item, icon: item.icon };
            replaceEarningValue(_item, '{derivative}', derivative.symbol);
            replaceEarningValue(_item, '{periodNumb}', unBondedTime);
            replaceEarningValue(_item, '{inputToken}', inputAsset.symbol);
            replaceEarningValue(_item, '{maintainBalance}', maintainBalance);
            replaceEarningValue(_item, '{maintainSymbol}', maintainSymbol);
            return _item;
          });
        } else {
          return [];
        }
      }
      case YieldPoolType.LENDING: {
        const derivativeSlug = poolInfo?.metadata.derivativeAssets?.[0] || '';
        const derivative = assetRegistry[derivativeSlug];
        const inputAsset = assetRegistry[poolInfo?.metadata.inputAsset];
        const maintainAsset = assetRegistry[poolInfo?.metadata.maintainAsset];

        if (derivative && inputAsset && maintainAsset) {
          const { symbol: maintainSymbol, decimals: maintainDecimals } = maintainAsset;
          const maintainBalance = getInputValuesFromString(
            poolInfo?.metadata.maintainBalance || '0',
            maintainDecimals || 0,
          );
          const earningData = earningStaticData.find(item => item.slug === YieldPoolType.LENDING)?.instructions || [];
          return earningData.map(item => {
            const _item: BoxProps = { ...item, icon: item.icon };

            replaceEarningValue(_item, '{derivative}', derivative.symbol);
            replaceEarningValue(_item, '{inputToken}', inputAsset.symbol);
            replaceEarningValue(_item, '{maintainBalance}', maintainBalance);
            replaceEarningValue(_item, '{maintainSymbol}', maintainSymbol);
            return _item;
          });
        } else {
          return [];
        }
      }
    }
  }, [assetRegistry, earningStaticData, poolInfo, replaceEarningValue, unBondedTime]);

  return { data };
};
