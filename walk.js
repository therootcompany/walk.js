import { promises as fs } from "fs";
import path from "path";

const _withFileTypes = { withFileTypes: true };
const skipDir = new Error("skip this directory");
const pass = (err) => err;

// a port of Go's filepath.Walk
const walk = async (root, walkFunc, _dirent) => {
  let err;

  // special case of the very first run
  if (!_dirent) {
    let _name = path.basename(path.resolve(root));
    _dirent = await fs.lstat(root).catch(pass);
    if (_dirent instanceof Error) {
      err = _dirent;
    } else {
      _dirent.name = _name;
    }
  }

  // run the user-supplied function and either skip, bail, or continue
  err = await walkFunc(err, root, _dirent).catch(pass);
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
  let result = await fs.readdir(root, _withFileTypes).catch(pass);
  if (result instanceof Error) {
    return walkFunc(result, root, _dirent);
  }
  for (let dirent of result) {
    await walk(path.join(root, dirent.name), walkFunc, dirent);
  }
};

export default {
  walk,
  skipDir,
};
