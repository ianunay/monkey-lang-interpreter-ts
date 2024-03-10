import Lexer from "../lexer";
import { Token, tokens } from "../lexer/token";
import {
  Statement,
  BlockStatement,
  BooleanExpression,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  Identifier,
  IfExpression,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  ReturnStatement,
  ArrayLiteral,
  HashLiteral,
  Program,
  StringLiteral,
} from "./ast";

enum Precedence {
  LOWEST = 1,
  EQUALS, // ==
  LESSGREATER, // > or <
  SUM, // +
  PRODUCT, // *
  PREFIX, // -X or !X
  CALL, // myFunction(X)
  INDEX, // array[index]
}

const precedences = new Map([
  [tokens.EQ, Precedence.EQUALS],
  [tokens.NOT_EQ, Precedence.EQUALS],
  [tokens.LT, Precedence.LESSGREATER],
  [tokens.GT, Precedence.LESSGREATER],
  [tokens.PLUS, Precedence.SUM],
  [tokens.MINUS, Precedence.SUM],
  [tokens.SLASH, Precedence.PRODUCT],
  [tokens.ASTERISK, Precedence.PRODUCT],
  [tokens.LPAREN, Precedence.CALL],
  [tokens.LBRACKET, Precedence.INDEX],
]);

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (Expression: Expression) => Expression | null;

export default class Parser {
  lexer: Lexer;
  errors: string[];
  curToken: Token;
  peekToken: Token;
  prefixParseFns: { [key: string]: PrefixParseFn };
  infixParseFns: { [key: string]: InfixParseFn };

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.errors = [];

    this.curToken = {
      type: "start",
      literal: "start",
    };
    this.peekToken = {
      type: "start",
      literal: "start",
    };

    this.prefixParseFns = {};
    this.infixParseFns = {};

    this.registerPrefix(tokens.IDENT, this.parseIdentifier);
    this.registerPrefix(tokens.INT, this.parseIntegerLiteral);
    this.registerPrefix(tokens.STRING, this.parseStringLiteral);
    this.registerPrefix(tokens.BANG, this.parsePrefixExpression);
    this.registerPrefix(tokens.MINUS, this.parsePrefixExpression);
    this.registerPrefix(tokens.TRUE, this.parseBoolean);
    this.registerPrefix(tokens.FALSE, this.parseBoolean);
    this.registerPrefix(tokens.LPAREN, this.parseGroupedExpression);
    this.registerPrefix(tokens.IF, this.parseIfExpression);
    this.registerPrefix(tokens.FUNCTION, this.parseFunctionLiteral);
    this.registerPrefix(tokens.LBRACKET, this.parseArrayLiteral);
    this.registerPrefix(tokens.LBRACE, this.parseHashLiteral);

    this.registerInfix(tokens.PLUS, this.parseInfixExpression);
    this.registerInfix(tokens.MINUS, this.parseInfixExpression);
    this.registerInfix(tokens.SLASH, this.parseInfixExpression);
    this.registerInfix(tokens.ASTERISK, this.parseInfixExpression);
    this.registerInfix(tokens.EQ, this.parseInfixExpression);
    this.registerInfix(tokens.NOT_EQ, this.parseInfixExpression);
    this.registerInfix(tokens.LT, this.parseInfixExpression);
    this.registerInfix(tokens.GT, this.parseInfixExpression);

    this.registerInfix(tokens.LPAREN, this.parseCallExpression);
    this.registerInfix(tokens.LBRACKET, this.parseIndexExpression);

