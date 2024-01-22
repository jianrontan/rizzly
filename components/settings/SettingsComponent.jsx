import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Switch } from 'react-native-switch';
import { useDrawerStatus } from '@react-navigation/drawer';

import { COLORS, FONT, SIZES } from '../../constants';

const SettingsComponent = ({ settingsOptions, isEnabled, setIsEnabled, fieldName, updateFirestore }) => {
    const toggleSwitch = () => {
        const newState = !isEnabled;
        setIsEnabled(newState);
        updateFirestore(fieldName, newState)
    }

    return (
        <SafeAreaView>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                {settingsOptions.map(({ title, subTitle }, index) =>
                    <TouchableOpacity key={title}>
                        <View style={{
                            paddingHorizontal: 20,
                            paddingTop: 20,
                            paddingBottom: 20,
                        }}>
                            <Text style={{ fontFamily: FONT.medium, fontSize: SIZES.medium, color: COLORS.themeColor }}>{title}</Text>
                            {subTitle && <Text style={{ fontFamily: FONT.regular, fontSize: SIZES.small, color: COLORS.lightThemeColor }}>{subTitle}</Text>}
                        </View>
                    </TouchableOpacity>
                )}
                <View
                    style={{
                        paddingHorizontal: 20,
                        paddingTop: 20,
                        paddingBottom: 20,
                        justifyContent: 'center',
                    }}
                >
                    <Switch
                        value={isEnabled}
                        onValueChange={toggleSwitch}
                        disabled={false}
                        activeText={'On'}
                        inActiveText={'Off'}
                        circleSize={25}
                        barHeight={20}
                        circleBorderWidth={1}
                        circleBorderActiveColor={COLORS.themeColor}
                        circleBorderInactiveColor={'#c9beb1'}
                        backgroundActive={COLORS.themeColor}
                        backgroundInactive={'#c9beb1'}
                        circleActiveColor={COLORS.lightBeige}
                        circleInActiveColor={COLORS.lightBeige}
                        changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                        innerCircleStyle={{ alignItems: "center", justifyContent: "center" }} // style for inner animated circle for what you (may) be rendering inside the circle
                        outerCircleStyle={{}} // style for outer animated circle
                        renderActiveText={false}
                        renderInActiveText={false}
                        switchLeftPx={2} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                        switchRightPx={2} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                        switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
                        switchBorderRadius={20} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                    />
                </View>
            </View>
            <View style={{ borderBottomColor: COLORS.sepGrayBeige, borderBottomWidth: 1 }}></View>
        </SafeAreaView>
    );
};

export default SettingsComponent;