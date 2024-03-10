import { Token } from "../lexer/token";

interface ASTNode {
  tokenLiteral(): string;
  toString(): string;
}

export interface Statement extends ASTNode {
  statementNode(): void;
}

export interface Expression extends ASTNode {
  expressionNode(): void;
}

export class Program implements ASTNode {
  Statements: Statement[];

  constructor(statements: Statement[]) {
    this.Statements = statements;
  }

  tokenLiteral(): string {
    if (this.Statements.length > 0) {
      return this.Statements[0].tokenLiteral();
    } else {
      return "";
    }
  }

  toString(): string {
    return this.Statements.map(s => s.toString()).join("");
  }
}

export class LetStatement implements Statement {
  Token: Token;
  Name: Identifier;
  Value: Expression;

  constructor(token: Token, name: Identifier, value: Expression) {
    this.Token = token;
    this.Name = name;
    this.Value = value;
  }

  statementNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    let out: string = "";

    out += this.tokenLiteral() + " ";
    out += this.Name.toString();
    out += " = ";

    if (this.Value) {
      out += this.Value.toString();
    }

    out += ";";

    return out;
  }
}

export class ReturnStatement implements Statement {
  Token: Token;
  ReturnValue: Expression;

  constructor(token: Token, returnValue: Expression) {
    this.Token = token;
    this.ReturnValue = returnValue;
  }

  statementNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    let out: string = this.tokenLiteral() + " ";

    if (this.ReturnValue) {
      out += this.ReturnValue.toString();
    }

    out += ";";

    return out;
  }
}

export class ExpressionStatement implements Statement {
  Token: Token;
  Expression: Expression;

  constructor(token: Token, expression: Expression) {
    this.Token = token;
    this.Expression = expression;
  }

  statementNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    if (this.Expression) {
      return this.Expression.toString();
    }

    return "";
  }
}

export class BlockStatement implements Statement {
  Token: Token;
  Statements: Statement[];

  constructor(token: Token, statements: Statement[]) {
    this.Token = token;
    this.Statements = statements;
  }

  statementNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    let out: string = "";

    this.Statements.forEach(s => {
      out += s.toString();
    });

    return out;
  }
}

export class Identifier implements Expression {
  Token: Token;
  Value: string;

  constructor(token: Token, value: string) {
    this.Token = token;
    this.Value = value;
  }

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    return this.Value;
  }
}

export class BooleanExpression implements Expression {
  Token: Token;
  Value: boolean;

  constructor(token: Token, value: boolean) {
    this.Token = token;
    this.Value = value;
  }

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    return this.Token.literal;
  }
}

export class IntegerLiteral implements Expression {
  Token: Token;
  Value: number;

  constructor(token: Token, value: number) {
    this.Token = token;
    this.Value = value;
  }

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    return this.Token.literal;
  }
}

export class PrefixExpression implements Expression {
  Token: Token;
  Operator: string;
  Right: Expression;

  constructor(token: Token, operator: string, right: Expression) {
    this.Token = token;
    this.Operator = operator;
    this.Right = right;
  }

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    return "(" + this.Operator + this.Right.toString() + ")";
  }
}

export class InfixExpression implements Expression {
  Token: Token;
  Left: Expression;
  Operator: string;
  Right: Expression;

  constructor(
    token: Token,
    left: Expression,
    operator: string,
    right: Expression
  ) {
    this.Token = token;
    this.Left = left;
    this.Operator = operator;
    this.Right = right;
  }

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    return (
      "(" +
      this.Left.toString() +
      " " +
      this.Operator +
      " " +
      this.Right.toString() +
      ")"
    );
  }
}

export class IfExpression implements Expression {
  Token: Token;
  Condition: Expression;
  Consequence: BlockStatement;
  Alternative: BlockStatement | null;

  constructor(
    token: Token,
    condition: Expression,
    consequence: BlockStatement,
    alternative: BlockStatement | null
  ) {
    this.Token = token;
    this.Condition = condition;
    this.Consequence = consequence;
    this.Alternative = alternative;
  }

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    let out: string =
      "if" + this.Condition.toString() + " " + this.Consequence.toString();

    if (this.Alternative) {
      out += "else " + this.Alternative.toString();
    }

    return out;
  }
}

export class FunctionLiteral implements Expression {
  Token: Token;
  Parameters: Identifier[];
  Body: BlockStatement;

  constructor(token: Token, parameters: Identifier[], body: BlockStatement) {
    this.Token = token;
    this.Parameters = parameters;
    this.Body = body;
  }

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    let params: string[] = this.Parameters.map(p => p.toString());

    return (
      this.tokenLiteral() +
      "(" +
      params.join(", ") +
      ") " +
      this.Body.toString()
    );
  }
}

export class CallExpression implements Expression {
  Token: Token;
  Function: Expression;
  Arguments: Expression[];

  constructor(token: Token, func: Expression, args: Expression[]) {
    this.Token = token;
    this.Function = func;
    this.Arguments = args;
  }

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    let args: string[] = this.Arguments.map(a => a.toString());

    return this.Function.toString() + "(" + args.join(", ") + ")";
  }
}

export class StringLiteral implements Expression {
  Token: Token;
  Value: string;

  constructor(token: Token, value: string) {
    this.Token = token;
    this.Value = value;
  }

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    return this.Token.literal;
  }
}

export class ArrayLiteral implements Expression {
  Token: Token;
  Elements: Expression[];

  constructor(token: Token, elements: Expression[]) {
    this.Token = token;
    this.Elements = elements;
  }

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    let elements: string[] = this.Elements.map(e => e.toString());

    return "[" + elements.join(", ") + "]";
  }
}

export class IndexExpression implements Expression {
  Token: Token;
  Left: Expression;
  Index: Expression;

  constructor(token: Token, left: Expression, index: Expression) {
    this.Token = token;
    this.Left = left;
    this.Index = index;
  }

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    return "(" + this.Left.toString() + "[" + this.Index.toString() + "])";
  }
}

export class HashLiteral implements Expression {
  Token: Token;
  Pairs: Map<Expression, Expression>;

  constructor(token: Token, pairs: Map<Expression, Expression>) {
    this.Token = token;
    this.Pairs = pairs;
  }

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.Token.literal;
  }
  toString(): string {
    let pairs: string[] = [];
    this.Pairs.forEach((value, key) => {
      pairs.push(key.toString() + ":" + value.toString());
    });

    return "{" + pairs.join(", ") + "}";
  }
}
