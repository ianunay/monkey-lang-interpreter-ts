import { describe, expect, test } from "@jest/globals";
import Lexer from "../lexer";
import Parser from ".";
import { Identifier, LetStatement } from "./ast";

describe("Parser", () => {
  describe("Let Statement", () => {
    test.each([
      { input: "let x = 5;", expectedIdentifier: "x", expectedValue: 5 },
    ])(
      "",
      ({
        input,
        expectedIdentifier,
        expectedValue,
      }: {
        input: string;
        expectedIdentifier: string;
        expectedValue: number;
      }) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();

        console.log(program);

        expect(program.Statements.length).toBe(1);
        testLetStatement(program.Statements[0], expectedIdentifier);
        testIdentifier(program.Statements[0], expectedValue);
      }
    );
  });
});

function testLetStatement(statement: any, name: string) {
  expect(statement.tokenLiteral()).toBe("let");
  expect(statement).toBeInstanceOf(LetStatement);
  expect(statement.Name.value).toBe(name);
  expect(statement.Name.tokenLiteral()).toBe(name);
}

function testIdentifier(exp: any, value: any) {
  expect(exp).toBeInstanceOf(Identifier);
  expect(exp.value).toBe(value);
  expect(exp.tokenLiteral()).toBe(value);
}
