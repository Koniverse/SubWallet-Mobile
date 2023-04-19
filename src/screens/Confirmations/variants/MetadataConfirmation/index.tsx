import { MetadataRequest } from '@subwallet/extension-base/background/types';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/Confirmation';
import ConfirmationFooter from 'components/Confirmation/ConfirmationFooter';
import { Button, Icon } from 'components/design-system-ui';
import { CheckCircle, XCircle } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { approveMetaRequest, rejectMetaRequest } from 'messaging/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

import createStyle from './styles';
interface Props {
  request: MetadataRequest;
}

const handleConfirm = async ({ id }: MetadataRequest) => await approveMetaRequest(id);

const handleCancel = async ({ id }: MetadataRequest) => await rejectMetaRequest(id);

const textStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

const MetadataConfirmation: React.FC<Props> = (props: Props) => {
  const { request } = props;
  const { specVersion, tokenDecimals, tokenSymbol, chain } = request.request;

  const theme = useSubWalletTheme().swThemes;

  const { accounts } = useSelector((state: RootState) => state.accountState);

  const styles = useMemo(() => createStyle(theme), [theme]);

  const [loading, setLoading] = useState(false);

  const onCancel = useCallback(() => {
    setLoading(true);
    handleCancel(request).finally(() => {
      setLoading(false);
    });
  }, [request]);

  const onConfirm = useCallback(() => {
    setLoading(true);

    handleConfirm(request).finally(() => {
      setLoading(false);
    });
  }, [request]);

  return (
    <React.Fragment>
      <ConfirmationContent>
        <ConfirmationGeneralInfo request={request} />
        <Text style={styles.text}>Your metadata is out of date</Text>
        <Text style={styles.description}>
          Approving this update will sync your metadata for {chain} chain from &nbsp; {request.url}
        </Text>
        <View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailName}>Symbol</Text>
            <Text style={styles.detailValue}>{tokenSymbol}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailName}>Decimals</Text>
            <Text style={styles.detailValue}>{tokenDecimals}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailName}>Spec version</Text>
            <Text style={styles.detailValue}>{specVersion}</Text>
          </View>
        </View>
      </ConfirmationContent>
      <ConfirmationFooter>
        <Button icon={<Icon phosphorIcon={XCircle} weight={'fill'} />} block={true} type="secondary" onPress={onCancel}>
          {i18n.common.cancel}
        </Button>
        <Button
          icon={<Icon phosphorIcon={CheckCircle} weight={'fill'} />}
          block={true}
          onPress={onConfirm}
          loading={loading}>
          {i18n.common.confirm}
        </Button>
      </ConfirmationFooter>
    </React.Fragment>
  );
};

export default MetadataConfirmation;
