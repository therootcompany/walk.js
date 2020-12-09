"use strict";

const fs = require("fs").promises;
const Walk = require("./walk.js");
const path = require("path");
const _withFileTypes = { withFileTypes: true };
const _noopts = {};
const _pass = (err) => err;

// a port of Go's filepath.Walk
Walk.create = function (opts) {
  if (!opts) {
    opts = _noopts;
  }

  // a port of Go's filepath.Walk
  const _walk = async (pathname, walkFunc, _dirent) => {
    let err;

    // special case of the very first run
    if (!_dirent) {
      _dirent = pathname;
    }

    // the first run, or if false === withFileTypes
    if ("string" === typeof _dirent) {
      let _name = path.basename(path.resolve(pathname));
      _dirent = await fs.lstat(pathname).catch(_pass);
      if (_dirent instanceof Error) {
        err = _dirent;
      } else {
        _dirent.name = _name;
      }
    }

    // run the user-supplied function and either skip, bail, or continue
    err = await walkFunc(err, pathname, _dirent).catch(_pass);
    if (false === err || Walk.skipDir === err) {
      return;
    }
    if (err instanceof Error) {
      throw err;
    }

    // "walk does not follow symbolic links"
    if (!_dirent || !_dirent.isDirectory()) {
      return;
    }

    // lightweight dirents or full lstat
    let _readdirOpts;
    if (!opts.withFileStats) {
      _readdirOpts = _withFileTypes;
    }

    // TODO check if the error is "not a directory"
    // (and thus allow false === opts.withFileTypes)
    let result = await fs.readdir(pathname, _readdirOpts).catch(_pass);
    if (result instanceof Error) {
      return walkFunc(result, pathname, _dirent);
    }
    if (opts.sort) {
      result = opts.sort(result);
    }
    for (let entity of result) {
      await _walk(path.join(pathname, entity.name || entity), walkFunc, entity);
    }
  };

  return _walk;
};

module.exports = Walk;
