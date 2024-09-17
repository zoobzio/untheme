declare const themes: any;
export type Theme = (typeof themes)[number];
export declare const useThemes: () => any;
export declare const useTheme: () => any;
export declare const useMode: () => any;
export declare function useUntheme(): {
    mode: any;
    theme: any;
    tokens: any;
    resolve: any;
};
export declare function useUnthemeRoot(): any;
export {};
