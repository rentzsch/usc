import test from "ava";
import { usc, InchesWithNormalizedFraction } from "./usc";

test("direct feet", (t) => {
  t.is(`0"`, IWNF(0));
  t.is(`1'`, IWNF(1));
  t.is(`999'`, IWNF(999));

  function IWNF(feet: number) {
    return InchesWithNormalizedFraction.createFromMinimalFractionalInches(
      feet * 12,
      0
    ).toString();
  }
});

test("direct inch", (t) => {
  t.is(`0"`, IWNF(0));
  t.is(`1"`, IWNF(1));
  t.is(`11"`, IWNF(11));
  t.is(`1'`, IWNF(12));
  t.is(`1' 1"`, IWNF(13));
  t.is(`83' 3"`, IWNF(999));

  function IWNF(inches: number) {
    return InchesWithNormalizedFraction.createFromMinimalFractionalInches(
      inches,
      0
    ).toString();
  }
});

test("direct fractional inches", (t) => {
  t.is(`1/16"`, IWNF16Str(1));
  t.is(`1/8"`, IWNF16Str(2));
  t.is(`3/16"`, IWNF16Str(3));
  t.is(`1/4"`, IWNF16Str(4));
  t.is(`5/16"`, IWNF16Str(5));
  t.is(`3/8"`, IWNF16Str(6));
  t.is(`7/16"`, IWNF16Str(7));
  t.is(`1/2"`, IWNF16Str(8));
  t.is(`9/16"`, IWNF16Str(9));
  t.is(`5/8"`, IWNF16Str(10));
  t.is(`11/16"`, IWNF16Str(11));
  t.is(`3/4"`, IWNF16Str(12));
  t.is(`13/16"`, IWNF16Str(13));
  t.is(`7/8"`, IWNF16Str(14));
  t.is(`15/16"`, IWNF16Str(15));
  t.is(`1"`, IWNF16Str(16));
  t.is(`1-1/16"`, IWNF16Str(17));

  // t.is(usc`1'`, `1'`);
  // t.is(usc`1"`, `1"`);

  //--

  // 8/16 => 1/2

  // t.is(new InchesWithNormalizedFraction(0, 0).toString(), `0"`);
  // t.true(false);
  // t.is(usc`1/16" + 15/16"`, `1"`);

  function IWNF16Str(inchesNumerator16: number) {
    return InchesWithNormalizedFraction.createFromMinimalFractionalInches(
      0,
      inchesNumerator16
    ).toString();
  }
});

test("eval feet", (t) => {
  t.is(usc`1'`, `1'`);
  t.is(usc`12"`, `1'`);
});

test("eval inches", (t) => {
  t.is(usc`1"`, `1"`);
  t.is(usc`11"`, `11"`);
  t.is(usc`2-3/4"`, `2-3/4"`);
  t.is(usc`2-6/8"`, `2-3/4"`);
  t.is(usc`2-12/16"`, `2-3/4"`);
});

test("eval fractional", (t) => {
  t.is(usc`1/16"`, `1/16"`);
  t.is(usc`8/16"`, `1/2"`);
  t.is(usc`16/32"`, `1/2"`);
  t.is(usc`1/16" + 2/16"`, `3/16"`);
  // t.is(usc`(1/16" + 2/16") + 2/16"`, `5/16"`);

  t.is(usc`1/2"`, `1/2"`);
  t.is(usc`2/4"`, `1/2"`);
  t.is(usc`4/8"`, `1/2"`);

  t.is(usc`2/16"`, `1/8"`);
  t.is(usc`3/16"`, `3/16"`);
  t.is(usc`4/16"`, `1/4"`);
  t.is(usc`5/16"`, `5/16"`);
  t.is(usc`6/16"`, `3/8"`);
  t.is(usc`7/16"`, `7/16"`);
  t.is(usc`8/16"`, `1/2"`);
  t.is(usc`9/16"`, `9/16"`);
  t.is(usc`10/16"`, `5/8"`);
  t.is(usc`11/16"`, `11/16"`);
  t.is(usc`12/16"`, `3/4"`);
  t.is(usc`13/16"`, `13/16"`);
  t.is(usc`14/16"`, `7/8"`);
  t.is(usc`15/16"`, `15/16"`);
  t.is(usc`16/16"`, `1"`);
  // t.is(usc`17/16"`, `1' 1/16"`); FIXME
});
