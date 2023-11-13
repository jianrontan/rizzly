import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  errorText: {
    fontFamily: "Lobster",
    fontSize: 11,
    color: COLORS.errorRed,
    paddingLeft: 8,
    paddingBottom: SIZES.medium,
  },
  signupView: {
    paddingTop: SIZES.mediumlarge,
    paddingBottom: SIZES.xLarge,
    paddingLeft: 8,
  },
  signupInput: {
    fontFamily: "Lobster",
    fontSize: SIZES.small,
  },
  signupButton: {
    width: 80,
    height: 40,
    backgroundColor: COLORS.brown,
    borderRadius: SIZES.small / 1.25,
    borderWidth: 1.5,
    borderColor: COLORS.themeColor,
    alignItems: "center",
    justifyContent: "center",
  },
  signupText: {
    fontFamily: "Lobster",
    fontSize: SIZES.smallmedium,
    color: COLORS.themeColor,
  },
  resetButton: {
    width: 160,
    height: 40,
    backgroundColor: COLORS.brown,
    borderRadius: SIZES.small / 1.25,
    borderWidth: 1.5,
    borderColor: COLORS.themeColor,
    alignItems: "center",
    justifyContent: "center",
  },
  noAccountText: {
    fontFamily: "Lobster",
    fontSize: SIZES.small,
    color: COLORS.themeColor,
  },
  forgotText: {
    fontFamily: "Lobster",
    fontSize: SIZES.small,
    color: COLORS.linkBlue,
  },
  text: {
    fontFamily: "Lobster",
    fontSize: SIZES.smallmedium,
    color: COLORS.black,
  },
});

export default styles;
