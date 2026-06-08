import type { UnthemeFactory } from "./types";

/**
 * Creates a runtime {@link Untheme} instance from a {@link Theme} definition.
 *
 * @param theme - The theme definition containing reference, system, and role tokens.
 * @param mode - The initial color mode.
 * @returns An {@link Untheme} instance for token access, mutation, and mode toggling.
 */
export const defineUntheme: UnthemeFactory = (theme, mode) => {
  type Theme = typeof theme;
  type Ref = keyof Theme["reference"];
  type Sys = keyof Theme["modes"]["dark"];
  type Role = keyof Theme["roles"];
  return {
    get theme() {
      return theme;
    },

    set theme(t) {
      theme = t;
    },

    get mode() {
      return mode;
    },

    set mode(m) {
      mode = m;
    },

    get tokens() {
      return {
        ...this.theme.reference,
        ...this.theme.modes[mode],
        ...this.theme.roles,
      };
    },

    resolve(token) {
      const val = this.tokens[token];
      return this.isToken(val) ? this.resolve(val) : val;
    },

    update(token, value) {
      if (this.isRole(token) && (this.isRef(value) || this.isSys(value))) {
        this.theme.roles[token] = value;
        return;
      }
      if (this.isSys(token) && this.isRef(value)) {
        this.theme.modes[mode][token] = value;
        return;
      }
      if (this.isRef(token)) {
        this.theme.reference[token] = value;
        return;
      }
    },

    isRef(v: string): v is Ref {
      return v in this.theme.reference;
    },

    isSys(v: string): v is Sys {
      return v in this.theme.modes[this.mode];
    },

    isRole(v: string): v is Role {
      return v in this.theme.roles;
    },

    isToken(v: string): v is Ref | Sys | Role {
      return this.isRef(v) || this.isSys(v) || this.isRole(v);
    },
  };
};
