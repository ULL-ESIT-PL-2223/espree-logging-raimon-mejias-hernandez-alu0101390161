/**
 * 
 */
import * as escodegen from "escodegen";
import * as espree from "espree";
import * as estraverse from "estraverse";
import * as fs from "fs/promises";

/**
 * @desc
 * @param {*} inputFile 
 * @param {*} outputFile 
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
 * @desc
 * @param {*} code 
 * @returns 
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
 * @desc
 * @param {*} node 
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
