import { StyleSheet } from "react-native";

import { COLORS, FONT, SIZES, SHADOWS } from "../../constants";
import { app } from "../../firebase/firebase";

const appStyles = StyleSheet.create({
    buttonPadding: {
        paddingLeft: 10,
    },
    headerFont: {
        fontFamily: FONT.bold,
        fontSize: SIZES.mediumlarge,
    },
    bottomTabLabel: {
        fontFamily: FONT.regular,
        fontSize: SIZES.xSmall,
        paddingBottom: 3,
    },
})

export default appStyles;
