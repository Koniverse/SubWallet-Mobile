import React from 'react';
import { AssetTypeOption } from 'types/asset';
import i18n from 'utils/i18n/i18n';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import { SelectItem } from 'components/design-system-ui';
import { Coin } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ModalRef } from 'types/modalRef';

interface Props {
  items: AssetTypeOption[];
  onSelectItem: (item: AssetTypeOption) => void;
  selectedValueMap: Record<string, boolean>;
  disabled?: boolean;
  tokenTypeRef: React.MutableRefObject<ModalRef | undefined>;
  renderSelected?: () => JSX.Element;
}

export const TokenTypeSelector = ({
  items,
  selectedValueMap,
  disabled,
  onSelectItem,
  tokenTypeRef,
  renderSelected,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  return (
    <BasicSelectModal
      items={items}
      selectedValueMap={selectedValueMap}
      title={i18n.header.selectTokenType}
      selectModalType={'single'}
      onSelectItem={onSelectItem}
      renderSelected={renderSelected}
      disabled={disabled}
      onBackButtonPress={() => tokenTypeRef?.current?.onCloseModal()}
      ref={tokenTypeRef}
      isShowInput={true}
      renderCustomItem={item => (
        <SelectItem
          onPress={() => onSelectItem(item)}
          icon={Coin}
          key={item.value}
          label={item.label}
          isSelected={selectedValueMap[item.value]}
          backgroundColor={theme['orange-6']}
        />
      )}
    />
  );
};
