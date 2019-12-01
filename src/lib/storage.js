import fs from 'fs';
import _ from 'lodash';
import { php } from '~/utils';
import { STORAGE_FILE, STORAGE_MEM } from './constants';

class Storage {
  constructor(fileName = '') {
    if (fileName) {
      this.file_name = fileName;
      this.resource = this.open(fileName);
    }
  }

  getFileName() {
    return this.file_name;
  }

  getResource() {
    return this.resource;
  }

  getTypeAsString() {
    return this.getType();
  }

  /**
   * @param {number} offset
   * @param {number} len
   * @param {boolean} [exactLength=true]
   * @returns {*}
   */
  read(offset, len, exactLength = true) {
    if (offset >= this.getFileSize()) {
      throw new Error(
        `Can't read ${len} bytes beyond end of '${this.getFileName()}' file, offset = ${offset}, file_size = ${this.getFileSize()}`,
      );
    }

    let result;
    try {
      result = this.readUnsafe(offset, len);
    } catch (error) {
      throw new Error(
        `Can't read ${len} bytes at ${offset} offset, from '${this.getFileName()}' file: ${error.message}`,
      );
    }

    if (exactLength && result.length < len) {
      throw new Error(`Can't read ${len} bytes at ${offset} offset, from '${this.getFileName()}' file`);
    }

    return result;
  }

  readUnsafe(offset, len) {}

  getFileSize() {}

  getType() {}

  open(fileName) {}
}

class StorageProxy extends Storage {
  constructor(type, fileName, factory) {
    super();
    this.file_name = fileName;
    this.type = type;
    this.factory = factory;
    this.___obj = null;
  }

  getFileName() {
    return this.__obj.getFileName();
  }

  getResource() {
    return this.__obj.getResource();
  }

  getFileSize() {
    return this.__obj.getFileSize();
  }

  getType() {
    return this.__obj.getType();
  }

  readUnsafe(offset, len) {
    return this.__obj.readUnsafe(offset, len);
  }

  open(fileName) {
    return this.__obj.open(fileName);
  }

  get __obj() {
    if (!this.___obj) {
      this.___obj = this.factory.open(this.type, this.file_name, false);

      delete this.file_name;
      delete this.type;
      delete this.factory;
    }

    return this.___obj;
  }

  set __obj(value) {
    this.___obj = !_.isUndefined(value) ? value : null;
  }
}

class StorageFile extends Storage {
  getType() {
    return STORAGE_FILE;
  }

  getFileSize() {
    const stat = fs.fstatSync(this.resource);
    if (stat === false) {
      throw new Error(`Can't invoke fs.fstatSync for '${this.file_name}' file`);
    }

    return stat.size;
  }

  readUnsafe(offset, len) {
    const buf = Buffer.alloc(len);
    fs.readSync(this.resource, buf, 0, len, offset);

    return buf;
  }

  open(fileName) {
    const fh = fs.openSync(fileName, 'r');
    if (fh === false) {
      throw new Error(`Can't open '${this.file_name}' file`);
    }

    return fh;
  }
}

class StorageMem extends Storage {
  getType() {
    return STORAGE_MEM;
  }

  getFileSize() {
    return this.resource.length;
  }

  readUnsafe(offset, len) {
    return php.strings.substr(this.resource, offset, len);
    // return this.resource.slice(offset, offset + len - 1);
  }

  open(fileName) {
    const buffer = fs.readFileSync(fileName);
    if (buffer === false) {
      throw new Error(`Can't read '${fileName}' file`);
    }

    return buffer;
  }
}

class StorageFactory {
  static get storages() {
    return {
      StorageFile,
      StorageMem,
    };
  }

  open(type, fileName, lazy) {
    switch (type) {
      case STORAGE_FILE:
      case STORAGE_MEM:
        break;
      default:
        throw new Error(`Invalid storage type '${type}' specified`);
    }

    if (lazy) {
      return new StorageProxy(type, fileName, this);
    }

    const className = `Storage${_.upperFirst(type.toLowerCase())}`;

    return new StorageFactory.storages[className](fileName);
  }
}

export { Storage, StorageProxy, StorageFile, StorageMem, StorageFactory };
