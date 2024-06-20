import React, { useCallback, useRef } from 'react';
import { Dimensions, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
import createStylesheet from './styles';
import PaginationItem from './PaginationItem';

const { width: screenWidth } = Dimensions.get('window');
interface ImageSliderProps {
  data: string[];
  onPressItem: (param: number) => void;
  height?: number;
}
type ImageSliderItem = {
  item: string;
  index: number;
};
const ImageSlider: React.FC<ImageSliderProps> = ({ data, onPressItem, height = 152 }) => {
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

  const renderItem = useCallback(
    ({ item, index }: ImageSliderItem) => (
      <TouchableOpacity activeOpacity={1} onPress={() => onPressItem(index)}>
        <FastImage source={{ uri: item }} style={stylesheet.banner} />
      </TouchableOpacity>
    ),
    [onPressItem, stylesheet.banner],
  );

  return (
    <View>
      <Carousel
        ref={carouselRef}
        loop
        width={screenWidth}
        height={height}
        autoPlay
        data={data}
        onScrollBegin={onScrollBegin}
        onScrollEnd={onScrollEnd}
        scrollAnimationDuration={800}
        autoPlayInterval={3000}
        renderItem={renderItem}
      />
      <View style={stylesheet.indicator}>
        {data.map((image: string, index: number) => (
          <PaginationItem animValue={progressValue} index={index} key={index} />
        ))}
      </View>
    </View>
  );
};

export default ImageSlider;
