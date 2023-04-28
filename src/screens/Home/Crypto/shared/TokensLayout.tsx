import React, { useMemo } from 'react';
import { ListRenderItem, ListRenderItemInfo, RefreshControl, ScrollView, StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { Coins } from 'phosphor-react-native';
import { EmptyList } from 'components/EmptyList';
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
import { TokenBalanceItemType } from 'types/balance';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import LinearGradient from 'react-native-linear-gradient';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';

interface Props {
  layoutHeader: React.ReactElement;
  listActions?: React.ReactElement;
  stickyBackground?: [string, string];
  stickyNode?: React.ReactElement;
  layoutFooter?: React.ReactElement;
  items: TokenBalanceItemType[];
  renderItem: ListRenderItem<TokenBalanceItemType>;
  isRefreshing?: boolean;
  refresh?: () => void;
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

export const TokensLayout = ({
  layoutHeader,
  layoutFooter,
  listActions,
  items: tokenBalanceItems,
  renderItem,
  isRefreshing,
  refresh,
  stickyBackground,
  stickyNode,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
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
    const marginTop = interpolate(yOffset.value, [218, 220], [-60, 0], Extrapolate.CLAMP);
    return {
      opacity,
      marginTop,
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

  const refreshControlNode = useMemo(() => {
    if (!refresh) {
      return undefined;
    }

    return <RefreshControl tintColor={ColorMap.light} refreshing={!!isRefreshing} onRefresh={refresh} />;
  }, [isRefreshing, refresh]);

  const renderHeaderComponent = () => {
    return (
      <Animated.View style={headerStyles}>
        <>{layoutHeader}</>
      </Animated.View>
    );
  };

  const customRenderItem = (data: ListRenderItemInfo<TokenBalanceItemType>) => {
    if (listActions && data.item?.slug === null) {
      return <Animated.View style={stickyHeaderStyles}>{listActions}</Animated.View>;
    }

    return renderItem(data);
  };

  if (!tokenBalanceItems.length) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={flatListContentContainerStyle}
        refreshControl={refreshControlNode}>
        <>
          <View style={{ height: '100%' }} />
          <View style={emptyListWrapperStyle}>
            <EmptyList icon={Coins} title={i18n.common.emptyTokenListMessage} />
            <View style={itemWrapperAppendixStyle} />
            {layoutFooter}
          </View>
        </>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[{ paddingHorizontal: 16 }, stickyHeaderInvisibleStyles]}>{listActions}</Animated.View>

      <AnimatedFlatlist
        onScroll={onScrollHandler}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        ListHeaderComponent={renderHeaderComponent}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        data={listActions ? [{ slug: null }, ...tokenBalanceItems] : tokenBalanceItems}
        renderItem={customRenderItem}
        ListFooterComponent={layoutFooter}
        refreshControl={refreshControlNode}
      />
    </View>
  );
};