    // Read two tokens, so curToken and peekToken are both set
    this.nextToken();
    this.nextToken();
  }

  nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  curTokenIs(tokenType: string) {
    return this.curToken?.type === tokenType;
  }

  peekTokenIs(tokenType: string) {
    return this.peekToken?.type === tokenType;
  }

  expectPeek(tokenType: string) {
    if (this.peekTokenIs(tokenType)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(tokenType);
      return false;
    }
  }

  peekError(tokenType: string) {
    const msg = `expected next token to be ${tokenType}, got ${this.peekToken?.type} instead`;
    this.errors.push(msg);
  }

  Errors() {
    return this.errors;
  }

  noPrefixParseFnError(tokenType: string) {
    const msg = `no prefix parse function for ${tokenType} found`;
    this.errors.push(msg);
  }

  parseProgram() {
    const statements: Statement[] = [];

    while (this.curToken?.type !== tokens.EOF) {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
      this.nextToken();
    }

    return new Program(statements);
  }

  parseStatement() {
    switch (this.curToken?.type) {
      case tokens.LET:
        return this.parseLetStatement();
      case tokens.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  parseLetStatement() {
    const tok = this.curToken;
    if (!this.expectPeek(tokens.IDENT)) {
      return null;
    }

    const name = new Identifier(this.curToken, this.curToken?.literal);

    if (!this.expectPeek(tokens.ASSIGN)) {
      return null;
    }

    this.nextToken();

    const value = this.parseExpression(Precedence.LOWEST);

    while (!this.curTokenIs(tokens.SEMICOLON)) {
      this.nextToken();
    }

    return new LetStatement(tok, name, value);
  }

  parseReturnStatement() {
    const tok = this.curToken;
    this.nextToken();
    const returnValue = this.parseExpression(Precedence.LOWEST);

    if (this.peekTokenIs(tokens.SEMICOLON)) {
      this.nextToken();
    }

    return new ReturnStatement(tok, returnValue);
  }

  parseExpressionStatement() {
    const tok = this.curToken;
    const expression = this.parseExpression(Precedence.LOWEST);

    if (expression === null) {
      return null;
    }

    if (this.peekTokenIs(tokens.SEMICOLON)) {
      this.nextToken();
    }

    return new ExpressionStatement(tok, expression);
  }

  parseExpression(precedence: Precedence) {
    const prefix = this.prefixParseFns[this.curToken?.type];
    if (!prefix) {
      this.noPrefixParseFnError(this.curToken?.type);
      return null;
    }
    let leftExp = prefix();

    while (
      !this.peekTokenIs(tokens.SEMICOLON) &&
      precedence < this.peekPrecedence()
    ) {
      const infix = this.infixParseFns[this.peekToken?.type];
      if (!infix) {
        return leftExp;
      }
      this.nextToken();

      if (leftExp !== null) {
        leftExp = infix(leftExp);
      }
    }

    return leftExp;
  }

  peekPrecedence() {
    const precedence = precedences.get(this.peekToken?.type);
    return precedence ?? Precedence.LOWEST;
  }

  curPrecedence() {
    const precedence = precedences.get(this.curToken?.type);
    return precedence ?? Precedence.LOWEST;
  }

  parseIdentifier() {
    return new Identifier(this.curToken, this.curToken?.literal);
  }

  parseIntegerLiteral() {
    const value = parseInt(this.curToken?.literal);
    if (Number.isNaN(value)) {
      this.errors.push(`could not parse ${this.curToken?.literal} as integer`);
      return null;
    }

    return new IntegerLiteral(this.curToken, value);
  }

  parseStringLiteral() {
    return new StringLiteral(this.curToken, this.curToken?.literal);
  }

  parsePrefixExpression() {
    const tok = this.curToken;
    this.nextToken();
    const right = this.parseExpression(Precedence.PREFIX);
    if (right === null) {
      return null;
    }
    return new PrefixExpression(tok, tok?.literal, right);
  }

  parseInfixExpression(left: Expression) {
    const tok = this.curToken;
    const precedence = this.curPrecedence();
    this.nextToken();
    const right = this.parseExpression(precedence);
    if (right === null) {
      return null;
    }

    return new InfixExpression(tok, left, tok?.literal, right);
  }

  parseBoolean() {
    return new BooleanExpression(this.curToken, this.curTokenIs(tokens.TRUE));
  }

  parseGroupedExpression() {
    this.nextToken();
    const exp = this.parseExpression(Precedence.LOWEST);
    if (!this.expectPeek(tokens.RPAREN)) {
      return null;
    }
    return exp;
  }

  parseIfExpression() {
    const tok = this.curToken;
    if (!this.expectPeek(tokens.LPAREN)) {
      return null;
    }
    this.nextToken();
    const condition = this.parseExpression(Precedence.LOWEST);
    if (!this.expectPeek(tokens.RPAREN)) {
      return null;
    }
    if (!this.expectPeek(tokens.LBRACE)) {
      return null;
    }
    const consequence = this.parseBlockStatement();
    let alternative = null;
    if (this.peekTokenIs(tokens.ELSE)) {
      this.nextToken();
      if (!this.expectPeek(tokens.LBRACE)) {
        return null;
      }
      alternative = this.parseBlockStatement();
    }

    if (condition === null || consequence === null) {
      return null;
    }

    return new IfExpression(tok, condition, consequence, alternative);
  }

  parseBlockStatement(): BlockStatement {
    const tok = this.curToken;
    const statements: Statement[] = [];
    this.nextToken();
    while (!this.curTokenIs(tokens.RBRACE) && !this.curTokenIs(tokens.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
      this.nextToken();
    }

    return new BlockStatement(tok, statements);
  }

  parseFunctionLiteral() {
    const tok = this.curToken;
    if (!this.expectPeek(tokens.LPAREN)) {
      return null;
    }
    const parameters = this.parseFunctionParameters();
    if (!this.expectPeek(tokens.LBRACE)) {
      return null;
    }
    return new FunctionLiteral(tok, parameters, this.parseBlockStatement());
  }

  parseFunctionParameters() {
    const identifiers: Identifier[] = [];
    if (this.peekTokenIs(tokens.RPAREN)) {
      this.nextToken();
      return identifiers;
    }
    this.nextToken();
    identifiers.push(new Identifier(this.curToken, this.curToken?.literal));
    while (this.peekTokenIs(tokens.COMMA)) {
      this.nextToken();
      this.nextToken();
      identifiers.push(new Identifier(this.curToken, this.curToken?.literal));
    }
    if (!this.expectPeek(tokens.RPAREN)) {
      return null;
    }
    return identifiers;
  }

  parseCallExpression(func: Expression) {
    const tok = this.curToken;
    const args = this.parseExpressionList(tokens.RPAREN);
    return new CallExpression(tok, func, args);
  }

  parseExpressionList(end: string) {
    const list: Expression[] = [];
    if (this.peekTokenIs(end)) {
      this.nextToken();
      return list;
    }
    this.nextToken();
    const exp = this.parseExpression(Precedence.LOWEST);
    if (exp === null) {
      return null;
    }
    list.push(exp);
    while (this.peekTokenIs(tokens.COMMA)) {
      this.nextToken();
      this.nextToken();
      const exp = this.parseExpression(Precedence.LOWEST);
      if (exp === null) {
        return null;
      }
      list.push(exp);
    }
    if (!this.expectPeek(end)) {
      return null;
    }
    return list;
  }

  parseArrayLiteral() {
    const exp = this.parseExpressionList(tokens.RBRACKET);
    if (exp === null) {
      return null;
    }
    return new ArrayLiteral(this.curToken, exp);
  }

  parseIndexExpression(left: Expression) {
    const tok = this.curToken;
    this.nextToken();
    const index = this.parseExpression(Precedence.LOWEST);
    if (index === null) {
      return null;
    }
    if (!this.expectPeek(tokens.RBRACKET)) {
      return null;
    }
    return new InfixExpression(tok, left, tok?.literal, index);
  }

  parseHashLiteral() {
    const tok = this.curToken;
    const pairs = new Map<Expression, Expression>();
    while (!this.peekTokenIs(tokens.RBRACE)) {
      this.nextToken();
      const key = this.parseExpression(Precedence.LOWEST);
      if (!this.expectPeek(tokens.COLON)) {
        return null;
      }
      this.nextToken();
      const value = this.parseExpression(Precedence.LOWEST);
      if (key === null || value === null) {
        return null;
      }
      pairs.set(key, value);
      if (!this.peekTokenIs(tokens.RBRACE) && !this.expectPeek(tokens.COMMA)) {
        return null;
      }
    }
    if (!this.expectPeek(tokens.RBRACE)) {
      return null;
    }
    return new HashLiteral(tok, pairs);
  }

  registerPrefix(tokenType: string, fn: PrefixParseFn) {
    this.prefixParseFns[tokenType] = fn.bind(this);
  }
  registerInfix(tokenType: string, fn: InfixParseFn) {
    this.infixParseFns[tokenType] = fn.bind(this);
  }
}
