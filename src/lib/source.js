class SourceInterface {
  getValue(key) {}
}

class SourceFsa extends SourceInterface {
  /**
   * @param {FsaInterface} fsa
   */
  constructor(fsa) {
    super();
    this.fsa = fsa;
    this.root = fsa.getRootTrans();
  }

  getFsa() {
    return this.fsa;
  }

  getValue(key) {
    const result = this.fsa.walk(this.root, key, true);
    if (result === false || !result.annot) {
      return false;
    }

    return result.annot;
  }
}

export { SourceInterface, SourceFsa };
