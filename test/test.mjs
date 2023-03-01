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
 * 
 * @param {*} inputFile 
 * @param {*} outputFile 
 * @param {*} expectedFile 
 * @returns 
 */
async function getLog(inputFile, outputFile, expectedFile) {
  await transpile(inputFile, outputFile);
  const output = await fs.readFile(outputFile, 'utf-8');
  const expected = await fs.readFile(expectedFile, 'utf-8');
  // await fs.unlink(outputFile);
  return [output, expected];  
}

/**
 * 
 * @param {*} outputLog 
 * @param {*} correctFile 
 * @returns 
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
 * 
 * @param {*} s 
 * @returns 
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


