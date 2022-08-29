import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { FontMedium, MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { SelectItem } from 'components/SelectItem';
import { ColorMap } from 'styles/color';
import { Activity, Barricade, CirclesThreePlus, IconProps, ListChecks, Trophy } from 'phosphor-react-native';
import { getNetworkLogo } from 'utils/index';
import { SubmitButton } from 'components/SubmitButton';
import useFormControl from 'hooks/screen/useFormControl';
import { FilterOptsType } from 'types/ui-types';

interface Props {
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  filterOpts: FilterOptsType;
  onChangeFilterOpts: (data: FilterOptsType) => void;
}

interface FilterOptionType {
  label: string;
  icon: JSX.Element;
}

const crowdloanFilterLabelStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.disabled,
  ...FontMedium,
  paddingTop: 12,
  paddingBottom: 12,
};
function getLeftIcon(icon: (iconProps: IconProps) => JSX.Element) {
  const Icon = icon;
  return <Icon size={20} color={ColorMap.disabled} weight={'bold'} />;
}

const parachainFilterOptions: Record<string, FilterOptionType> = {
  all: {
    label: 'All Parachains',
    icon: getLeftIcon(CirclesThreePlus),
  },
  polkadot: {
    label: 'Polkadot Parachain',
    icon: getNetworkLogo('polkadot', 20),
  },
  kusama: {
    label: 'Kusama Parachain',
    icon: getNetworkLogo('kusama', 20),
  },
};

const crowdloanStatusFilterOptions: Record<string, FilterOptionType> = {
  all: {
    label: 'All Projects',
    icon: getLeftIcon(ListChecks),
  },
  completed: {
    label: 'Winner',
    icon: getLeftIcon(Trophy),
  },
  fail: {
    label: 'Fail',
    icon: getLeftIcon(Barricade),
  },
  ongoing: {
    label: 'Active',
    icon: getLeftIcon(Activity),
  },
};

const crowdloanFilterConfig = {
  paraChain: {
    name: 'Parachain',
    value: 'all',
  },
  crowdloanStatus: {
    name: 'Crowdloan Status',
    value: 'all',
  },
};

export const CrowdloanFilter = ({ modalVisible, onChangeModalVisible, filterOpts, onChangeFilterOpts }: Props) => {
  const { formState, onChangeValue } = useFormControl(crowdloanFilterConfig, {});

  const onPressBack = () => {
    onChangeValue('paraChain')(filterOpts.paraChain);
    onChangeValue('crowdloanStatus')(filterOpts.crowdloanStatus);
    onChangeModalVisible();
  };

  const onApplyChange = () => {
    onChangeFilterOpts({ ...formState.data });
    onChangeModalVisible();
  };

  return (
    <SubWalletFullSizeModal
      modalVisible={modalVisible}
      onChangeModalVisible={onChangeModalVisible}
      modalStyle={{ paddingTop: 0 }}>
      <ContainerWithSubHeader title={'Filters'} onPressBack={onPressBack} style={{ flex: 1, width: '100%' }}>
        <View style={{ ...sharedStyles.layoutContainer }}>
          <View style={{ flex: 1 }}>
            <Text style={crowdloanFilterLabelStyle}>{formState.labels.paraChain}</Text>
            {Object.keys(parachainFilterOptions).map(opt => (
              <SelectItem
                key={opt}
                label={parachainFilterOptions[opt].label}
                isSelected={opt === formState.data.paraChain}
                onPress={() => onChangeValue('paraChain')(opt)}
                showSeparator={false}
                leftIcon={parachainFilterOptions[opt].icon}
              />
            ))}

            <Text style={crowdloanFilterLabelStyle}>{formState.labels.crowdloanStatus}</Text>
            {Object.keys(crowdloanStatusFilterOptions).map(opt => (
              <SelectItem
                key={opt}
                label={crowdloanStatusFilterOptions[opt].label}
                isSelected={opt === formState.data.crowdloanStatus}
                onPress={() => onChangeValue('crowdloanStatus')(opt)}
                showSeparator={false}
                leftIcon={crowdloanStatusFilterOptions[opt].icon}
              />
            ))}
          </View>

          <SubmitButton title={'Apply'} style={{ ...MarginBottomForSubmitButton }} onPress={onApplyChange} />
        </View>
      </ContainerWithSubHeader>
    </SubWalletFullSizeModal>
  );
};
