import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { Dispatch, SetStateAction } from 'react';

export interface TransactionFormBaseProps {
  from: string;
  chain: string;
  asset: string;
}

export interface TransactionContextProps extends TransactionFormBaseProps {
  transactionType: ExtrinsicType;
  setFrom: Dispatch<SetStateAction<string>>;
  setChain: Dispatch<SetStateAction<string>>;
  setAsset: Dispatch<SetStateAction<string>>;
  onDone: (extrinsicHash: string) => void;
  onClickRightBtn: () => void;
  setShowRightBtn: Dispatch<SetStateAction<boolean>>;
  setDisabledRightBtn: Dispatch<SetStateAction<boolean>>;
}

export const enum ExtraExtrinsicType {
  IMPORT_NFT = 'nft.import',
  IMPORT_TOKEN = 'token.import',
}
export type ExtrinsicTypeMobile = ExtraExtrinsicType | ExtrinsicType;
