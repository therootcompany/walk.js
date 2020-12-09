// a port of Go's filepath.Walk

import { promises as fs } from "fs";
import path from "path";

var Walk = {};
var _withFileTypes = { withFileTypes: true };
var _skipDir = new Error("skip this directory");

function pass(err) {
  return err;
}

function skipOrThrow(err) {
  if (!(err instanceof Error)) {
    // go
    return false;
  }
  if (_skipDir === err) {
    // skip
    return true;
  }
  // throw
  throw err;
}

Walk.skipDir = _skipDir;

Walk.walk = async function _walk(root, walker) {
  // Special case of the very first item, root
  var err;
  var stat = await fs.lstat(root).catch(function (e) {
    err = e;
    return null;
  });
  stat.name = path.basename(path.resolve(root));

  /* similar to function in main walk loop */
  var uerr = await walker(err, root, stat).then(pass).catch(pass);
  if (skipOrThrow(uerr) || err) {
    return;
  }

  if (stat.isDirectory()) {
    return _walkHelper(root, stat, walker);
  }
  /* end */
};

async function _walkHelper(root, prevEnt, walker) {
  var err;
  var dirents = await fs.readdir(root, _withFileTypes).catch(function (e) {
    err = e;
  });
  if (err) {
    return walker(err, root, prevEnt);
  }

  var dirent;
  var pathname;
  var _name;
  for (dirent of dirents) {
    if ("string" === typeof dirent) {
      _name = dirent;
      pathname = path.join(root, _name);
      dirent = await fs.lstat(pathname).catch(function (e) {
        err = e;
      });
      dirent.name = _name;
    } else {
      pathname = path.join(root, dirent.name);
    }

    /* main inner loop */
    err = await walker(err, pathname, dirent).then(pass).catch(pass);
    if (skipOrThrow(err)) {
      continue;
    }

    // "walk does not follow symbolic links"
    if (dirent.isDirectory()) {
      await _walkHelper(path.join(root, dirent.name), dirent, walker);
    }
    /* end */
  }
}

export default Walk;
