import { NominationInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { ValidatorDataType } from 'types/earning';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, store } from 'stores/index';
import useFetchChainState from 'hooks/screen/useFetchChainState';
import { useGetPoolTargetList } from 'hooks/earning';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { getValidatorKey } from 'utils/transaction';
import { fetchPoolTarget } from 'messaging/index';
import { StakingValidatorItem } from 'components/common/StakingValidatorItem';
import { StakingNominationItem } from 'components/common/StakingNominationItem';
import BigN from 'bignumber.js';
import { Button, Icon } from 'components/design-system-ui';
import { EmptyValidator } from 'components/EmptyValidator';
import { Book, MagnifyingGlass } from 'phosphor-react-native';
import { FlatListScreen } from 'components/FlatListScreen';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { ValidatorSelectorDetailModal } from 'components/Modal/common/ValidatorSelectorDetailModal';
import { ChangeEarningValidatorProps } from 'routes/transaction/transactionAction';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { StyleSheet, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ChangeBittensorValidator } from 'screens/Transaction/ChangeEarningValidator/ChangeBittensorValidator';
import { ChangeValidator } from 'screens/Transaction/ChangeEarningValidator/ChangeValidator';

export const ChangeEarningValidator = ({
  route: {
    params: { chain, from, slug, displayType: displayTypeProps, nominations, readOnly, addresses, compound },
  },
}: ChangeEarningValidatorProps) => {
  console.log('from', from);
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const [viewDetailItem, setViewDetailItem] = useState<ValidatorDataType | undefined>(undefined);
  const [forceFetchValidator, setForceFetchValidator] = useState(false);
  const [isChangeValidatorModalVisible, setIsChangeValidatorModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);

  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const poolInfo = poolInfoMap[slug];
  const chainState = useFetchChainState(poolInfo?.chain || '');

  const items = useGetPoolTargetList(slug) as ValidatorDataType[];

  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const assetInfo = assetRegistry[poolInfo.metadata.inputAsset];
  const decimals = _getAssetDecimals(assetInfo);
  const symbol = _getAssetSymbol(assetInfo);

  const maxPoolMembersValue = useMemo(() => {
    if (poolInfo.type === YieldPoolType.NATIVE_STAKING) {
      return poolInfo.maxPoolMembers;
    }

    return undefined;
  }, [poolInfo]);

  const validatortList = useMemo(() => {
    if (addresses && addresses.length > 0) {
      return items
        .filter(item => addresses.includes(item.address.trim()))
        .map(item => ({
          ...item,
        }));
    }

    const itemMap = new Map(items.map(item => [item.address.trim(), item]));

    const result: ValidatorDataType[] = [];

    for (const nomination of nominations) {
      const address = nomination.validatorAddress.trim();
      const item = itemMap.get(address);

      if (item) {
        result.push({
          ...item,
        });
      } else {
        result.push({
          address,
          chain: nomination.chain,
          totalStake: '0',
          ownStake: '0',
          otherStake: '0',
          minBond: '0',
          nominatorCount: 0,
          commission: 0,
          expectedReturn: undefined,
          blocked: false,
          identity: nomination.validatorIdentity || '',
          isVerified: false,
          icon: undefined,
          isCrowded: false,
          eraRewardPoint: undefined,
          topQuartile: false,
          symbol: symbol,
          decimals: decimals,
          isMissingInfo: true,
        });
      }
    }

    return result;
  }, [items, nominations, addresses, symbol, decimals]);

  const handleValidatorLabel = useMemo(() => {
    const label = getValidatorLabel(chain);

    return label !== 'dApp' ? label.toLowerCase() : label;
  }, [chain]);

  const isBittensorChain = useMemo(() => {
    return poolInfo.chain === 'bittensor' || poolInfo.chain === 'bittensor_testnet';
  }, [poolInfo.chain]);

  const onPress = useCallback(() => {
    setIsChangeValidatorModalVisible(true);
    setStep(2);
  }, []);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyValidator
        isDataEmpty={items.length === 0}
        onClickReload={setForceFetchValidator}
        validatorTitle={handleValidatorLabel}
        icon={MagnifyingGlass}
        title={''}
      />
    );
  }, [handleValidatorLabel, items, setForceFetchValidator]);

  const expandNominations = useMemo(() => {
    if (!nominations || !items) {
      return nominations;
    }

    const validatorMap = items.reduce<Record<string, ValidatorDataType>>((acc, val) => {
      acc[reformatAddress(val.address)] = val;

      return acc;
    }, {});

    const mappedNominations = nominations.map(nomination => {
      const matched = validatorMap[reformatAddress(nomination.validatorAddress)];

      return {
        ...nomination,
        validatorIdentity: matched?.identity,
        commission: matched?.commission,
        expectedReturn: matched?.expectedReturn,
        eraRewardPoint: matched?.eraRewardPoint,
      };
    });

    // Find nomination have highest era pts
    const maxEraNomination = mappedNominations.reduce((max, current) => {
      const maxEra = max.eraRewardPoint ? new BigN(max.eraRewardPoint) : new BigN(0);
      const currentEra = current.eraRewardPoint ? new BigN(current.eraRewardPoint) : new BigN(0);

      return currentEra.isGreaterThan(maxEra) ? current : max;
    }, mappedNominations[0]);

    const remainingNominations = mappedNominations.filter(nomination => nomination !== maxEraNomination);

    // Sort nomination by apy
    const sortedRemaining = remainingNominations.sort((a, b) => {
      const aReturn = a.expectedReturn ? new BigN(a.expectedReturn) : new BigN(0);
      const bReturn = b.expectedReturn ? new BigN(b.expectedReturn) : new BigN(0);

      return bReturn.comparedTo(aReturn);
    });

    return maxEraNomination ? [maxEraNomination, ...sortedRemaining] : sortedRemaining;
  }, [items, nominations]);
  const onClickMore = useCallback((item: ValidatorDataType) => {
    return () => {
      setViewDetailItem(item);
      // activeModal(VALIDATOR_DETAIL_MODAL);
    };
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ValidatorDataType | NominationInfo>) => {
      if (displayTypeProps === 'validator') {
        const validator = item as ValidatorDataType;
        const key = getValidatorKey(validator.address, validator.identity);

        return (
          <StakingValidatorItem
            apy={validator?.expectedReturn?.toString() || '0'}
            isNominated={false}
            isSelected={false}
            key={key}
            onPressRightButton={onClickMore(validator)}
            showUnSelectedIcon={false}
            validatorInfo={validator}
          />
        );
      }

      const nomination = item as NominationInfo;
      const key = getValidatorKey(nomination.validatorAddress, nomination.validatorIdentity);

      return (
        <StakingNominationItem
          isChangeValidator={true}
          isSelectable={false}
          isSelected={false}
          key={key}
          nominationInfo={nomination}
          poolInfo={poolInfo}
        />
      );
    },
    [displayTypeProps, onClickMore, poolInfo],
  );

  const list = useMemo(
    () => (displayTypeProps === 'validator' ? validatortList : expandNominations),
    [displayTypeProps, expandNominations, validatortList],
  );

  useEffect(() => {
    let unmount = false;

    if ((!!poolInfo.chain && !!compound?.address && chainState?.active) || forceFetchValidator) {
      fetchPoolTarget({ slug })
        .then(result => {
          if (!unmount) {
            store.dispatch({ type: 'earning/updatePoolTargets', payload: result });
          }
        })
        .catch(console.error)
        .finally(() => {
          if (!unmount) {
            setForceFetchValidator(false);
          }
        });
    }

    return () => {
      unmount = true;
    };
  }, [chainState?.active, forceFetchValidator, slug, poolInfo.chain, compound?.address]);

  const onPressBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <>
      {step === 1 && (
        <>
          <FlatListScreen
            style={{ flex: 1 }}
            flatListStyle={{ paddingTop: theme.padding }}
            onPressBack={onPressBack}
            items={list}
            title={'Your validator'}
            renderItem={renderItem}
            estimatedItemSize={58}
            renderListEmptyComponent={renderEmpty}
            withSearchInput={false}
            afterListItem={
              <View style={styles.footerArea}>
                {!readOnly && (
                  <Button icon={<Icon phosphorIcon={Book} weight={'fill'} />} onPress={onPress}>
                    {'Change validators'}
                  </Button>
                )}
              </View>
            }
          />

          {viewDetailItem && (
            <ValidatorSelectorDetailModal
              detailModalVisible={detailModalVisible}
              setVisible={setDetailModalVisible}
              chain={chain}
              maxPoolMembersValue={maxPoolMembersValue}
              detailItem={viewDetailItem}
            />
          )}
        </>
      )}

      {step === 2 && !readOnly && isChangeValidatorModalVisible && (
        <>
          {isBittensorChain ? (
            <ChangeBittensorValidator
              chain={poolInfo.chain}
              disabled={false}
              from={from}
              nominations={expandNominations}
              setForceFetchValidator={setForceFetchValidator}
              slug={poolInfo.slug}
            />
          ) : (
            <ChangeValidator
              chain={poolInfo.chain}
              from={from}
              items={items}
              nominations={expandNominations}
              onCancel={onPressBack}
              setForceFetchValidator={setForceFetchValidator}
              slug={poolInfo.slug}
            />
          )}
        </>
      )}
    </>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    footerArea: {
      marginTop: theme.marginXS,
      marginBottom: theme.margin,
      paddingHorizontal: theme.padding,
    },
  });
}
