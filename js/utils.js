function makeRequest(url, method, callback) {
    const xhttp = new XMLHttpRequest()
    xhttp.onload = function () {
        callback(this.responseText)
    }
    xhttp.open(method, url, true);
    xhttp.send();
}
//https://stackoverflow.com/a/2802804
function naturalSorter(as, bs) {
    var a, b, a1, b1, i = 0, n, L,
        rx = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
    if (as === bs) return 0;
    a = as.toLowerCase().match(rx);
    b = bs.toLowerCase().match(rx);
    L = a.length;
    while (i < L) {
        if (!b[i]) return 1;
        a1 = a[i],
            b1 = b[i++];
        if (a1 !== b1) {
            n = a1 - b1;
            if (!isNaN(n)) return n;
            return a1 > b1 ? 1 : -1;
        }
    }
    return b[i] ? -1 : 0;
}