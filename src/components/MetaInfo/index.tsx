import React, { useMemo } from 'react';
import {
  AccountGroupItem,
  AccountItem,
  ChainItem,
  DataItem,
  DefaultItem,
  DisplayTypeItem,
  NumberItem,
  StatusItem,
  TotalItem,
  TransferItem,
} from './parts';
import { InfoItemGeneralProps } from 'components/MetaInfo/types';
import { StyleProp, View } from 'react-native';
import { MetaInfoContext } from 'components/MetaInfo/context';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from './style';
import { ThemeTypes } from 'styles/themes';

function getSpaceSize(size: 'xs' | 'sm' | 'ms', theme: ThemeTypes) {
  if (size === 'xs') {
    return theme.sizeXS;
  }

  if (size === 'sm') {
    return theme.sizeSM;
  }

  return theme.size;
}

interface Props extends InfoItemGeneralProps {
  children?: React.ReactNode;
  hasBackgroundWrapper?: boolean;
  style?: StyleProp<any>;
  spaceSize?: 'xs' | 'sm' | 'ms';
}

const _MetaInfo: React.FC<Props> = ({
  children,
  style,
  hasBackgroundWrapper = false,
  labelColorScheme = 'light',
  labelFontWeight = 'semibold',
  spaceSize = 'ms',
  valueColorScheme = 'gray',
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = MetaInfoStyles(theme);
  const containerStyle = useMemo(() => {
    return [
      hasBackgroundWrapper && _style['container.has-background-wrapper'],
      { gap: getSpaceSize(spaceSize, theme) },
      style,
    ];
  }, [style, hasBackgroundWrapper, _style, spaceSize, theme]);

  return (
    <View style={containerStyle}>
      <MetaInfoContext.Provider
        value={{
          labelColorScheme,
          labelFontWeight,
          valueColorScheme,
        }}>
        {children}
      </MetaInfoContext.Provider>
    </View>
  );
};

type CompoundedComponent = React.ForwardRefExoticComponent<Props> & {
  Data: typeof DataItem;
  Status: typeof StatusItem;
  Account: typeof AccountItem;
  AccountGroup: typeof AccountGroupItem;
  Transfer: typeof TransferItem;
  Chain: typeof ChainItem;
  DisplayType: typeof DisplayTypeItem;
  Number: typeof NumberItem;
  Total: typeof TotalItem;
  Default: typeof DefaultItem;
};

const MetaInfo = _MetaInfo as unknown as CompoundedComponent;

MetaInfo.Data = DataItem;
MetaInfo.Status = StatusItem;
MetaInfo.Account = AccountItem;
MetaInfo.AccountGroup = AccountGroupItem;
MetaInfo.Transfer = TransferItem;
MetaInfo.Chain = ChainItem;
MetaInfo.DisplayType = DisplayTypeItem;
MetaInfo.Number = NumberItem;
MetaInfo.Total = TotalItem;
MetaInfo.Default = DefaultItem;

export default MetaInfo;
