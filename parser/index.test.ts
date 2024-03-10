import { describe, expect, test } from "@jest/globals";
import Lexer from "../lexer";
import Parser from ".";
import {
  BooleanExpression,
  IntegerLiteral,
  StringLiteral,
  LetStatement,
  ReturnStatement,
  Identifier,
  ExpressionStatement,
  PrefixExpression,
  InfixExpression,
  IfExpression,
  FunctionLiteral,
  CallExpression,
} from "./ast";

describe("Parser", () => {
  describe("Let Statement", () => {
    test.each([
      { input: "let x = 5;", expectedIdentifier: "x", expectedValue: 5 },
      { input: "let y = true;", expectedIdentifier: "y", expectedValue: true },
      {
        input: 'let foobar = "hello world";',
        expectedIdentifier: "foobar",
        expectedValue: "hello world",
      },
    ])(
      "$input",
      ({
        input,
        expectedIdentifier,
        expectedValue,
      }: {
        input: string;
        expectedIdentifier: string;
        expectedValue: number | string | boolean;
      }) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();

        expect(program.Statements.length).toBe(1);
        testLetStatement(program.Statements[0], expectedIdentifier);
        testLiteralExpression(
          (program.Statements[0] as LetStatement).Value,
          expectedValue
        );
      }
    );
  });

  describe("Return Statement", () => {
    test.each([
      { input: "return 5;", expectedValue: 5 },
      { input: "return true;", expectedValue: true },
      { input: 'return "hello world";', expectedValue: "hello world" },
    ])(
      "$input",
      ({
        input,
        expectedValue,
      }: {
        input: string;
        expectedValue: number | boolean | string;
      }) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();

        expect(program.Statements.length).toBe(1);
        expect(program.Statements[0].tokenLiteral()).toBe("return");
        testLiteralExpression(
          (program.Statements[0] as ReturnStatement).ReturnValue,
          expectedValue
        );
      }
    );
  });

  describe("Identifier Expression", () => {
    test("should parse identifier expression", () => {
      const input = "foobar;";
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program.Statements.length).toBe(1);
      expect(program.Statements[0]).toBeInstanceOf(ExpressionStatement);
      expect(
        (program.Statements[0] as ExpressionStatement).Expression
      ).toBeInstanceOf(Identifier);
      expect(program.Statements[0].tokenLiteral()).toBe("foobar");
    });
  });

  describe("Integer Literal Expression", () => {
    test("should parse integer literal expression", () => {
      const input = "5;";
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program.Statements.length).toBe(1);
      expect(program.Statements[0]).toBeInstanceOf(ExpressionStatement);
      expect(
        (program.Statements[0] as ExpressionStatement).Expression
      ).toBeInstanceOf(IntegerLiteral);
      expect(program.Statements[0].tokenLiteral()).toBe("5");
    });
  });

  describe("Parsing Prefix Expressions", () => {
    test.each([
      { input: "!5;", operator: "!", value: 5 },
      { input: "-15;", operator: "-", value: 15 },
      { input: "!foobar", operator: "!", value: "foobar" },
      { input: "-foobar", operator: "-", value: "foobar" },
      { input: "!true", operator: "!", value: true },
      { input: "!false", operator: "!", value: false },
    ])("$input", ({ input, operator, value }) => {
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program.Statements.length).toBe(1);
      expect(program.Statements[0]).toBeInstanceOf(ExpressionStatement);
      expect(
        (program.Statements[0] as ExpressionStatement).Expression
      ).toBeInstanceOf(PrefixExpression);
      const prefixExpression = program.Statements[0] as ExpressionStatement;
      const Right = (prefixExpression.Expression as PrefixExpression).Right;
      expect((prefixExpression.Expression as PrefixExpression).Operator).toBe(
        operator
      );
      expect(Right.tokenLiteral()).toBe(value.toString());
    });
  });

  describe("Parsing Infix Expressions", () => {
    test.each([
      { input: "5 + 5;", leftValue: 5, operator: "+", rightValue: 5 },
      { input: "5 - 5;", leftValue: 5, operator: "-", rightValue: 5 },
      { input: "5 * 5", leftValue: 5, operator: "*", rightValue: 5 },
      { input: "5 / 5", leftValue: 5, operator: "/", rightValue: 5 },
      { input: "5 > 5", leftValue: 5, operator: ">", rightValue: 5 },
      { input: "5 < 5", leftValue: 5, operator: "<", rightValue: 5 },
      { input: "5 == 5", leftValue: 5, operator: "==", rightValue: 5 },
      { input: "5 != 5", leftValue: 5, operator: "!=", rightValue: 5 },
      {
        input: "foobar + barfoo;",
        leftValue: "foobar",
        operator: "+",
        rightValue: "barfoo",
      },
      {
        input: "foobar - barfoo;",
        leftValue: "foobar",
        operator: "-",
        rightValue: "barfoo",
      },
      {
        input: "foobar * barfoo;",
        leftValue: "foobar",
        operator: "*",
        rightValue: "barfoo",
      },
      {
        input: "foobar / barfoo;",
        leftValue: "foobar",
        operator: "/",
        rightValue: "barfoo",
      },
      {
        input: "foobar > barfoo;",
        leftValue: "foobar",
        operator: ">",
        rightValue: "barfoo",
      },
      {
        input: "foobar < barfoo;",
        leftValue: "foobar",
        operator: "<",
        rightValue: "barfoo",
      },
      {
        input: "foobar == barfoo;",
        leftValue: "foobar",
        operator: "==",
        rightValue: "barfoo",
      },
      {
        input: "foobar != barfoo;",
        leftValue: "foobar",
        operator: "!=",
        rightValue: "barfoo",
      },
      {
        input: "true == true",
        leftValue: true,
        operator: "==",
        rightValue: true,
      },
      {
        input: "true != false",
        leftValue: true,
        operator: "!=",
        rightValue: false,
      },
      {
        input: "false == false",
        leftValue: false,
        operator: "==",
        rightValue: false,
      },
    ])("$input", ({ input, leftValue, operator, rightValue }) => {
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program.Statements.length).toBe(1);
      expect(program.Statements[0]).toBeInstanceOf(ExpressionStatement);
      expect(
        (program.Statements[0] as ExpressionStatement).Expression
      ).toBeInstanceOf(InfixExpression);
      const infixExpression = program.Statements[0] as ExpressionStatement;
      const Left = (infixExpression.Expression as InfixExpression).Left;
      expect((infixExpression.Expression as InfixExpression).Operator).toBe(
        operator
      );
      expect(Left.tokenLiteral()).toBe(leftValue.toString());
      const Right = (infixExpression.Expression as InfixExpression).Right;
      expect(Right.tokenLiteral()).toBe(rightValue.toString());
    });
  });

  describe.skip("Operator Precedence Parsing", () => {
    test.each([
      { input: "-a * b", expected: "((-a) * b)" },
      {
        input: "!-a",
        expected: "(!(-a))",
      },
      {
        input: "a + b + c",
        expected: "((a + b) + c)",
      },
      {
        input: "a + b - c",
        expected: "((a + b) - c)",
      },
      {
        input: "a * b * c",
        expected: "((a * b) * c)",
      },
      {
        input: "a * b / c",
        expected: "((a * b) / c)",
      },
      {
        input: "a + b / c",
        expected: "(a + (b / c))",
      },
      {
        input: "a + b * c + d / e - f",
        expected: "(((a + (b * c)) + (d / e)) - f)",
      },
      {
        input: "3 + 4; -5 * 5",
        expected: "(3 + 4)((-5) * 5)",
      },
      {
        input: "5 > 4 == 3 < 4",
        expected: "((5 > 4) == (3 < 4))",
      },
      {
        input: "5 < 4 != 3 > 4",
        expected: "((5 < 4) != (3 > 4))",
      },
      {
        input: "3 + 4 * 5 == 3 * 1 + 4 * 5",
        expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
      },
      {
        input: "true",
        expected: "true",
      },
      {
        input: "false",
        expected: "false",
      },
      {
        input: "3 > 5 == false",
        expected: "((3 > 5) == false)",
      },
      {
        input: "3 < 5 == true",
        expected: "((3 < 5) == true)",
      },
      {
        input: "1 + (2 + 3) + 4",
        expected: "((1 + (2 + 3)) + 4)",
      },
      {
        input: "(5 + 5) * 2",
        expected: "((5 + 5) * 2)",
      },
      {
        input: "2 / (5 + 5)",
        expected: "(2 / (5 + 5))",
      },
      {
        input: "(5 + 5) * 2 * (5 + 5)",
        expected: "(((5 + 5) * 2) * (5 + 5))",
      },
      {
        input: "-(5 + 5)",
        expected: "(-(5 + 5))",
      },
      {
        input: "!(true == true)",
        expected: "(!(true == true))",
      },
      {
        input: "a + add(b * c) + d",
        expected: "((a + add((b * c))) + d)",
      },
      {
        input: "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
        expected: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
      },
      {
        input: "add(a + b + c * d / f + g)",
        expected: "add((((a + b) + ((c * d) / f)) + g))",
      },
      {
        input: "a * [1, 2, 3, 4][b * c] * d",
        expected: "((a * ([1, 2, 3, 4][(b * c)])) * d)",
      },
      {
        input: "add(a * b[2], b[1], 2 * [1, 2][1])",
        expected: "add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))",
      },
    ])("$input", ({ input, expected }) => {
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program.toString()).toBe(expected);
    });
  });

  describe("Boolean Expression", () => {
    test.each([
      { input: "true;", expectedValue: true },
      { input: "false;", expectedValue: false },
    ])("$input", ({ input, expectedValue }) => {
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program.Statements.length).toBe(1);
      expect(program.Statements[0]).toBeInstanceOf(ExpressionStatement);
      expect(
        (program.Statements[0] as ExpressionStatement).Expression
      ).toBeInstanceOf(BooleanExpression);
      expect(
        (
          (program.Statements[0] as ExpressionStatement)
            .Expression as BooleanExpression
        ).Value
      ).toBe(expectedValue);
      expect(program.Statements[0].tokenLiteral()).toBe(
        expectedValue.toString()
      );
    });
  });

  describe("If Expression", () => {
    test("should parse if expression", () => {
      const input = "if (x < y) { x }";
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program.Statements.length).toBe(1);
      expect(program.Statements[0]).toBeInstanceOf(ExpressionStatement);
      expect(
        (program.Statements[0] as ExpressionStatement).Expression
      ).toBeInstanceOf(IfExpression);
      const ifExpression = program.Statements[0] as ExpressionStatement;
      expect(ifExpression.Expression.tokenLiteral()).toBe("if");
      expect(ifExpression.Expression).toBeInstanceOf(IfExpression);
      expect(
        (ifExpression.Expression as IfExpression).Condition
      ).toBeInstanceOf(InfixExpression);
      expect(
        (ifExpression.Expression as IfExpression).Consequence.Statements.length
      ).toBe(1);
      expect(
        (ifExpression.Expression as IfExpression).Consequence.Statements[0]
      ).toBeInstanceOf(ExpressionStatement);
      expect(
        (
          (ifExpression.Expression as IfExpression).Consequence
            .Statements[0] as ExpressionStatement
        ).Expression
      ).toBeInstanceOf(Identifier);
      expect(
        (
          ifExpression.Expression as IfExpression
        ).Consequence.Statements[0].tokenLiteral()
      ).toBe("x");
      expect((ifExpression.Expression as IfExpression).Alternative).toBeNull();
      expect(ifExpression.Expression.toString()).toBe("if(x < y) x");
    });

    test("should parse if else expression", () => {
      const input = "if (x < y) { x } else { y }";
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();
      expect(program.Statements.length).toBe(1);
      expect(program.Statements[0]).toBeInstanceOf(ExpressionStatement);
      expect(
        (program.Statements[0] as ExpressionStatement).Expression
      ).toBeInstanceOf(IfExpression);
      const ifExpression = program.Statements[0] as ExpressionStatement;
      expect(ifExpression.Expression.tokenLiteral()).toBe("if");
      expect(ifExpression.Expression).toBeInstanceOf(IfExpression);
      expect(
        (ifExpression.Expression as IfExpression).Condition
      ).toBeInstanceOf(InfixExpression);
      expect(
        (ifExpression.Expression as IfExpression).Consequence.Statements.length
      ).toBe(1);
      expect(
        (ifExpression.Expression as IfExpression).Consequence.Statements[0]
      ).toBeInstanceOf(ExpressionStatement);
      expect(
        (
          (ifExpression.Expression as IfExpression).Consequence
            .Statements[0] as ExpressionStatement
        ).Expression
      ).toBeInstanceOf(Identifier);
      expect(
        (
          ifExpression.Expression as IfExpression
        ).Consequence.Statements[0].tokenLiteral()
      ).toBe("x");

      expect(
        (ifExpression.Expression as IfExpression).Alternative?.Statements.length
      ).toBe(1);
      expect(
        (ifExpression.Expression as IfExpression).Alternative?.Statements[0]
      ).toBeInstanceOf(ExpressionStatement);
      expect(
        (
          (ifExpression.Expression as IfExpression).Alternative
            ?.Statements[0] as ExpressionStatement
        ).Expression
      ).toBeInstanceOf(Identifier);
      expect(
        (
          ifExpression.Expression as IfExpression
        ).Alternative?.Statements[0].tokenLiteral()
      ).toBe("y");

      expect(ifExpression.Expression.toString()).toBe("if(x < y) xelse y");
    });
  });

  describe("Function Literal", () => {
    test("should parse function literal", () => {
      const input = "fn(x, y) { x + y; }";
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();
      expect(program.Statements.length).toBe(1);
      expect(program.Statements[0]).toBeInstanceOf(ExpressionStatement);
      expect(
        (program.Statements[0] as ExpressionStatement).Expression
      ).toBeInstanceOf(FunctionLiteral);
      const functionLiteral = program.Statements[0] as ExpressionStatement;
      expect(functionLiteral.Expression.tokenLiteral()).toBe("fn");
      expect(functionLiteral.Expression).toBeInstanceOf(FunctionLiteral);
      expect(
        (functionLiteral.Expression as FunctionLiteral)?.Parameters?.length
      ).toBe(2);
      const parameters = (functionLiteral.Expression as FunctionLiteral)
        ?.Parameters;
      expect(parameters && parameters[0].Value).toBe("x");
      expect(parameters && parameters[1].Value).toBe("y");

      expect(
        (functionLiteral.Expression as FunctionLiteral).Body.Statements.length
      ).toBe(1);
      expect(
        (
          (functionLiteral.Expression as FunctionLiteral).Body
            .Statements[0] as ExpressionStatement
        ).Expression
      ).toBeInstanceOf(InfixExpression);
      expect(
        (
          (functionLiteral.Expression as FunctionLiteral).Body
            .Statements[0] as ExpressionStatement
        ).Expression.toString()
      ).toBe("(x + y)");
    });
  });

  describe("Call Expression", () => {
    test("should parse call expression", () => {
      const input = "add(1, 2 * 3, 4 + 5);";
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();
      expect(program.Statements.length).toBe(1);
      expect(program.Statements[0]).toBeInstanceOf(ExpressionStatement);
      expect(
        (program.Statements[0] as ExpressionStatement).Expression
      ).toBeInstanceOf(CallExpression);
      const callExpression = program.Statements[0] as ExpressionStatement;
      expect(callExpression.Expression).toBeInstanceOf(CallExpression);
      expect(
        (callExpression.Expression as CallExpression)?.Arguments?.length
      ).toBe(3);
      const args = (callExpression.Expression as CallExpression)?.Arguments;
      expect(args && args[0].toString()).toBe("1");
      expect(args && args[1].toString()).toBe("(2 * 3)");
      expect(args && args[2].toString()).toBe("(4 + 5)");
    });
  });
});

function testLetStatement(statement: any, name: string) {
  expect(statement.tokenLiteral()).toBe("let");
  expect(statement).toBeInstanceOf(LetStatement);
  expect(statement.Name.Value).toBe(name);
  expect(statement.Name.tokenLiteral()).toBe(name);
}

function testLiteralExpression(expValue: any, value: any) {
  switch (typeof value) {
    case "number":
      expect(expValue).toBeInstanceOf(IntegerLiteral);
      expect(expValue.Value).toBe(value);
      expect(expValue.tokenLiteral()).toBe(value.toString());
      break;
    case "string":
      expect(expValue).toBeInstanceOf(StringLiteral);
      expect(expValue.Value).toBe(value);
      expect(expValue.tokenLiteral()).toBe(value);
      break;
    case "boolean":
      expect(expValue).toBeInstanceOf(BooleanExpression);
      expect(expValue.Value).toBe(value);
      expect(expValue.tokenLiteral()).toBe(value.toString());
      break;
  }
}
