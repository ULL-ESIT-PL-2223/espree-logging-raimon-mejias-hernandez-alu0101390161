import { transpile } from "../src/logging-espree.js";
import assert from 'assert';
import * as fs from "fs/promises";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
import Tst from './test-description.mjs';

const Test = Tst.map(t => ({
  input: __dirname + '/data/' + t.input,
  output: __dirname + '/data/' + t.output,
  correctLogged: __dirname + '/data/' + t.correctLogged,
  correctOut: __dirname + '/data/' + t.correctOut,
})
)

async function getLog(inputFile, outputFile, expectedFile) {
  await transpile(inputFile, outputFile);
  const output = await fs.readFile(outputFile, 'utf-8');
  const expected = await fs.readFile(expectedFile, 'utf-8');
  await fs.unlink(outputFile);
  return [output, expected];  
}

async function calculate(outputLog, correctFile) {
  const correct = await fs.readFile(correctFile, 'utf-8');
  let log = console.log;
  let result = ' ';
  console.log = function (...space) { result += space.join(''); }
  eval(outputLog);
  console.log = log;
  return [result, correct];
}

function removeSpaces(s) {
  return s.replace(/\s/g, '');
}

for (let i = 0; i < Test.length; i++) {
  describe(`transpile ${Test[i].input}`, async () => {
    it(`tested with ${Test[i].correctLogged}`, async () => {
      const result = getLog(Test[i].input, Test[i].output, Test[i].expected); 
      assert.equal(removeSpaces(result[0]), removeSpaces(result[1]));
    });
    it(`tested with ${Test[i].correctOut}`, async () => {
      const output =  getLog(Test[i].input, Test[i].output, Test[i].expected)[0]; 
      const result = calculate(output, Test[i].correctOut)
      assert.equal(removeSpaces(result[0]), removeSpaces(result[1]));
    });
  });
}


