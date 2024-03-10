type TokenType = string;

export interface Token {
  type: TokenType;
  literal: string;
}

export const tokens = {
  ILLEGAL: "ILLEGAL",
  EOF: "EOF",

  // Identifiers + literals
  IDENT: "IDENT", // add, foobar, x, y, ...
  INT: "INT", // 1343456
  STRING: "STRING", // "foobar"

  // Operators
  ASSIGN: "=",
  PLUS: "+",
  MINUS: "-",
  BANG: "!",
  ASTERISK: "*",
  SLASH: "/",

  LT: "<",
  GT: ">",
  EQ: "==",
  NOT_EQ: "!=",

  // Delimiters
  COMMA: ",",
  SEMICOLON: ";",
  COLON: ";",

  LPAREN: "(",
  RPAREN: ")",
  LBRACE: "{",
  RBRACE: "}",
  LBRACKET: "[",
  RBRACKET: "]",

  // Keywords
  FUNCTION: "FUNCTION",
  LET: "LET",
  TRUE: "TRUE",
  FALSE: "FALSE",
  IF: "IF",
  ELSE: "ELSE",
  RETURN: "RETURN",
};

const keywords = new Map<string, TokenType>([
  ["fn", tokens.FUNCTION],
  ["let", tokens.LET],
  ["true", tokens.TRUE],
  ["false", tokens.FALSE],
  ["if", tokens.IF],
  ["else", tokens.ELSE],
  ["return", tokens.RETURN],
]);

export function lookupIdent(ident: string): TokenType {
  return keywords.get(ident) || tokens.IDENT;
}
