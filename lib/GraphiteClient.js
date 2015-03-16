var CarbonClient = require('./CarbonClient');

module.exports = GraphiteClient;
function GraphiteClient(properties) {
  this._carbon = properties.carbon;
  this._prefix = properties.prefix;
}

GraphiteClient.createClient = function(carbonDsn, prefix) {
  var client = new this({
    carbon: new CarbonClient({dsn: carbonDsn}),
    prefix: prefix
  });
  return client;
};

GraphiteClient.flatten = function(obj, flat, prefix) {
  flat   = flat || {};
  prefix = prefix || '';
  if(prefix !== '' && prefix.slice(-1) !== '.') prefix = prefix + '.';

  for (var key in obj) {
    var value = obj[key];
    if (typeof value === 'object') {
      this.flatten(value, flat, prefix + key + '.');
    } else {
      flat[prefix + key] = value;
    }
  }

  return flat;
};

GraphiteClient.prototype.write = function(metrics, timestamp, cb) {
  if (typeof timestamp === 'function') {
    cb        = timestamp;
    timestamp = null;
  }

  timestamp = timestamp || Date.now();
  timestamp = Math.floor(timestamp / 1000);

  this._carbon.write(GraphiteClient.flatten(metrics, null, this._prefix), timestamp, cb);
};

GraphiteClient.prototype.end = function() {
  this._carbon.end();
};
