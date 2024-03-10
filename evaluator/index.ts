import {
  ASTNode,
  Program,
  ExpressionStatement,
  BlockStatement,
  ReturnStatement,
  LetStatement,
  IntegerLiteral,
  StringLiteral,
  BooleanExpression,
  PrefixExpression,
  InfixExpression,
  IfExpression,
  Identifier,
  FunctionLiteral,
  CallExpression,
  ArrayLiteral,
  IndexExpression,
  HashLiteral,
} from "../parser/ast";
import { Environment } from "./environment";
import {
  ArrayObject,
  BooleanObject,
  ErrorObject,
  FunctionObject,
  HashPair,
  IntegerObject,
  NullObject,
  ObjectStore,
  ReturnValue,
  StringObject,
} from "./object";

export function Eval(node: ASTNode, env: Environment): ObjectStore {
  if (node instanceof Program) {
    return evalProgram(node, env);
  } else if (node instanceof BlockStatement) {
    return evalBlockStatement(node, env);
  } else if (node instanceof ExpressionStatement) {
    return Eval(node.Expression, env);
  } else if (node instanceof ReturnStatement) {
    if (node.ReturnValue === null) {
      return new ReturnValue(new ErrorObject("return value is null"));
    }
    const value = Eval(node.ReturnValue, env);
    if (value instanceof ErrorObject) {
      return value;
    }
    return new ReturnValue(value);
  } else if (node instanceof LetStatement) {
    if (node.Value === null) {
      return new ErrorObject("let value is null");
    }
    const value = Eval(node.Value, env);
    if (value instanceof ErrorObject) {
      return value;
    }
    env.set(node.Name.Value, value);
    return value;
  }
  // Expressions
  else if (node instanceof IntegerLiteral) {
    return new IntegerObject(node.Value);
  } else if (node instanceof StringLiteral) {
    return new StringObject(node.Value);
  } else if (node instanceof BooleanExpression) {
    return new BooleanObject(node.Value);
  } else if (node instanceof PrefixExpression) {
    const right = Eval(node.Right, env);
    if (right instanceof ErrorObject) {
      return right;
    }
    return evalPrefixExpression(node.Operator, right);
  } else if (node instanceof InfixExpression) {
    const left = Eval(node.Left, env);
    if (left instanceof ErrorObject) {
      return left;
    }

    const right = Eval(node.Right, env);
    if (right instanceof ErrorObject) {
      return right;
    }

    return evalInfixExpression(node.Operator, left, right);
  } else if (node instanceof IfExpression) {
    return evalIfExpression(node, env);
  } else if (node instanceof Identifier) {
    return evalIdentifier(node, env);
  } else if (node instanceof FunctionLiteral) {
    if (node.Parameters === null || node.Body === null) {
      return new ErrorObject("function literal parameters or body is null");
    }
    const parameters = node.Parameters;
    const body = node.Body;
    return new FunctionObject(parameters, body, env);
  } else if (node instanceof CallExpression) {
    const func = Eval(node.Function, env);
    if (func instanceof ErrorObject) {
      return func;
    }
    if (node.Arguments === null) {
      return new ErrorObject("call expression arguments is null");
    }
    const args = evalExpressions(node.Arguments, env);
    if (args.length === 1 && args[0] instanceof ErrorObject) {
      return args[0];
    }

    return applyFunction(func, args);
  } else if (node instanceof ArrayLiteral) {
    const elements = evalExpressions(node.Elements, env);
    if (elements.length === 1 && elements[0] instanceof ErrorObject) {
      return elements[0];
    }
    return new ArrayObject(elements);
  } else if (node instanceof IndexExpression) {
    const left = Eval(node.Left, env);
    if (left instanceof ErrorObject) {
      return left;
    }
    const index = Eval(node.Index, env);
    if (index instanceof ErrorObject) {
      return index;
    }
    return evalIndexExpression(left, index);
  } else if (node instanceof HashLiteral) {
    return evalHashLiteral(node, env);
  } else {
    return new ErrorObject("unknown node type");
  }
}

function evalProgram(program: Program, env: Environment): ObjectStore {
  let result = {} as ObjectStore;

  for (const statement of program.Statements) {
    result = Eval(statement, env);
    if (result instanceof ReturnValue) {
      return result.value;
    } else if (result instanceof ErrorObject) {
      return result;
    }
  }

  return result;
}

function evalBlockStatement(
  block: BlockStatement,
  env: Environment
): ObjectStore {
  let result = {} as ObjectStore;

  for (const statement of block.Statements) {
    result = Eval(statement, env);
    if (result instanceof ReturnValue || result instanceof ErrorObject) {
      return result;
    }
  }

  return result;
}

function evalPrefixExpression(
  operator: string,
  right: ObjectStore
): ObjectStore {
  if (operator === "!") {
    return evalBangOperatorExpression(right);
  } else if (operator === "-") {
    return evalMinusPrefixOperatorExpression(right);
  }
  return new ErrorObject(`unknown operator: ${operator}${right}`);
}

