String.prototype.formatHTTP = function(){
    var regex = new RegExp(/http[s]*:\/\//, 'gi');

    if (!regex.test(this))
        ret = 'http://' + this;
    else if(this.indexOf('http://') != 0 && this.indexOf('https://') != 0)
        ret = 'http://' + this;
    else ret = this;

    return ret.toString();
};

String.prototype.formatHTTPS = function(){
    var httpsregex = new RegExp(/https:\/\//, 'gi');
    var httpregex = new RegExp(/http:\/\//, 'gi');

    if (!httpregex.test(this) && !httpsregex.test(this))
        ret = 'https://' + this;
    else if(this.indexOf('http://') == 0)
        ret = this.replace('http://', 'https://');
    else if(this.indexOf('http://') != 0 && this.indexOf('https://') != 0)
        ret = 'https://' + this;
    else ret = this;

    return ret.toString();
};