import React, { useState } from 'react';
import { Button, Divider, Icon, SwModal } from 'components/design-system-ui';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { IconProps } from 'phosphor-react-native';
import { SelectModalField } from 'components/common/SelectModal/parts/SelectModalField';
import { View } from 'react-native';
import { ActionSelectItem } from 'components/common/SelectModal/parts/ActionSelectItem';
import { FilterSelectItem } from 'components/common/SelectModal/parts/FilterSelectItem';

interface Props<T> {
  title: string;
  items: T[];
  renderSelectModalBtn?: (onOpenModal: () => void) => JSX.Element;
  renderSelected?: () => JSX.Element;
  selectModalType?: 'single' | 'multi';
  selectModalItemType?: 'filter' | 'select';
  onSelectItem?: (item: T) => void;
  disabled?: boolean;
  selectedValueMap: Record<string, boolean>;
  applyBtn?: {
    label: string;
    icon: React.ElementType<IconProps>;
    onPressApplyBtn: () => void;
  };
}

export function BasicSelectModal<T>(selectModalProps: Props<T>) {
  const {
    title,
    items,
    renderSelectModalBtn,
    renderSelected,
    selectModalType,
    onSelectItem,
    disabled,
    selectModalItemType,
    applyBtn,
    selectedValueMap,
  } = selectModalProps;
  const [isOpen, setOpen] = useState<boolean>(false);
  const onCloseModal = () => setOpen(false);
  const onOpenModal = () => setOpen(true);
  const renderItem = (item: T) => {
    if (selectModalItemType === 'select') {
      return (
        <ActionSelectItem
          item={item}
          onSelectItem={onSelectItem}
          selectedValueMap={selectedValueMap}
          onCloseModal={onCloseModal}
        />
      );
    } else if (selectModalItemType === 'filter') {
      return (
        <FilterSelectItem
          item={item}
          selectedValueMap={selectedValueMap}
          onSelectItem={onSelectItem}
          onCloseModal={onCloseModal}
        />
      );
    } else {
      return <></>;
    }
  };

  const renderFooter = () => {
    return (
      <>
        <Divider style={{ paddingTop: 4, paddingBottom: 16 }} color={'#1A1A1A'} />
        <View style={{ width: '100%', ...MarginBottomForSubmitButton }}>
          <Button icon={<Icon phosphorIcon={applyBtn?.icon} size={'lg'} />} onPress={applyBtn?.onPressApplyBtn}>
            {applyBtn?.label}
          </Button>
        </View>
      </>
    );
  };

  return (
    <>
      {renderSelectModalBtn ? (
        renderSelectModalBtn(() => setOpen(true))
      ) : (
        <SelectModalField disabled={disabled} onPressField={onOpenModal} renderSelected={renderSelected} />
      )}

      <SwModal modalVisible={isOpen} modalTitle={title} onChangeModalVisible={onCloseModal}>
        <>
          {items.map(item => renderItem(item))}
          {selectModalType === 'multi' && renderFooter()}
        </>
      </SwModal>
    </>
  );
}
