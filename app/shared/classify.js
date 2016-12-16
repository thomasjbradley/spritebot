module.exports = function (str) {
  return str.trim().toLowerCase().replace(/[^a-z0-9\-]/ig, '-').replace(/\-+/g, '-');
};
