import { ActionType, ValidateRecipientParams, ValidationCondition } from '@subwallet/extension-base/core/types';
import { AccountSignMode } from '@subwallet/extension-base/types';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { ValidateResult } from 'react-hook-form/dist/types/validator';
import {
  _isAddress,
  _isNotDuplicateAddress,
  _isNotNull,
  _isSupportLedgerAccount,
  _isValidAddressForEcosystem,
  _isValidSubstrateAddressFormat,
  _isValidTonAddressFormat,
} from '@subwallet/extension-base/core/utils';
import { isSubstrateAddress, isTonAddress } from '@subwallet/keyring';

function getConditions(validateRecipientParams: ValidateRecipientParams): ValidationCondition[] {
  const { account, actionType, autoFormatValue, destChainInfo, srcChain, toAddress } = validateRecipientParams;
  const conditions: ValidationCondition[] = [];
  const isSendAction = [ActionType.SEND_FUND, ActionType.SEND_NFT].includes(actionType);

  conditions.push(ValidationCondition.IS_NOT_NULL);
  conditions.push(ValidationCondition.IS_ADDRESS);
  conditions.push(ValidationCondition.IS_VALID_ADDRESS_FOR_ECOSYSTEM);

  if (isSubstrateAddress(toAddress) && !autoFormatValue) {
    // todo: need isSubstrateAddress util function to check exactly
    conditions.push(ValidationCondition.IS_VALID_SUBSTRATE_ADDRESS_FORMAT);
  }

  if (isTonAddress(toAddress)) {
    conditions.push(ValidationCondition.IS_VALID_TON_ADDRESS_FORMAT);
  }

  if (srcChain === destChainInfo.slug && isSendAction && !destChainInfo.tonInfo) {
    conditions.push(ValidationCondition.IS_NOT_DUPLICATE_ADDRESS);
  }

  if (account?.isHardware) {
    conditions.push(ValidationCondition.IS_SUPPORT_LEDGER_ACCOUNT);

    if (account.signMode === AccountSignMode.LEGACY_LEDGER) {
      conditions.push(ValidationCondition.IS_VALID_SUBSTRATE_ADDRESS_FORMAT);
    }
  }

  return conditions;
}

function getValidationFunctions(
  conditions: ValidationCondition[],
): Array<(validateRecipientParams: ValidateRecipientParams) => string> {
  const validationFunctions: Array<(validateRecipientParams: ValidateRecipientParams) => string> = [];

  for (const condition of conditions) {
    switch (condition) {
      case ValidationCondition.IS_NOT_NULL: {
        validationFunctions.push(_isNotNull);

        break;
      }

      case ValidationCondition.IS_ADDRESS: {
        validationFunctions.push(_isAddress);

        break;
      }

      case ValidationCondition.IS_VALID_ADDRESS_FOR_ECOSYSTEM: {
        validationFunctions.push(_isValidAddressForEcosystem);

        break;
      }

      case ValidationCondition.IS_VALID_SUBSTRATE_ADDRESS_FORMAT: {
        validationFunctions.push(_isValidSubstrateAddressFormat);

        break;
      }

      case ValidationCondition.IS_VALID_TON_ADDRESS_FORMAT: {
        validationFunctions.push(_isValidTonAddressFormat);

        break;
      }

      case ValidationCondition.IS_NOT_DUPLICATE_ADDRESS: {
        validationFunctions.push(_isNotDuplicateAddress);

        break;
      }

      case ValidationCondition.IS_SUPPORT_LEDGER_ACCOUNT: {
        validationFunctions.push(_isSupportLedgerAccount);

        break;
      }
    }
  }

  return validationFunctions;
}

function runValidationFunctions(
  validateRecipientParams: ValidateRecipientParams,
  validationFunctions: Array<(validateRecipientParams: ValidateRecipientParams) => string>,
): Promise<ValidateResult> {
  const validationResults: string[] = [];

  for (const validationFunction of validationFunctions) {
    validationResults.push(validationFunction(validateRecipientParams));
  }

  for (const result of validationResults) {
    if (result) {
      return Promise.resolve(detectTranslate(result));
    }
  }

  return Promise.resolve(undefined);
}

export function validateRecipientAddress(validateRecipientParams: ValidateRecipientParams): Promise<ValidateResult> {
  const conditions = getConditions(validateRecipientParams);
  const validationFunctions = getValidationFunctions(conditions);
  return runValidationFunctions(validateRecipientParams, validationFunctions);
}
