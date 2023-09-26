import React, { useCallback, useMemo } from 'react';
import { Button, Icon, SelectItem } from 'components/design-system-ui';
import i18n from 'utils/i18n/i18n';
import { PlusCircle, ShareNetwork } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import useFetchChainInfo from 'hooks/screen/useFetchChainInfo';
import { ModalRef } from 'types/modalRef';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';

export interface ProviderItemType {
  value: string;
  label: string;
}

interface Props {
  chainSlug: string;
  selectedValueMap: Record<string, boolean>;
  onPressBack: () => void;
  onSelectItem?: (item: ProviderItemType) => void;
  renderSelectModalBtn?: (onOpenModal: React.Dispatch<React.SetStateAction<boolean>>) => JSX.Element;
  rpcSelectorRef: React.MutableRefObject<ModalRef | undefined>;
}

export const RpcSelectorModal = ({
  chainSlug,
  selectedValueMap,
  onPressBack,
  onSelectItem,
  renderSelectModalBtn,
  rpcSelectorRef,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const chainInfo = useFetchChainInfo(chainSlug);

  const providerList = useMemo(() => {
    if (!chainInfo) {
      return [];
    }

    return Object.entries(chainInfo.providers).map(([key, provider]) => {
      return {
        value: key,
        label: provider,
      } as ProviderItemType;
    });
  }, [chainInfo]);

  const renderItem = useCallback(
    (item: { label: string; value: string }) => (
      <SelectItem
        key={item.value}
        icon={ShareNetwork}
        backgroundColor={theme.colorTextLight4}
        label={item.label}
        isSelected={selectedValueMap[item.value]}
        onPress={() => {
          onSelectItem && onSelectItem(item);
          onPressBack();
        }}
      />
    ),
    [theme.colorTextLight4, selectedValueMap, onSelectItem, onPressBack],
  );

  return (
    <BasicSelectModal
      items={providerList}
      selectedValueMap={{}}
      selectModalType={'single'}
      renderCustomItem={renderItem}
      renderSelectModalBtn={renderSelectModalBtn}
      title={i18n.header.providers}
      ref={rpcSelectorRef}
      onBackButtonPress={() => rpcSelectorRef?.current?.onCloseModal()}>
      <Button
        style={{ marginTop: theme.margin }}
        icon={<Icon phosphorIcon={PlusCircle} size={'lg'} weight={'fill'} />}
        onPress={() => {
          onPressBack();
          !!chainInfo && navigation.navigate('AddProvider', { slug: chainInfo.slug });
        }}>
        {i18n.buttonTitles.addNewProvider}
      </Button>
    </BasicSelectModal>
  );
};
