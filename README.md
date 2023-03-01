[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-f4981d0f882b2a3f0472912d15f9806d57e124e0fc890972558857b51b24a6f9.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=10330046)
# Lab: Espree logging

## Información de la práctica

- Universidad de La Laguna
- Escuela Superior de Ingeniería y Tecnología
- Grado en Ingeniería Informatica
- Curso: 3º
- Asignatura: Procesadores de Lenguajes
- Fecha: 01/03/2023
- Autor: Raimon Mejías Hernández
- Correo: alu0101390161@ull.edu.es

## listado de las tareas a realizar 

* Utilizar commander para la línea de comandos 
  * Opciones en la línea de comandos (-V(--version),, -o(--output), -h(--help))
* Añadir mensaje de logs a la entrada de las funciones
  * Reto 1: Soportar las Arrow functions
  * Reto 2: Indicar el número de línea en la que se encuentra la función
* Realizar test con Mocha
* Realizar un estudio de cubrimiento con nyc
* Realizar integración continua con GitHub Actions
* Crear Scripts para ejecutar el programa
* Documentar el código utilizando JSDoc
* Publicar el paquete en npmjs
* Redactar el informe

## Tareas realizadas

A continuación se detallan paso a paso todas las tareas realizadas

## Utilizar commander para la línea de comandos 

Utilizando la libreria commander se puede realizar el paso de argumentos al programa de una manera sencilla y rápida.
Indicando en `Program` Todos los argumentos y opciones que nuestro programa permite, realizando por ultimo una lectura de
los argumentos del programa.

```JavaScript
program
  .version(version)
  .argument("<filename>", 'file with the original code')
  .option("-o, --output <filename>", "file in which to write the output")
  .action((filename, options) => {
    transpile(filename, options.output);
  });

program.parse(process.argv);
```

### Opciones de la línea de comandos

- <fichero>  Fichero que contiene una función escrita en JS, del cual se creara un AST
- -V --version: Muestra la versión actual del programa
- -o --output <fichero>: Vuelca el nuevo código JS generado a partir de la modificación del AST original.
- -h --help : Muestra la información de ayuda del programa

## Añadir mensaje de logs a la entrada de las funciones

Utilizando la plantilla del fichero `logging-espree.js`, se ha procedido a rellenar las funciones con el código necesario:

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
La función transpile es muy parecida a la de las prácticas anteriores, con la unica diferencia de realizar la llamada a la función addLogging, la cual
es otra función que se debe implementar en esta práctica.

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
La función addLogging se encarga de general el AST del código JS leido originalmente, para luego utilizar la función traverse de la libreria estraverse para
realizar la modificación de los nodos de tipo función, llamando así a la función addBeforeCode.

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
La funcion addBeforeCode se encarga de conseguir toda la información necesaria para generar el console.log que se va a añadir justo debajo de la 
declaración de la función, por ultimo modifica el AST original añadiendole a la función nuevos nodos en el body.

### Indicar los valores de los argumentos

Como se puede observar en el código de la función addBeforeCode, se realiza un recorrido por los parametros de la función, obteniendo así los
nombres de los parametros

```javascript
  let parameters = '';
  for (let i = 0; i < node.params.length; i++) { 
    parameters +=  '${ ' + node.params[i].name + ' }' + ((i < node.params.length - 1)? ', ' : '');
  }
```

### Reto 1: Soportar las funciones Arrow

Para permitir que el código de `logging-espree.js` soporte la aparición de expresiones del estilo:

```JavaScript
a => { return a; }
(a, b) => { 
  let c = a + b;
  return c;
}
```
Se ha de añadir, a las condiciones del if dentro de la función traverse, la condición `node.type === 'ArrowFunctionExpression'` Permitiendo así detectar los nodos de dicho tipo y realizando la modificación pertinente.

### Reto 2: Indicar el número de línea en la que se encuentra la función

