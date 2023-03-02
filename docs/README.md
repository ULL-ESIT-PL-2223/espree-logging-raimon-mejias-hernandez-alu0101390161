- Universidad de La Laguna
- Escuela Superior de Ingeniería y Tecnología
- Grado en Ingeniería Informatica
- Curso: 3º
- Asignatura: Procesadores de Lenguajes
- Fecha: 01/03/2023
- Autor: Raimon Mejías Hernández
- Correo: alu0101390161@ull.edu.es

El módulo espree-logging contiene las siguientes funciones: 

## Función transpile
La función transpile se encarga de leer el fichero con el código JavaScript y para
todas las funciones que encuentre en el fichero de entrada, le añadirá un console.log
al inicio de cada función, indicando el el nombre de la función, los parámetros de la función y el número de línea

```JavaScript
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
```

## Función addLogging

La función addLogging toma como parametro una string que contenga código JavaScript y genera el AST 
correspondiente, para luego llamar a la función traverse de la libreria estraverse, dentro se realiza un recorrido del árbol
ejecutando la función indicada en enter cada vez que se encuentra con un nuevo nodo.
La función ejecutada será addBeforeCode y se llamará solamente con los nodos que contengan la información de las funciones.
Por ultimo devolverá el nuevo AST producto de la modificación del AST original

```JavaScript
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
```

## Función addBeforeCode

La función addBeforeCode se encarga de obtener la información necesaria para crear la string que contenga el console.log
a insertar, por ultimo se encarga de general el AST del console.log y de insertarlo en el body del nodo de tipo función. 

```JavaScript
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
```