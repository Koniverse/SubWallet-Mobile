import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { CheckCircleIcon } from 'phosphor-react-native';
import { SubstrateProxyType } from '@subwallet/extension-base/types';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import { Icon, Typography } from 'components/design-system-ui';
import { TextField } from 'components/Field/Text';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { FontMedium } from 'styles/sharedStyles';
import { ModalRef } from 'types/modalRef';
import i18n from 'utils/i18n/i18n';

interface Props {
  chain: string;
  value?: SubstrateProxyType;
  label?: string;
  disabled?: boolean;
  onSelectItem: (value: SubstrateProxyType) => void;
}

interface SubstrateProxyTypeExtended {
  type: SubstrateProxyType;
  label: string;
  unSupportedChains?: string[];
}

// Substrate supports many proxy types; SubWallet exposes only these four.
const substrateProxyTypeItems: SubstrateProxyTypeExtended[] = [
  { type: 'Any', label: 'Any' },
  { type: 'NonTransfer', label: 'Non - transfer' },
  { type: 'Governance', label: 'Governance' },
  {
    type: 'Staking',
    label: 'Staking',
    unSupportedChains: ['astar'], // TODO: read the supported set from chain metadata instead
  },
];

export const SubstrateProxyTypeSelector = ({ chain, disabled, label, onSelectItem, value }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const selectorRef = useRef<ModalRef | null>(null);

  const filteredProxyTypes = useMemo(() => {
    if (!chain) {
      return substrateProxyTypeItems;
    }

    return substrateProxyTypeItems.filter(item => !item.unSupportedChains?.includes(chain));
  }, [chain]);

  const selectedLabel = useMemo(
    () => substrateProxyTypeItems.find(item => item.type === value)?.label || '',
    [value],
  );

  const renderItem = useCallback(
    (item: SubstrateProxyTypeExtended) => {
      const isSelected = item.type === value;

      return (
        <TouchableOpacity
          key={item.type}
          activeOpacity={1}
          style={styles.item}
          onPress={() => {
            onSelectItem(item.type);
            selectorRef.current?.onCloseModal();
          }}>
          <Typography.Text style={styles.itemLabel}>{item.label}</Typography.Text>
          {isSelected && (
            <Icon phosphorIcon={CheckCircleIcon} customSize={20} weight={'fill'} iconColor={theme.colorSuccess} />
          )}
        </TouchableOpacity>
      );
    },
    [onSelectItem, styles.item, styles.itemLabel, theme.colorSuccess, value],
  );

  return (
    <BasicSelectModal
      ref={selectorRef}
      title={i18n.substrateProxy.selectProxyType}
      titleTextAlign={'center'}
      items={filteredProxyTypes}
      selectedValueMap={value ? { [value]: true } : {}}
      isShowInput
      disabled={disabled}
      renderCustomItem={renderItem}
      renderSelected={() => (
        <View>
          <TextField
            label={label}
            text={selectedLabel}
            placeholder={i18n.substrateProxy.selectProxyType}
          />
        </View>
      )}
    />
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      paddingVertical: theme.paddingSM,
      paddingHorizontal: theme.paddingSM,
    },
    itemLabel: {
      ...FontMedium,
      color: theme.colorTextLight1,
    },
  });
}

export default SubstrateProxyTypeSelector;
