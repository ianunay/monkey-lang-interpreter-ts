import { describe, expect, test } from "@jest/globals";
import { Identifier, LetStatement, Program } from "./ast";
import { tokens } from "../lexer/token";

describe("AST", () => {
  test("Program", () => {
    const program = new Program([
      new LetStatement(
        { type: tokens.LET, literal: "let" },
        new Identifier({ type: tokens.IDENT, literal: "myVar" }, "myVar"),
        new Identifier(
          { type: tokens.IDENT, literal: "anotherVar" },
          "anotherVar"
        )
      ),
    ]);
    expect(program.toString()).toBe("let myVar = anotherVar;");
  });
});
