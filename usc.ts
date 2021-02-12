import Snapdragon from "snapdragon";
import capture from "snapdragon-capture";
import captureSet from "snapdragon-capture-set";

import assert from "assert";
import util from "util";

enum TokenType {
  Feet = "Feet",
  Inches = "Inches",
  Fraction = "Fraction",
  Feet_Inches = "Feet_Inches",
  Inches_Fraction = "Inches_Fraction",
  Feet_Inches_Fraction = "Feet_Inches_Fraction",
  Operator_Plus = "Operator_Plus",
  Operator_Minus = "Operator_Minus",
  Paren = "Paren",
  Whitespace = "Whitespace",
}

type TokenNode = {
  type: TokenType;
  val?: InchesWithNormalizedFraction;
  nodes?: TokenNode[];
};

/**
 * Foundational immutable class to represent a positive USCU length in inches.
 * Only handles up to one-sixteenth inch-fractions.
 * https://en.wikipedia.org/wiki/United_States_customary_units#Units_of_length
 */

export class InchesWithNormalizedFraction {
  /** Only positive integers. */
  readonly wholeInches: number;

  /** Only positive integers 0-15. */
  readonly numerator16: number;

  constructor(wholeInches: number, numerator16: number) {
    assert(Math.floor(wholeInches) === wholeInches);
    assert(wholeInches >= 0);
    assert(Math.floor(numerator16) === numerator16);
    assert(numerator16 >= 0 && numerator16 <= 15);

    this.wholeInches = wholeInches;
    this.numerator16 = numerator16;
  }

  /**
   * Handles cases where inchesNumerator > 15.
   */
  static createFromMinimalFractionalInches(
    wholeInches: number,
    inchesNumerator16: number
  ) {
    const additionalInches = Math.floor(inchesNumerator16 / 16);
    const remainderInchesNumerator = inchesNumerator16 % 16;
    // console.log({ inches, inchesNumerator, additionalInches, remainderInchesNumerator });
    return new InchesWithNormalizedFraction(
      wholeInches + additionalInches,
      remainderInchesNumerator
    );
  }

  toString() {
    const feet = Math.floor(this.wholeInches / 12);
    const inches = this.wholeInches % 12;

    //--

    let feetStr = "",
      inchesStr = "",
      fractionStr = "";
    if (feet > 0) {
      feetStr = feet.toString();
    }
    if (inches > 0) {
      inchesStr = inches.toString();
    }
    if (this.numerator16 > 0) {
      switch (this.numerator16) {
        case 1:
          fractionStr = "1/16";
          break;
        case 2:
          fractionStr = "1/8";
          break;
        case 3:
          fractionStr = "3/16";
          break;
        case 4:
          fractionStr = "1/4";
          break;
        case 5:
          fractionStr = "5/16";
          break;
        case 6:
          fractionStr = "3/8";
          break;
        case 7:
          fractionStr = "7/16";
          break;
        case 8:
          fractionStr = "1/2";
          break;
        case 9:
          fractionStr = "9/16";
          break;
        case 10:
          fractionStr = "5/8";
          break;
        case 11:
          fractionStr = "11/16";
          break;
        case 12:
          fractionStr = "3/4";
          break;
        case 13:
          fractionStr = "13/16";
          break;
        case 14:
          fractionStr = "7/8";
          break;
        case 15:
          fractionStr = "15/16";
          break;
        default:
          assert(this.numerator16 >= 0 && this.numerator16 <= 15);
          break;
      }
    }

    //--

    // console.log({
    //   wholeInches: this.wholeInches,
    //   numerator16: this.numerator16,
    //   feetStr,
    //   inchesStr,
    //   inchesFractionStr: fractionStr,
    // });
    if (feetStr) {
      if (inchesStr) {
        if (fractionStr) {
          // 1' 2-3/4"
          return `${feetStr}' ${inchesStr}-${fractionStr}"`;
        } else {
          // 1' 2"
          return `${feetStr}' ${inchesStr}"`;
        }
      } else {
        if (fractionStr) {
          // 1' 3/4"
          return `${feetStr}' ${fractionStr}"`;
        } else {
          // 1'
          return `${feetStr}'`;
        }
      }
    } else {
      if (inchesStr) {
        if (fractionStr) {
          // 2-3/4"
          return `${inchesStr}-${fractionStr}"`;
        } else {
          // 2"
          return `${inchesStr}"`;
        }
      } else {
        if (fractionStr) {
          // 3/4"
          return `${fractionStr}"`;
        } else {
          // 0"
          return '0"';
        }
      }
    }
  }

