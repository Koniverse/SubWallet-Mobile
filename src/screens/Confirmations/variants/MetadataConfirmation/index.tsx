import { MetadataRequest } from '@subwallet/extension-base/background/types';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/common/Confirmation';
import ConfirmationFooter from 'components/common/Confirmation/ConfirmationFooter';
import { Button, Icon } from 'components/design-system-ui';
import { CheckCircle, XCircle } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { approveMetaRequest, rejectMetaRequest } from 'messaging/index';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

import createStyle from './styles';
interface Props {
  request: MetadataRequest;
}

const handleConfirm = async ({ id }: MetadataRequest) => await approveMetaRequest(id);

const handleCancel = async ({ id }: MetadataRequest) => await rejectMetaRequest(id);

const MetadataConfirmation: React.FC<Props> = (props: Props) => {
  const { request } = props;
  const { specVersion, tokenDecimals, tokenSymbol, chain } = request.request;

  const theme = useSubWalletTheme().swThemes;

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
        <Text style={styles.text}>{i18n.confirmation.yourMetadataIsOutOfDate}</Text>
        <Text style={styles.description}>{i18n.confirmation.metadataDescription(chain, request.url)}</Text>
        <View style={{ paddingBottom: 8 }}>
          <View style={styles.detailContainer}>
            <Text style={styles.detailName}>{i18n.common.symbol}</Text>
            <Text style={styles.detailValue}>{tokenSymbol}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailName}>{i18n.common.decimals}</Text>
            <Text style={styles.detailValue}>{tokenDecimals}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailName}>{i18n.common.specVersion}</Text>
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
