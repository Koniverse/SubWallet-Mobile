import React from 'react';
import { View } from 'react-native';
import { Icon, Logo, Typography } from 'components/design-system-ui';
import { ArrowRight } from 'phosphor-react-native';
import { NetworkGroup } from 'components/MetaInfo/parts';

interface Props {
  chains: string[];
}

export const TransactionProcessPreview = ({ chains }: Props) => {
  const isMode1 = chains.length < 6;

  return (
    <View>
      {isMode1 ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          {chains.map((item, index) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Logo size={16} network={item.toLowerCase()} shape={'circle'} />

              {index !== chains.length - 1 && <Icon customSize={12} phosphorIcon={ArrowRight} />}
            </View>
          ))}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <NetworkGroup chains={chains} />
          <Typography.Text>{`${chains.length} steps`}</Typography.Text>
        </View>
      )}
    </View>
  );
};
