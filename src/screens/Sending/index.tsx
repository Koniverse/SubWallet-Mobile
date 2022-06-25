import React, { useEffect, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { Keyboard, StyleProp, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { InputAddress } from 'components/InputAddress';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { getNetworkLogo } from 'utils/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { SubmitButton } from 'components/SubmitButton';
import useFreeBalance from 'hooks/screen/useFreeBalance';
import FormatBalance from 'components/FormatBalance';
import { BalanceFormatType } from 'types/ui-types';
import { getBalanceFormat, getMaxTransferAndNoFees, isContainGasRequiredExceedsError } from 'screens/Sending/utils';
import BigN from 'bignumber.js';
import { BN, BN_ZERO } from '@polkadot/util';
import { InputBalance } from 'components/InputBalance';
import { BN_TEN } from 'utils/chainBalances';
import { BalanceToUsd } from 'components/BalanceToUsd';
import { checkTransfer, transferCheckReferenceCount, transferCheckSupporting } from '../../messaging';

const NetworkLogoWrapperStyle: StyleProp<any> = {
  borderRadius: 20,
  width: 40,
  height: 40,
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: ColorMap.secondary,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 48,
  marginBottom: 16,
};

export const SendFund = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const {
    currentNetwork: { networkKey },
    accounts: { currentAccountAddress },
    chainRegistry,
    price: { tokenPriceMap },
  } = useSelector((state: RootState) => state);
  const [receiveAddress, setReceiveAddress] = useState<string>('');
  const [amount, setAmount] = useState<BN | undefined>(BN_ZERO);
  const [isBlurInputAddress, setBlurInputAddress] = useState<boolean>(false);
  const selectedTokenMap = chainRegistry[networkKey].tokenMap;
  const selectedMainToken = Object.values(selectedTokenMap).find(val => val.isMainToken);
  const selectedToken = selectedMainToken ? selectedMainToken.name : Object.keys(selectedTokenMap)[0];
  const senderFreeBalance = useFreeBalance(networkKey, currentAccountAddress, selectedToken);
  const [isAll, setIsAll] = useState(false);
  const balanceFormat: BalanceFormatType = getBalanceFormat(networkKey, selectedToken, chainRegistry);
  const tokenPrice = tokenPriceMap[selectedToken.toLowerCase()] || 0;
  const reformatAmount = new BigN(amount?.toString() || '0').div(BN_TEN.pow(balanceFormat[0]));
  const amountToUsd = reformatAmount.multipliedBy(new BigN(tokenPrice));
  const [isGasRequiredExceedsError, setGasRequiredExceedsError] = useState<boolean>(false);
  const [recipientPhish, setRecipientPhish] = useState<string | null>(null);
  const [existentialDeposit, setExistentialDeposit] = useState<string>('0');
  const [[fee, feeSymbol], setFeeInfo] = useState<[string | null, string | null | undefined]>([null, null]);
  const [reference, setReference] = useState<boolean | null>(null);
  const [[isSupportTransfer, isSupportTransferAll], setTransferSupport] = useState<[boolean, boolean] | [null, null]>([
    null,
    null,
  ]);
  const [maxTransfer, noFees] = getMaxTransferAndNoFees(
    fee,
    feeSymbol,
    selectedToken,
    selectedToken,
    senderFreeBalance,
    existentialDeposit,
  );
  const isSameAddress = !!receiveAddress && !!currentAccountAddress && receiveAddress === currentAccountAddress;
  const canToggleAll = !!isSupportTransferAll && !!maxTransfer && !reference && !!receiveAddress;
  const valueToTransfer = canToggleAll && isAll ? maxTransfer.toString() : amount?.toString() || '0';
  const amountGtAvailableBalance = amount && senderFreeBalance && amount.gt(new BN(senderFreeBalance));
  const canMakeTransfer =
    isSupportTransfer &&
    !isGasRequiredExceedsError &&
    !recipientPhish &&
    !!receiveAddress &&
    !isSameAddress &&
    !amountGtAvailableBalance;

  useEffect(() => {
    let isSync = true;

    if (receiveAddress) {
      checkTransfer({
        networkKey: networkKey,
        from: currentAccountAddress,
        to: receiveAddress,
        transferAll: canToggleAll && isAll,
        token: selectedToken,
        value: valueToTransfer,
      })
        .then(rs => {
          if (isSync) {
            setFeeInfo([rs.estimateFee && rs.estimateFee !== '0' ? rs.estimateFee : null, rs.feeSymbol]);
            setGasRequiredExceedsError(false);
          }
        })
        .catch((e: Error) => {
          if (isContainGasRequiredExceedsError(e.message) && isSync) {
            setGasRequiredExceedsError(true);
          } else {
            if (isSync) {
              setGasRequiredExceedsError(false);
            }

            console.log('There is problem when checkTransfer', e);
          }
        });
    }

    return () => {
      isSync = false;
    };
  }, [amount, canToggleAll, currentAccountAddress, isAll, networkKey, receiveAddress, selectedToken, valueToTransfer]);

  // useEffect(() => {
  //   let isSync = true;
  //
  //   transferGetExistentialDeposit({ networkKey, token: selectedToken })
  //     .then(rs => {
  //       if (isSync) {
  //         setExistentialDeposit(rs);
  //       }
  //     })
  //     .catch(e => console.log('There is problem when transferGetExistentialDeposit', e));
  //
  //   return () => {
  //     isSync = false;
  //     setExistentialDeposit('0');
  //   };
  // }, [networkKey, selectedToken]);
  //
  // useEffect(() => {
  //   let isSync = true;
  //
  //   if (receiveAddress) {
  //     checkAddress(receiveAddress)
  //       .then(v => {
  //         if (isSync) {
  //           setRecipientPhish(v);
  //         }
  //       })
  //       .catch(e => console.log(e));
  //   }
  //
  //   return () => {
  //     isSync = false;
  //     setRecipientPhish(null);
  //   };
  // }, [receiveAddress]);
  //
  useEffect(() => {
    let isSync = true;

    transferCheckReferenceCount({ address: currentAccountAddress, networkKey })
      .then(res => {
        if (isSync) {
          setReference(res);
        }
      })
      .catch(e => console.log(e));

    return () => {
      isSync = false;
      setReference(null);
    };
  }, [currentAccountAddress, networkKey]);

  useEffect(() => {
    let isSync = true;

    transferCheckSupporting({ networkKey, token: selectedToken })
      .then(res => {
        if (isSync) {
          setTransferSupport([res.supportTransfer, res.supportTransferAll]);
        }
      })
      .catch(e => console.log(e));

    return () => {
      isSync = false;
      setTransferSupport([null, null]);
    };
  }, [networkKey, selectedToken]);

  return (
    <SubScreenContainer navigation={navigation} title={'Send Fund'}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setBlurInputAddress(false);
        }}>
        <View style={{ ...sharedStyles.layoutContainer }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <InputAddress
              label={'Sent to address'}
              onFocus={() => setBlurInputAddress(true)}
              onBlur={() => setBlurInputAddress(false)}
              onChangeText={text => setReceiveAddress(text)}
              receiveAddress={receiveAddress}
              onChangeInputAddress={() => setBlurInputAddress(true)}
              isBlurInputAddress={isBlurInputAddress}
            />

            <View style={NetworkLogoWrapperStyle}>{getNetworkLogo(networkKey, 34)}</View>
            <InputBalance
              decimals={balanceFormat[0]}
              isZeroable
              defaultValue={''}
              onChangeText={setAmount}
              placeholder={'0'}
              siSymbol={balanceFormat[2] || balanceFormat[1]}
            />
            {reformatAmount && <BalanceToUsd amountToUsd={amountToUsd} />}
          </View>

          <View>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: ColorMap.light, ...sharedStyles.mainText, ...FontMedium }}>Balance: </Text>
                <FormatBalance format={balanceFormat} value={senderFreeBalance} />
              </View>

              {canToggleAll && (
                <TouchableOpacity onPress={() => setIsAll(true)}>
                  <Text style={{ color: ColorMap.primary, ...sharedStyles.mainText, ...FontMedium }}>Use Max</Text>
                </TouchableOpacity>
              )}
            </View>

            <SubmitButton title={'Continue'} style={{ width: '100%', marginBottom: 22 }} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SubScreenContainer>
  );
};
