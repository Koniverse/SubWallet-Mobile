import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ListRenderItemInfo } from 'react-native';
import { NetworkAndTokenToggleItem } from 'components/NetworkAndTokenToggleItem';
import i18n from 'utils/i18n/i18n';
import { FlatListScreen } from 'components/FlatListScreen';
import useChainInfoWithState, { ChainInfoWithState } from 'hooks/chain/useChainInfoWithState';
import { updateChainActiveState } from 'messaging/index';
import { FlatListScreenPaddingTop, FontSemiBold } from 'styles/sharedStyles';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updateShowZeroBalanceState } from 'stores/utils';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass, Wallet } from 'phosphor-react-native';
import { ToggleItem } from 'components/ToggleItem';
import { SwFullSizeModal, Typography } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

interface Props {
  modalVisible: boolean;
  setVisible: (arg: boolean) => void;
}

let chainKeys: Array<string> | undefined;

let cachePendingChainMap: Record<string, boolean> = {};

const searchFunction = (items: ChainInfoWithState[], searchString: string) => {
  return items.filter(network => network.name.toLowerCase().includes(searchString.toLowerCase()));
};

const processChainMap = (
  chainInfoMap: Record<string, ChainInfoWithState>,
  pendingKeys = Object.keys(cachePendingChainMap),
  updateKeys = false,
): ChainInfoWithState[] => {
  if (!chainKeys || updateKeys) {
    chainKeys = Object.keys(chainInfoMap)
      .filter(key => Object.keys(chainInfoMap[key].providers).length > 0)
      .sort((a, b) => {
        const aActive = pendingKeys.includes(a) ? cachePendingChainMap[a] : chainInfoMap[a].active;
        const bActive = pendingKeys.includes(b) ? cachePendingChainMap[b] : chainInfoMap[b].active;

        if (aActive === bActive) {
          return 0;
        } else if (aActive) {
          return -1;
        } else {
          return 1;
        }
      });
  }

  return chainKeys.map(key => chainInfoMap[key]);
};

export const CustomizationModal = ({ modalVisible, setVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const isShowZeroBalance = useSelector((state: RootState) => state.settings.isShowZeroBalance);
  const chainInfoMap = useChainInfoWithState();
  const [pendingChainMap, setPendingChainMap] = useState<Record<string, boolean>>(cachePendingChainMap);
  const [currentChainList, setCurrentChainList] = useState(processChainMap(chainInfoMap));
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);

  const onCancel = () => modalBaseV2Ref?.current?.close();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (modalVisible) {
      timeout = setTimeout(() => setIsLoadingData(false), 100);
    } else {
      timeout = setTimeout(() => setIsLoadingData(true), 100);
    }
    return () => clearTimeout(timeout);
  }, [modalVisible]);
  useEffect(() => {
    setPendingChainMap(prevPendingChainMap => {
      Object.entries(prevPendingChainMap).forEach(([key, val]) => {
        if (chainInfoMap[key].active === val) {
          // @ts-ignore
          delete prevPendingChainMap[key];
        }
      });

      return { ...prevPendingChainMap };
    });
  }, [chainInfoMap]);

  useEffect(() => {
    setCurrentChainList(processChainMap(chainInfoMap, Object.keys(pendingChainMap)));
  }, [chainInfoMap, pendingChainMap]);

  useEffect(() => {
    cachePendingChainMap = pendingChainMap;
  }, [pendingChainMap]);

  const onToggleItem = (item: ChainInfoWithState) => {
    setPendingChainMap({ ...pendingChainMap, [item.slug]: !item.active });
    const reject = () => {
      console.warn('Toggle network request failed!');
      // @ts-ignore
      delete pendingNetworkMap[item.key];
      setPendingChainMap({ ...pendingChainMap });
    };

    updateChainActiveState(item.slug, !item.active)
      .then(result => {
        if (!result) {
          reject();
        }
      })
      .catch(reject);
  };

  const renderItem = ({ item }: ListRenderItemInfo<ChainInfoWithState>) => {
    return (
      <NetworkAndTokenToggleItem
        isDisableSwitching={
          item.slug === 'polkadot' || item.slug === 'kusama' || Object.keys(pendingChainMap).includes(item.slug)
        }
        key={`${item.slug}-${item.name}`}
        itemName={item.name}
        itemKey={item.slug}
        connectionStatus={item.connectionStatus}
        style={{ paddingRight: theme.sizeXS }}
        // @ts-ignore
        isEnabled={
          Object.keys(pendingChainMap).includes(item.slug) ? pendingChainMap[item.slug] : chainInfoMap[item.slug].active
        }
        onValueChange={() => onToggleItem(item)}
      />
    );
  };

  const renderListEmptyComponent = () => {
    return (
      <EmptyList
        icon={MagnifyingGlass}
        title={i18n.emptyScreen.networkSettingsTitle}
        message={i18n.emptyScreen.networkSettingsMessage}
      />
    );
  };

  const onChangeZeroBalance = useCallback(() => {
    updateShowZeroBalanceState(!isShowZeroBalance);
  }, [isShowZeroBalance]);

  const beforeList = useMemo(() => {
    return (
      <>
        <Typography.Text
          style={{
            fontSize: theme.fontSizeSM,
            lineHeight: theme.fontSizeSM * theme.lineHeightSM,
            color: theme.colorTextLight3,
            ...FontSemiBold,
            paddingLeft: 16,
            paddingTop: 8,
            paddingBottom: 8,
          }}>
          {i18n.customization.balance}
        </Typography.Text>
        <ToggleItem
          backgroundIcon={Wallet}
          backgroundIconColor={theme['green-7']}
          style={{ marginHorizontal: 16 }}
          label={i18n.customization.showZeroBalance}
          isEnabled={isShowZeroBalance}
          onValueChange={onChangeZeroBalance}
        />
        <Typography.Text
          style={{
            fontSize: theme.fontSizeSM,
            lineHeight: theme.fontSizeSM * theme.lineHeightSM,
            color: theme.colorTextLight3,
            ...FontSemiBold,
            paddingLeft: 16,
          }}>
          {i18n.customization.networks}
        </Typography.Text>
      </>
    );
  }, [isShowZeroBalance, onChangeZeroBalance, theme]);

  return (
    <SwFullSizeModal
      modalBaseV2Ref={modalBaseV2Ref}
      isUseModalV2
      setVisible={setVisible}
      modalVisible={modalVisible}
      onBackButtonPress={onCancel}>
      <FlatListScreen
        beforeListItem={beforeList}
        items={currentChainList}
        isShowFilterBtn={false}
        style={FlatListScreenPaddingTop}
        title={i18n.header.customizeAssetDisplay}
        searchFunction={searchFunction}
        renderItem={renderItem}
        onPressBack={onCancel}
        renderListEmptyComponent={renderListEmptyComponent}
        isLoadingData={isLoadingData}
        isShowListWrapper
        placeholder={i18n.placeholder.networkName}
      />
    </SwFullSizeModal>
  );
};
