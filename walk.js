"use strict";

const fs = require("fs").promises;
const path = require("path");

const skipDir = new Error("skip this directory");
const _withFileTypes = { withFileTypes: true };
const pass = (err) => err;

// a port of Go's filepath.Walk
const walk = async (pathname, walkFunc, _dirent) => {
  let err;

  // special case of the very first run
  if (!_dirent) {
    let _name = path.basename(path.resolve(pathname));
    _dirent = await fs.lstat(pathname).catch(pass);
    if (_dirent instanceof Error) {
      err = _dirent;
    } else {
      _dirent.name = _name;
    }
  }

  // run the user-supplied function and either skip, bail, or continue
  err = await walkFunc(err, pathname, _dirent).catch(pass);
  if (false === err || skipDir === err) {
    return;
  }
  if (err instanceof Error) {
    throw err;
  }

  // "walk does not follow symbolic links"
  if (!_dirent.isDirectory()) {
    return;
  }
  let result = await fs.readdir(pathname, _withFileTypes).catch(pass);
  if (result instanceof Error) {
    return walkFunc(result, pathname, _dirent);
  }
  for (let dirent of result) {
    await walk(path.join(pathname, dirent.name), walkFunc, dirent);
  }
};

module.exports = {
  walk,
  skipDir,
};
