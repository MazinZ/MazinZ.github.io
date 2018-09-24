const fs = require('fs');
const readline = require('readline');
/*
  Space complexity: O(n),
  Time complexity: O(nlogn) (bottleneck is sorting)
  where n is # of unique request urls

  Thoughts for improvement:

  - Error handling

  - Runtime/space efficiency would likely be important as log files get large very quickly.

  - This script isn't flexible enough to handle top k elements.

  - The script is inefficient for repeated calculations of top 10 elements
  (since logs frequently update)

  - We can cut down on memory usage by using a radix trie or similar
  to take advantage of the fact that most requested files will
  have similar string prefixing

*/

(function() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Please enter a filename: ', (file) => {
    rl.close();
    fs.readFile(file, 'utf8', (err, data) => {
      main(data);
    });
  });
}());

function main(data) {
  const lines = data.split(/\r?\n/).filter(line => !!line);
  const parsed = lines.map(line => parse(line));
  const ranked = rank(parsed);
  output(ranked, 10);
}

function output(results, count) {
  const n = Math.min(results.length, count);
  for (let i = 0; i < n; i+=1) {
    console.log(results[i][0], results[i][1]);
  }
}

function parse(line) {
  const regex = /(?<=\[)(.*?)(?=\])|(?<=")(.*?)(?=")|[0-9]+/g;
  const matches = line.match(regex);
  const request = matches[1].split(' ');

  return {
    date: matches[0],
    httpCode: +matches[2],
    bytes: +matches[3],
    request: request[0],
    url: request[1],
  };
}

function rank(parsed) {
  const bytes = {};
  for (let i = 0; i < parsed.length; i+=1) {
    const entry = parsed[i];
    const success = entry.httpCode >= 200 && entry.httpCode <= 299;
    if (entry.request === 'GET' && success) {
      bytes[entry.url] = (bytes[entry.url] + entry.bytes) || entry.bytes;
    }
  }
  const entries = [];
  for (const [key, val] of Object.entries(bytes)) {
    entries.push([key, val]);
  }
  entries.sort((a, b) => a[1] - b[1]);
  return entries;
}
