import {
  CurrentTokenPrice,
  HistoryTokenPriceJSON,
  PriceChartTimeframe,
  ResponseSubscribeCurrentTokenPrice,
} from '@subwallet/extension-base/background/KoniTypes';
import { sendMessage } from 'messaging/index';

export async function getHistoryTokenPrice(
  priceId: string,
  timeframe: PriceChartTimeframe,
): Promise<HistoryTokenPriceJSON> {
  return sendMessage('pri(price.getHistory)', { priceId, timeframe });
}

export async function canShowChart(priceId: string): Promise<boolean> {
  return sendMessage('pri(price.checkCoinGeckoPriceSupport)', priceId);
}

export async function subscribeCurrentTokenPrice(
  priceId: string,
  callback: (item: CurrentTokenPrice) => void,
): Promise<ResponseSubscribeCurrentTokenPrice> {
  return sendMessage('pri(price.subscribeCurrentTokenPrice)', priceId, callback);
}
