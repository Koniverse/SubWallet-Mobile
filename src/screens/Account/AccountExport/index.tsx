import WordPhrase from 'components/common/WordPhrase';
import AlertBox from 'components/design-system-ui/alert-box';
import useCopyClipboard from 'hooks/common/useCopyClipboard';
import useGoHome from 'hooks/screen/useGoHome';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Share, View } from 'react-native';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { AccountExportProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { ExportType, SelectExportType } from 'components/common/SelectExportType';
import { Button, Icon, QRCode, SelectItem, Typography } from 'components/design-system-ui';
import PasswordModal from 'components/Modal/PasswordModal';
import { exportAccount, exportAccountPrivateKey, keyringExportMnemonic } from 'messaging/index';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { KeyringPair$Json } from '@subwallet/keyring/types';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AddressBook, CheckCircle, CopySimple, DownloadSimple, X } from 'phosphor-react-native';
import createStyle from './styles';
import { toShort } from 'utils/index';

const ViewStep = {
  SELECT_TYPES: 1,
  SHOW_RS: 2,
};

export const AccountExport = ({
  route: {
    params: { address },
  },
}: AccountExportProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const goHome = useGoHome();

  const styles = useMemo(() => createStyle(theme), [theme]);

  const [isBusy, setIsBusy] = useState(false);
  const [currentViewStep, setCurrentViewStep] = useState<number>(1);

  const [selectedTypes, setSelectedTypes] = useState<ExportType[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [errorArr, setErrorArr] = useState<string[] | undefined>(undefined);

  const [privateKey, setPrivateKey] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('');
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [jsonData, setJsonData] = useState<null | KeyringPair$Json>(null);
  const titleMap: Record<ExportType, string> = useMemo(
    () => ({
      [ExportType.JSON_FILE]: i18n.header.successful,
      [ExportType.QR_CODE]: i18n.header.yourQrCode,
      [ExportType.PRIVATE_KEY]: i18n.header.yourPrivateKey,
      [ExportType.SEED_PHRASE]: i18n.header.yourRecoveryPhrase,
    }),
    [],
  );

  const exportSingle = selectedTypes.length <= 1;

  useHandlerHardwareBackPress(isBusy);
  const account = useGetAccountByAddress(address);

  const qrData = useMemo((): string => {
    const prefix = 'secret';
    const result: string[] = [prefix, privateKey || '', publicKey];

    if (account?.name) {
      result.push(account.name);
    }

    return result.join(':');
  }, [account?.name, publicKey, privateKey]);

  const onExportJson = useCallback((_jsonData: KeyringPair$Json, _address: string): (() => void) => {
    return () => {
      if (_jsonData) {
        Share.share({ title: 'Account Json', message: JSON.stringify(_jsonData) });
      }
    };
  }, []);

  const onPressSubmit = useCallback(
    (password: string) => {
      if (!selectedTypes.length || !account) {
        return;
      }

      const _address = account.address;

      if (!_address) {
        return;
      }

      setIsBusy(true);

      setTimeout(() => {
        const promise = new Promise<void>((resolve, reject) => {
          const result = {
            privateKey: false,
            seedPhrase: false,
            jsonFile: false,
          };

          const checkDone = () => {
            if (Object.values(result).every(value => value)) {
              resolve();
            }
          };

          if (selectedTypes.includes(ExportType.PRIVATE_KEY) || selectedTypes.includes(ExportType.QR_CODE)) {
            exportAccountPrivateKey(_address, password)
              .then(res => {
                setPrivateKey(res.privateKey);
                setPublicKey(res.publicKey);
                result.privateKey = true;
                checkDone();
              })
              .catch((e: Error) => {
                reject(new Error(e.message));
              });
          } else {
            result.privateKey = true;
          }

          if (selectedTypes.includes(ExportType.SEED_PHRASE) && account?.isMasterAccount) {
            keyringExportMnemonic({ address, password: password })
              .then(res => {
                setSeedPhrase(res.result);
                result.seedPhrase = true;
                checkDone();
              })
              .catch((e: Error) => {
                reject(new Error(e.message));
              });
          } else {
            result.seedPhrase = true;
          }

          if (selectedTypes.includes(ExportType.JSON_FILE)) {
            exportAccount(_address, password)
              .then(res => {
                setJsonData(res.exportedJson);
                result.jsonFile = true;
                checkDone();
              })
              .catch((e: Error) => {
                reject(new Error(e.message));
              });
          } else {
            result.jsonFile = true;
          }
        });

        promise
          .then(() => {
            setCurrentViewStep(2);
            setModalVisible(false);
          })
          .catch(() => setErrorArr([i18n.errorMessage.invalidPassword]))
          .finally(() => {
            setIsBusy(false);
          });
      }, 500);
    },
    [account, address, selectedTypes],
  );

  const copyPrivateKey = useCopyClipboard(privateKey);
  const copyQr = useCopyClipboard(qrData);

  const onPressDone = () => {
    navigation.goBack();
  };

  const title = useMemo(() => {
    if (currentViewStep === ViewStep.SELECT_TYPES) {
      return i18n.header.exportAccount;
    } else {
      if (!exportSingle) {
        return i18n.exportAccount.exportSuccessful;
      } else {
        return titleMap[selectedTypes[0]];
      }
    }
  }, [currentViewStep, exportSingle, selectedTypes, titleMap]);

  if (!account) {
    return null;
  }

  return (
    <SubScreenContainer navigation={navigation} disabled={isBusy} title={title} rightIcon={X} onPressRightIcon={goHome}>
      <View style={styles.layoutContainer}>
        <ScrollView style={styles.bodyArea}>
          <View style={currentViewStep === ViewStep.SELECT_TYPES ? styles.introWarning : styles.rsWarning}>
            <AlertBox
              title={i18n.warning.warningAccTitle}
              description={i18n.warning.warningAccMessage}
              type="warning"
            />
          </View>

          {currentViewStep === ViewStep.SELECT_TYPES && (
            <SelectExportType
              selectedItems={selectedTypes}
              setSelectedItems={setSelectedTypes}
              account={account}
              loading={isBusy}
            />
          )}

          {currentViewStep === ViewStep.SHOW_RS && (
            <View style={styles.resultContainer}>
              {selectedTypes.includes(ExportType.PRIVATE_KEY) && (
                <View>
                  {!exportSingle && (
                    <Typography.Text style={styles.blockTitle} size={'sm'}>
                      {titleMap[ExportType.PRIVATE_KEY]}
                    </Typography.Text>
                  )}
                  <View style={styles.rsBlock}>
                    <Typography.Text style={styles.blockText}>{privateKey}</Typography.Text>
                  </View>
                  <View style={styles.copyArea}>
                    <Button
                      type="ghost"
                      size="xs"
                      onPress={copyPrivateKey}
                      icon={<Icon phosphorIcon={CopySimple} size="md" iconColor={theme.colorTextLight4} />}>
                      {i18n.common.copyToClipboard}
                    </Button>
                  </View>
                </View>
              )}

              {selectedTypes.includes(ExportType.SEED_PHRASE) && (
                <View>
                  {!exportSingle && (
                    <Typography.Text style={styles.blockTitle} size={'sm'}>
                      {titleMap[ExportType.SEED_PHRASE]}
                    </Typography.Text>
                  )}
                  <View style={styles.phraseBlock}>
                    <WordPhrase seedPhrase={seedPhrase} />
                  </View>
                </View>
              )}

              {selectedTypes.includes(ExportType.QR_CODE) && (
                <View>
                  {!exportSingle && (
                    <Typography.Text style={styles.blockTitle} size={'sm'}>
                      {titleMap[ExportType.QR_CODE]}
                    </Typography.Text>
                  )}
                  <View style={styles.qrArea}>
                    <QRCode
                      errorLevel={'Q'}
                      value={qrData}
                      QRSize={4}
                      outerEyesRadius={11}
                      innerEyesRadius={5}
                      pieceBorderRadius={2}
                    />
                  </View>
                  <View style={styles.copyArea}>
                    <Button
                      type="ghost"
                      size="xs"
                      onPress={copyQr}
                      icon={<Icon phosphorIcon={CopySimple} size="md" iconColor={theme.colorTextLight4} />}>
                      {i18n.common.copyToClipboard}
                    </Button>
                  </View>
                </View>
              )}

              {selectedTypes.includes(ExportType.JSON_FILE) && jsonData && (
                <View>
                  {!exportSingle && (
                    <Typography.Text style={styles.blockTitle} size={'sm'}>
                      {i18n.exportAccount.yourJsonFile}
                    </Typography.Text>
                  )}
                  <SelectItem
                    onPress={onExportJson(jsonData, address)}
                    icon={AddressBook}
                    backgroundColor={theme.colorPrimary}
                    label={`${toShort(address)}.json`}
                    rightIcon={
                      <Icon
                        phosphorIcon={DownloadSimple}
                        size={'sm'}
                        iconColor={theme.colorTextTertiary}
                        weight={'bold'}
                      />
                    }
                  />
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.footerArea}>
          {currentViewStep === ViewStep.SELECT_TYPES ? (
            <Button disabled={!(selectedTypes && selectedTypes.length)} block onPress={() => setModalVisible(true)}>
              {i18n.common.confirm}
            </Button>
          ) : (
            <Button
              block
              disabled={isBusy}
              onPress={onPressDone}
              icon={<Icon phosphorIcon={CheckCircle} size={'lg'} weight={'fill'} />}>
              {i18n.common.finish}
            </Button>
          )}
        </View>

        <PasswordModal
          visible={modalVisible}
          setModalVisible={setModalVisible}
          isBusy={isBusy}
          onConfirm={onPressSubmit}
          errorArr={errorArr}
          setErrorArr={setErrorArr}
        />
      </View>
    </SubScreenContainer>
  );
};
