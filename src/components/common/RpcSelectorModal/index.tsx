import React, { useCallback, useMemo } from 'react';
import { Button, Icon, SelectItem } from 'components/design-system-ui';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { ListRenderItemInfo, View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { PlusCircle, ShareNetwork } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import useFetchChainInfo from 'hooks/screen/useFetchChainInfo';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';

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

const searchFunction = (items: { label: string; value: string }[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(item => item.label.toLowerCase().includes(lowerCaseSearchString));
};

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
    ({ item }: ListRenderItemInfo<{ label: string; value: string }>) => (
      <View style={{ ...ContainerHorizontalPadding, marginBottom: theme.marginXS }}>
        <SelectItem
          icon={ShareNetwork}
          backgroundColor={theme.colorTextLight4}
          label={item.label}
          isSelected={selectedValueMap[item.value]}
          onPress={() => {
            onSelectItem && onSelectItem(item);
            onPressBack();
          }}
        />
      </View>
    ),
    [theme.marginXS, theme.colorTextLight4, selectedValueMap, onSelectItem, onPressBack],
  );

  return (
    <FullSizeSelectModal
      items={providerList}
      selectedValueMap={{}}
      selectModalType={'single'}
      renderCustomItem={renderItem}
      renderSelectModalBtn={renderSelectModalBtn}
      title={i18n.header.providers}
      ref={rpcSelectorRef}
      searchFunc={searchFunction}
      onBackButtonPress={() => rpcSelectorRef?.current?.onCloseModal()}
      renderAfterListItem={() => (
        <View style={{ ...ContainerHorizontalPadding, ...MarginBottomForSubmitButton, paddingTop: 16 }}>
          <Button
            icon={<Icon phosphorIcon={PlusCircle} size={'lg'} weight={'fill'} />}
            onPress={() => {
              onPressBack();
              !!chainInfo && navigation.navigate('AddProvider', { slug: chainInfo.slug });
            }}>
            {i18n.buttonTitles.addNewProvider}
          </Button>
        </View>
      )}
    />
  );
};
