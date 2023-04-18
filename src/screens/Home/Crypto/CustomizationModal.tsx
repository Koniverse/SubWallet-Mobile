import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ListRenderItemInfo, Switch, View } from 'react-native';
import { NetworkAndTokenToggleItem } from 'components/NetworkAndTokenToggleItem';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { FlatListScreen } from 'components/FlatListScreen';
import useChainInfoWithState, { ChainInfoWithState } from 'hooks/chain/useChainInfoWithState';
import { updateChainActiveState } from 'messaging/index';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import { FlatListScreenPaddingTop, FontSemiBold } from 'styles/sharedStyles';
import { Typography } from 'components/design-system-ui';
import { ColorMap } from 'styles/color';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updateShowZeroBalanceState } from 'stores/utils';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  modalVisible: boolean;
  onCancel?: () => void;
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

export const CustomizationModal = ({ modalVisible, onCancel }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const isShowZeroBalance = useSelector((state: RootState) => state.settings.isShowZeroBalance);
  const chainInfoMap = useChainInfoWithState();
  const [pendingChainMap, setPendingChainMap] = useState<Record<string, boolean>>(cachePendingChainMap);
  const [currentChainList, setCurrentChainList] = useState(processChainMap(chainInfoMap));

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
      <Warning
        style={{ marginHorizontal: 16 }}
        title={i18n.warningTitle.warning}
        message={i18n.warningMessage.noNetworkAvailable}
        isDanger={false}
      />
    );
  };

  const onChangeZeroBalance = useCallback((checked: boolean) => {
    updateShowZeroBalanceState(checked);
  }, []);

  const beforeList = useMemo(() => {
    return (
      <View
        style={{
          flexDirection: 'row',
          paddingTop: theme.paddingSM,
          paddingBottom: theme.paddingXS,
          paddingHorizontal: theme.padding,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Typography.Text size={'md'} style={{ color: theme.colorTextLight1, ...FontSemiBold }}>
          {i18n.cryptoScreen.showZeroBalance}
        </Typography.Text>

        <Switch
          ios_backgroundColor={ColorMap.switchInactiveButtonColor}
          value={isShowZeroBalance}
          onValueChange={onChangeZeroBalance}
        />
      </View>
    );
  }, [isShowZeroBalance, onChangeZeroBalance, theme.colorTextLight1, theme.padding, theme.paddingSM, theme.paddingXS]);

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onCancel}>
      <FlatListScreen
        beforeListItem={beforeList}
        items={currentChainList}
        style={FlatListScreenPaddingTop}
        title={i18n.title.customization}
        searchFunction={searchFunction}
        renderItem={renderItem}
        onPressBack={onCancel}
        renderListEmptyComponent={renderListEmptyComponent}
        isShowListWrapper
      />
    </SubWalletFullSizeModal>
  );
};
