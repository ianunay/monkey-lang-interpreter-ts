/* 
  A lexer is a submodule that performs lexical analysis. 
  It takes a string of characters as input and produces a sequence of tokens as output.
*/

import { Token, lookupIdent, tokens } from "../token";

export default class Lexer {
  input: string;
  position: number;
  readPosition: number;
  ch: string | 0;

  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.readPosition = 0;
    this.ch = "";

    this.readChar();
  }

  readChar() {
    if (this.readPosition >= this.input.length) {
      this.ch = 0;
    } else {
      this.ch = this.input[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition += 1;
  }

  nextToken(): Token {
    let tok: Token;

    this.skipWhiteSpace();

    switch (this.ch) {
      case "=":
        if (this.peakChar() === "=") {
          this.readChar();
          tok = { type: tokens.EQ, literal: "==" };
        } else {
          tok = { type: tokens.ASSIGN, literal: this.ch };
        }
        break;

      case "+":
        tok = { type: tokens.PLUS, literal: this.ch };
        break;
      case "-":
        tok = { type: tokens.MINUS, literal: this.ch };
        break;
      case "!":
        if (this.peakChar() === "=") {
          this.readChar();
          tok = { type: tokens.NOT_EQ, literal: "!=" };
        } else {
          tok = { type: tokens.BANG, literal: this.ch };
        }
        break;
      case "/":
        tok = { type: tokens.SLASH, literal: this.ch };
        break;
      case "*":
        tok = { type: tokens.ASTERISK, literal: this.ch };
        break;
      case "<":
        tok = { type: tokens.LT, literal: this.ch };
        break;
      case ">":
        tok = { type: tokens.GT, literal: this.ch };
        break;
      case ";":
        tok = { type: tokens.SEMICOLON, literal: this.ch };
        break;
      case ":":
        tok = { type: tokens.COLON, literal: this.ch };
        break;
      case ",":
        tok = { type: tokens.COMMA, literal: this.ch };
        break;
      case "(":
        tok = { type: tokens.LPAREN, literal: this.ch };
        break;
      case ")":
        tok = { type: tokens.RPAREN, literal: this.ch };
        break;
      case '"':
        const literal = this.readString();
        tok = { type: tokens.STRING, literal };
        break;
      case "{":
        tok = { type: tokens.LBRACE, literal: this.ch };
        break;
      case "}":
        tok = { type: tokens.RBRACE, literal: this.ch };
        break;
      case "[":
        tok = { type: tokens.LBRACKET, literal: this.ch };
        break;
      case "]":
        tok = { type: tokens.RBRACKET, literal: this.ch };
        break;
      case 0:
        tok = { type: tokens.EOF, literal: "" };
        break;
      default:
        if (this.isLetter(this.ch)) {
          const literal = this.readIdentifier();
          const type = lookupIdent(literal);
          tok = { type, literal };
          return tok;
        } else if (this.isDigit(this.ch)) {
          const literal = this.readNumber();
          const type = tokens.INT;
          tok = { type, literal };
          return tok;
        } else {
          tok = { type: tokens.ILLEGAL, literal: this.ch };
        }
        break;
    }

    this.readChar();
    return tok;
  }

  isLetter(ch: string): boolean {
    return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_";
  }

  isDigit(ch: string): boolean {
    return ch >= "0" && ch <= "9";
  }

  readIdentifier(): string {
    const position = this.position;
    while (this.ch !== 0 && this.isLetter(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  readNumber(): string {
    const position = this.position;
    while (this.ch !== 0 && this.isDigit(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  readString(): string {
    const position = this.position + 1;
    this.readChar();
    while (this.ch !== 0 && this.ch !== '"') {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  peakChar(): string | 0 {
    if (this.readPosition >= this.input.length) {
      return 0;
    } else {
      return this.input[this.readPosition];
    }
  }

  skipWhiteSpace() {
    while (
      this.ch === " " ||
      this.ch === "\t" ||
      this.ch === "\n" ||
      this.ch === "\r"
    ) {
      this.readChar();
    }
  }
}
