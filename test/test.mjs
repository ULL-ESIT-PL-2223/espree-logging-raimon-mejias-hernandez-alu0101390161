/**
 * Universidad de La Laguna
 * Escuela Superior de Ingeniería y Tecnología
 * Grado en Ingeniería Informática
 * Curso 3º
 * Procesadores de Lenguajes
 *
 * @author Raimon Mejías Hernández
 * @since Mar 1 2023
 * @desc test
 * Contains all the tests of the program
 * @see {@link https://ull-esit-gradoii-pl.github.io//practicas/espree-logging}
 * 
 */
import { transpile } from "../src/logging-espree.js";
import assert from 'assert';
import * as fs from "fs/promises";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
import Tst from './test-description.mjs';

const Test = Tst.map(t => ({
  input: __dirname + '/input/' + t.input,
  output: __dirname + '/js/' + t.output,
  correctLogged: __dirname + '/correct/' + t.correctLogged,
  correctOut: __dirname + '/output/' + t.correctOut,
})
)

/**
 * @desc read the input file and creates a javascript code that is stored in
 * the output file and should be equal to the expected file
 * @param {String} inputFile - The file with the function that is going to be transpiled
 * @param {String} outputFile - The file where the new JavaScript is going to be stored
 * @param {String} expectedFile - The file that should contain the exact same code that the outputfile
 * @returns {[String, String]} - An array with the output code and the expected code both in a string
 */
async function getLog(inputFile, outputFile, expectedFile) {
  await transpile(inputFile, outputFile);
  const output = await fs.readFile(outputFile, 'utf-8');
  const expected = await fs.readFile(expectedFile, 'utf-8');
  return [output, expected];  
}

/**
 * @desc Use stubbing methods to change the console.log 
 * Then use it to return the result and the expected output
 * @param {*} outputLog - The expected output string that contains the function
 * @param {*} correctFile - The file that contains the correct js 
 * file that should be inside the outputlog
 * @returns {[string, string]} - returns an array with the result in the first position
 * and the correct result in the second position
 */
async function calculate(outputLog, correctFile) {
  const correct = await fs.readFile(correctFile, 'utf-8');
  let log = console.log;
  let result = ' ';
  console.log = function (...space) { result += space.join(''); }
  eval(outputLog);
  console.log = log;
  return [result, correct];
}

/**
 * @desc Clear all the whitespaces in a string
 * @param {String} s - The string to remove the whitespaces 
 * @returns The new strings without the whitespaces
 */
function removeSpaces(s) {
  return s.replace(/\s/g, '');
}

for (let i = 0; i < Test.length; i++) {
  describe(`transpile ${Test[i].input}`, async () => {
    it(`tested with ${Test[i].correctLogged} (correctLoggedFile)`, async () => {
      const result = await getLog(Test[i].input, Test[i].output, Test[i].correctLogged);
      assert.equal(removeSpaces(result[0]), removeSpaces(result[1]));
    });
    it(`tested with ${Test[i].correctOut} (correctOutFile)`, async () => {
      const output = await getLog(Test[i].input, Test[i].output, Test[i].correctLogged); 
      const result = await calculate(output[0], Test[i].correctOut)
      assert.equal(removeSpaces(result[0]), removeSpaces(result[1]));
    });
  });
}


