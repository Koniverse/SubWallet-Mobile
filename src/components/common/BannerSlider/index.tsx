import React, { useRef } from 'react';
import { Dimensions, View } from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import createStylesheet from './styles';
import PaginationItem from './PaginationItem';
import { Button, Icon } from 'components/design-system-ui';
import { X } from 'phosphor-react-native';

const { width: screenWidth } = Dimensions.get('window');
interface BannerSliderProps {
  data: string[];
  renderItem: ({ item, index }: BannerSliderItem) => React.JSX.Element;
  onCloseBanner: () => void;
}

export type BannerSliderItem = {
  item: string;
  index: number;
};
const BannerSlider: React.FC<BannerSliderProps> = ({ data, renderItem, onCloseBanner }) => {
  const stylesheet = createStylesheet();
  const progressValue = useSharedValue<number>(0);
  const carouselRef = useRef<ICarouselInstance>(null);

  const onScrollBegin = () => {
    if (!carouselRef.current) {
      return;
    }

    progressValue.value = carouselRef.current.getCurrentIndex() + 1;
  };
  const onScrollEnd = () => {
    if (progressValue.value >= data.length) {
      progressValue.value = 0;
    }
  };

  return (
    <View>
      <Carousel
        ref={carouselRef}
        loop
        width={screenWidth}
        height={152}
        autoPlay
        data={data}
        onScrollBegin={onScrollBegin}
        onScrollEnd={onScrollEnd}
        scrollAnimationDuration={800}
        autoPlayInterval={3000}
        renderItem={renderItem}
      />
      <View style={stylesheet.indicator}>
        {data.map((item, index) => (
          <PaginationItem animValue={progressValue} index={index} key={index} />
        ))}
      </View>
      <Button
        icon={<Icon phosphorIcon={X} weight="bold" size="sm" />}
        onPress={onCloseBanner}
        shape="round"
        style={{ position: 'absolute', right: -3, top: 5 }}
        size="xs"
        type="ghost"
      />
    </View>
  );
};

export default BannerSlider;
