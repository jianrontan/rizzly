import { StyleSheet } from "react-native";

import { COLORS, FONT, SIZES, SHADOWS } from "../../constants";

const appStyles = StyleSheet.create({
    buttonPadding: {
        paddingLeft: 10,
    },
    headerFont: {
        fontFamily: FONT.bold,
        fontSize: SIZES.mediumlarge,
    },
    headerFont2: {
        fontFamily: FONT.bold,
        fontSize: SIZES.mediumlarge,
        color: "white"
    },
    bottomTabLabel: {
        fontFamily: FONT.regular,
        fontSize: SIZES.xSmall,
        paddingBottom: 3,
    },
    logoutDrawer: {
        paddingTop: SIZES.mediumlarge,
        paddingLeft: SIZES.mediumlarge,
    },
    logoutDrawerText: {
        fontFamily: FONT.medium,
        color: "white"
    },
})

export default appStyles;
