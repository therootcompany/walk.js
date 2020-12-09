// a port of Go's filepath.Walk

import { promises as fs } from "fs";
import { skipDir } from "./walk.js";
import path from "path";

var Walk = {};
var _withFileTypes = { withFileTypes: true };
var _noopts = {};

function pass(err) {
  return err;
}

function skipOrThrow(err) {
  if (!(err instanceof Error)) {
    // go
    return false;
  }
  if (false === err || skipDir === err) {
    // skip
    return true;
  }
  // throw
  throw err;
}

Walk.skipDir = skipDir;

Walk.create = function (opts) {
  async function _walk(root, walker) {
    if (!opts) {
      opts = _noopts;
    }

    // Special case of the very first item, root
    var err;
    var stat = await fs.lstat(root).catch(function (e) {
      err = e;
      return null;
    });
    if (stat) {
      stat.name = path.basename(path.resolve(root));
    }

    /* similar to function in main walk loop */
    var uerr = await walker(err, root, stat).then(pass).catch(pass);
    if (skipOrThrow(uerr) || err) {
      return;
    }

    if (false === opts.withFileTypes) {
      stat = stat.name;
    }
    if (opts.sort) {
      stat = (opts.sort([stat]) || [])[0];
    }

    if (stat && stat.isDirectory()) {
      return _walkHelper(root, stat, walker, opts);
    }
    /* end */

    async function _walkHelper(root, prevEnt, walker, opts) {
      var err;
      var _readdirOpts;
      if (false !== opts.withFileTypes) {
        _readdirOpts = _withFileTypes;
      }
      var dirents = await fs.readdir(root, _readdirOpts).catch(function (e) {
        err = e;
      });
      if (err) {
        return walker(err, root, prevEnt);
      }
      if (opts.sort) {
        dirents = opts.sort(dirents);
      }

      var dirent;
      var pathname;
      for (dirent of dirents) {
        if ("string" === typeof dirent) {
          pathname = path.join(root, dirent);
          dirent = await fs.lstat(path.join(root)).catch(function (e) {
            err = e;
          });
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
          await _walkHelper(path.join(root, dirent.name), dirent, walker, opts);
        }
        /* end */
      }
    }
  }

  return _walk;
};

export default Walk;
