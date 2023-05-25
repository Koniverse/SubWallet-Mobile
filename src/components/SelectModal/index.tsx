import React, { useState } from 'react';
import { SwFullSizeModal } from 'components/design-system-ui';
import { FlatListScreen } from 'components/FlatListScreen';
import { ListRenderItemInfo, StyleProp, TouchableOpacity, View } from 'react-native';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { OptionType } from 'components/common/FilterModal';
import { FieldBase, FieldBaseProps } from 'components/Field/Base';

interface Props<T> {
  items: T[];
  searchFunc: (items: T[], searchString: string) => T[];
  renderItem?: ({ item }: ListRenderItemInfo<T>) => JSX.Element;
  renderListEmptyComponent: (searchString?: string | undefined) => JSX.Element;
  title?: string;
  onPressBack?: () => void;
  isShowFilterBtn?: boolean;
  filterFunction?: ((items: T[], filters: string[]) => T[]) | undefined;
  filterOptions?: OptionType[];
  placeholder?: string;
  loading?: boolean;
  withSearchInput?: boolean;
  isShowListWrapper?: boolean;
  renderSelectModalBtn?: (onOpenModal: React.Dispatch<React.SetStateAction<boolean>>) => JSX.Element;
  renderSelected?: () => JSX.Element;
}

interface SelectModalFieldProps extends FieldBaseProps {
  outerStyle?: StyleProp<any>;
  onPressField?: () => void;
  renderSelected?: () => JSX.Element;
}

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingLeft: 12,
  paddingRight: 6,
  paddingBottom: 4,
};

const SelectModalField = ({ outerStyle, label, onPressField, renderSelected, ...fieldBase }: SelectModalFieldProps) => {
  return (
    <TouchableOpacity onPress={onPressField}>
      <FieldBase label={label} {...fieldBase} outerStyle={outerStyle}>
        <View style={[blockContentStyle, !label && { paddingTop: 12 }]}>{renderSelected && renderSelected()}</View>
      </FieldBase>
    </TouchableOpacity>
  );
};

export function SelectModal<T>(selectModalProps: Props<T>) {
  const {
    items,
    renderItem,
    searchFunc,
    renderListEmptyComponent,
    title,
    onPressBack,
    isShowFilterBtn,
    filterFunction,
    filterOptions,
    placeholder,
    loading,
    withSearchInput,
    isShowListWrapper,
    renderSelectModalBtn,
    renderSelected,
  } = selectModalProps;
  const [isOpen, setOpen] = useState<boolean>(false);

  return (
    <>
      {renderSelectModalBtn ? (
        renderSelectModalBtn(setOpen)
      ) : (
        <SelectModalField label={''} onPressField={() => setOpen(true)} renderSelected={renderSelected} />
      )}

      <SwFullSizeModal modalVisible={isOpen}>
        <FlatListScreen
          autoFocus={true}
          items={items}
          style={[FlatListScreenPaddingTop, { flex: 1 }]}
          renderItem={renderItem}
          searchFunction={searchFunc}
          renderListEmptyComponent={renderListEmptyComponent}
          title={title}
          onPressBack={onPressBack}
          isShowFilterBtn={isShowFilterBtn}
          filterFunction={filterFunction}
          filterOptions={filterOptions}
          placeholder={placeholder}
          loading={loading}
          withSearchInput={withSearchInput}
          isShowListWrapper={isShowListWrapper}
        />
      </SwFullSizeModal>
    </>
  );
}
