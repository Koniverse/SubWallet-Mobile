import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Button, Icon, PageIcon, Typography } from 'components/design-system-ui';
import { CheckCircle } from 'phosphor-react-native';
import ResultAccountProxyItem, {
  ResultAccountProxyItemType,
} from 'screens/MigrateAccount/SummaryView/ResultAccountProxyItem';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { VoidFunction } from 'types/index';
import { pingUnifiedAccountMigrationDone } from 'messaging/index';
import ResultAccountProxyListModal from 'screens/MigrateAccount/SummaryView/ResultAccountProxyListModal';
import { FontSemiBold } from 'styles/sharedStyles';

interface Props {
  resultProxyIds: string[];
  onPressFinish: VoidFunction;
}

const instructionUrl =
  'https://docs.subwallet.app/main/extension-user-guide/account-management/migrate-solo-accounts-to-unified-accounts';

const SummaryView: React.FC<Props> = ({ resultProxyIds, onPressFinish }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const accountProxies = useSelector((root: RootState) => root.accountState.accountProxies);
  const [isAccountListModalOpen, setIsAccountListModalOpen] = useState<boolean>(false);

  const accountProxyNameMapById = useMemo(() => {
    const result: Record<string, string> = {};

    accountProxies.forEach(ap => {
      result[ap.id] = ap.name;
    });

    return result;
  }, [accountProxies]);

  const resultAccountProxies = useMemo<ResultAccountProxyItemType[]>(() => {
    return resultProxyIds.map(id => ({
      accountName: accountProxyNameMapById[id] || '',
      accountProxyId: id,
    }));
  }, [accountProxyNameMapById, resultProxyIds]);

  const showAccountListModalTrigger = resultAccountProxies.length > 2;

  const getAccountListModalTriggerLabel = () => {
    if (resultAccountProxies.length === 3) {
      return 'And 1 other';
    }

    // return t('And {{number}} others', { replace: { number: resultAccountProxies.length - 2 } });
    return `And ${resultAccountProxies.length - 2} others`;
  };

  const onOpenAccountListModal = useCallback(() => {
    setIsAccountListModalOpen(true);
  }, []);

  const hasAnyAccountToMigrate = !!resultAccountProxies.length;

  useEffect(() => {
    // notice to background that account migration is done
    pingUnifiedAccountMigrationDone().catch(console.error);
  }, []);

  return (
    <ContainerWithSubHeader showLeftBtn={false} title={'Finish'} style={{ paddingHorizontal: theme.padding }}>
      <>
        <View style={{ flex: 1 }}>
          <View style={{ width: '100%', alignItems: 'center', paddingTop: theme.paddingLG }}>
            <PageIcon icon={CheckCircle} weight={'fill'} color={theme.colorSuccess} />
          </View>

          <Typography.Title
            level={3}
            style={{ color: theme.colorWhite, textAlign: 'center', paddingVertical: theme.padding }}>
            {'All done!'}
          </Typography.Title>

          {!hasAnyAccountToMigrate && (
            <Typography.Text size={'md'} style={{ color: theme.colorTextTertiary, textAlign: 'center' }}>
              {'All eligible accounts have been migrated.\n Review '}
              <Typography.Text size={'md'} style={styles.highLight} onPress={() => Linking.openURL(instructionUrl)}>
                {'our guide'}
              </Typography.Text>
              {' to learn more about migration eligibility & process'}
            </Typography.Text>
          )}

          {hasAnyAccountToMigrate && (
            <>
              <View>
                {resultAccountProxies.length > 1 ? (
                  <Typography.Text size={'md'} style={{ color: theme.colorTextTertiary, textAlign: 'center' }}>
                    {'You have successfully migrated to \n'}
                    <Typography.Text
                      size={'md'}
                      style={{
                        color: theme.colorWhite,
                        ...FontSemiBold,
                      }}>{`${`${resultAccountProxies.length}`.padStart(2, '0')} unified accounts`}</Typography.Text>
                  </Typography.Text>
                ) : (
                  <Typography.Text size={'md'} style={{ color: theme.colorTextTertiary, textAlign: 'center' }}>
                    {'You have successfully migrated to \n '}
                    <Typography.Text
                      size={'md'}
                      style={{
                        color: theme.colorWhite,
                        ...FontSemiBold,
                      }}>{`${`${resultAccountProxies.length}`.padStart(2, '0')} unified account`}</Typography.Text>
                  </Typography.Text>
                )}
              </View>

              <View style={{ paddingTop: theme.paddingXL, gap: theme.paddingXS }}>
                {resultAccountProxies.slice(0, 2).map(ap => (
                  <ResultAccountProxyItem key={ap.accountProxyId} {...ap} />
                ))}
              </View>

              {showAccountListModalTrigger && (
                <Button type={'ghost'} size={'xs'} onPress={onOpenAccountListModal}>
                  {getAccountListModalTriggerLabel()}
                </Button>
              )}
            </>
          )}

          {isAccountListModalOpen && showAccountListModalTrigger && (
            <ResultAccountProxyListModal
              accountProxies={resultAccountProxies}
              modalVisible={isAccountListModalOpen}
              setModalVisible={setIsAccountListModalOpen}
            />
          )}
        </View>
        <View style={{ paddingBottom: theme.padding }}>
          <Button
            icon={hasAnyAccountToMigrate ? <Icon phosphorIcon={CheckCircle} weight="fill" /> : undefined}
            onPress={onPressFinish}>
            {hasAnyAccountToMigrate ? 'Finish' : 'Back to home'}
          </Button>
        </View>
      </>
    </ContainerWithSubHeader>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    highLight: {
      color: theme.colorLink,
      textDecorationLine: 'underline',
    },
  });
}

export default SummaryView;
