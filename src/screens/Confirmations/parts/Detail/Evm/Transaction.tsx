// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EvmSendTransactionRequest, EvmTransactionArg } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import BigN from 'bignumber.js';
import MetaInfo from 'components/MetaInfo';
import useGetChainInfoByChainId from 'hooks/chain/useGetChainInfoByChainId';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import React, { useCallback, useMemo } from 'react';

interface Props {
  request: EvmSendTransactionRequest;
  account: AccountJson;
}

const convertToBigN = (num: EvmSendTransactionRequest['value']): string | number | undefined => {
  if (typeof num === 'object') {
    return num.toNumber();
  } else {
    return num;
  }
};

const EvmTransactionDetail: React.FC<Props> = (props: Props) => {
  const { account, request } = props;
  const { chainId } = request;

  const recipient = useGetAccountByAddress(request.to);

  const chainInfo = useGetChainInfoByChainId(chainId);

  const amount = useMemo((): number => {
    return new BigN(convertToBigN(request.value) || 0).toNumber();
  }, [request.value]);

  const handlerRenderArg = useCallback((data: EvmTransactionArg, parentName: string): JSX.Element => {
    const { children, name, value } = data;
    const _name = (parentName ? `${parentName}.` : '') + name;

    if (children) {
      return <React.Fragment key={parentName}>{children.map(child => handlerRenderArg(child, name))}</React.Fragment>;
    }

    return (
      <MetaInfo.Data key={_name} label={_name}>
        {value}
      </MetaInfo.Data>
    );
  }, []);

  const renderInputInfo = useCallback((): React.ReactNode => {
    const data = request.parseData;

    if (typeof data === 'string') {
      return null;
    }

    return (
      <>
        <MetaInfo.Default label={'Method'} labelAlign="top">
          {data.methodName}
        </MetaInfo.Default>
        <MetaInfo.Data label={'Arguments'}>{data.args.map(value => handlerRenderArg(value, ''))}</MetaInfo.Data>
      </>
    );
  }, [handlerRenderArg, request.parseData]);

  return (
    <MetaInfo>
      {chainInfo ? (
        <MetaInfo.Chain chain={chainInfo.slug} label={'Network'} />
      ) : chainId !== undefined ? (
        <MetaInfo.Default label={'Chain id'}>{chainId}</MetaInfo.Default>
      ) : null}
      <MetaInfo.Transfer
        recipientAddress={recipient?.address || request.to || ''}
        recipientLabel={'To'}
        recipientName={recipient?.name || ''}
        senderAddress={account.address}
        senderLabel={'From'}
        senderName={account.name}
      />
      {(!request.isToContract || amount !== 0) && (
        <MetaInfo.Number
          decimals={chainInfo?.evmInfo?.decimals}
          label={'Amount'}
          suffix={chainInfo?.evmInfo?.symbol}
          value={amount}
        />
      )}
      <MetaInfo.Number
        decimals={chainInfo?.evmInfo?.decimals}
        label={'Estimate gas'}
        suffix={chainInfo?.evmInfo?.symbol}
        value={request.estimateGas}
      />
      {renderInputInfo()}
      {request.data && request.data !== '0x' && <MetaInfo.Data label={'Hex data'}>{request.data}</MetaInfo.Data>}
    </MetaInfo>
  );
};
export default EvmTransactionDetail;
