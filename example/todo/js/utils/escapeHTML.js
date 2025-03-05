export default (str) => str.replace(/[&<>"']/g, match => ({
    '&' : '&amp;',
    '<' : '&lt;',
    '>' : '&gt;',
    '"' : '&quot;',
    "'" : '&#039;'
}[match]));
