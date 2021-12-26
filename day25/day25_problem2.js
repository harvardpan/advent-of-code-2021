// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function getCharacter(algorithm, inputImage, row, col, iteration) {
  if (row < 0 || row >= inputImage.length || col < 0 || col >= inputImage[0].length) {
    if (iteration % 2) {
      return algorithm[0];
    }
    return '.';
  }
  return inputImage[row][col];
}

function getOutputPixel(algorithm, inputImage, row, col, iteration) {
  let pixelString = [ ];
  for (let i = row - 1; i <= row + 1; ++i) {
    for (let j = col - 1; j <= col + 1; ++j) {
      pixelString.push(getCharacter(algorithm, inputImage, i, j, iteration));
    }
  }
  let pixelNumber = Number.parseInt(pixelString.map(x => {
    if (x === '#') return '1';
    return '0';
  }).join(''), 2);
  return algorithm[pixelNumber];
}

function enhanceImage(algorithm, inputImage, iteration) {
  let border = 1;
  let enhancedImage = [ ];
  for (let row = -border; row < inputImage.length + border; ++row) {
    let currentRow = [ ];
    enhancedImage.push(currentRow);
    for (let col = -border; col < inputImage[0].length + border; ++col) {
      currentRow.push(getOutputPixel(algorithm, inputImage, row, col, iteration));
    }
  }
  return enhancedImage;
}

function countLitPixels(image) {
  let litPixels = 0;
  for (let row = 0; row < image.length; ++row) {
    litPixels += image[row].filter(x => x === '#').length;
  }
  return litPixels;
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let algorithm = '';
  let inputImage = [ ];
  for await (const line of rl) {
    if (algorithm === '') {
      algorithm = line.split('');
      continue;
    }
    if (line.trim() === '') {
      continue;
    }
    inputImage.push(line.split(''));
  }
  let nextImage = inputImage;
  for (let i = 0; i < 50; ++i) {
    nextImage = enhanceImage(algorithm, nextImage, i);    
  }
  console.log(`There are ${countLitPixels(nextImage)} lit pixels.`);
}

processLineByLine()
  .then(result => {
  });
