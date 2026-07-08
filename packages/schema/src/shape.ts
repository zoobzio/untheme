import type { Shape, Rule, Enum, Template, Type } from "./types";

import {
  borderOf,
  gradientOf,
  shadowOf,
  strokeStyleOf,
  transitionOf,
  typographyOf,
} from "./composite";
import {
  literalColor,
  literalCubicBezier,
  literalDimension,
  literalDuration,
  literalFontFamily,
  literalFontWeight,
  literalNumber,
} from "./scalar";
import { all, reference, referenceType, valued } from "./util";

/**
 * Assembles the {@link Shape} rules for a template: for each token type, the
 * rule for its literal form and the rule for a value in that position. The
 * scalar literal rules come from `./scalar`; the composite literal rules are
 * built from `./composite`, each fed the value rules for the sub-values its
 * slots hold. The value rule for a type wraps its literal with a same-type
 * reference check, so a slot accepts an alias to a token of its type or a
 * structured value in place. Composite value rules are built in dependency
 * order — a composite whose slots reference another composite is built after
 * that one's value rule exists.
 *
 * @param enums - The template's sets, supplying the token and type lookups a
 *   reference is checked against.
 */
export const defineShape = <T extends Template>(enums: Enum<T>): Shape => {
  const referenceOf = (type: Type): Rule =>
    all([
      reference("Reference", enums.tokens),
      referenceType("Reference", enums.types, type),
    ]);

  const color = valued(referenceOf("color"), literalColor);
  const dimension = valued(referenceOf("dimension"), literalDimension);
  const duration = valued(referenceOf("duration"), literalDuration);
  const fontFamily = valued(referenceOf("fontFamily"), literalFontFamily);
  const fontWeight = valued(referenceOf("fontWeight"), literalFontWeight);
  const number = valued(referenceOf("number"), literalNumber);
  const cubicBezier = valued(referenceOf("cubicBezier"), literalCubicBezier);

  const literalStrokeStyle = strokeStyleOf(dimension);
  const strokeStyle = valued(referenceOf("strokeStyle"), literalStrokeStyle);

  const literalBorder = borderOf(color, dimension, strokeStyle);
  const border = valued(referenceOf("border"), literalBorder);

  const literalTransition = transitionOf(duration, cubicBezier);
  const transition = valued(referenceOf("transition"), literalTransition);

  const literalShadow = shadowOf(color, dimension, referenceOf("shadow"));
  const shadow = valued(referenceOf("shadow"), literalShadow);

  const literalGradient = gradientOf(color, number);
  const gradient = valued(referenceOf("gradient"), literalGradient);

  const literalTypography = typographyOf(
    fontFamily,
    dimension,
    fontWeight,
    number,
  );
  const typography = valued(referenceOf("typography"), literalTypography);

  return {
    color: { literal: literalColor, value: color },
    dimension: { literal: literalDimension, value: dimension },
    duration: { literal: literalDuration, value: duration },
    fontFamily: { literal: literalFontFamily, value: fontFamily },
    fontWeight: { literal: literalFontWeight, value: fontWeight },
    number: { literal: literalNumber, value: number },
    cubicBezier: { literal: literalCubicBezier, value: cubicBezier },
    strokeStyle: { literal: literalStrokeStyle, value: strokeStyle },
    border: { literal: literalBorder, value: border },
    transition: { literal: literalTransition, value: transition },
    shadow: { literal: literalShadow, value: shadow },
    gradient: { literal: literalGradient, value: gradient },
    typography: { literal: literalTypography, value: typography },
  };
};
