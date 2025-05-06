import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Logo } from 'components/design-system-ui';
import { ACCOUNT_CHAIN_TYPE_ORDINAL_MAP, AccountChainType } from '@subwallet/extension-base/types';
import { getChainTypeLogoMap } from 'utils/account/account';

interface Props {
  chainTypes: AccountChainType[];
}

export const AccountChainTypeLogos = ({ chainTypes }: Props) => {
  const chainTypeLogoMap = useMemo(() => {
    return getChainTypeLogoMap();
  }, []);

  const sortedChainTypes = useMemo(() => {
    const result = [...chainTypes];

    result.sort((a, b) => ACCOUNT_CHAIN_TYPE_ORDINAL_MAP[a] - ACCOUNT_CHAIN_TYPE_ORDINAL_MAP[b]);

    return result;
  }, [chainTypes]);

  return (
    <View style={{ height: 20, alignItems: 'center', flexDirection: 'row' }}>
      {sortedChainTypes.map((nt, index) => (
        <View style={index !== 0 && { marginLeft: -4 }}>
          <Logo network={chainTypeLogoMap[nt]} size={16} shape={'circle'} />
        </View>
      ))}
    </View>
  );
};
