import { AccountJson } from "@subwallet/extension-base/background/types";
import React from "react";

export interface Recoded {
  account: AccountJson | null;
  formatted: string | null;
  genesisHash?: string | null;
  prefix?: number;
  isEthereum: boolean;
}

export interface CheckBoxesType {
  value: string;
  labelComponent: React.ReactNode;
}
