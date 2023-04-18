import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleProp, View } from 'react-native';
import { SubScreenContainer } from 'components/SubScreenContainer';
import {
  ContainerHorizontalPadding,
  FontMedium,
  FontSemiBold,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
} from 'styles/sharedStyles';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from 'react-native-toast-notifications';
import { ExportAccountProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { ExportType, SelectExportType } from 'components/common/SelectExportType';
import { Warning } from 'components/Warning';
import { Button, Icon, QRCode, Typography } from 'components/design-system-ui';
import PasswordModal from 'components/Modal/PasswordModal';
import { exportAccount, exportAccountPrivateKey, keyringExportMnemonic } from 'messaging/index';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { KeyringPair$Json } from '@subwallet/keyring/types';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CheckCircle, CopySimple } from 'phosphor-react-native';
import { SeedWordDataType } from 'screens/CreateAccount/types';
import { SeedWord } from 'components/SeedWord';

const layoutContainerStyle: StyleProp<any> = {
  ...ContainerHorizontalPadding,
  flex: 1,
  marginTop: 8,
};

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
  ...ScrollViewStyle,
};

const footerAreaStyle: StyleProp<any> = {
  marginLeft: -4,
  marginRight: -4,
  flexDirection: 'row',
  paddingTop: 12,
  ...MarginBottomForSubmitButton,
};

const rsBlockStyle: StyleProp<any> = {
  paddingTop: 8,
  paddingBottom: 24,
  paddingHorizontal: 12,
  backgroundColor: '#1A1A1A',
  marginBottom: 16,
  borderRadius: 8,
};

const blockTextStyle: StyleProp<any> = {
  fontSize: 14,
  lineHeight: 22,
  color: '#fff',
  ...FontMedium,
  textAlign: 'center',
};

const blockTitleStyle: StyleProp<any> = { ...FontSemiBold, color: 'rgba(255, 255, 255, 0.65)', marginBottom: 16 };

const phraseBlockStyle: StyleProp<any> = {
  paddingLeft: 14,
  paddingRight: 14,
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginBottom: 16,
  justifyContent: 'center',
};

const seedWordStyle = {
  margin: 4,
};

const ViewStep = {
  SELECT_TYPES: 1,
  SHOW_RS: 2,
};

const titleMap: Record<ExportType, string> = {
  [ExportType.JSON_FILE]: 'Successful',
  [ExportType.QR_CODE]: 'Your QR code',
  [ExportType.PRIVATE_KEY]: 'Your private key',
  [ExportType.SEED_PHRASE]: 'Your recovery phrase',
};

