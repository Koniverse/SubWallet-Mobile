import React, { useMemo } from 'react';
import { Icon, Image, Typography, Web3Block } from 'components/design-system-ui';
import { SessionTypes } from '@walletconnect/types';
import { stripUrl } from '@subwallet/extension-base/utils';
import { TouchableOpacity, View } from 'react-native';
import { DAppIconMap } from '../../predefined/dAppSites';
import { AbstractAddressJson } from '@subwallet/extension-base/background/types';
import { getWCAccountList } from 'utils/walletConnect';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { CaretRight } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';

interface Props {
  session: SessionTypes.Struct;
  onPress: (topic: string) => void;
}

export const ConnectionItem = ({ session, onPress }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const {
    namespaces,
    peer: { metadata: dAppInfo },
    topic,
  } = session;

  const accountItems = useMemo(
    (): AbstractAddressJson[] => getWCAccountList(accounts, namespaces),
    [accounts, namespaces],
  );
  const currentDomain = useMemo(() => {
    try {
      return stripUrl(dAppInfo.url);
    } catch (e) {
      return dAppInfo.url;
    }
  }, [dAppInfo.url]);

  function getImageSource(domain: string): string {
    if (DAppIconMap[domain]) {
      return DAppIconMap[domain];
    }

    return `https://icons.duckduckgo.com/ip2/${domain}.ico`;
  }

  return (
    <TouchableOpacity onPress={() => onPress(topic)} activeOpacity={BUTTON_ACTIVE_OPACITY}>
      <Web3Block
        customStyle={{
          container: {
            backgroundColor: theme.colorBgSecondary,
            borderRadius: theme.borderRadiusLG,
            marginHorizontal: theme.margin,
          },
          right: { marginRight: -2, marginLeft: 10 },
        }}
        leftItem={<Image src={getImageSource(currentDomain)} shape={'circle'} style={{ width: 28, height: 28 }} />}
        middleItem={
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'space-between', flex: 1 }}>
            <Typography.Text ellipsis size={'md'} style={{ ...FontSemiBold, color: theme.colorWhite, flex: 1 }}>
              {dAppInfo.name}
            </Typography.Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'flex-end', flex: 1 }}>
              <Typography.Text ellipsis style={{ ...FontMedium, color: theme.colorTextTertiary, maxWidth: '80%' }}>
                {currentDomain}
              </Typography.Text>
              <Typography.Text size={'md'} style={{ ...FontSemiBold, color: theme.colorWhite }}>
                {accountItems.length}
              </Typography.Text>
            </View>
          </View>
        }
        rightItem={<Icon phosphorIcon={CaretRight} size={'sm'} />}
      />
    </TouchableOpacity>
  );
};
