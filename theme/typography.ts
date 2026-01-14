import { normalize } from "./scale";

export const typography = {
  h1: { fontSize: normalize(32), fontWeight: "900" as const },
  h2: { fontSize: normalize(28), fontWeight: "800" as const },
  h3: { fontSize: normalize(24), fontWeight: "700" as const },
  h4: { fontSize: normalize(22), fontWeight: "600" as const },
  h5: { fontSize: normalize(20), fontWeight: "500" as const },
  h6: { fontSize: normalize(18), fontWeight: "400" as const },
  subtitle1: { fontSize: normalize(16), fontWeight: "400" as const },
  subtitle2: { fontSize: normalize(14), fontWeight: "400" as const },
  body1: { fontSize: normalize(16), fontWeight: "400" as const },
  body2: { fontSize: normalize(14), fontWeight: "400" as const },
  button: { fontSize: normalize(16), fontWeight: "600" as const },
};
