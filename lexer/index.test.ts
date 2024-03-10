import { describe, expect, test } from "@jest/globals";
import Lexer from "./";
import { tokens } from "./token";

describe("lexer", () => {
  test("should tokenize the input string", () => {
    const input = `let five = 5;
    let ten = 10;
    
    let add = fn(x, y) {
      x + y;
    };
    
    let result = add(five, ten);
    !-/*5;
    5 < 10 > 5;
    
    if (5 < 10) {
      return true;
    } else {
      return false;
    }
    
    10 == 10;
    10 != 9;
    "foobar"
    "foo bar"
    [1, 2];
    {"foo": "bar"}
    `;
    const lexer = new Lexer(input);
    const expected = [
      { type: tokens.LET, literal: "let" },
      { type: tokens.IDENT, literal: "five" },
      { type: tokens.ASSIGN, literal: "=" },
      { type: tokens.INT, literal: "5" },
      { type: tokens.SEMICOLON, literal: ";" },
      { type: tokens.LET, literal: "let" },
      { type: tokens.IDENT, literal: "ten" },
      { type: tokens.ASSIGN, literal: "=" },
      { type: tokens.INT, literal: "10" },
      { type: tokens.SEMICOLON, literal: ";" },
      { type: tokens.LET, literal: "let" },
      { type: tokens.IDENT, literal: "add" },
      { type: tokens.ASSIGN, literal: "=" },
      { type: tokens.FUNCTION, literal: "fn" },
      { type: tokens.LPAREN, literal: "(" },
      { type: tokens.IDENT, literal: "x" },
      { type: tokens.COMMA, literal: "," },
      { type: tokens.IDENT, literal: "y" },
      { type: tokens.RPAREN, literal: ")" },
      { type: tokens.LBRACE, literal: "{" },
      { type: tokens.IDENT, literal: "x" },
      { type: tokens.PLUS, literal: "+" },
      { type: tokens.IDENT, literal: "y" },
      { type: tokens.SEMICOLON, literal: ";" },
      { type: tokens.RBRACE, literal: "}" },
      { type: tokens.SEMICOLON, literal: ";" },
      { type: tokens.LET, literal: "let" },
      { type: tokens.IDENT, literal: "result" },
      { type: tokens.ASSIGN, literal: "=" },
      { type: tokens.IDENT, literal: "add" },
      { type: tokens.LPAREN, literal: "(" },
      { type: tokens.IDENT, literal: "five" },
      { type: tokens.COMMA, literal: "," },
      { type: tokens.IDENT, literal: "ten" },
      { type: tokens.RPAREN, literal: ")" },
      { type: tokens.SEMICOLON, literal: ";" },
      { type: tokens.BANG, literal: "!" },
      { type: tokens.MINUS, literal: "-" },
      { type: tokens.SLASH, literal: "/" },
      { type: tokens.ASTERISK, literal: "*" },
      { type: tokens.INT, literal: "5" },
      { type: tokens.SEMICOLON, literal: ";" },
      { type: tokens.INT, literal: "5" },
      { type: tokens.LT, literal: "<" },
      { type: tokens.INT, literal: "10" },
      { type: tokens.GT, literal: ">" },
      { type: tokens.INT, literal: "5" },
      { type: tokens.SEMICOLON, literal: ";" },
      { type: tokens.IF, literal: "if" },
      { type: tokens.LPAREN, literal: "(" },
      { type: tokens.INT, literal: "5" },
      { type: tokens.LT, literal: "<" },
      { type: tokens.INT, literal: "10" },
      { type: tokens.RPAREN, literal: ")" },
      { type: tokens.LBRACE, literal: "{" },
      { type: tokens.RETURN, literal: "return" },
      { type: tokens.TRUE, literal: "true" },
      { type: tokens.SEMICOLON, literal: ";" },
      { type: tokens.RBRACE, literal: "}" },
      { type: tokens.ELSE, literal: "else" },
      { type: tokens.LBRACE, literal: "{" },
      { type: tokens.RETURN, literal: "return" },
      { type: tokens.FALSE, literal: "false" },
      { type: tokens.SEMICOLON, literal: ";" },
      { type: tokens.RBRACE, literal: "}" },
      { type: tokens.INT, literal: "10" },
      { type: tokens.EQ, literal: "==" },
      { type: tokens.INT, literal: "10" },
      { type: tokens.SEMICOLON, literal: ";" },
      { type: tokens.INT, literal: "10" },
      { type: tokens.NOT_EQ, literal: "!=" },
      { type: tokens.INT, literal: "9" },
      { type: tokens.SEMICOLON, literal: ";" },
      { type: tokens.STRING, literal: "foobar" },
      { type: tokens.STRING, literal: "foo bar" },
      { type: tokens.LBRACKET, literal: "[" },
      { type: tokens.INT, literal: "1" },
      { type: tokens.COMMA, literal: "," },
      { type: tokens.INT, literal: "2" },
      { type: tokens.RBRACKET, literal: "]" },
      { type: tokens.SEMICOLON, literal: ";" },
      { type: tokens.LBRACE, literal: "{" },
      { type: tokens.STRING, literal: "foo" },
      { type: tokens.COLON, literal: ":" },
      { type: tokens.STRING, literal: "bar" },
      { type: tokens.RBRACE, literal: "}" },
      { type: tokens.EOF, literal: "" },
    ];

    expected.forEach(exp => {
      expect(exp).toEqual(lexer.nextToken());
    });
  });
});
