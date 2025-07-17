import React, { ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Icon, SwFullSizeModal } from 'components/design-system-ui';
import { FlatListScreen, RightIconOpt } from 'components/FlatListScreen';
import { Keyboard, Platform, View, ViewStyle } from 'react-native';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { OptionType } from 'components/common/FilterModal';
import { AccountSelectItem } from 'components/common/SelectModal/parts/AccountSelectItem';
import { _TokenSelectItem } from 'components/common/SelectModal/parts/TokenSelectItem';
import { ChainSelectItem } from 'components/common/SelectModal/parts/ChainSelectItem';
import { IconProps, MagnifyingGlass } from 'phosphor-react-native';
import { SelectModalField } from 'components/common/SelectModal/parts/SelectModalField';
import { EmptyList } from 'components/EmptyList';
import i18n from 'utils/i18n/i18n';
import { TokenItemType } from 'components/Modal/common/TokenSelector';
import { ChainInfo } from 'types/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { SortFunctionInterface } from 'types/ui-types';
import { SectionItem } from 'components/LazySectionList';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { AccountAddressItemExtraType } from 'components/Modal/common/AccountSelector';
import { AccountProxyItem } from 'screens/Account/AccountsScreen';
import { AccountProxySelectItem } from 'components/common/SelectModal/parts/AccountProxySelectItem';

interface Props<T> {
  items: T[];
  searchFunc?: (items: T[], searchString: string) => T[];
  renderCustomItem?: ({ item }: ListRenderItemInfo<T>) => JSX.Element;
  renderListEmptyComponent?: (searchString?: string | undefined) => JSX.Element;
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
  selectModalItemType?: 'account' | 'token' | 'chain' | 'account-chain-address' | 'account-proxy';
  selectModalType?: 'single' | 'multi';
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T) => void;
  disabled?: boolean;
  applyBtn?: {
    label: string;
    icon: React.ElementType<IconProps>;
    onPressApplyBtn: () => void;
    applyBtnDisabled?: boolean;
  };
  customBtn?: {
    label?: string;
    icon: React.ElementType<IconProps>;
    onPressCustomBtn: () => void;
    customBtnDisabled?: boolean;
  };
  closeModalAfterSelect?: boolean;
  children?: React.ReactNode;
  isShowContent?: boolean;
  isShowInput?: boolean;
  defaultValue?: string;
  acceptDefaultValue?: boolean;
  renderAfterListItem?: () => JSX.Element;
  onBackButtonPress?: () => void;
  onCloseModal?: () => void;
  onModalOpened?: () => void;
  rightIconOption?: RightIconOpt;
  level?: number;
  grouping?: {
    renderSectionHeader: (item: string, itemLength?: number) => React.ReactElement | null;
    groupBy: (item: T) => string;
    sortSection?: SortFunctionInterface<SectionItem<T>>;
  };
  showAccountSignModeIcon?: boolean;
  estimatedItemSize?: number;
  extraData?: any;
  keyExtractor?: (item: T, index: number) => string;
  flatListStyle?: ViewStyle;
  showBalance?: boolean;
  filterModalSearchFunc?: (items: OptionType[], searchString: string) => OptionType[];
  isFilterFullSize?: boolean;
}
const LOADING_TIMEOUT = Platform.OS === 'ios' ? 20 : 100;

