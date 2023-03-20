import React from 'react';
import {
  ListRenderItem,
  ListRenderItemInfo,
  RefreshControl,
  RefreshControlProps,
  ScrollView,
  StyleProp,
  View,
} from 'react-native';
import { TokenBalanceItemType } from 'types/ui-types';
import { ColorMap } from 'styles/color';
import { LeftIconButton } from 'components/LeftIconButton';
import { Coins, SlidersHorizontal } from 'phosphor-react-native';
import { EmptyList } from 'components/EmptyList';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { itemWrapperAppendixStyle } from 'screens/Home/Crypto/layers/shared';
import { AnimatedFlatlist } from 'components/design-system-ui';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  renderTabContainerHeader: () => JSX.Element;
  items: TokenBalanceItemType[];
  renderItem: ListRenderItem<TokenBalanceItemType>;
  renderActions: () => JSX.Element;
  isRefresh: boolean;
  refresh: (tabId: string) => void;
  refreshTabId: string;
  isEmptyList?: boolean;
}

const flatListContentContainerStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark,
  flexGrow: 1,
  justifyContent: 'center',
  position: 'relative',
};

const emptyListWrapperStyle: StyleProp<any> = {
  position: 'absolute',
  marginVertical: 'auto',
  alignItems: 'center',
  left: 0,
  right: 0,
  paddingTop: 48,
  backgroundColor: ColorMap.dark1,
};

export const TokensTab = ({
  renderTabContainerHeader,
  items: tokenBalanceItems,
  renderItem,
  renderActions,
  isRefresh,
  refresh,
  refreshTabId,
  isEmptyList,
}: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const yOffset = useSharedValue(0);
  const isAnimating = useSharedValue(0);

  const headerStyles = useAnimatedStyle(() => {
    const translateY = interpolate(yOffset.value, [0, 200], [0, -10], Extrapolate.CLAMP);
    const opacity = interpolate(yOffset.value, [0, 200], [1, 0], Extrapolate.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  }, []);
  const stickyHeaderStyles = useAnimatedStyle(() => {
    const opacity = interpolate(yOffset.value, [210, 218], [1, 0], Extrapolate.CLAMP);
    const translateY = interpolate(yOffset.value, [210, 218], [0, -40], Extrapolate.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  }, []);
  const stickyHeaderInvisibleStyles = useAnimatedStyle(() => {
    const opacity = interpolate(yOffset.value, [218, 220], [0, 1], Extrapolate.CLAMP);
    return {
      opacity,
    };
  }, []);

  const onScrollHandler = useAnimatedScrollHandler(
    {
      onScroll: e => {
        const y = e.contentOffset.y;
        if (yOffset.value < y && y < 40 && isAnimating.value === 0) {
          isAnimating.value = 1;
          yOffset.value = withTiming(40, undefined, () => (isAnimating.value = 0));
        } else if (yOffset.value > y && y < 40 && isAnimating.value === 0) {
          isAnimating.value = 1;
          yOffset.value = withTiming(0, undefined, () => (isAnimating.value = 0));
        } else if (y >= 40 && isAnimating.value === 0) {
          yOffset.value = y;
        }
      },
    },
    [],
  );

  const renderFooterComponent = () => {
    return (
      <View style={{ width: '100%', alignItems: 'center', paddingVertical: 16 }}>
        <LeftIconButton
          icon={SlidersHorizontal}
          title={i18n.common.manageTokenList}
          onPress={() => navigation.navigate('CustomTokenSetting')}
        />
      </View>
    );
  };

  const renderRefreshControl = ():
    | React.ReactElement<RefreshControlProps, string | React.JSXElementConstructor<any>>
    | undefined => {
    return (
      <RefreshControl
        style={{ opacity: refreshTabId === 'one' ? 1 : 0 }}
        tintColor={ColorMap.light}
        refreshing={isRefresh}
        onRefresh={() => refresh('one')}
      />
    );
  };

  if (isEmptyList) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={flatListContentContainerStyle}
        refreshControl={renderRefreshControl()}>
        <>
          <View style={{ height: '100%' }} />
          <View style={emptyListWrapperStyle}>
            <EmptyList icon={Coins} title={i18n.common.emptyTokenListMessage} />
            <View style={itemWrapperAppendixStyle} />
            {renderFooterComponent()}
          </View>
        </>
      </ScrollView>
    );
  }

  const renderHeaderComponent = () => {
    return (
      <Animated.View style={headerStyles}>
        <>{renderTabContainerHeader()}</>
      </Animated.View>
    );
  };

  const customRenderItem = (data: ListRenderItemInfo<TokenBalanceItemType>) => {
    if (data.item?.id === null) {
      return <Animated.View style={stickyHeaderStyles}>{renderActions()}</Animated.View>;
    }

    return renderItem(data);
  };

  return (
    <>
      <Animated.View style={[{ paddingHorizontal: 16 }, stickyHeaderInvisibleStyles]}>{renderActions()}</Animated.View>
      <AnimatedFlatlist
        onScroll={onScrollHandler}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        ListHeaderComponent={renderHeaderComponent}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        data={[{ id: null }, ...tokenBalanceItems]}
        renderItem={customRenderItem}
        ListFooterComponent={renderFooterComponent}
        refreshControl={renderRefreshControl()}
      />
    </>
  );
};