  static normalizeToDenominator16(
    inchesNumerator: number,
    inchesDenominator: number
  ) {
    assert(inchesNumerator >= 0);
    assert(inchesDenominator >= 0);

    const precentage = inchesNumerator / inchesDenominator;

    if (precentage < 1 / 16) {
      return 0;
    } else if (precentage < 2 / 16) {
      return 1;
    } else if (precentage < 3 / 16) {
      return 2;
    } else if (precentage < 4 / 16) {
      return 3;
    } else if (precentage < 5 / 16) {
      return 4;
    } else if (precentage < 6 / 16) {
      return 5;
    } else if (precentage < 7 / 16) {
      return 6;
    } else if (precentage < 8 / 16) {
      return 7;
    } else if (precentage < 9 / 16) {
      return 8;
    } else if (precentage < 10 / 16) {
      return 9;
    } else if (precentage < 11 / 16) {
      return 10;
    } else if (precentage < 12 / 16) {
      return 11;
    } else if (precentage < 13 / 16) {
      return 12;
    } else if (precentage < 14 / 16) {
      return 13;
    } else if (precentage < 15 / 16) {
      return 14;
    } else if (precentage < 16 / 16) {
      return 15;
    } else {
      return 16;
    }
  }

  add(rhs: InchesWithNormalizedFraction) {
    return InchesWithNormalizedFraction.createFromMinimalFractionalInches(
      this.wholeInches + rhs.wholeInches,
      this.numerator16 + rhs.numerator16
    );
  }
}

