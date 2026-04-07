// Design tokens — single source of truth for the whole app
export const T = {
  // Brand blues
  blue:     "#4D93F8",
  blueDark: "#2A51C1",
  blueDeep: "#1A3A9F",
  blueSoft: "#EBF2FF",
  blueMid:  "#C6DCFC",

  // Neutrals
  white:    "#FFFFFF",
  bg:       "#F7F8FC",
  bgCard:   "#FFFFFF",
  border:   "#E8ECF4",
  borderMid:"#D1D9EE",

  // Text
  text:     "#0D1B3E",
  textMid:  "#4A5578",
  textSoft: "#8B94B3",

  // Status / accent
  green:    "#10B981",
  greenSoft:"#D1FAE5",
  amber:    "#F59E0B",
  amberSoft:"#FEF3C7",
  red:      "#EF4444",
  redSoft:  "#FEE2E2",
  purple:   "#8B5CF6",
  purpleSoft:"#EDE9FE",
  teal:     "#14B8A6",
  tealSoft: "#CCFBF1",
  orange:   "#F97316",
  orangeSoft:"#FFEDD5",

  // Shore colours
  shores: {
    onsite:   "#2A51C1",
    offshore: "#F59E0B",
    nearMX:   "#10B981",
    nearMA:   "#EF4444",
    alchemy:  "#8B5CF6",
  },

  // Shadows
  shadow:   "0 1px 4px rgba(13,27,62,0.06), 0 4px 16px rgba(13,27,62,0.04)",
  shadowMd: "0 4px 20px rgba(13,27,62,0.10)",
  shadowLg: "0 8px 40px rgba(13,27,62,0.14)",

  // Radii
  r:    "8px",
  rMd:  "12px",
  rLg:  "16px",
  rXl:  "20px",
};

export const font = {
  display: "'DM Sans', 'Segoe UI', sans-serif",
  body:    "'DM Sans', 'Segoe UI', sans-serif",
  mono:    "'JetBrains Mono', 'Fira Code', monospace",
};

// Shared component styles
export const card = {
  background: T.bgCard,
  borderRadius: T.rMd,
  border: `1px solid ${T.border}`,
  boxShadow: T.shadow,
  padding: "20px",
};

export const cardSm = {
  ...card,
  padding: "14px 16px",
};

// Chip / badge
export function statusColor(status) {
  switch(status) {
    case "Active":     return { bg: T.greenSoft,  text: T.green  };
    case "Draft":      return { bg: T.amberSoft,  text: T.amber  };
    case "Won":        return { bg: T.blueSoft,   text: T.blueDark};
    case "Lost":       return { bg: T.redSoft,    text: T.red    };
    case "Pipeline":   return { bg: T.purpleSoft, text: T.purple };
    default:           return { bg: T.border,     text: T.textMid};
  }
}

export const RACI_COLOR = { R: T.green, A: T.red, C: T.amber, I: T.textSoft };
export const RACI_BG    = { R: T.greenSoft, A: T.redSoft, C: T.amberSoft, I: T.border };
