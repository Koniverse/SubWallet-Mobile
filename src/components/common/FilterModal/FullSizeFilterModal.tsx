import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import i18n from 'utils/i18n/i18n';
import { FadersHorizontal, MagnifyingGlass } from 'phosphor-react-native';
import { OptionType } from 'components/common/FilterModal/index';
import { Button, Icon, SwFullSizeModal } from 'components/design-system-ui';
import { ScrollView, TextInput, View } from 'react-native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Search } from 'components/Search';
import { EmptyList } from 'components/EmptyList';
import { FilterSelectItem } from 'components/common/SelectModal/parts/FilterSelectItem';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

interface Props<OptionType> {
  modalTitle?: string;
  options: OptionType[];
  optionSelectionMap: Record<string, boolean>;
  onChangeOption?: (value: string, isChecked: boolean) => void;
  onApplyFilter?: () => void;
  searchFunction?: (items: OptionType[], searchString: string) => OptionType[];
  placeholder: string;
  autoFocus?: boolean;
  applyBtnDisabled?: boolean;
  onCloseModal?: () => void;
}

function _FullSizeFilterModal(
  {
    modalTitle = i18n.header.filter,
    options,
    optionSelectionMap,
    autoFocus,
    placeholder,
    searchFunction,
    onChangeOption,
    onCloseModal: _onCloseModal,
    onApplyFilter,
    applyBtnDisabled,
  }: Props<OptionType>,
  ref: ForwardedRef<any>,
) {
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const theme = useSubWalletTheme().swThemes;
  const [searchString, setSearchString] = useState<string>('');
  const [isOpen, setOpen] = useState<boolean>(false);
  const searchRef = useRef<TextInput>(null);
  const onCloseModal = useCallback(() => {
    setSearchString('');
    modalBaseV2Ref?.current?.close();
  }, []);
  const onOpenModal = () => setOpen(true);
  useImperativeHandle(
    ref,
    () => ({
      onOpenModal: onOpenModal,
      onCloseModal: onCloseModal,
      isModalOpen: isOpen,
    }),
    [isOpen, onCloseModal],
  );

  useEffect(() => {
    setTimeout(() => {
      if (autoFocus && searchRef && searchRef.current) {
        searchRef.current.focus();
      }
    }, 200);
  }, [autoFocus, searchRef]);

  const filteredItems = useMemo(() => {
    return searchFunction ? searchFunction(options, searchString) : options;
  }, [options, searchFunction, searchString]);

  const renderItem = useCallback(
    (item: OptionType) => {
      return (
        <FilterSelectItem
          style={{ paddingHorizontal: theme.padding }}
          item={item}
          selectedValueMap={optionSelectionMap}
          onSelectItem={_item => onChangeOption && onChangeOption(_item.value, !optionSelectionMap[_item.value])}
        />
      );
    },
    [optionSelectionMap, onChangeOption, theme.padding],
  );

  return (
    <SwFullSizeModal level={2} modalBaseV2Ref={modalBaseV2Ref} isUseModalV2 modalVisible={isOpen} setVisible={setOpen}>
      <ContainerWithSubHeader
        showLeftBtn={true}
        onPressBack={_onCloseModal}
        title={modalTitle}
        titleTextAlign={'center'}
        isShowMainHeader={false}>
        <View style={{ flex: 1 }}>
          {searchFunction && (
            <Search
              autoFocus={false}
              placeholder={placeholder}
              onClearSearchString={() => setSearchString('')}
              onSearch={setSearchString}
              searchText={searchString}
              style={{ marginBottom: 8, marginTop: 8, marginHorizontal: 16 }}
              searchRef={searchRef}
            />
          )}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={'handled'}
            style={{ width: '100%' }}
            contentContainerStyle={{ gap: 8 }}>
            {filteredItems && filteredItems.length ? (
              filteredItems.map(item => renderItem(item))
            ) : (
              <View style={{ flex: 1 }}>
                <EmptyList
                  icon={MagnifyingGlass}
                  title={'No results found'}
                  message={'Change your search criteria and try again'}
                />
              </View>
            )}
          </ScrollView>
          <View
            style={{
              width: '100%',
              paddingHorizontal: theme.padding,
              ...MarginBottomForSubmitButton,
              paddingTop: theme.padding,
              flexDirection: 'row',
              gap: theme.sizeSM,
            }}>
            <Button
              block
              disabled={applyBtnDisabled}
              icon={
                <Icon
                  phosphorIcon={FadersHorizontal}
                  size={'lg'}
                  weight={'fill'}
                  iconColor={applyBtnDisabled ? theme.colorTextLight5 : theme.colorWhite}
                />
              }
              onPress={onApplyFilter}>
              {i18n.buttonTitles.applyFilter}
            </Button>
          </View>
        </View>
      </ContainerWithSubHeader>
    </SwFullSizeModal>
  );
}

export const FullSizeFilterModal: React.ForwardRefExoticComponent<Props<any> & React.RefAttributes<any>> =
  forwardRef(_FullSizeFilterModal);