function evalInfixExpression(
  operator: string,
  left: ObjectStore,
  right: ObjectStore
): ObjectStore {
  if (left instanceof IntegerObject && right instanceof IntegerObject) {
    return evalIntegerInfixExpression(operator, left, right);
  } else if (left instanceof StringObject && right instanceof StringObject) {
    return evalStringInfixExpression(operator, left, right);
  } else if (operator === "==") {
    return new BooleanObject(
      (left as BooleanObject).value === (right as BooleanObject).value
    );
  } else if (operator === "!=") {
    return new BooleanObject(
      (left as BooleanObject).value !== (right as BooleanObject).value
    );
  } else if (left instanceof ErrorObject) {
    return left;
  } else if (right instanceof ErrorObject) {
    return right;
  }
  return new ErrorObject(
    `unknown operator: ${left.type} ${operator} ${right.type}`
  );
}

function evalBangOperatorExpression(right: ObjectStore): ObjectStore {
  if (right instanceof BooleanObject) {
    return new BooleanObject(!right.value);
  } else if (right instanceof NullObject) {
    return new BooleanObject(true);
  }
  return new BooleanObject(false);
}

function evalMinusPrefixOperatorExpression(right: ObjectStore): ObjectStore {
  if (right instanceof IntegerObject) {
    return new IntegerObject(-right.value);
  } else if (right instanceof ErrorObject) {
    return right;
  }
  return new ErrorObject(`unknown operator: -${right}`);
}

function evalIntegerInfixExpression(
  operator: string,
  left: IntegerObject,
  right: IntegerObject
): ObjectStore {
  switch (operator) {
    case "+":
      return new IntegerObject(left.value + right.value);
    case "-":
      return new IntegerObject(left.value - right.value);
    case "*":
      return new IntegerObject(left.value * right.value);
    case "/":
      return new IntegerObject(left.value / right.value);
    case "<":
      return new BooleanObject(left.value < right.value);
    case ">":
      return new BooleanObject(left.value > right.value);
    case "==":
      return new BooleanObject(left.value === right.value);
    case "!=":
      return new BooleanObject(left.value !== right.value);
    default:
      return new ErrorObject(
        `unknown operator: ${left.type} ${operator} ${right.type}`
      );
  }
}

function evalStringInfixExpression(
  operator: string,
  left: StringObject,
  right: StringObject
): ObjectStore {
  if (operator !== "+") {
    return new ErrorObject(
      `unknown operator: ${left.type} ${operator} ${right.type}`
    );
  }
  return new StringObject(left.value + right.value);
}

function evalIfExpression(ie: IfExpression, env: Environment): ObjectStore {
  const condition = Eval(ie.Condition, env);
  if (condition instanceof ErrorObject) {
    return condition;
  }
  if (isTruthy(condition)) {
    return Eval(ie.Consequence, env);
  } else if (ie.Alternative !== null) {
    return Eval(ie.Alternative, env);
  }
  return new NullObject();
}

function isTruthy(obj: ObjectStore): boolean {
  if (obj instanceof BooleanObject) {
    return obj.value;
  } else if (obj instanceof NullObject) {
    return false;
  }
  return true;
}

function evalIdentifier(node: Identifier, env: Environment): ObjectStore {
  const val = env.get(node.Value);
  if (val) {
    return val;
  }
  return new ErrorObject(`identifier not found: ${node.Value}`);
}

function evalExpressions(
  exps: ASTNode[],
  env: Environment
): ObjectStore[] | [ErrorObject] {
  const result = [] as ObjectStore[];
  for (const e of exps) {
    const evaluated = Eval(e, env);
    if (evaluated instanceof ErrorObject) {
      return [evaluated];
    }
    result.push(evaluated);
  }
  return result;
}

function applyFunction(fn: ObjectStore, args: ObjectStore[]): ObjectStore {
  if (fn instanceof FunctionObject) {
    const extendedEnv = extendFunctionEnv(fn, args);
    const evaluated = Eval(fn.body, extendedEnv);
    return unwrapReturnValue(evaluated);
  }
  return new ErrorObject(`not a function: ${fn.type}`);
}

function extendFunctionEnv(
  fn: FunctionObject,
  args: ObjectStore[]
): Environment {
  const env = new Environment(fn.env);

  for (let i = 0; i < fn.parameters.length; i++) {
    env.set(fn.parameters[i].Value, args[i]);
  }

  return env;
}

function unwrapReturnValue(obj: ObjectStore): ObjectStore {
  if (obj instanceof ReturnValue) {
    return obj.value;
  }
  return obj;
}

function evalIndexExpression(
  left: ObjectStore,
  index: ObjectStore
): ObjectStore {
  if (left instanceof ArrayObject && index instanceof IntegerObject) {
    return evalArrayIndexExpression(left, index);
  } else if (left instanceof ErrorObject) {
    return left;
  } else if (index instanceof ErrorObject) {
    return index;
  }
  return new ErrorObject(`index operator not supported: ${left.type}`);
}

function evalArrayIndexExpression(
  array: ArrayObject,
  index: IntegerObject
): ObjectStore {
  const idx = index.value;
  const max = array.elements.length - 1;
  if (idx < 0 || idx > max) {
    return new NullObject();
  }
  return array.elements[idx];
}

function evalHashLiteral(node: HashLiteral, env: Environment): ObjectStore {
  const pairs = new Map<string, ObjectStore>();
  for (const [keyNode, valueNode] of node.Pairs) {
    const key = Eval(keyNode, env);
    if (key instanceof ErrorObject) {
      return key;
    }
    const value = Eval(valueNode, env);
    if (value instanceof ErrorObject) {
      return value;
    }
    const hashKey = key as StringObject;
    pairs.set(hashKey.value, value);
  }
  return new HashPair(pairs);
}