export const ExportAccount = ({
  route: {
    params: { address },
  },
}: ExportAccountProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const [isBusy, setIsBusy] = useState(false);
  const [currentViewStep, setCurrentViewStep] = useState<number>(1);
  const [selectedTypes, setSelectedTypes] = useState<ExportType[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [errorArr, setErrorArr] = useState<string[] | undefined>(undefined);
  const [privateKey, setPrivateKey] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('');
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [jsonData, setJsonData] = useState<null | KeyringPair$Json>(null);
  const toast = useToast();
  useHandlerHardwareBackPress(isBusy);
  const account = useGetAccountByAddress(address);
  const seedItems = useMemo<SeedWordDataType[]>(() => {
    return seedPhrase.split(' ').map((word, index) => {
      return {
        key: `${index}-${word}`,
        title: word,
        prefixText: `${index + 1}`.padStart(2, '0'),
      };
    });
  }, [seedPhrase]);

  const qrData = useMemo((): string => {
    const prefix = 'secret';
    const result: string[] = [prefix, privateKey || '', publicKey];

    if (account?.name) {
      result.push(account.name);
    }

    return result.join(':');
  }, [account?.name, publicKey, privateKey]);

  const onPressSubmit = useCallback(() => {
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
        .catch(() => setErrorArr(['Invalid password']))
        .finally(() => {
          setIsBusy(false);
        });
    }, 500);
  }, [account, address, password, selectedTypes]);

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    toast.hideAll();
    toast.show(i18n.common.copiedToClipboard);
  };

  const renderSeedWord = (item: SeedWordDataType) => {
    return <SeedWord style={seedWordStyle} key={item.key} prefixText={item.prefixText} title={item.title} disabled />;
  };

  const renderCopyBtn = () => {
    return (
      <View style={{ alignItems: 'center' }}>
        <Button
          type="ghost"
          size={'xs'}
          onPress={() => copyToClipboard(privateKey)}
          icon={<Icon phosphorIcon={CopySimple} size={'md'} iconColor={theme.colorTextLight4} />}>
          {i18n.common.copyToClipboard}
        </Button>
      </View>
    );
  };

  const onPressDone = () => {
    navigation.goBack();
  };

  const title = useMemo(() => {
    const exportSingle = selectedTypes.length <= 1;
    if (currentViewStep === ViewStep.SELECT_TYPES) {
      return i18n.title.exportAccount;
    } else {
      if (!exportSingle) {
        return 'Export successful';
      } else {
        return titleMap[selectedTypes[0]];
      }
    }
  }, [currentViewStep, selectedTypes]);

  return (
    <SubScreenContainer navigation={navigation} disabled={isBusy} title={title}>
      <View style={layoutContainerStyle}>
        <ScrollView style={bodyAreaStyle}>
          <Warning
            style={{ marginTop: 16 }}
            title={'Warning: Never disclose this key'}
            message={'Anyone with your keys can steal any assets held in your account.'}
          />

          {currentViewStep === ViewStep.SELECT_TYPES && (
            <SelectExportType
              styles={{ marginTop: 16 }}
              selectedItems={selectedTypes}
              setSelectedItems={setSelectedTypes}
            />
          )}

          {currentViewStep === ViewStep.SHOW_RS && (
            <>
              {selectedTypes.includes(ExportType.PRIVATE_KEY) && (
                <View style={{ marginTop: theme.marginLG }}>
                  <Typography.Text style={blockTitleStyle} size={'sm'}>
                    YOUR PRIVATE KEY
                  </Typography.Text>
                  <View style={rsBlockStyle}>
                    <Typography.Text style={blockTextStyle}>{privateKey}</Typography.Text>
                  </View>
                  {renderCopyBtn()}
                </View>
              )}

              {selectedTypes.includes(ExportType.SEED_PHRASE) && (
                <View style={{ marginTop: theme.marginLG }}>
                  <Typography.Text style={blockTitleStyle} size={'sm'}>
                    YOUR SEED PHRASE
                  </Typography.Text>
                  <View style={phraseBlockStyle}>{seedItems.map(renderSeedWord)}</View>
                  {renderCopyBtn()}
                </View>
              )}

              {selectedTypes.includes(ExportType.QR_CODE) && (
                <View style={{ marginTop: theme.marginLG }}>
                  <Typography.Text style={blockTitleStyle} size={'sm'}>
                    YOUR QR
                  </Typography.Text>
                  <View style={{ alignItems: 'center', marginBottom: 16 }}>
                    <QRCode errorLevel={'H'} value={qrData} />
                  </View>

                  {renderCopyBtn()}
                </View>
              )}

              {selectedTypes.includes(ExportType.JSON_FILE) && (
                <View style={{ marginTop: theme.marginLG }}>
                  <Typography.Text style={blockTitleStyle} size={'sm'}>
                    YOUR JSON FILE
                  </Typography.Text>
                  <View style={rsBlockStyle}>
                    <Typography.Text style={blockTextStyle}>{JSON.stringify(jsonData)}</Typography.Text>
                  </View>
                  {renderCopyBtn()}
                </View>
              )}
            </>
          )}
        </ScrollView>

        <View style={footerAreaStyle}>
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
          closeModal={() => setModalVisible(false)}
          isBusy={isBusy}
          onConfirm={onPressSubmit}
          errorArr={errorArr}
          setErrorArr={setErrorArr}
          onChangePassword={setPassword}
        />
      </View>
    </SubScreenContainer>
  );
};
