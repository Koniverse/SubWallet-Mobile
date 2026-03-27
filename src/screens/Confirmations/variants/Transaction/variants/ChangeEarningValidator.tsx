import BigN from 'bignumber.js';
import React, { useCallback, useMemo, useState } from 'react';

import { BaseTransactionConfirmationProps } from './Base';
import {
  SubmitBittensorChangeValidatorStaking,
  YieldPoolInfo,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import { toShort } from 'utils/index';
import MetaInfo from 'components/MetaInfo';
import { Icon, Typography } from 'components/design-system-ui';
import { useYieldPositionDetail } from 'hooks/earning';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { TouchableOpacity } from 'react-native';
import { InfoIcon } from 'phosphor-react-native';
import { ConfirmationContent } from 'components/common/Confirmation';
import { EarningValidatorSelectedModal } from 'components/Modal/Earning/EarningValidatorSelectedModal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';

type Props = BaseTransactionConfirmationProps;

type ValidatorAccount = {
  address: string;
  identity?: string;
};

type ValidatorAddressProps = {
  account?: ValidatorAccount;
  className?: string;
  label?: string;
  title?: string;
};

type ValidatorGroupProps = {
  accounts: ValidatorAccount[];
  compound: YieldPositionInfo;
  poolInfo: YieldPoolInfo;
  title: string;
  total: number;
  label?: string;
  className?: string;
  maxValidator?: number;
};

const ValidatorAddress = ({ account, label, title }: ValidatorAddressProps) => {
  const theme = useSubWalletTheme().swThemes;
  const validator = useMemo(() => {
    if (!account) {
      return '-';
    }

    const { address, identity } = account;

    if (identity && address && identity === address) {
      return toShort(address);
    }

    return identity || (address ? toShort(address) : '-');
  }, [account]);

  return (
    <MetaInfo.Default label={label || title}>
      <Typography.Text style={{ color: theme['gray-5'] }}>{validator}</Typography.Text>
    </MetaInfo.Default>
  );
};

const ValidatorGroupModal = ({ accounts, compound, maxValidator, poolInfo, title, total }: ValidatorGroupProps) => {
  const theme = useSubWalletTheme().swThemes;
  const totalValidatorSelected = maxValidator ? `${total} (max ${maxValidator}) ` : `${total} `;
  const [modalVisible, setModalVisible] = useState(false);

  const addresses = useMemo(() => accounts.map(account => account.address), [accounts]);

  const onPress = useCallback(() => {
    setModalVisible(true);
  }, []);

  return (
    <>
      <MetaInfo>
        <MetaInfo.Default label={title}>
          <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Typography.Text style={{ color: theme.colorTextTertiary }}>{totalValidatorSelected}</Typography.Text>
            <Icon phosphorIcon={InfoIcon} size="sm" iconColor={theme.colorTextTertiary} />
          </TouchableOpacity>
        </MetaInfo.Default>
      </MetaInfo>

      <EarningValidatorSelectedModal
        addresses={addresses}
        chain={poolInfo.chain}
        compound={compound}
        displayType={'validator'}
        from={compound.address}
        nominations={compound.nominations}
        readOnly={true}
        slug={poolInfo.slug}
        title={title}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </>
  );
};

const ChangeValidatorTransactionConfirmation = (props: Props) => {
  const { transaction } = props;
  const data = transaction.data as SubmitBittensorChangeValidatorStaking;
  const slug = data.slug;

  const { compound } = useYieldPositionDetail(slug, data.address);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const poolInfo = poolInfoMap[slug];
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  const { deselectedValidatorAccounts, newValidatorAccounts, totalSelectedCount } = useMemo(() => {
    const oldValidatorAccounts: ValidatorAccount[] =
      compound?.nominations
        ?.filter(item => item.validatorAddress === data.originValidator)
        .map(item => ({
          address: item.validatorAddress,
          identity: item.validatorIdentity,
        })) || [];

    const _newValidatorAccounts: ValidatorAccount[] = data.selectedValidators.map(v => ({
      address: v.address,
      identity: v.identity,
    }));

    const _totalSelectedCount = _newValidatorAccounts.length;

    const _deselectedValidatorAccounts = oldValidatorAccounts.filter(
      old => !_newValidatorAccounts.find(newValidator => newValidator.address === old.address),
    );

    return {
      oldValidatorAccounts,
      newValidatorAccounts: _newValidatorAccounts,
      deselectedValidatorAccounts: _deselectedValidatorAccounts,
      totalSelectedCount: _totalSelectedCount,
    };
  }, [compound?.nominations, data.originValidator, data.selectedValidators]);

  const isBittensorChain = useMemo(() => {
    return transaction.chain === 'bittensor' || transaction.chain === 'bittensor_testnet';
  }, [transaction.chain]);

  const stakingFee = data.subnetData?.stakingFee;
  const isShowAmount = useMemo(() => {
    return new BigN(data.amount).gt(0);
  }, [data.amount]);

  return (
    <ConfirmationContent isFullHeight transaction={transaction}>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo>
        <MetaInfo hasBackgroundWrapper>
          {isShowAmount && (
            <MetaInfo.Number
              decimals={decimals}
              label={'Amount'}
              suffix={data.metadata?.subnetSymbol || symbol}
              value={data.amount}
            />
          )}
          <MetaInfo.Number
            decimals={decimals}
            label={'Estimated fee'}
            suffix={symbol}
            value={transaction.estimateFee?.value || 0}
          />
          {compound && !isBittensorChain && (
            <ValidatorGroupModal
              accounts={newValidatorAccounts}
              compound={compound}
              maxValidator={poolInfo.statistic?.maxCandidatePerFarmer}
              poolInfo={poolInfo}
              title={'Total validators selected'}
              total={totalSelectedCount}
            />
          )}
        </MetaInfo>
      </MetaInfo>

      {isBittensorChain && (
        <>
          <MetaInfo hasBackgroundWrapper>
            <ValidatorAddress
              account={deselectedValidatorAccounts[0]}
              label="From validator"
              title="Deselected validators"
            />

            <ValidatorAddress
              account={newValidatorAccounts[0]}
              label="To validator"
              title="Newly selected validators"
            />
          </MetaInfo>
          {!!stakingFee && (
            <AlertBox
              description={i18n.formatString(i18n.message.validatorChangeFeeInfo, stakingFee)}
              title={i18n.message.validatorChangeFeeTitle}
              type="info"
            />
          )}
        </>
      )}
    </ConfirmationContent>
  );
};

export default ChangeValidatorTransactionConfirmation;
