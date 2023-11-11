const COLORS = {
  primary: "#312651",
  secondary: "#444262",
  tertiary: "#FF7754",

  gray: "#83829A",
  gray2: "#C1C0C8",

  white: "#F3F4F8",
  lightWhite: "#FAFAFC",
  lightBeige: "#f7e2cb",
  grayBeige: "#edd8c0",
  sepGrayBeige: "#ccbdab",
  darkBeige: "#e6d2bc",
  darkThemeColor: "#592615",
  themeColor: "#6e4639",
  lightThemeColor: "#69524b",
  errorRed: "#cf0202",
  brownRed: "#b50202",
  linkBlue: "#4643f7",
};

const FONT = {
  regular: "MontReg",
  medium: "MontMed",
  bold: "MontBold",
};

const SIZES = {
  xSmall: 10,
  small: 12,
  smallmedium: 14,
  medium: 16,
  mediumlarge: 18,
  large: 20,
  xLarge: 24,
  xmLarge: 28,
  xxLarge: 32,
};

const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  },
};

export { COLORS, FONT, SIZES, SHADOWS };
