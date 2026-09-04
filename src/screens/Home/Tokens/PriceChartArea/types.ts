import { PriceChartPoint } from '@subwallet/extension-base/background/KoniTypes';
import { SwNumberProps } from 'components/design-system-ui/number';

export interface DisplayPriceChartPoint extends PriceChartPoint {
  /** The point's value up to the hovered index, null past it, so the line splits. */
  hoverValue: number | null;
}

export type PriceInfoUIProps = {
  value: SwNumberProps['value'];
  change: SwNumberProps['value'];
  percent: SwNumberProps['value'];
  isPriceDown?: boolean;
};
