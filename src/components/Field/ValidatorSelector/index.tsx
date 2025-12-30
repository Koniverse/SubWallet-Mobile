import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View } from 'react-native';
import { Book, Lightning } from 'phosphor-react-native';
import { ActivityIndicator, Button, Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { toShort } from 'utils/index';
import AvatarGroup from 'components/common/AvatarGroup';
import { FontSemiBold } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { ThemeTypes } from 'styles/themes';

interface Props extends FieldBaseProps {
  outerStyle?: StyleProp<any>;
  value?: string;
  placeholder?: string;
  loading?: boolean;
  showLightningBtn?: boolean;
  onPressBookBtn?: () => void;
  onPressLightningBtn?: () => void;
  disabled?: boolean;
  chain: string;
}

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingLeft: 12,
  paddingRight: 6,
  paddingBottom: 4,
};

const textStyle: StyleProp<any> = {
  fontSize: 14,
  lineHeight: 22,
  ...FontSemiBold,
  color: 'rgba(255, 255, 255, 0.85)',
  flex: 1,
};

export const ValidatorSelectorField = ({
  outerStyle,
  value,
  label,
  placeholder,
  loading,
  onPressBookBtn,
  onPressLightningBtn,
  showLightningBtn = false,
  disabled,
  chain,
  ...fieldBase
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);
  const isBittensorChain = useMemo(() => {
    return chain === 'bittensor';
  }, [chain]);

  const addressList = useMemo(() => {
    if (value) {
      const _addressList: string[] = value.split(',').map(item => {
        const itemInfo = item.split('___');

        return itemInfo[0];
      });

      return _addressList;
    } else {
      return [];
    }
  }, [value]);

  const renderContent = () => {
    if (!value) {
      return <Text style={textStyle}>{placeholder || 'Selected validator'}</Text>;
    }

    if (isBittensorChain) {
      const [address, name] = value.split('___');

      return (
        <Text numberOfLines={1} style={textStyle}>
          {name || toShort(address)}
        </Text>
      );
    }

    const valueList = value.split(',');

    if (valueList.length > 1) {
      return <Text style={textStyle}>{i18n.formatString(i18n.message.selectedXValidator, valueList.length)}</Text>;
    }

    return (
      <Text numberOfLines={1} style={textStyle}>
        {valueList[0].split('___')[1] || toShort(valueList[0].split('___')[0])}
      </Text>
    );
  };

  return (
    <FieldBase label={label} {...fieldBase} outerStyle={outerStyle}>
      <View style={[blockContentStyle, !label && styles.noLabelStyle]}>
        <View style={styles.leftArea}>
          {!!addressList.length && (
            <View style={styles.avatarGroupWrapper}>
              <AvatarGroup avatarSize={20} addresses={isBittensorChain ? [addressList[0]] : addressList} />
            </View>
          )}

          {renderContent()}
        </View>

        {loading ? (
          <View style={styles.indicatorWrapper}>
            <ActivityIndicator size={20} indicatorColor={theme.colorWhite} />
          </View>
        ) : (
          <View style={styles.buttonWrapper}>
            <Button
              size={'xs'}
              type={'ghost'}
              disabled={disabled}
              icon={
                <Icon
                  phosphorIcon={Book}
                  size={'sm'}
                  iconColor={disabled ? theme.colorTextLight5 : theme.colorTextLight3}
                />
              }
              onPress={onPressBookBtn}
            />
            {showLightningBtn && (
              <Button
                size={'xs'}
                type={'ghost'}
                disabled={disabled}
                icon={
                  <Icon
                    phosphorIcon={Lightning}
                    size={'sm'}
                    iconColor={disabled ? theme.colorTextLight5 : theme.colorTextLight3}
                  />
                }
                onPress={onPressLightningBtn}
              />
            )}
          </View>
        )}
      </View>
    </FieldBase>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    noLabelStyle: { paddingTop: theme.paddingSM },
    leftArea: { flexDirection: 'row', flex: 1, alignItems: 'center' },
    avatarGroupWrapper: { paddingRight: 8 },
    indicatorWrapper: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    buttonWrapper: { flexDirection: 'row' },
  });
}
