const _hrSingle = '-----------------------------------------------------------------------------------\n';
const _hrDouble = '===================================================================================\n';

var utilities = {};

utilities.announce = (message, options) => {
  // options object format: { type: 'note' / 'start' / 'success' / 'error' , importance: 1 / 2 }
  var text = message || 'something happened! (no message was specified)'; 
  var hr = '', type = '[ ] ';
  if (options.type && options.type === 'note') type = '[*] ';
  if (options.type && options.type === 'start') { type = '[?] '; message += '...'; }
  if (options.type && options.type === 'success') type = '[+] ';
  if (options.type && options.type === 'error') type = '[!] ';
  if (options.importance && options.importance === 1) { hr = _hrDouble; message += '\n' }
  if (options.importance && options.importance === 2) { hr = _hrSingle; message += '\n' }
  console.log(hr + type + message + hr);
};

module.exports = utilities;