Para obtener el número de línea en la que se encuentra la función detectada se ha incluir en los parametros pasados a la función `espree.parse()` el objeto `{loc: true}`
Obteniendo así un AST que contiene los campos loc.start.line, consiguiendo así el número de línea de la función.

```JavaScript 
let ast = espree.parse(code, {ecmaVersion: 12, loc: true}); // Función AddLogging
const line = node.loc.start.line; // Funcion addBeforeCode
```

### Documentar el código utilizando JSDoc

Junto con el código creado se ha realizado una documentación exhaustiva del código, explicando toda la información necesaria para entender el código creado.
Se ha utilizado el formato JSDoc para la realización de los comentarios de cabecera de las funciones y del programa.

```JavaScript 
/**
 * @desc It takes a string and convert it to an AST, then proceeds to 
 * insert the new console.log in each function that find
 * @param {String} code - An string that contain a function
 * @returns Returns the new JavaScript code generated from the modified AST
 */
```

Ejemplo de un comentario JSDoc para la función `addLogging`

## Tests and Covering

Como se ha relizado en anteriores prácticas se ha utilizado la metodología de Stubbing para relizar modificaciones en el método console.log permitiendo así utilizarlo para realizar
las comprobaciones de los tests.

```JavaScript
async function calculate(outputLog, correctFile) {
  const correct = await fs.readFile(correctFile, 'utf-8');
  let log = console.log;
  let result = ' ';
  console.log = function (...space) { result += space.join(''); }
  eval(outputLog);
  console.log = log;
  return [result, correct];
}
```

Antes de realizar el calculo primero se debe realizar el transpile, para ello se llama a: 

```JavaScript
async function getLog(inputFile, outputFile, expectedFile) {
  await transpile(inputFile, outputFile);
  const output = await fs.readFile(outputFile, 'utf-8');
  const expected = await fs.readFile(expectedFile, 'utf-8');
  return [output, expected];  
}
```

Por ultimo se realizan iterativamente los tests que se encuentran definidos en el fichero `test-description.mjs`

### Realización del covering con nyc

Para la realización de esta práctica se ha pedido que en el package.json se indique el campo "type" con "module". Esto tiene un efecto negativo en la ejecución del estudio de cubrimiento del código con nyc, realizando una búsqueda en internet se encuentra que nyc no soporta la ejecución con el tipo module: 

![problea_nyc](https://github.com/istanbuljs/nyc/issues/1353)

## Realizar integración continua con GitHub Actions

Utilizando el fichero creado en la práctica anterior se ha realizado la integración continua automatica con GitHub Actions 

## Crear Scripts para ejecutar el programa

A continuación se listan todos los scripts que se pueden ejecutar en el package.json

- `npm run test`: Realiza la ejecución de todos los tests
- `npm run cov`: Realiza la ejecución de todos los tests dando como resultado el estudio de cobertura
- `npm run clear`: Borra todos los ficheros temporales .js del directorio test/js

## Publicar el paquete en npmjs




## References 

* [Lab espree logging](https://ull-esit-gradoii-pl.github.io//practicas/espree-logging)
* Examples at [Repo ULL-ESIT-GRADOII-PL/esprima-pegjs-jsconfeu-talk](https://github.com/ULL-ESIT-GRADOII-PL/esprima-pegjs-jsconfeu-talk)
* Example [crguezl/hello-jison](https://github.com/crguezl/hello-jison)
* [Espree](https://github.com/eslint/espree)
  * [Options for parse and tokenize methods](https://github.com/eslint/espree#options)
* <a href="https://astexplorer.net/" target="_blank">astexplorer.net demo</a>
* [idgrep.js](https://github.com/ULL-ESIT-GRADOII-PL/esprima-pegjs-jsconfeu-talk/blob/master/idgrep.js)
* [Introducción a los Compiladores](https://ull-esit-gradoii-pl.github.io/temas/introduccion-a-pl/esprima.html) con Jison y Espree