function _SelectModal<T>(selectModalProps: Props<T>, ref: ForwardedRef<any>) {
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
    customBtn,
    closeModalAfterSelect = true,
    children,
    isShowContent = true,
    isShowInput = true,
    defaultValue,
    acceptDefaultValue,
    renderAfterListItem,
    onBackButtonPress,
    onCloseModal: _onCloseModal,
    onModalOpened,
    rightIconOption,
    level,
    grouping,
    showAccountSignModeIcon,
    estimatedItemSize,
    extraData,
    keyExtractor,
    flatListStyle,
    showBalance = true,
    filterModalSearchFunc,
    isFilterFullSize,
  } = selectModalProps;
  const [isOpen, setOpen] = useState<boolean>(false);
  const [isLoadingData, setLoadingData] = useState<boolean>(true);
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const onCloseModal = useCallback(() => {
    setTimeout(() => setLoadingData(true), LOADING_TIMEOUT);
    setOpen(false);
    _onCloseModal && _onCloseModal();
  }, [_onCloseModal]);
  const defaultItem = items[0];

  const theme = useSubWalletTheme().swThemes;

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => setLoadingData(false), LOADING_TIMEOUT);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    if (acceptDefaultValue) {
      if (!defaultValue) {
        defaultItem && onSelectItem && onSelectItem(defaultItem);
      } else {
        let existed;
        if (selectModalItemType === 'token') {
          const tokenItems = items as TokenItemType[];
          existed = tokenItems.find(item => item.slug === defaultValue);
        } else if (selectModalItemType === 'account') {
          const accountItems = items as AccountAddressItemExtraType[];
          existed = accountItems.find(item => item.address === defaultValue);
        } else if (selectModalItemType === 'account-proxy') {
          const accountItems = items as AccountProxyItem[];
          existed = accountItems.find(item => item.id === defaultValue);
        } else {
          const chainItems = items as ChainInfo[];
          existed = chainItems.find(item => item.slug === defaultValue);
        }

        if (!existed) {
          defaultItem && onSelectItem && onSelectItem(defaultItem);
        } else {
          onSelectItem && onSelectItem(existed as T);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultItem, defaultValue]);

  const _onSelectItem = useCallback(
    (_item: T) => {
      selectModalType === 'single' && Keyboard.dismiss();
      // setTimeout(() => onSelectItem && onSelectItem(_item), 50);
      onSelectItem && onSelectItem(_item);
    },
    [onSelectItem, selectModalType],
  );

  useImperativeHandle(
    ref,
    () => ({
      onOpenModal: () => {
        setOpen(true);
        !!onModalOpened && onModalOpened();
      },
      onCloseModal: onCloseModal,
      closeModal: () => {
        setTimeout(() => setLoadingData(true), LOADING_TIMEOUT);
        setOpen(false);
      },
      isModalOpen: isOpen,
    }),
    [isOpen, onCloseModal, onModalOpened],
  );

  const renderItem = ({ item }: ListRenderItemInfo<T>) => {
    if (selectModalItemType === 'account') {
      return (
        <>
          <AccountSelectItem
            item={item}
            selectedValueMap={selectedValueMap}
            onSelectItem={_onSelectItem}
            showAccountSignModeIcon={showAccountSignModeIcon}
            onCloseModal={() => closeModalAfterSelect && modalBaseV2Ref?.current?.close()}
          />
        </>
      );
    } else if (selectModalItemType === 'account-proxy') {
      return (
        <>
          <AccountProxySelectItem
            item={item}
            selectedValueMap={selectedValueMap}
            onSelectItem={_onSelectItem}
            showAccountSignModeIcon={showAccountSignModeIcon}
            onCloseModal={() => closeModalAfterSelect && modalBaseV2Ref?.current?.close()}
          />
        </>
      );
    } else if (selectModalItemType === 'token') {
      return (
        <_TokenSelectItem
          item={item}
          selectedValueMap={selectedValueMap}
          onSelectItem={_onSelectItem}
          onCloseModal={() => closeModalAfterSelect && modalBaseV2Ref?.current?.close()}
          showBalance={showBalance}
        />
      );
    } else if (selectModalItemType === 'chain') {
      return (
        <ChainSelectItem
          item={item}
          selectedValueMap={selectedValueMap}
          onSelectItem={_onSelectItem}
          onCloseModal={() => closeModalAfterSelect && modalBaseV2Ref?.current?.close()}
        />
      );
    } else {
      return <></>;
    }
  };

  const _renderListEmptyComponent = () => {
    return (
      <EmptyList
        icon={MagnifyingGlass}
        title={i18n.emptyScreen.selectorEmptyTitle}
        message={i18n.emptyScreen.selectorEmptyMessage}
      />
    );
  };

  const renderFooter = () => {
    return (
      <>
        <View
          style={{
            width: '100%',
            paddingHorizontal: theme.padding,
            ...MarginBottomForSubmitButton,
            paddingTop: theme.padding,
            flexDirection: 'row',
            gap: theme.sizeSM,
          }}>
          {customBtn && (
            <Button
              disabled={customBtn?.customBtnDisabled}
              type={'secondary'}
              icon={
                <Icon
                  phosphorIcon={customBtn?.icon}
                  size={'lg'}
                  iconColor={customBtn?.customBtnDisabled ? theme.colorTextLight5 : theme.colorWhite}
                />
              }
              onPress={customBtn?.onPressCustomBtn}
            />
          )}
          <Button
            block
            disabled={applyBtn?.applyBtnDisabled}
            icon={
              <Icon
                phosphorIcon={applyBtn?.icon}
                size={'lg'}
                weight={'fill'}
                iconColor={applyBtn?.applyBtnDisabled ? theme.colorTextLight5 : theme.colorWhite}
              />
            }
            onPress={applyBtn?.onPressApplyBtn}>
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
      ) : isShowInput ? (
        <SelectModalField disabled={disabled} onPressField={() => setOpen(true)} renderSelected={renderSelected} />
      ) : (
        <></>
      )}

      {isShowContent ? (
        <SwFullSizeModal
          level={level}
          modalBaseV2Ref={modalBaseV2Ref}
          isUseModalV2
          modalVisible={isOpen}
          setVisible={setOpen}
          onBackButtonPress={onBackButtonPress}>
          <>
            {isOpen && (
              <FlatListScreen
                autoFocus={true}
                items={items}
                style={{ flex: 1 }}
                flatListStyle={flatListStyle}
                renderItem={renderCustomItem || renderItem}
                searchFunction={searchFunc}
                renderListEmptyComponent={renderListEmptyComponent || _renderListEmptyComponent}
                title={title}
                onPressBack={onCloseModal}
                isLoadingData={isLoadingData}
                isShowFilterBtn={isShowFilterBtn}
                filterFunction={filterFunction}
                filterOptions={filterOptions}
                placeholder={placeholder}
                loading={loading}
                withSearchInput={withSearchInput}
                isShowListWrapper={isShowListWrapper}
                rightIconOption={rightIconOption}
                grouping={grouping}
                removeClippedSubviews={true}
                afterListItem={
                  selectModalType === 'multi' ? renderFooter() : renderAfterListItem ? renderAfterListItem() : undefined
                }
                estimatedItemSize={estimatedItemSize || 80}
                searchMarginBottom={grouping ? theme.sizeXS : undefined}
                extraData={extraData}
                keyExtractor={keyExtractor}
                filterModalSearchFunc={filterModalSearchFunc}
                isFilterFullSize={isFilterFullSize}
              />
            )}
          </>

          {children}
        </SwFullSizeModal>
      ) : (
        <>{children}</>
      )}
    </>
  );
}

export const FullSizeSelectModal: React.ForwardRefExoticComponent<Props<any> & React.RefAttributes<any>> =
  forwardRef(_SelectModal);
