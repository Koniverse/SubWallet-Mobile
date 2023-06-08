import React, { useState } from 'react';
import { Button, Divider, Icon, SwFullSizeModal } from 'components/design-system-ui';
import { FlatListScreen } from 'components/FlatListScreen';
import { ListRenderItemInfo, View } from 'react-native';
import { FlatListScreenPaddingTop, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { OptionType } from 'components/common/FilterModal';
import { AccountSelectItem } from 'components/common/SelectModal/parts/AccountSelectItem';
import { _TokenSelectItem } from 'components/common/SelectModal/parts/TokenSelectItem';
import { ChainSelectItem } from 'components/common/SelectModal/parts/ChainSelectItem';
import { IconProps } from 'phosphor-react-native';
import { SelectModalField } from 'components/common/SelectModal/parts/SelectModalField';

interface Props<T> {
  items: T[];
  searchFunc: (items: T[], searchString: string) => T[];
  renderCustomItem?: ({ item }: ListRenderItemInfo<T>) => JSX.Element;
  renderListEmptyComponent: (searchString?: string | undefined) => JSX.Element;
  title?: string;
  isShowFilterBtn?: boolean;
  filterFunction?: ((items: T[], filters: string[]) => T[]) | undefined;
  filterOptions?: OptionType[];
  placeholder?: string;
  loading?: boolean;
  withSearchInput?: boolean;
  isShowListWrapper?: boolean;
  renderSelectModalBtn?: (onOpenModal: React.Dispatch<React.SetStateAction<boolean>>) => JSX.Element;
  renderSelected?: () => JSX.Element;
  selectModalItemType?: 'account' | 'token' | 'chain';
  selectModalType?: 'single' | 'multi';
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T) => void;
  disabled?: boolean;
  applyBtn?: {
    label: string;
    icon: React.ElementType<IconProps>;
    onPressApplyBtn: () => void;
  };
}

export function SelectModal<T>(selectModalProps: Props<T>) {
  const {
    items,
    renderCustomItem,
    searchFunc,
    renderListEmptyComponent,
    title,
    isShowFilterBtn,
    filterFunction,
    filterOptions,
    placeholder,
    loading,
    withSearchInput,
    isShowListWrapper,
    renderSelectModalBtn,
    renderSelected,
    selectedValueMap,
    selectModalItemType,
    selectModalType,
    onSelectItem,
    disabled,
    applyBtn,
  } = selectModalProps;
  const [isOpen, setOpen] = useState<boolean>(false);
  const onCloseModal = () => setOpen(false);

  const renderItem = ({ item }: ListRenderItemInfo<T>) => {
    if (selectModalItemType === 'account') {
      return (
        <>
          <AccountSelectItem
            item={item}
            selectedValueMap={selectedValueMap}
            onSelectItem={onSelectItem}
            onCloseModal={() => selectModalType === 'single' && onCloseModal()}
          />
        </>
      );
    } else if (selectModalItemType === 'token') {
      return (
        <_TokenSelectItem
          item={item}
          selectedValueMap={selectedValueMap}
          onSelectItem={onSelectItem}
          onCloseModal={() => selectModalType === 'single' && onCloseModal()}
        />
      );
    } else if (selectModalItemType === 'chain') {
      return (
        <ChainSelectItem
          item={item}
          selectedValueMap={selectedValueMap}
          onSelectItem={onSelectItem}
          onCloseModal={() => selectModalType === 'single' && onCloseModal()}
        />
      );
    } else {
      return <></>;
    }
  };

  const renderFooter = () => {
    return (
      <>
        <Divider style={{ marginVertical: 16 }} color={'#1A1A1A'} />
        <View style={{ width: '100%', paddingHorizontal: 16, ...MarginBottomForSubmitButton }}>
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
        renderSelectModalBtn(setOpen)
      ) : (
        <SelectModalField disabled={disabled} onPressField={() => setOpen(true)} renderSelected={renderSelected} />
      )}

      <SwFullSizeModal modalVisible={isOpen}>
        <FlatListScreen
          autoFocus={true}
          items={items}
          style={[FlatListScreenPaddingTop, { flex: 1 }]}
          renderItem={renderCustomItem || renderItem}
          searchFunction={searchFunc}
          renderListEmptyComponent={renderListEmptyComponent}
          title={title}
          onPressBack={onCloseModal}
          isShowFilterBtn={isShowFilterBtn}
          filterFunction={filterFunction}
          filterOptions={filterOptions}
          placeholder={placeholder}
          loading={loading}
          withSearchInput={withSearchInput}
          isShowListWrapper={isShowListWrapper}
          afterListItem={selectModalType === 'multi' ? renderFooter() : undefined}
        />
      </SwFullSizeModal>
    </>
  );
}
