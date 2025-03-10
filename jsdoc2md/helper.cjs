exports.escapeAnchor = function(anchor) {
    return anchor.toLowerCase().replace('+', '__').replace('.', '_');
};

exports.escapeUrlAnchor = function(url) {
    var parts = url.split('#');
    if (parts.length === 1) return url;
    return parts[0] + '#' + exports.escapeAnchor(parts[1]);
}