export function usc(strings: TemplateStringsArray) {
  const snapdragon = new Snapdragon();
  const ast = snapdragon.parser
    .use(capture())
    .use(captureSet())
    .captureSet(TokenType.Paren, /^\(/, /^\)/)
    .set(TokenType.Feet_Inches_Fraction, function (this: any) {
      // 1' 2-3/4"
      const m = this.match(/^(\d+)'\s+(\d+)-(\d+)\/(\d+)"/);
      if (m) {
        // TODO
        return this.position()(`${m[1]}' ${m[2]}-${m[3]}/${m[4]}`);
      }
    })
    .set(TokenType.Feet_Inches, function (this: any) {
      // 1' 2"
      const m = this.match(/^(\d+)'\s+(\d+)"/);
      if (m) {
        // TODO
        return this.position()(`${m[1]}' ${m[2]}`);
      }
    })
    .set(TokenType.Inches_Fraction, function (this: any) {
      // 2-3/4"
      // const m = this.match(/^(\d+)-(\d+)\/(\d+)"/);
      const m = this.match(
        /^(?<inches>\d+)-(?<numerator>\d+)\/(?<denominator>\d+)"/
      );
      if (m) {
        return this.position()({
          val: InchesWithNormalizedFraction.createFromMinimalFractionalInches(
            parseInt(m.groups.inches, 10),
            InchesWithNormalizedFraction.normalizeToDenominator16(
              parseInt(m.groups.numerator, 10),
              parseInt(m.groups.denominator, 10)
            )
          ),
        });
      }
    })
    .set(TokenType.Fraction, function (this: any) {
      // 1/16"
      const m = this.match(/^(?<numerator>\d+)\/(?<denominator>\d+)"/);
      if (m) {
        return this.position()({
          val: InchesWithNormalizedFraction.createFromMinimalFractionalInches(
            0,
            InchesWithNormalizedFraction.normalizeToDenominator16(
              parseInt(m.groups.numerator, 10),
              parseInt(m.groups.denominator, 10)
            )
          ),
        });
      }
    })
    .set(TokenType.Feet, function (this: any) {
      // 1'
      const m = this.match(/^(?<feet>\d+)'/);
      if (m) {
        return this.position()({
          val: InchesWithNormalizedFraction.createFromMinimalFractionalInches(
            parseInt(m.groups.feet, 10) * 12,
            0
          ),
        });
      }
    })
    .set(TokenType.Inches, function (this: any) {
      // 2"
      const m = this.match(/^(?<inches>\d+)"/);
      if (m) {
        return this.position()({
          val: InchesWithNormalizedFraction.createFromMinimalFractionalInches(
            parseInt(m.groups.inches, 10),
            0
          ),
        });
      }
    })
    .capture(TokenType.Whitespace, /^\s+/)
    .capture(TokenType.Operator_Plus, /^\+/)
    .capture(TokenType.Operator_Minus, /^\-/)
    .parse(strings.join(""));

  return evalExpression(
    ast.nodes.filter((node: any) => node.type !== "bos" && node.type !== "eos")
  ).toString();
}

function evalExpression(nodes: TokenNode[]): InchesWithNormalizedFraction {
  nodes = nodes.filter((node) => node.type !== TokenType.Whitespace);
  switch (nodes.length) {
    case 1:
      if (nodes[0].type === TokenType.Paren) {
        return evalExpression(nodes[0].nodes!);
      } else if (isValue(nodes[0].type)) {
        return nodes[0].val!;
      } else {
        throw Error(`Unknown node ${errObj(nodes)}`);
      }
      break;
    case 2:
      throw Error(`Just two nodes ${errObj(nodes)}`);
      break;
    case 3:
      {
        if (!isOperator(nodes[1].type))
          throw Error(
            `Expected operator is not an operator ${errObj(nodes[1])}`
          );

        const lhsValue = evalValueOrParen(nodes[0]);
        const operator = nodes[1].type;
        const rhsValue = evalValueOrParen(nodes[2]);
        return evalOperation(lhsValue, operator, rhsValue);
      }
      break;
    case 4:
      throw Error(`Just four nodes ${errObj(nodes)}`);
      break;
    default:
      // Even numbers of nodes are probably errors.
      throw Error(`TODO arbitrary nodes.length: ${errObj(nodes)}`);
  }
}

function errObj(obj: any) {
  return util.inspect(obj, { depth: 3, compact: true });
}

function evalValueOrParen(node: TokenNode): InchesWithNormalizedFraction {
  if (node.type === TokenType.Paren) {
    return evalExpression(node.nodes!);
  } else {
    if (!isValue(node.type)) throw Error(`Not a value ${errObj(node)}`);
    return node.val!;
  }
}

/*function evalSubtree(nodes: TokenNode[]) {
  // expression or a value
  // expr: 1' + 2' + 3' => value
  nodes = nodes.filter((node) => node.type !== TokenType.Whitespace);
  switch (nodes[0].type) {
    case TokenType.Fraction:
      if (nodes.length === 1) {
        return nodes[0].val!.toString();
      } else if (nodes.length === 3) {
        if (isOperator(nodes[1].type) && isValue(nodes[2].type)) {
          return evalOperation(
            nodes[0].val!,
            nodes[1].type,
            nodes[2].val!
          ).toString();
        }
      }
      break;
    case TokenType.Paren:
      console.log({ nodes });
      break;
    default:
      throw Error(`unknown firstNode.type ${nodes[0].type}`);
  }
}*/

function evalOperation(
  lhs: InchesWithNormalizedFraction,
  operator: TokenType,
  rhs: InchesWithNormalizedFraction
) {
  assert(isOperator(operator));
  switch (operator) {
    case TokenType.Operator_Plus:
      return lhs.add(rhs);
      break;
    case TokenType.Operator_Minus:
      throw Error(`TODO minus`);
      break;
    default:
      throw Error(`unknown TokenType operator ${operator}`);
  }
}

function isOperator(tokenType: TokenType) {
  return (
    tokenType === TokenType.Operator_Plus ||
    tokenType === TokenType.Operator_Minus
  );
}

function isValue(tokenType: TokenType) {
  return (
    tokenType === TokenType.Feet ||
    tokenType === TokenType.Inches ||
    tokenType === TokenType.Fraction ||
    tokenType === TokenType.Feet_Inches ||
    tokenType === TokenType.Inches_Fraction ||
    tokenType === TokenType.Feet_Inches_Fraction
  );
}
