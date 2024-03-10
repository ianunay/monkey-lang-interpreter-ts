import { Eval } from "./evaluator";
import { Environment } from "./evaluator/environment";
import Lexer from "./lexer";
import Parser from "./parser";

const fs = require("fs");

const filename = process.argv[2];

const fileContents = fs.readFileSync(filename, "utf8");

const lexer = new Lexer(fileContents);
const parser = new Parser(lexer);
const program = parser.parseProgram();
const env = new Environment();

// console.log(JSON.stringify(program, null, 2));
console.log(Eval(program, env).inspect());
