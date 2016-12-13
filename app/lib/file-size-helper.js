'use strict';

const bytesToKilobytes = function (bytes) {
  return Math.round((bytes / 1024) * 1000) / 1000;
};

const diffBytesInKilobytes = function (bytesIn, bytesOut) {
  return Math.round((100 - bytesOut * 100 / bytesIn) * 10) / 10;
}

module.exports = {
  bytesToKilobytes: bytesToKilobytes,
  diffBytesInKilobytes: diffBytesInKilobytes,
};
