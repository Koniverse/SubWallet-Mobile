export interface QrAccount {
  content: string;
  genesisHash: string;
  isAddress: boolean;
  name?: string;
  isEthereum: boolean;
  isReadOnly: boolean;
}
