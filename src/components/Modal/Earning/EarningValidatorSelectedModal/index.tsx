import React, { useCallback, useMemo } from 'react';
import { SwModal } from 'components/design-system-ui';
import { NominationInfo, YieldPositionInfo } from '@subwallet/extension-base/types';
import { ValidatorDataType } from 'types/earning';
import { useGetPoolTargetList } from 'hooks/earning';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { reformatAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { getValidatorKey } from 'utils/transaction';
import { StakingValidatorItem } from 'components/common/StakingValidatorItem';
import { StakingNominationItem } from 'components/common/StakingNominationItem';
import { ScrollView, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  chain: string;
  from: string;
  slug: string;
  displayType: 'validator' | 'nomination';
  title?: string;
  nominations: NominationInfo[];
  readOnly?: boolean;
  addresses?: string[];
  compound?: YieldPositionInfo;
}

export const EarningValidatorSelectedModal = ({
  modalVisible,
  setModalVisible,
  slug,
  displayType: displayTypeProps,
  title = 'Your validators',
  nominations,
  addresses,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const poolInfo = poolInfoMap[slug];
  const assetInfo = assetRegistry[poolInfo.metadata.inputAsset];
  const decimals = _getAssetDecimals(assetInfo);
  const symbol = _getAssetSymbol(assetInfo);
  const items = useGetPoolTargetList(slug) as ValidatorDataType[];

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

  const list = useMemo(
    () => (displayTypeProps === 'validator' ? validatortList : expandNominations),
    [displayTypeProps, expandNominations, validatortList],
  );

  const renderItem = useCallback(
    (item: ValidatorDataType | NominationInfo) => {
      if (displayTypeProps === 'validator') {
        const validator = item as ValidatorDataType;
        const key = getValidatorKey(validator.address, validator.identity);

        return (
          <View style={{ marginHorizontal: -theme.padding }}>
            <StakingValidatorItem
              apy={validator?.expectedReturn?.toString() || '0'}
              isNominated={false}
              isSelected={false}
              key={key}
              isShowRightBtn={false}
              showUnSelectedIcon={false}
              validatorInfo={validator}
            />
          </View>
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
    [displayTypeProps, poolInfo, theme.padding],
  );

  return (
    <>
      <SwModal
        isUseForceHidden={false}
        modalVisible={modalVisible}
        setVisible={setModalVisible}
        onChangeModalVisible={() => setModalVisible(false)}
        modalTitle={title}
        modalStyle={{ maxHeight: 600 }}>
        <View style={{ maxHeight: 400, width: '100%' }}>
          <ScrollView>{list.map(item => renderItem(item))}</ScrollView>
        </View>
      </SwModal>
    </>
  );
};
