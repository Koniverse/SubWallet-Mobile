import { AuthorizeRequest } from '@subwallet/extension-base/background/types';
import { getDomainFromUrl } from '@subwallet/extension-base/utils';
import { Image, Logo } from 'components/design-system-ui';
import DualLogo from 'components/Logo/DualLogo';
import React from 'react';
import { Text, View } from 'react-native';

interface Props {
  request: AuthorizeRequest;
}

const ConfirmationGeneralInfo: React.FC<Props> = (props: Props) => {
  const { request } = props;
  const domain = getDomainFromUrl(request.url);
  const leftLogoUrl = `https://icons.duckduckgo.com/ip2/${domain}.ico`;

  return (
    <View style={{ display: 'flex', alignItems: 'center' }}>
      <DualLogo
        leftLogo={<Logo network="subwallet" shape="squircle" size={56} />}
        rightLogo={<Image shape="squircle" src={{ uri: leftLogoUrl }} squircleSize={56} />}
      />
      <Text>{domain}</Text>
    </View>
  );
};

export default ConfirmationGeneralInfo;
