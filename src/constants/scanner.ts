import { deviceHeight, deviceWidth } from 'constants/index';
import { ColorMap } from 'styles/color';
import { convertHexColorToRGBA } from 'utils/color';

export const overlayColor = convertHexColorToRGBA(ColorMap.dark2, 0.5); // this gives us a black color with a 50% transparency

export const rectDimensions = Math.round(deviceWidth * 0.64); // this is equivalent to 255 from a 393 device width
export const rectBorderWidth = deviceWidth * 0.005; // this is equivalent to 2 from a 393 device width
export const rectBorderColor = 'transparent';
export const topOverlayHeight = (deviceHeight - rectDimensions) * 0.4;
export const bottomOverlayHeight = (deviceHeight - rectDimensions) * 0.65;
