import { Call, ExtrinsicEra, ExtrinsicPayload } from '@polkadot/types/interfaces';
import { AnyJson, SignerPayloadJSON } from '@polkadot/types/types';
import { BN, bnToBn, formatNumber } from '@polkadot/util';
import { AccountJson } from '@subwallet/extension-base/background/types';
import MetaInfo from 'components/MetaInfo';
import useGetChainInfoByGenesisHash from 'hooks/chain/useGetChainInfoByGenesisHash';
import useMetadata from 'hooks/transaction/confirmation/useMetadata';
import React, { useMemo, useRef } from 'react';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { Chain } from '@subwallet/extension-chains/types';

interface Decoded {
  args: AnyJson | null;
  method: Call | null;
}

interface Props {
  payload: ExtrinsicPayload;
  request: SignerPayloadJSON;
  account: AccountJson;
}

const displayDecodeVersion = (message: string, chain: Chain, specVersion: BN): string => {
  return `${message}: chain=${
    chain.name
  }, specVersion=${chain.specVersion.toString()} (request specVersion=${specVersion.toString()})`;
};

const decodeMethod = (data: string, chain: Chain, specVersion: BN): Decoded => {
  let args: AnyJson | null = null;
  let method: Call | null = null;

  try {
    if (specVersion.eqn(chain.specVersion)) {
      method = chain.registry.createType('Call', data);
      args = (method.toHuman() as { args: AnyJson }).args;
    } else {
      console.log(displayDecodeVersion('Outdated metadata to decode', chain, specVersion));
    }
  } catch (error) {
    console.error(`${displayDecodeVersion('Error decoding method', chain, specVersion)}:: ${(error as Error).message}`);

    args = null;
    method = null;
  }

  return { args, method };
};

const renderMethod = (data: string, { args, method }: Decoded): React.ReactNode => {
  if (!args || !method) {
    return <MetaInfo.Data label={'Method data'}>{data}</MetaInfo.Data>;
  }

  return (
    <div className="method-container">
      <MetaInfo.Data label={'Method'}>
        <details>
          <summary>
            {method.section}.{method.method}
            {method.meta ? `(${method.meta.args.map(({ name }) => name).join(', ')})` : ''}
          </summary>
          <pre>{JSON.stringify(args, null, 2)}</pre>
        </details>
      </MetaInfo.Data>
      {method.meta && (
        <MetaInfo.Data label={'Info'}>
          <details>
            <summary>{method.meta.docs.map(d => d.toString().trim()).join(' ')}</summary>
          </details>
        </MetaInfo.Data>
      )}
    </div>
  );
};

const mortalityAsString = (era: ExtrinsicEra, hexBlockNumber: string): string => {
  if (era.isImmortalEra) {
    return 'immortal';
  }

  const blockNumber = bnToBn(hexBlockNumber);
  const mortal = era.asMortalEra;

  return i18n.formatString(
    i18n.confirmation.lifeTimeContent,
    formatNumber(mortal.birth(blockNumber)),
    formatNumber(mortal.death(blockNumber)),
  ) as string;
};

const SubstrateTransactionDetail: React.FC<Props> = (props: Props) => {
  const {
    account,
    payload: { era, nonce, tip },
    request: { blockNumber, genesisHash, method, specVersion: hexSpec },
  } = props;
  // const theme = useSubWalletTheme().swThemes;

  const { chain } = useMetadata(genesisHash);
  const chainInfo = useGetChainInfoByGenesisHash(genesisHash);
  const specVersion = useRef(bnToBn(hexSpec)).current;
  const decoded = useMemo(
    () => (chain && chain.hasMetadata ? decodeMethod(method, chain, specVersion) : { args: null, method: null }),
    [method, chain, specVersion],
  );
  // const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <MetaInfo>
      {chainInfo ? (
        <MetaInfo.Chain chain={chainInfo.slug} label={i18n.common.network} />
      ) : (
        <MetaInfo.Default label={i18n.common.genesis}>{toShort(genesisHash, 10, 10)}</MetaInfo.Default>
      )}
      <MetaInfo.Account
        address={account.address}
        label={i18n.common.from}
        name={account.name}
        networkPrefix={chain?.ss58Format ?? chainInfo?.substrateInfo?.addressPrefix}
      />
      <MetaInfo.Number label={i18n.common.version} value={specVersion.toNumber()} />
      <MetaInfo.Number label={i18n.common.nonce} value={formatNumber(nonce)} />
      {!tip.isEmpty && (
        <MetaInfo.Number
          decimals={chainInfo?.substrateInfo?.decimals || 0}
          label={i18n.common.tip}
          suffix={chainInfo?.substrateInfo?.symbol}
          value={tip.toNumber()}
        />
      )}
      {renderMethod(method, decoded)}
      <MetaInfo.Data label={i18n.common.lifetime}>{mortalityAsString(era, blockNumber)}</MetaInfo.Data>
    </MetaInfo>
  );
};

export default SubstrateTransactionDetail;
