import React from 'react';
import { SigningRequest } from '@subwallet/extension-base/background/types';
import { ConfirmationHookType } from 'hooks/types';

interface Props {
  payload: SigningRequest;
  cancelRequest: ConfirmationHookType['cancelRequest'];
  approveRequest: ConfirmationHookType['approveRequest'];
}

const CONFIRMATION_TYPE = 'signingRequest';

export const SubstrateSignConfirmation = ({
  payload: { request, id: confirmationId, url, account },
  cancelRequest,
  approveRequest,
}: Props) => {
  return <></>;
};
