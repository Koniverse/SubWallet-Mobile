import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SwFullSizeModal } from 'components/design-system-ui';
import { FlatListScreen } from 'components/FlatListScreen';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { Warning } from 'components/Warning';
import i18n from 'utils/i18n/i18n';
import { NominationPoolInfo, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import useGetValidatorList, { NominationPoolDataType } from 'hooks/screen/Staking/useGetValidatorList';
import { ListRenderItemInfo, TouchableOpacity } from 'react-native';
import { StakingPoolItem } from 'components/common/StakingPoolItem';
import useGetNominatorInfo from 'hooks/screen/Staking/useGetNominatorInfo';
import { PREDEFINED_STAKING_POOL } from '@subwallet/extension-base/constants';
import { PoolSelectorField } from 'components/Field/PoolSelector';
import { PoolSelectorDetailModal } from 'components/Modal/common/PoolSelectorDetailModal';
import loading from "components/Loading";

interface Props {
  onSelectItem?: (value: string) => void;
  chain: string;
  from: string;
  poolLoading: boolean;
  selectedPool?: NominationPoolInfo;
  disabled?: boolean;
}

const searchFunction = (items: NominationPoolDataType[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();

  return items.filter(({ name }) => name?.toLowerCase().includes(lowerCaseSearchString));
};

const renderListEmptyComponent = () => {
  return (
    <Warning
      style={{ marginHorizontal: 16 }}
      title={i18n.warningTitle.warning}
      message={'No pool available'}
      isDanger={false}
    />
  );
};

export const PoolSelector = ({ chain, onSelectItem, from, poolLoading, selectedPool, disabled }: Props) => {
  const items = useGetValidatorList(chain, StakingType.POOLED) as NominationPoolDataType[];
  const [poolSelectModalVisible, setPoolSelectModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NominationPoolDataType | undefined>(undefined);
  const nominatorMetadata = useGetNominatorInfo(chain, StakingType.POOLED, from);
  const nominationPoolValueList = useMemo((): string[] => {
    return nominatorMetadata[0]?.nominations.map(item => item.validatorAddress) || [];
  }, [nominatorMetadata]);

  useEffect(() => {
    const defaultSelectedPool = nominationPoolValueList[0] || String(PREDEFINED_STAKING_POOL[chain] || '');

    onSelectItem && onSelectItem(defaultSelectedPool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nominationPoolValueList]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NominationPoolDataType>) => {
      const { address, name, id, bondedAmount, symbol, decimals } = item;

      return (
        <StakingPoolItem
          address={address}
          decimals={decimals}
          id={id}
          bondedAmount={bondedAmount}
          name={name}
          symbol={symbol}
          key={id}
          onPress={() => {
            onSelectItem && onSelectItem(item.id.toString());
            setPoolSelectModalVisible(false);
          }}
          onPressRightButton={() => {
            setSelectedItem(item);
            setDetailModalVisible(true);
          }}
        />
      );
    },
    [onSelectItem],
  );

  const isDisabled = useMemo(
    () => disabled || !!nominationPoolValueList.length || !items.length,
    [disabled, items.length, nominationPoolValueList.length],
  );

  return (
    <>
      <TouchableOpacity onPress={() => setPoolSelectModalVisible(true)} disabled={isDisabled || poolLoading}>
        <PoolSelectorField disabled={isDisabled} item={selectedPool} label={'Select pool'} loading={poolLoading} />
      </TouchableOpacity>

      <SwFullSizeModal modalVisible={poolSelectModalVisible}>
        <FlatListScreen
          autoFocus={true}
          items={items}
          style={FlatListScreenPaddingTop}
          title={'Select pool'}
          searchFunction={searchFunction}
          renderItem={renderItem}
          onPressBack={() => setPoolSelectModalVisible(false)}
          renderListEmptyComponent={renderListEmptyComponent}
          isShowFilterBtn={false}
        />

        {!!selectedItem && (
          <PoolSelectorDetailModal
            detailItem={selectedItem}
            detailModalVisible={detailModalVisible}
            onCancel={() => setPoolSelectModalVisible(false)}
          />
        )}
      </SwFullSizeModal>
    </>
  );
};
