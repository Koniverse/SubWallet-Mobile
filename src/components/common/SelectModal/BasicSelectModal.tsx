import React, { ForwardedRef, forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Divider, Icon, SwModal } from 'components/design-system-ui';
import { IconProps } from 'phosphor-react-native';
import { SelectModalField } from 'components/common/SelectModal/parts/SelectModalField';
import { View } from 'react-native';
import { ActionSelectItem } from 'components/common/SelectModal/parts/ActionSelectItem';
import { FilterSelectItem } from 'components/common/SelectModal/parts/FilterSelectItem';
import { ActionItemType } from 'components/Modal/AccountActionSelectModal';
import { OptionType } from 'components/common/FilterModal';

interface Props<T> {
  title: string;
  items: T[];
  renderSelectModalBtn?: (onOpenModal: () => void) => JSX.Element;
  renderSelected?: () => JSX.Element;
  selectModalType?: 'single' | 'multi';
  selectModalItemType?: 'filter' | 'select';
  onSelectItem?: (item: T, isCheck?: boolean) => void;
  disabled?: boolean;
  selectedValueMap: Record<string, boolean>;
  applyBtn?: {
    label: string;
    icon: React.ElementType<IconProps>;
    onPressApplyBtn: () => void;
  };
  isShowInput?: boolean;
  isShowContent?: boolean;
  children?: React.ReactNode;
  renderCustomItem?: (item: T) => JSX.Element;
  onChangeModalVisible?: () => void;
}

function _BasicSelectModal<T>(selectModalProps: Props<T>, ref: ForwardedRef<any>) {
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
    isShowInput,
    isShowContent = true,
    children,
    renderCustomItem,
    onChangeModalVisible,
  } = selectModalProps;
  const [isOpen, setOpen] = useState<boolean>(false);
  const onCloseModal = () => setOpen(false);
  const onOpenModal = () => setOpen(true);

  useImperativeHandle(
    ref,
    () => ({
      onOpenModal: onOpenModal,
      onCloseModal: onCloseModal,
      isModalOpen: isOpen,
    }),
    [isOpen],
  );
  const renderItem = (item: T) => {
    if (selectModalItemType === 'select') {
      const selectItem = item as ActionItemType;
      return (
        <ActionSelectItem
          key={selectItem.key}
          item={item}
          onSelectItem={onSelectItem}
          selectedValueMap={selectedValueMap}
        />
      );
    } else if (selectModalItemType === 'filter') {
      const filterItem = item as OptionType;
      return (
        <FilterSelectItem
          key={filterItem.value}
          item={item}
          selectedValueMap={selectedValueMap}
          onSelectItem={onSelectItem}
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
        <Button icon={<Icon phosphorIcon={applyBtn?.icon} size={'lg'} />} onPress={applyBtn?.onPressApplyBtn}>
          {applyBtn?.label}
        </Button>
      </>
    );
  };

  return (
    <>
      {renderSelectModalBtn ? (
        renderSelectModalBtn(() => setOpen(true))
      ) : isShowInput ? (
        <SelectModalField disabled={disabled} onPressField={onOpenModal} renderSelected={renderSelected} />
      ) : (
        <></>
      )}

      {isShowContent ? (
        <SwModal
          modalVisible={isOpen}
          modalTitle={title}
          onChangeModalVisible={() => {
            onChangeModalVisible && onChangeModalVisible();
            onCloseModal();
          }}>
          <View style={{ width: '100%' }}>
            {items.map(item => (renderCustomItem ? renderCustomItem(item) : renderItem(item)))}
            {selectModalType === 'multi' && renderFooter()}
            {children}
          </View>
        </SwModal>
      ) : (
        <>{children}</>
      )}
    </>
  );
}

export const BasicSelectModal: React.ForwardRefExoticComponent<Props<any> & React.RefAttributes<any>> =
  forwardRef(_BasicSelectModal);
