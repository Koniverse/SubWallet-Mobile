import useFetchMarkdownContentData from 'hooks/static-content/useFetchMarkdownContentData';
import React, { useEffect, useState } from 'react';
import { VoidFunction } from 'types/index';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { LoadingScreen } from 'screens/LoadingScreen';
import { ContentGenerator } from 'components/StaticContent/ContentGenerator';
import { Button, Icon, PageIcon, Typography } from 'components/design-system-ui';
import { CheckCircle, Warning, XCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { View } from 'react-native';
import i18n from 'utils/i18n/i18n';

interface Props {
  isForcedMigration?: boolean;
  isBusy?: boolean;
  onDismiss: VoidFunction;
  onMigrateNow: VoidFunction;
}

type ContentDataType = {
  content: string;
  title: string;
};

export const BriefView = ({ isForcedMigration, onDismiss, onMigrateNow, isBusy }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const [contentData, setContentData] = useState<ContentDataType>({
    content: '',
    title: '',
  });
  const [isFetchingBriefContent, setIsFetchingBriefContent] = useState<boolean>(true);
  const fetchMarkdownContentData = useFetchMarkdownContentData();

  useEffect(() => {
    let sync = true;

    if (!isForcedMigration) {
      setIsFetchingBriefContent(true);

      fetchMarkdownContentData<ContentDataType>('unified_account_migration_content_mobile', ['en'])
        .then(data => {
          if (sync) {
            setContentData(data);
            setIsFetchingBriefContent(false);
          }
        })
        .catch(e => console.log('fetch unified_account_migration_content error:', e));
    }

    return () => {
      sync = false;
    };
  }, [fetchMarkdownContentData, isForcedMigration]);

  useEffect(() => {
    if (isForcedMigration) {
      setIsFetchingBriefContent(false);
    }
  }, [isForcedMigration]);

  if (isFetchingBriefContent || isBusy) {
    return <LoadingScreen />;
  }
  return (
    <ContainerWithSubHeader
      showLeftBtn={false}
      style={{ paddingHorizontal: theme.padding }}
      title={!isForcedMigration ? contentData.title : 'Migration incomplete!'}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {!isForcedMigration && <ContentGenerator content={contentData.content} />}

          {isForcedMigration && (
            <>
              <View style={{ alignItems: 'center', paddingTop: theme.paddingLG }}>
                <PageIcon icon={Warning} color={theme.colorWarning} />
              </View>

              <View style={{ gap: theme.sizeMD, paddingTop: theme.paddingMD }}>
                <Typography.Text style={{ color: theme.colorTextTertiary, textAlign: 'center' }}>
                  {
                    'Account migration is not yet complete. If this process remains incomplete, you will not be able to perform any action on SubWallet extension.'
                  }
                </Typography.Text>
                <Typography.Text style={{ color: theme.colorTextTertiary, textAlign: 'center' }}>
                  {
                    'Make sure to complete the migration to avoid any potential issues with your accounts. Hit “Continue” to resume and complete the process. '
                  }
                </Typography.Text>
              </View>
            </>
          )}
        </View>

        <View style={{ paddingBottom: 16 }}>
          {!isForcedMigration && (
            <View style={{ flexDirection: 'row', gap: theme.size }}>
              <Button
                block
                icon={<Icon phosphorIcon={XCircle} weight={'fill'} />}
                type={'secondary'}
                onPress={onDismiss}>
                {i18n.buttonTitles.cancel}
              </Button>
              <Button block icon={<Icon phosphorIcon={CheckCircle} weight={'fill'} />} onPress={onMigrateNow}>
                {'Migrate now'}
              </Button>
            </View>
          )}

          {isForcedMigration && <Button onPress={onMigrateNow}>{i18n.buttonTitles.continue}</Button>}
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
