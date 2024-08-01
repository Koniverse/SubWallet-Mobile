import { useCallback, useMemo } from 'react';
import { AppBannerData, AppBasicInfoData, PopupHistoryData } from 'types/staticContent';
import { updateAppBannerData, updateBannerHistoryData } from 'stores/base/StaticContent';
import { useDispatch, useSelector } from 'react-redux';
import { YieldPositionInfo } from '@subwallet/extension-base/types';
import { RootState } from 'stores/index';
import BigN from 'bignumber.js';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import { getOutputValuesFromString } from 'components/Input/InputAmount';
import { BN_ZERO } from 'utils/chainBalances';
import useFetchAllNftCollection from 'hooks/screen/Home/Nft/useFetchAllNftCollection';
import useGetCrowdloanList from 'hooks/screen/Home/Crowdloans/useGetCrowdloanList';
import { _CrowdloanItemType } from 'types/index';
import { checkComparison, filterCampaignDataFunc } from 'utils/campaign';

export const useHandleAppBannerMap = (
  yieldPositionList: YieldPositionInfo[],
  checkPopupExistTime: (info: AppBasicInfoData) => boolean,
) => {
  const dispatch = useDispatch();
  const { appBannerData, bannerHistoryMap } = useSelector((state: RootState) => state.staticContent);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { balanceMap } = useSelector((state: RootState) => state.balance);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { nftCollections } = useFetchAllNftCollection();
  const crowdloanList: _CrowdloanItemType[] = useGetCrowdloanList();

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

  const getFilteredAppBannerByTimeAndPlatform = useCallback(
    (data: AppBannerData[]) => {
      const activeList = data.filter(({ info }) => checkPopupExistTime(info));
      const filteredData = activeList
        .filter(({ info, locations }) => filterCampaignDataFunc(info, locations))
        .sort((a, b) => a.priority - b.priority);
      dispatch(updateAppBannerData(filteredData));
    },
    [checkPopupExistTime, dispatch],
  );

  const initBannerHistoryMap = useCallback((data: AppBannerData[]) => {
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
    const result = { ...newData, ...bannerHistoryMap };
    dispatch(updateBannerHistoryData(result));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAppBannerData = useCallback(
    (data: AppBannerData[]) => {
      getFilteredAppBannerByTimeAndPlatform(data);
      initBannerHistoryMap(data);
    },
    [getFilteredAppBannerByTimeAndPlatform, initBannerHistoryMap],
  );
  const updateBannerHistoryMap = useCallback(
    (ids: string[]) => {
      const result: Record<string, PopupHistoryData> = {};
      for (const key of ids) {
        result[key] = { lastShowTime: Date.now(), showTimes: bannerHistoryMap[key].showTimes + 1 };
      }

      dispatch(
        updateBannerHistoryData({
          ...bannerHistoryMap,
          ...result,
        }),
      );
    },
    [bannerHistoryMap, dispatch],
  );

  const filteredAppBannerMap = useMemo(() => {
    return appBannerData?.filter(item => {
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
              const comparisonValue = getOutputValuesFromString(_item.value?.toString(), decimals);

              return checkComparison(_item.comparison, value, comparisonValue);
            });
          });

          isPassValidation.push(dataFilterByBalanceCondition.some(d => d));
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

          isPassValidation.push(dataFilterByEarningCondition.some(i => i));
        }

        if (item.conditions['condition-nft'] && item.conditions['condition-nft'].length) {
          const dataFilterByNftCondition = nftCollections.find(nft =>
            item.conditions['condition-nft'].find(
              cond => cond.chain === nft.chain || cond.collection_id === nft.collectionId,
            ),
          );

          isPassValidation.push(!!dataFilterByNftCondition);
        }

        if (item.conditions['condition-crowdloan'] && item.conditions['condition-crowdloan'].length) {
          const dataFilterByCrowdloaCondition = crowdloanList.find(c =>
            item.conditions['condition-crowdloan'].find(cond => cond.chain === c.chainSlug),
          );

          isPassValidation.push(!!dataFilterByCrowdloaCondition);
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
          return isPassValidation.some(_i => _i);
        } else {
          return true;
        }
      } else {
        return true;
      }
    });
  }, [
    appBannerData,
    assetRegistry,
    balanceMap,
    chainInfoMap,
    crowdloanList,
    hasMoneyArr,
    nftCollections,
    yieldPositionList,
  ]);

  const appBannerMap = useMemo(() => {
    if (filteredAppBannerMap) {
      const result: Record<string, AppBannerData[]> = filteredAppBannerMap.reduce((r, a) => {
        r[a.position] = r[a.position] || [];
        r[a.position].push(a);
        return r;
      }, Object.create(null));

      return result;
    } else {
      return {};
    }
  }, [filteredAppBannerMap]);

  return {
    setAppBannerData,
    updateBannerHistoryMap,
    appBannerMap,
  };
};
