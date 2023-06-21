import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Warning } from 'components/Warning';
import i18n from 'utils/i18n/i18n';
import { NominationPoolInfo, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import useGetValidatorList, { NominationPoolDataType } from 'hooks/screen/Staking/useGetValidatorList';
import { ListRenderItemInfo } from 'react-native';
import { StakingPoolItem } from 'components/common/StakingPoolItem';
import useGetNominatorInfo from 'hooks/screen/Staking/useGetNominatorInfo';
import { PREDEFINED_STAKING_POOL } from '@subwallet/extension-base/constants';
import { PoolSelectorField } from 'components/Field/PoolSelector';
import { PoolSelectorDetailModal } from 'components/Modal/common/PoolSelectorDetailModal';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';

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
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NominationPoolDataType | undefined>(undefined);
  const nominatorMetadata = useGetNominatorInfo(chain, StakingType.POOLED, from);
  const nominationPoolValueList = useMemo((): string[] => {
    return nominatorMetadata[0]?.nominations.map(item => item.validatorAddress) || [];
  }, [nominatorMetadata]);
  const poolSelectorRef = useRef<ModalRef>();

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
            poolSelectorRef && poolSelectorRef.current?.onCloseModal();
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
      <FullSizeSelectModal
        selectedValueMap={{}}
        selectModalType={'single'}
        items={items}
        renderCustomItem={renderItem}
        searchFunc={searchFunction}
        title={i18n.header.selectPool}
        ref={poolSelectorRef}
        renderListEmptyComponent={renderListEmptyComponent}
        disabled={isDisabled}
        onBackButtonPress={() => poolSelectorRef?.current?.onCloseModal()}
        renderSelected={() => (
          <PoolSelectorField
            disabled={isDisabled}
            onPressBookBtn={() => poolSelectorRef && poolSelectorRef.current?.onOpenModal()}
            onPressLightningBtn={() => poolSelectorRef && poolSelectorRef.current?.onOpenModal()}
            item={selectedPool}
            label={i18n.inputLabel.selectPool}
            loading={poolLoading}
          />
        )}>
        {!!selectedItem && (
          <PoolSelectorDetailModal
            detailItem={selectedItem}
            detailModalVisible={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
          />
        )}
      </FullSizeSelectModal>
    </>
  );
};
