const fs = require('fs');
const { Transform, pipeline } = require('stream');
const readline = require('readline');
const inputFilePath = process.argv[2];
const outputFilePath = 'output.txt';

const wordSplitter = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  transform(chunk, encoding, callback) {
    const words = chunk
      .toString()
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/);
    words.forEach(word => this.push(word));
    callback();
  }
});

const wordCounter = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  transform(word, encoding, callback) {
    if (word) {
      if (!this.wordMap) this.wordMap = {};
      this.wordMap[word] = (this.wordMap[word] || 0) + 1;
    }
    callback();
  },
  flush(callback) {
    const sortedWords = Object.keys(this.wordMap).sort();
    const vector = sortedWords.map(word => this.wordMap[word]);
    this.push(vector.join(', '));
    callback();
  }
});

const readStream = fs.createReadStream(inputFilePath, 'utf-8');
const writeStream = fs.createWriteStream(outputFilePath);

pipeline(
  readStream,
  wordSplitter,
  wordCounter,
  writeStream,
  (err) => {
    if (err) {
      console.error('Error: pipeline', err);
    } else {
      console.log('Success: pipeline');
    }
  }
);