export type SupportService = 'transak' | 'banxa' | 'coinbase' | 'moonpay' | 'onramper' | 'meld';

export interface BuyServiceInfo {
  name: string;
  contactUrl: string;
  termUrl: string;
  policyUrl: string;
  url: string;
}

export type CreateBuyOrderFunction = (
  token: string,
  address: string,
  network: string,
  walletReference: string,
) => Promise<string>;
