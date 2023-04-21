import React, { useEffect, useState } from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import { Coins, Plus } from 'phosphor-react-native';
import { ListRenderItemInfo, SafeAreaView } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import useFetchCustomToken from 'hooks/screen/Setting/useFetchCustomToken';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { TokenToggleItem } from 'components/common/TokenToggleItem';
import { updateAssetSetting } from '../../messaging';
const filterFunction = (items: _ChainAsset[], searchString: string) => {
  return items.filter(item => item?.symbol.toLowerCase().includes(searchString.toLowerCase()));
};

let cachePendingAssetMap: Record<string, boolean> = {};

export const CustomTokenSetting = () => {
  const { assetItems, assetSettingMap } = useFetchCustomToken();
  const navigation = useNavigation<RootNavigationProps>();
  const [pendingAssetMap, setPendingAssetMap] = useState<Record<string, boolean>>(cachePendingAssetMap);

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
        items={assetItems}
        autoFocus={false}
        searchFunction={filterFunction}
        renderItem={renderItem}
        renderListEmptyComponent={() => <EmptyList icon={Coins} title={i18n.errorMessage.noTokenAvailable} />}
        isShowListWrapper
      />

      <SafeAreaView />
    </>
  );
};
