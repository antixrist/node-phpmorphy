import _ from 'lodash';

class LinkBase {
  /**
   * @param {FsaInterface} fsa
   * @param trans
   * @param rawTrans
   */
  constructor(fsa, trans, rawTrans) {
    this.fsa = fsa;
    this.trans = trans;
    this.raw_trans = rawTrans;
  }

  isAnnotation() {}

  getTrans() {
    return this.trans;
  }

  getFsa() {
    return this.fsa;
  }

  getRawTrans() {
    return this.raw_trans;
  }
}

/**
 * This class represent "normal" link i.e. link that points to automat state
 */
class Link extends LinkBase {
  isAnnotation() {
    return false;
  }

  getDest() {
    return this.trans.dest;
  }

  getAttr() {
    return this.trans.attr;
  }

  getTargetState() {
    return this.createState(this.trans.dest);
  }

  createState(index) {
    return new State(this.fsa, index);
  }
}

class LinkAnnot extends LinkBase {
  isAnnotation() {
    return true;
  }

  getAnnotation() {
    return this.fsa.getAnnot(this.raw_trans);
  }
}

class State {
  /**
   * @param {FsaInterface} fsa
   * @param index
   */
  constructor(fsa, index) {
    this.fsa = fsa;
    this.raw_transes = fsa.readState(index);
    this.transes = fsa.unpackTranses(this.raw_transes);
  }

  getLinks() {
    let trans;
    const result = [];

    for (let i = 0, c = this.transes.length; i < c; i++) {
      trans = this.transes[i];

      if (!trans.term) {
        result.push(this.createNormalLink(trans, this.raw_transes[i]));
      } else {
        result.push(this.createAnnotLink(trans, this.raw_transes[i]));
      }
    }

    return result;
  }

  getSize() {
    return _.size(this.transes);
  }

  createNormalLink(trans, raw) {
    return new Link(this.fsa, trans, raw);
  }

  createAnnotLink(trans, raw) {
    return new LinkAnnot(this.fsa, trans, raw);
  }
}

export { LinkBase, Link, LinkAnnot, State };
