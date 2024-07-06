import { useCallback, useMemo } from 'react';
import { AppConfirmationData, PopupHistoryData } from 'types/staticContent';
import { updateAppConfirmationData, updateConfirmationHistoryData } from 'stores/base/StaticContent';
import { useDispatch, useSelector } from 'react-redux';
import { YieldPositionInfo } from '@subwallet/extension-base/types';
import { RootState } from 'stores/index';
import BigN from 'bignumber.js';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import { getOutputValuesFromString } from 'components/Input/InputAmount';
import { BN_ZERO } from 'utils/chainBalances';

export const useHandleAppConfirmationMap = (yieldPositionList: YieldPositionInfo[]) => {
  const dispatch = useDispatch();
  const { appConfirmationData, confirmationHistoryMap } = useSelector((state: RootState) => state.staticContent);
  const { balanceMap } = useSelector((state: RootState) => state.balance);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const nftCollections = useSelector((state: RootState) => state.nft.nftCollections);

  const hasMoneyArr = useMemo(() => {
    let result: string[] = [];

    if (balanceMap.ALL) {
      const isHasBalance = Object.values(balanceMap.ALL).find(item => {
        const freeBalance = item?.free;
        const lockedBalance = item?.locked;
        const value = new BigN(freeBalance).plus(lockedBalance);

        return value.gt(BN_ZERO);
      });

      if (isHasBalance) {
        result.push('balance');
      }
    }

    if (nftCollections && nftCollections.length) {
      result.push('nft');
    }

    if (yieldPositionList && yieldPositionList.length) {
      result.push('earning');
    }

    return result;
  }, [balanceMap, nftCollections, yieldPositionList]);

  const getFilteredAppConfirmationByTimeAndPlatform = useCallback(
    (data: AppConfirmationData[]) => {
      dispatch(updateAppConfirmationData(data));
    },
    [dispatch],
  );

  const initConfirmationHistoryMap = useCallback((data: AppConfirmationData[]) => {
    const newData: Record<string, PopupHistoryData> = data.reduce(
      (o, key) =>
        Object.assign(o, {
          [`${key.position}-${key.id}`]: {
            lastShowTime: 0,
            showTimes: 0,
          },
        }),
      {},
    );
    const result = { ...newData, ...confirmationHistoryMap };
    dispatch(updateConfirmationHistoryData(result));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAppConfirmationData = useCallback(
    (data: AppConfirmationData[]) => {
      getFilteredAppConfirmationByTimeAndPlatform(data);
      initConfirmationHistoryMap(data);
    },
    [getFilteredAppConfirmationByTimeAndPlatform, initConfirmationHistoryMap],
  );

  const updateConfirmationHistoryMap = useCallback(
    (id: string) => {
      dispatch(
        updateConfirmationHistoryData({
          ...confirmationHistoryMap,
          [id]: { lastShowTime: Date.now(), showTimes: confirmationHistoryMap[id].showTimes + 1 },
        }),
      );
    },
    [confirmationHistoryMap, dispatch],
  );

  const checkComparison = useCallback((comparison: string, value: string, comparisonValue: string) => {
    switch (comparison) {
      case 'eq':
        return new BigN(value).eq(comparisonValue);
      case 'gt':
        return new BigN(value).gt(comparisonValue);
      case 'gte':
        return new BigN(value).gte(comparisonValue);
      case 'lt':
        return new BigN(value).lt(comparisonValue);
      case 'lte':
        return new BigN(value).lte(comparisonValue);
      default:
        return true;
    }
  }, []);

  const filteredAppConfirmationMap = useMemo(() => {
    return appConfirmationData?.filter(item => {
      if (!!Object.keys(item.conditions) && !!Object.keys(item.conditions).length) {
        const isPassValidation: boolean[] = [];

        if (item.conditions['condition-balance'] && item.conditions['condition-balance'].length) {
          const dataFilterByBalanceCondition = item.conditions['condition-balance'].map(_item => {
            return Object.values(balanceMap).some(info => {
              const balanceData = info[_item.chain_asset];
              const decimals = _getAssetDecimals(assetRegistry[_item.chain_asset]);
              const freeBalance = balanceData?.free;
              const lockedBalance = balanceData?.locked;
              const value = new BigN(freeBalance).plus(lockedBalance).toString();
              const comparisonValue = getOutputValuesFromString(_item.value.toString(), decimals);

              return checkComparison(_item.comparison, value, comparisonValue);
            });
          });

          isPassValidation.push(dataFilterByBalanceCondition.some(i => i));
        }

        if (item.conditions['condition-earning'] && item.conditions['condition-earning'].length) {
          const dataFilterByEarningCondition = item.conditions['condition-earning'].map(condition => {
            const yieldPosition = yieldPositionList.find(_item => _item.slug === condition.pool_slug);

            if (yieldPosition) {
              const chainInfo = chainInfoMap[yieldPosition.chain];
              const decimals = chainInfo?.substrateInfo?.decimals || chainInfo?.evmInfo?.decimals;
              const activeStake = yieldPosition.totalStake;
              const comparisonValue = getOutputValuesFromString(condition.value.toString(), decimals || 0);

              return checkComparison(condition.comparison, activeStake, comparisonValue);
            } else {
              return false;
            }
          });

          isPassValidation.push(dataFilterByEarningCondition.some(_i => _i));
        }

        if (item.conditions['condition-nft'] && item.conditions['condition-nft'].length) {
          const dataFilterByNftCondition = nftCollections.find(nft =>
            item.conditions['condition-nft'].find(
              cond => cond.chain === nft.chain || cond.collection_id === nft.collectionId,
            ),
          );

          isPassValidation.push(!!dataFilterByNftCondition);
        }

        if (
          item.conditions['condition-has-money'] &&
          item.conditions['condition-has-money'][0] &&
          item.conditions['condition-has-money'][0].has_money
        ) {
          const isHasMoney = item.conditions['condition-has-money'][0].has_money.some(i => hasMoneyArr.includes(i));

          isPassValidation.push(isHasMoney);
        }

        if (isPassValidation && isPassValidation.length) {
          return isPassValidation.some(d => d);
        } else {
          return true;
        }
      } else {
        return true;
      }
    });
  }, [
    appConfirmationData,
    assetRegistry,
    balanceMap,
    chainInfoMap,
    checkComparison,
    hasMoneyArr,
    nftCollections,
    yieldPositionList,
  ]);

  const appConfirmationMap = useMemo(() => {
    if (filteredAppConfirmationMap) {
      const result: Record<string, AppConfirmationData[]> = filteredAppConfirmationMap.reduce((r, a) => {
        r[a.position] = r[a.position] || [];
        r[a.position].push(a);
        return r;
      }, Object.create(null));

      return result;
    } else {
      return {};
    }
  }, [filteredAppConfirmationMap]);

  return {
    setAppConfirmationData,
    updateConfirmationHistoryMap,
    appConfirmationMap,
  };
};
