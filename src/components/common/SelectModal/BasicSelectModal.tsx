import React, { ForwardedRef, forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Button, Icon, SwModal } from 'components/design-system-ui';
import { IconProps } from 'phosphor-react-native';
import { SelectModalField } from 'components/common/SelectModal/parts/SelectModalField';
import { ScrollView, View } from 'react-native';
import { ActionSelectItem } from 'components/common/SelectModal/parts/ActionSelectItem';
import { FilterSelectItem } from 'components/common/SelectModal/parts/FilterSelectItem';
import { ActionItemType } from 'components/Modal/AccountActionSelectModal';
import { OptionType } from 'components/common/FilterModal';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

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
    disabled?: boolean;
  };
  isShowInput?: boolean;
  isShowContent?: boolean;
  children?: React.ReactNode;
  renderCustomItem?: (item: T) => JSX.Element;
  onChangeModalVisible?: () => void;
  onBackButtonPress?: () => void;
  titleTextAlign?: 'center' | 'left';
  beforeListItem?: React.ReactNode;
  isUseForceHidden?: boolean;
  level?: number;
  isUseModalV2?: boolean;
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
    onBackButtonPress,
    titleTextAlign,
    beforeListItem,
    isUseForceHidden,
    isUseModalV2 = true,
    level,
  } = selectModalProps;
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const [isOpen, setOpen] = useState<boolean>(false);
  const onCloseModal = useCallback(() => {
    if (isUseModalV2) {
      modalBaseV2Ref?.current?.close();
    } else {
      setOpen(false);
    }
  }, [isUseModalV2]);
  const onOpenModal = () => setOpen(true);
  const theme = useSubWalletTheme().swThemes;

  useImperativeHandle(
    ref,
    () => ({
      onOpenModal: onOpenModal,
      onCloseModal: onCloseModal,
      isModalOpen: isOpen,
    }),
    [isOpen, onCloseModal],
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
        <Button
          style={{
            width: '100%',
            paddingHorizontal: theme.padding,
            // ...MarginBottomForSubmitButton,
            marginTop: theme.padding,
          }}
          disabled={applyBtn?.disabled}
          icon={color => <Icon phosphorIcon={applyBtn?.icon} size={'lg'} iconColor={color} />}
          onPress={applyBtn?.onPressApplyBtn}>
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
          level={level}
          modalBaseV2Ref={modalBaseV2Ref}
          onBackButtonPress={onBackButtonPress}
          modalVisible={isOpen}
          modalTitle={title}
          titleTextAlign={titleTextAlign}
          isUseForceHidden={isUseForceHidden}
          setVisible={setOpen}
          isUseModalV2={isUseModalV2}
          onChangeModalVisible={() => {
            !isUseModalV2 && onCloseModal();
            onChangeModalVisible && onChangeModalVisible();
          }}>
          <View style={{ width: '100%' }}>
            {beforeListItem}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps={'handled'}
              style={{ width: '100%', maxHeight: 400 }}
              contentContainerStyle={{ gap: 8 }}>
              {items.map(item => (renderCustomItem ? renderCustomItem(item) : renderItem(item)))}
            </ScrollView>

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
