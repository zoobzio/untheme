export type UnthemeColorShade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950;

export type UnthemeColor = {
  [Shade in UnthemeColorShade]: string;
};

export type UnthemeColorPack<Color extends string> = {
  [C in Color]: UnthemeColor;
};
