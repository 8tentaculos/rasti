exports.escapedAnchor = function (anchor) {
  if (typeof anchor !== 'string') return null;
  return anchor.toLowerCase().replace('+', '__').replace('.', '_');
};
