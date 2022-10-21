import { deviceHeight, deviceWidth } from 'constants/index';

export const overlayColor = 'rgba(34, 34, 34, 0.5)'; // this gives us a black color with a 50% transparency

export const rectDimensions = deviceWidth * 0.64; // this is equivalent to 255 from a 393 device width
export const rectBorderWidth = deviceWidth * 0.005; // this is equivalent to 2 from a 393 device width
export const rectBorderColor = 'transparent';
export const topOverlayHeight = (deviceHeight - rectDimensions) * 0.4;
export const bottomOverlayHeight = (deviceHeight - rectDimensions) * 0.65;
