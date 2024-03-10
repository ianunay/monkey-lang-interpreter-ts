import { describe, expect, test } from "@jest/globals";
import { Eval } from ".";
import Lexer from "../lexer";
import Parser from "../parser";
import { Environment } from "./environment";
import { BooleanObject, IntegerObject } from "./object";

describe("evaluator", () => {
  describe("eval integer expression", () => {
    test.each([
      { input: "5", expected: 5 },
      { input: "10", expected: 10 },
      { input: "-5", expected: -5 },
      { input: "-10", expected: -10 },
      { input: "5 + 5 + 5 + 5 - 10", expected: 10 },
      { input: "2 * 2 * 2 * 2 * 2", expected: 32 },
      { input: "-50 + 100 + -50", expected: 0 },
      { input: "5 * 2 + 10", expected: 20 },
      { input: "5 + 2 * 10", expected: 25 },
      { input: "20 + 2 * -10", expected: 0 },
      { input: "50 / 2 * 2 + 10", expected: 60 },
      { input: "2 * (5 + 10)", expected: 30 },
      { input: "3 * 3 * 3 + 10", expected: 37 },
      { input: "3 * (3 * 3) + 10", expected: 37 },
      { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: 50 },
    ])("should evaluate %s", ({ input, expected }) => {
      expect((testEval(input) as IntegerObject).value).toBe(expected);
    });
  });

  describe("eval boolean expression", () => {
    test.each([
      { input: "true", expected: true },
      { input: "false", expected: false },
      { input: "1 < 2", expected: true },
      { input: "1 > 2", expected: false },
      { input: "1 < 1", expected: false },
      { input: "1 > 1", expected: false },
      { input: "1 == 1", expected: true },
      { input: "1 != 1", expected: false },
      { input: "1 == 2", expected: false },
      { input: "1 != 2", expected: true },
      { input: "true == true", expected: true },
      { input: "false == false", expected: true },
      { input: "true == false", expected: false },
      { input: "true != false", expected: true },
      { input: "false != true", expected: true },
      { input: "(1 < 2) == true", expected: true },
      { input: "(1 < 2) == false", expected: false },
      { input: "(1 > 2) == true", expected: false },
      { input: "(1 > 2) == false", expected: true },
    ])("should evaluate %s", ({ input, expected }) => {
      expect((testEval(input) as BooleanObject).value).toBe(expected);
    });
  });

  describe("bang operator", () => {
    test.each([
      { input: "!true", expected: false },
      { input: "!false", expected: true },
      { input: "!5", expected: false },
      { input: "!!true", expected: true },
      { input: "!!false", expected: false },
      { input: "!!5", expected: true },
    ])("should evaluate %s", ({ input, expected }) => {
      expect((testEval(input) as BooleanObject).value).toBe(expected);
    });
  });

  describe("if else expression", () => {
    test.each([
      { input: "if (true) { 10 }", expected: 10 },
      { input: "if (false) { 10 }", expected: null },
      { input: "if (1) { 10 }", expected: 10 },
      { input: "if (1 < 2) { 10 }", expected: 10 },
      { input: "if (1 > 2) { 10 }", expected: null },
      { input: "if (1 > 2) { 10 } else { 20 }", expected: 20 },
      { input: "if (1 < 2) { 10 } else { 20 }", expected: 10 },
    ])("should evaluate %s", ({ input, expected }) => {
      expect((testEval(input) as IntegerObject).value).toBe(expected);
    });
  });
});

function testEval(input: string) {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();
  const env = new Environment();

  return Eval(program, env);
}
