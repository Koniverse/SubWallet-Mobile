import { Images } from 'assets/index';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleProp, View, ActivityIndicator, ViewStyle } from 'react-native';
import Video from 'react-native-video';
import { ColorMap } from 'styles/color';

interface Props {
  style?: StyleProp<ViewStyle>;
  mainUrl?: string;
  backupUrl?: string;
}

const ContainerStyle: StyleProp<any> = {
  position: 'relative',
  backgroundColor: ColorMap.dark,
};

const ImageStyle: StyleProp<any> = {
  width: '100%',
  height: '100%',
  resizeMode: 'contain',
  borderRadius: 10,
};

const VideoStyle: StyleProp<any> = {
  width: '100%',
  height: '100%',
  borderRadius: 10,
};

const IndicatorStyle: StyleProp<any> = {
  width: '100%',
  height: '100%',
  position: 'absolute',
};

const ImagePreview = (props: Props) => {
  const { style, mainUrl, backupUrl } = props;

  const [url, setUrl] = useState(mainUrl);
  const [loading, setLoading] = useState(true);
  const [showImage, setShowImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  const videoRef = useRef<Video>(null);

  const handleOnLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setShowImage(false);
  }, []);

  const handleVideoError = useCallback(() => {
    if (backupUrl && url !== backupUrl) {
      setUrl(backupUrl);
      setShowImage(true);
      setLoading(true);
      setImageError(false);
    } else {
      setLoading(false);
      setImageError(true);
    }
  }, [backupUrl, url]);

  useEffect(() => {
    if (url !== mainUrl) {
      setShowImage(true);
      setLoading(true);
      setImageError(false);
      setUrl(mainUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainUrl]);

  return (
    <View style={[ContainerStyle, style]}>
      {showImage ? (
        <Image
          style={ImageStyle}
          source={{ uri: url }}
          onLoad={handleOnLoad}
          onError={handleImageError}
          defaultSource={Images.default}
        />
      ) : !imageError ? (
        <Video
          ref={videoRef}
          resizeMode={'contain'}
          source={{ uri: url }}
          style={VideoStyle}
          onError={handleVideoError}
          onLoad={handleOnLoad}
          repeat={true}
          muted={true}
        />
      ) : (
        <Image style={ImageStyle} source={Images.default} />
      )}
      {loading && <ActivityIndicator style={IndicatorStyle} animating={true} />}
    </View>
  );
};

export default React.memo(ImagePreview);
