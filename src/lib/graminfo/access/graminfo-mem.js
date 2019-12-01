import _ from 'lodash';
import { php } from '~/utils';
import { GramInfo } from '~/lib/graminfo/graminfo';

class GramInfoMem extends GramInfo {
  getGramInfoHeaderSize() {
    return 20;
  }

  readGramInfoHeader(offset) {
    const mem = this.resource;
    const result = php.unpack(
      [
        'vid',
        'vfreq',
        'vforms_count',
        'vpacked_forms_count',
        'vancodes_count',
        'vancodes_offset',
        'vancodes_map_offset',
        'vaffixes_offset',
        'vaffixes_size',
        'vbase_size',
      ].join('/'),
      php.strings.substr(mem, offset, 20),
    );

    result.offset = offset;

    return result;
  }

  readAncodesMap(info) {
    const mem = this.resource;
    const formsCount = info.packed_forms_count;
    // TODO: this can be wrong due to aligning ancodes map section
    const offset = info.offset + 20 + info.forms_count * 2;

    return php.unpack(`v${formsCount}`, php.strings.substr(mem, offset, formsCount * 2));
  }

  splitAncodes(ancodes, map) {
    const result = [];

    let k;
    let kc;
    let j = 0;
    _.forEach(map, mapItem => {
      const res = [];

      for (k = 0, kc = mapItem; k < kc; k++, j++) {
        res.push(ancodes[j]);
      }

      result.push(res);
    });

    return result;
  }

  readAncodes(info) {
    const mem = this.resource;
    const formsCount = info.forms_count;
    // TODO: this can be wrong due to aligning ancodes section
    const offset = info.offset + 20;
    const ancodes = php.unpack(`v${formsCount}`, php.strings.substr(mem, offset, formsCount * 2));
    const map = this.readAncodesMap(info);

    return this.splitAncodes(ancodes, map);
  }

  readFlexiaData(info) {
    const mem = this.resource;
    let offset = info.offset + 20;

    if (php.var.isset(info.affixes_offset)) {
      offset += info.affixes_offset;
    } else {
      offset += info.forms_count * 2 + info.packed_forms_count * 2;
    }

    return php.strings
      .substr(mem, offset, info.affixes_size - this.ends_size)
      .toString()
      .split(this.ends.toString());
  }

  readAllGramInfoOffsets() {
    return this.readSectionIndex(this.header.flex_index_offset, this.header.flex_count);
  }

  readSectionIndex(offset, count) {
    const mem = this.resource;

    return php.array.array_values(php.unpack(`V${count}`, php.strings.substr(mem, offset, count * 4)));
  }

  readAllFlexia() {
    const result = {};
    let offset = this.header.flex_offset;

    _.forEach(
      this.readSectionIndexAsSize(this.header.flex_index_offset, this.header.flex_count, this.header.flex_size),
      size => {
        const header = this.readGramInfoHeader(offset);
        const affixes = this.readFlexiaData(header);
        const ancodes = this.readAncodes(header, true);

        result[header.id] = {
          header,
          affixes,
          ancodes,
        };

        offset += size;
      },
    );

    return result;
  }

  readAllPartOfSpeech() {
    const mem = this.resource;
    const result = {};
    let offset = this.header.poses_offset;
    let res;

    _.forEach(
      this.readSectionIndexAsSize(this.header.poses_index_offset, this.header.poses_count, this.header.poses_size),
      size => {
        res = php.unpack('vid/Cis_predict', php.strings.substr(mem, offset, 3));

        result[res.id] = {
          name: this.cleanupCString(php.strings.substr(mem, offset + 3, size - 3)),
          is_predict: !!res.is_predict,
        };

        offset += size;
      },
    );

    return result;
  }

  readAllGrammems() {
    const mem = this.resource;
    const result = {};
    let offset = this.header.grammems_offset;
    let res;

    _.forEach(
      this.readSectionIndexAsSize(
        this.header.grammems_index_offset,
        this.header.grammems_count,
        this.header.grammems_size,
      ),
      size => {
        res = php.unpack('vid/Cshift', php.strings.substr(mem, offset, 3));

        result[res.id] = {
          shift: res.shift,
          name: this.cleanupCString(php.strings.substr(mem, offset + 3, size - 3)),
        };

        offset += size;
      },
    );

    return result;
  }

  readAllAncodes() {
    const mem = this.resource;
    const result = {};
    let offset = this.header.ancodes_offset;
    let res;
    let grammemsCount;
    let grammemIds;

    for (let i = 0; i < this.header.ancodes_count; i++) {
      res = php.unpack('vid/vpos_id', php.strings.substr(mem, offset, 4));
      offset += 4;

      grammemsCount = php.unpack('v', php.strings.substr(mem, offset, 2))[1];
      offset += 2;

      grammemIds = grammemsCount
        ? php.array.array_values(php.unpack(`v${grammemsCount}`, php.strings.substr(mem, offset, grammemsCount * 2)))
        : [];

      result[res.id] = {
        offset,
        grammem_ids: grammemIds,
        pos_id: res.pos_id,
      };

      offset += grammemsCount * 2;
    }

    return result;
  }
}

export { GramInfoMem };
