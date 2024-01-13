// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getContractAddressOfToken } from '@subwallet/extension-base/services/chain-service/utils';
import { TokenApproveData } from '@subwallet/extension-base/types';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import MetaInfo from 'components/MetaInfo';
import useGetChainAssetInfo from 'hooks/common/userGetChainAssetInfo';
import React, { useMemo } from 'react';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const TokenApproveConfirmation: React.FC<Props> = (props: Props) => {
  const { transaction } = props;

  const txParams = useMemo((): TokenApproveData => transaction.data as TokenApproveData, [transaction.data]);

  const inputAsset = useGetChainAssetInfo(txParams.inputTokenSlug);
  const spenderAsset = useGetChainAssetInfo(txParams.spenderTokenSlug);

  return (
    <ConfirmationContent isFullHeight>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />
      <MetaInfo hasBackgroundWrapper>
        {inputAsset && <MetaInfo.Account address={_getContractAddressOfToken(inputAsset)} label={'Contract'} />}

        {spenderAsset && (
          <MetaInfo.Account address={_getContractAddressOfToken(spenderAsset)} label={'Spender contract'} />
        )}
      </MetaInfo>
    </ConfirmationContent>
  );
};

export default TokenApproveConfirmation;
