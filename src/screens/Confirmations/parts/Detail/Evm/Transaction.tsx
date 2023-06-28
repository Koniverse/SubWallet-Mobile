// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EvmSendTransactionRequest, EvmTransactionArg } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import BigN from 'bignumber.js';
import { Icon, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import useGetChainInfoByChainId from 'hooks/chain/useGetChainInfoByChainId';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import React, { useCallback, useMemo, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { CaretRight } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

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
  const theme = useSubWalletTheme().swThemes;
  const [isShowDetailHexData, setShowHexData] = useState<boolean>(false);

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
        <MetaInfo.Default label={i18n.inputLabel.method} labelAlign="top">
          {data.methodName}
        </MetaInfo.Default>
        <MetaInfo.Data label={i18n.inputLabel.arguments}>
          <View style={{ marginLeft: 8 }}>{data.args.map(value => handlerRenderArg(value, ''))}</View>
        </MetaInfo.Data>
      </>
    );
  }, [handlerRenderArg, request.parseData]);

  return (
    <MetaInfo>
      {chainInfo ? (
        <MetaInfo.Chain chain={chainInfo.slug} label={i18n.inputLabel.network} />
      ) : chainId !== undefined ? (
        <MetaInfo.Default label={i18n.inputLabel.chainId}>{chainId}</MetaInfo.Default>
      ) : null}
      <MetaInfo.Transfer
        recipientAddress={recipient?.address || request.to || ''}
        recipientLabel={i18n.inputLabel.to}
        recipientName={recipient?.name || ''}
        senderAddress={account.address}
        senderLabel={i18n.inputLabel.from}
        senderName={account.name}
      />
      {(!request.isToContract || amount !== 0) && (
        <MetaInfo.Number
          decimals={chainInfo?.evmInfo?.decimals}
          label={i18n.inputLabel.amount}
          suffix={chainInfo?.evmInfo?.symbol}
          value={amount}
        />
      )}
      <MetaInfo.Number
        decimals={chainInfo?.evmInfo?.decimals}
        label={i18n.inputLabel.estimatedFee}
        suffix={chainInfo?.evmInfo?.symbol}
        value={request.estimateGas}
      />
      {renderInputInfo()}
      {request.data && request.data !== '0x' && (
        <MetaInfo.Data label={i18n.inputLabel.hexData}>
          {valueStyle => (
            <TouchableWithoutFeedback onPress={() => setShowHexData(!isShowDetailHexData)}>
              {isShowDetailHexData ? (
                <Typography.Text style={valueStyle}>{request.data}</Typography.Text>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Icon phosphorIcon={CaretRight} weight={'fill'} size={'xs'} iconColor={theme.colorTextTertiary} />
                  <Typography.Text ellipsis style={[valueStyle, { flex: 1 }]}>
                    {request.data}
                  </Typography.Text>
                </View>
              )}
            </TouchableWithoutFeedback>
          )}
        </MetaInfo.Data>
      )}
    </MetaInfo>
  );
};
export default EvmTransactionDetail;
