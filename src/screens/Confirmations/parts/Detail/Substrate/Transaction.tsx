import { Call, ExtrinsicEra, ExtrinsicPayload } from '@polkadot/types/interfaces';
import { AnyJson, SignerPayloadJSON } from '@polkadot/types/types';
import { BN, bnToBn, formatNumber } from '@polkadot/util';
import MetaInfo from 'components/MetaInfo';
import useGetChainInfoByGenesisHash from 'hooks/chain/useGetChainInfoByGenesisHash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PlayIcon } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { Chain } from '@subwallet/extension-chains/types';
import { Icon, Typography } from 'components/design-system-ui';
import { FontMonoRegular } from 'styles/sharedStyles';

const MONO_COLOR = 'rgba(255, 255, 255, 0.45)';

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  // Solid triangle like the browser's <details> marker, turned down once the row is open.
  marker: {
    paddingTop: 5,
  },
  markerOpen: {
    paddingTop: 5,
    transform: [{ rotate: '90deg' }],
  },
  summaryText: {
    flex: 1,
    color: MONO_COLOR,
    ...FontMonoRegular,
  },
  body: {
    color: MONO_COLOR,
    ...FontMonoRegular,
  },
});

interface CollapsibleDataProps {
  summary: string;
  children?: React.ReactNode;
}

/**
 * The `<details>`/`<summary>` pair the extension uses for the Method and Info rows: one
 * ellipsized line until it is opened, then the full text plus the decoded arguments.
 */
const CollapsibleData: React.FC<CollapsibleDataProps> = ({ children, summary }: CollapsibleDataProps) => {
  const [isOpen, setOpen] = useState(false);
  const onToggle = useCallback(() => setOpen(open => !open), []);

  return (
    <View>
      <TouchableOpacity activeOpacity={0.8} style={styles.summaryRow} onPress={onToggle}>
        <View style={isOpen ? styles.markerOpen : styles.marker}>
          <Icon phosphorIcon={PlayIcon} weight={'fill'} customSize={10} iconColor={MONO_COLOR} />
        </View>
        <Typography.Text ellipsis={!isOpen} style={styles.summaryText}>
          {summary}
        </Typography.Text>
      </TouchableOpacity>
      {isOpen && children}
    </View>
  );
};

interface Decoded {
  args: AnyJson | null;
  method: Call | null;
}

interface Props {
  payload: ExtrinsicPayload;
  request: SignerPayloadJSON;
  address: string;
  accountName?: string;
  // Resolved by the confirmation screen's own useMetadata. This modal mounts its content on
  // open, so resolving metadata here again meant shipping the raw metadata hex over the
  // WebView bridge and rebuilding the type registry on the JS thread while the sheet was
  // animating in - which is what made "View details" stutter.
  chain: Chain | null;
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

  const signature = `${method.section}.${method.method}${
    method.meta ? `(${method.meta.args.map(({ name }) => name).join(', ')})` : ''
  }`;

  return (
    <>
      <MetaInfo.Data label={'Method'}>
        <CollapsibleData summary={signature}>
          <Typography.Text style={styles.body}>{JSON.stringify(args, null, 2)}</Typography.Text>
        </CollapsibleData>
      </MetaInfo.Data>
      {method.meta && (
        <MetaInfo.Data label={'Info'}>
          <CollapsibleData summary={method.meta.docs.map(d => d.toString().trim()).join(' ')} />
        </MetaInfo.Data>
      )}
    </>
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
    address,
    accountName,
    chain,
    payload: { era, nonce, tip },
    request: { blockNumber, genesisHash, method, specVersion: hexSpec },
  } = props;
  // const theme = useSubWalletTheme().swThemes;

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
        address={address}
        label={i18n.common.from}
        name={accountName}
        networkPrefix={chain?.ss58Format ?? chainInfo?.substrateInfo?.addressPrefix}
      />
      <MetaInfo.Number label={i18n.common.version} value={specVersion.toNumber()} />
      <MetaInfo.Number label={i18n.common.nonce} value={formatNumber(nonce)} />
      {!tip.isEmpty && (
        <MetaInfo.Number
          decimals={chainInfo?.substrateInfo?.decimals || 0}
          label={i18n.common.tip}
          suffix={chainInfo?.substrateInfo?.symbol}
          value={tip.toPrimitive() as string | number}
        />
      )}
      {renderMethod(method, decoded)}
      <MetaInfo.Data label={i18n.common.lifetime}>{mortalityAsString(era, blockNumber)}</MetaInfo.Data>
    </MetaInfo>
  );
};

export default SubstrateTransactionDetail;
