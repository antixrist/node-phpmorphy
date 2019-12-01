import util from 'util';
import _ from 'lodash';

const logger = {};
logger.log = console.log.bind(console);
logger.trace = console.trace.bind(console);
logger.info = console.info.bind(console);
logger.warn = console.warn.bind(console);
logger.error = console.error.bind(console);

/**
 * @param any
 * @returns {Array}
 */
function castArray(any) {
  any = !_.isUndefined(any) && !_.isNull(any) ? any : [];
  any = _.isArray(any) ? any : [any];

  return any;
}

/**
 * @param object
 * @param {object} [opts]
 * @returns {string}
 */
function inspect(
  object,
  opts = {
    depth: null,
    colors: true,
    maxArrayLength: 1000,
  },
) {
  return util.inspect(object, opts);
}

/**
 * @param any
 * @returns {boolean}
 */
function isStringifyedNumber(any) {
  const int = _.toInteger(any);

  if (int === 0 && any !== '0') {
    return false;
  }

  return any == int;
}
/**
 * @param something
 * @param [encoding='utf-8']
 * @returns {Buffer|*}
 */
function toBuffer(something, encoding = 'utf-8') {
  let retVal = something;

  if (_.isArray(something)) {
    retVal = _.map(something, item => toBuffer(item, encoding));
  } else if (Buffer.isBuffer(something)) {
    retVal = something;
  } else if (_.isString(something)) {
    retVal = Buffer.from(something, encoding);
  } else if (_.isPlainObject(something)) {
    const obj = _.clone(something);
    _.forEach(obj, (val, key) => (obj[key] = toBuffer(val, encoding)));

    retVal = obj;
  }

  return retVal;
}

/**
 * @param something
 * @param {String} [encoding='utf8']
 * @returns {string|*}
 */
function buffer2str(something, encoding = 'utf8') {
  return Buffer.isBuffer(something) ? something.toString(encoding) : something;
}

/**
 * @param something
 * @returns {Array}
 */
function str2ascii(something) {
  const retVal = [];
  const buffer = !Buffer.isBuffer(something) ? Buffer.from(something, 'binary') : something;

  for (let i = 0, length = buffer.length; i < length; i++) {
    retVal.push(buffer[i]);
  }

  return retVal;
}

/**
 * @param something
 * @returns {String}
 */
function str2hex(something) {
  const retVal = !Buffer.isBuffer(something) ? Buffer.from(something, 'binary') : something;

  return retVal.toString('hex');
}

function clone(instance) {
  return _.merge({}, Object.create(Object.getPrototypeOf(instance)), instance);
}

export { logger, castArray, inspect, isStringifyedNumber, toBuffer, buffer2str, str2ascii, str2hex, clone };
