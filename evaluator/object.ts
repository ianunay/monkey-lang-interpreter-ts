import { BlockStatement, Identifier } from "../parser/ast";
import { Environment } from "./environment";

type ObjectType = string;

const object = {
  NULL_OBJ: "NULL",
  ERROR_OBJ: "ERROR",

  INTEGER_OBJ: "INTEGER",
  BOOLEAN_OBJ: "BOOLEAN",
  STRING_OBJ: "STRING",

  RETURN_VALUE_OBJ: "RETURN_VALUE",

  FUNCTION_OBJ: "FUNCTION",
  BUILTIN_OBJ: "BUILTIN",

  ARRAY_OBJ: "ARRAY",
  HASH_OBJ: "HASH",
};

type HashKey = {
  type: ObjectType;
  value: number;
};

type Hashable = {
  hashKey(): HashKey;
};

export interface ObjectStore {
  type: ObjectType;
  inspect(): string;
}

export class IntegerObject implements ObjectStore {
  value: number;
  type: string;

  constructor(value: number) {
    this.value = value;
    this.type = object.INTEGER_OBJ;
  }

  inspect(): string {
    return this.value.toString();
  }
}

export class BooleanObject implements ObjectStore {
  value: boolean;
  type: string;

  constructor(value: boolean) {
    this.value = value;
    this.type = object.BOOLEAN_OBJ;
  }

  inspect(): string {
    return this.value.toString();
  }
}

export class NullObject implements ObjectStore {
  type: string;
  value: null;

  constructor() {
    this.type = object.NULL_OBJ;
    this.value = null;
  }

  inspect(): string {
    return "null";
  }
}

export class ReturnValue implements ObjectStore {
  value: ObjectStore;
  type: string;

  constructor(value: ObjectStore) {
    this.value = value;
    this.type = object.RETURN_VALUE_OBJ;
  }

  inspect(): string {
    return this.value.inspect();
  }
}

export class ErrorObject implements ObjectStore {
  message: string;
  type: string;

  constructor(message: string) {
    this.message = message;
    this.type = object.ERROR_OBJ;
  }

  inspect(): string {
    return `ERROR: ${this.message}`;
  }
}

export class FunctionObject implements ObjectStore {
  parameters: Identifier[];
  body: BlockStatement;
  env: Environment;
  type: string;

  constructor(
    parameters: Identifier[],
    body: BlockStatement,
    env: Environment
  ) {
    this.parameters = parameters;
    this.body = body;
    this.env = env;
    this.type = object.FUNCTION_OBJ;
  }

  inspect(): string {
    let out: string = "";
    let params: string[] = [];

    this.parameters.forEach(p => {
      params.push(p.toString());
    });

    out += "fn";
    out += "(";
    out += params.join(", ");
    out += ") {\n";
    out += this.body.toString();
    out += "\n}";

    return out;
  }
}

export class StringObject implements ObjectStore {
  value: string;
  type: string;

  constructor(value: string) {
    this.value = value;
    this.type = object.STRING_OBJ;
  }

  inspect(): string {
    return this.value;
  }

  // TODO: Implement hashKey
  hashKey(): HashKey {
    return { type: this.type, value: this.value.length };
  }
}

export class BuiltinObject implements ObjectStore {
  fn: (...args: ObjectStore[]) => ObjectStore;
  type: string;

  constructor(fn: (...args: ObjectStore[]) => ObjectStore) {
    this.fn = fn;
    this.type = object.BUILTIN_OBJ;
  }

  inspect(): string {
    return "builtin function";
  }
}

export class ArrayObject implements ObjectStore {
  elements: ObjectStore[];
  type: string;

  constructor(elements: ObjectStore[]) {
    this.elements = elements;
    this.type = object.ARRAY_OBJ;
  }

  inspect(): string {
    let out: string = "";
    let elements: string[] = [];

    this.elements.forEach(e => {
      elements.push(e.inspect());
    });

    out += "[";
    out += elements.join(", ");
    out += "]";

    return out;
  }
}
// TODO: Implement hashKey and hashable properly
export class HashPair {
  pairs: Map<string, ObjectStore>;
  type: string;

  constructor(pairs: Map<string, ObjectStore>) {
    this.pairs = pairs;
    this.type = object.HASH_OBJ;
  }

  inspect(): string {
    let out: string = "";
    let pairs: string[] = [];

    this.pairs.forEach((value, key) => {
      pairs.push(`${key}: ${value.inspect()}`);
    });

    out += "{";
    out += pairs.join(", ");
    out += "}";

    return out;
  }
}
