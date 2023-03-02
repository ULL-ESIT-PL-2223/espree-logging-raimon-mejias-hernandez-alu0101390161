/**
 * Universidad de La Laguna
 * Escuela Superior de Ingeniería y Tecnología
 * Grado en Ingeniería Informática
 * Curso 3º
 * Procesadores de Lenguajes
 *
 * @author Raimon Mejías Hernández
 * @since Mar 1 2023
 * @desc logging espree
 * The program implements a function called addLogging that 
 *  - Analyze the JS code passed as an argument 
 *  - Produce a new equivalent JS code that has new console.log messages at the beginning of 
 *    each function (declaration, expression or arrow)
 * @see {@link https://ull-esit-gradoii-pl.github.io//practicas/espree-logging}
 * 
 */
import * as escodegen from "escodegen";
import * as espree from "espree";
import * as estraverse from "estraverse";
import * as fs from "fs/promises";

/**
 * @desc A function whose purpose is to transpile the function stored in the
 * input file and then return a new function with some console.log added
 * @param {String} inputFile - The file with the original function 
 * @param {String} outputFile - The file where the new function will be stored
 * if no output file is passed then it will print the result in the console
 */
export async function transpile(inputFile, outputFile) {
  try {
    const code = await fs.readFile(inputFile, 'utf-8');
    const ast = addLogging(code);
    if (!outputFile) { 
      console.log(ast); 
    } else {
      await fs.writeFile(outputFile, ast);
    }
  } catch (SyntaxError) {
    console.log('espree couldn\'t create the ast while transpiling the inputfile');
    console.log(`${SyntaxError.name}: ${SyntaxError.message} at line ${SyntaxError.lineNumber}`);
  }
}

/**
 * @desc It takes a string and convert it to an AST, then proceeds to 
 * insert the new console.log in each function that find
 * @param {String} code - An string that contain a function
 * @returns Returns the new JavaScript code generated from the modified AST
 */
export function addLogging(code) {
  let ast = espree.parse(code, {ecmaVersion: 12, loc: true});
  estraverse.traverse(ast, { 
    enter: function(node, parent) {
        if (node.type === 'FunctionDeclaration' || 
            node.type === 'FunctionExpression'  ||
            node.type === 'ArrowFunctionExpression') {
              addBeforeCode(node);
            }
        }
    });
  return escodegen.generate(ast);
}

/**
 * @desc Insert a new node in the body of the parameter node
 * takes the name, line number and parameters of the function and 
 * creates the new console.log inside the function
 * @param {object} node - A node of type function(declaration, expression or arrow)
 */
function addBeforeCode(node) {
  const name = (node.id)? node.id.name : '<anonymous function>';
  const line = node.loc.start.line;
  let parameters = '';
  for (let i = 0; i < node.params.length; i++) { 
    parameters +=  '${ ' + node.params[i].name + ' }' + ((i < node.params.length - 1)? ', ' : '');
  }
  const beforeCode = `console.log(\`Entering ${name}(${parameters}) at line ${line}\`)`;
  const beforeNodes = espree.parse(beforeCode, {ecmaVersion: 12}).body;
  node.body.body = beforeNodes.concat(node.body.body);
}
