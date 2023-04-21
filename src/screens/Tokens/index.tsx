import React, { useEffect, useState } from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import { Coins, Plus } from 'phosphor-react-native';
import { ListRenderItemInfo, SafeAreaView, View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { SubmitButton } from 'components/SubmitButton';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import useFetchCustomToken from 'hooks/screen/Setting/useFetchCustomToken';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { TokenToggleItem } from 'components/common/TokenToggleItem';
import { updateAssetSetting } from '../../messaging';
import { AssetSetting } from '@subwallet/extension-base/background/KoniTypes';
import assetRegistry from "stores/feature/common/AssetRegistry";

const filterFunction = (items: _ChainAsset[], searchString: string) => {
  return items.filter(
    item =>
      item.name?.toLowerCase().includes(searchString.toLowerCase()) ||
      item.symbol?.toLowerCase().includes(searchString.toLowerCase()),
  );
};

let assetKeys: Array<string> | undefined;

let cachePendingAssetMap: Record<string, boolean> = {};

const processAssetMap = (
  assetMap: Record<string, _ChainAsset>,
  assetSettingMap: Record<string, AssetSetting>,
  pendingKeys = Object.keys(cachePendingAssetMap),
  updateKeys = false,
): _ChainAsset[] => {
  if (!assetKeys || updateKeys) {
    assetKeys = Object.keys(assetMap).sort((a, b) => {
      const aVisible = pendingKeys.includes(a) ? cachePendingAssetMap[a] : assetSettingMap[a]?.visible || false;
      const bVisible = pendingKeys.includes(b) ? cachePendingAssetMap[b] : assetSettingMap[b]?.visible || false;

      if (aVisible === bVisible) {
        return 0;
      } else if (aVisible) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  return assetKeys.map(key => assetMap[key]);
};

export const CustomTokenSetting = () => {
  const { assetItems, assetSettingMap, assetRegistry } = useFetchCustomToken();
  const navigation = useNavigation<RootNavigationProps>();
  const [pendingAssetMap, setPendingAssetMap] = useState<Record<string, boolean>>(cachePendingAssetMap);
  const [currentAssetList, setCurrentAssetList] = useState(processAssetMap(assetRegistry, assetSettingMap));

  useEffect(() => {
    setPendingAssetMap(prePendingAssetMap => {
      Object.entries(prePendingAssetMap).forEach(([key, val]) => {
        if (assetSettingMap[key].visible === val) {
          delete prePendingAssetMap[key];
        }
      });

      return { ...prePendingAssetMap };
    });
  }, [assetSettingMap]);

  useEffect(() => {
    setCurrentAssetList(processAssetMap(assetRegistry, assetSettingMap, Object.keys(pendingAssetMap)));
  }, [assetRegistry, assetSettingMap, pendingAssetMap]);

  useEffect(() => {
    cachePendingAssetMap = pendingAssetMap;
  }, [pendingAssetMap]);

  const onToggleItem = (item: _ChainAsset) => {
    setPendingAssetMap({ ...pendingAssetMap, [item.slug]: !assetSettingMap[item.slug].visible });
    const reject = () => {
      console.warn('Toggle token request failed!');
      // @ts-ignore
      delete pendingassetMap[item.key];
      setPendingAssetMap({ ...pendingAssetMap });
    };

    updateAssetSetting({
      tokenSlug: item.slug,
      assetSetting: {
        visible: !assetSettingMap[item.slug].visible,
      },
    })
      .then(result => {
        if (!result) {
          reject();
        }
      })
      .catch(reject);
  };

  const renderItem = ({ item }: ListRenderItemInfo<_ChainAsset>) => {
    return (
      <TokenToggleItem
        item={item}
        onPress={() =>
          navigation.navigate('ConfigureToken', {
            tokenDetail: JSON.stringify(item),
          })
        }
        isEnabled={
          Object.keys(pendingAssetMap).includes(item.slug)
            ? pendingAssetMap[item.slug]
            : assetSettingMap[item.slug]?.visible || false
        }
        onValueChange={() => onToggleItem(item)}
        isDisableSwitching={Object.keys(pendingAssetMap).includes(item.slug)}
      />
    );
  };

  return (
    <>
      <FlatListScreen
        rightIconOption={{
          icon: Plus,
          onPress: () => navigation.navigate('ImportToken'),
        }}
        title={i18n.settings.tokens}
        items={currentAssetList}
        autoFocus={false}
        searchFunction={filterFunction}
        renderItem={renderItem}
        renderListEmptyComponent={() => <EmptyList icon={Coins} title={i18n.errorMessage.noTokenAvailable} />}
        // afterListItem={
        //   <View style={{ ...MarginBottomForSubmitButton, ...ContainerHorizontalPadding, paddingTop: 16 }}>
        //     <SubmitButton title={i18n.common.importToken} onPress={() => navigation.navigate('ImportToken')} />
        //   </View>
        // }
        isShowListWrapper
      />

      <SafeAreaView />
    </>
  );
};
