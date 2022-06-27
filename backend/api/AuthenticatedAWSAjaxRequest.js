class AuthenticatedAWSAjaxRequest{
    constructor(awsCredentials, service, ajaxOptions) {
        this.awsCredentials = awsCredentials;
        this.service = service;
        this.ajaxOptions = ajaxOptions;

        this.date = new Date();
        this.parseRequestUrl(ajaxOptions.url);


        ajaxOptions['headers'] = this.AuthorizationHeaders();
        return $.ajax(ajaxOptions);
    }

    parseRequestUrl(url){
        var parser = document.createElement('a');
            parser.href = url;

        this.uri = parser.pathname;
        this.queryString = parser.search;
        this.host = parser.host;
    }

    fullDateProp(prop) {
        if( prop < 10){prop = '0' + prop};
        return prop;
    }

    amzdate() {
        return this.datestamp() + 'T' + this.fullDateProp(this.date.getUTCHours()) + this.fullDateProp(this.date.getUTCMinutes()) + this.fullDateProp(this.date.getUTCSeconds()) + 'Z';
    }

    datestamp() {
        return '' + this.date.getUTCFullYear() + this.fullDateProp(this.date.getUTCMonth() + 1) + this.fullDateProp(this.date.getUTCDate());
    }

    getSignatureKey() {
        var kDate = CryptoJS.HmacSHA256(this.datestamp(), "AWS4" + this.awsCredentials.secretAccessKey, { asBytes: true });
        var kRegion = CryptoJS.HmacSHA256(this.awsCredentials.region, kDate, { asBytes: true });
        var kService = CryptoJS.HmacSHA256(this.service, kRegion, { asBytes: true });

        return CryptoJS.HmacSHA256("aws4_request", kService, { asBytes: true });
    }

    signedHeaders() {
        return 'content-type;host;x-amz-date';
    }

    canonicalRequest() {
        var canonicalHeaders = 'host:' + this.host + '\n' + 'x-amz-date:' + this.amzdate() +'\n';
        var payloadHash = CryptoJS.SHA256(this.ajaxOptions.data);
        var canonicalRequest = this.ajaxOptions.method + '\n' + this.uri + '\n' + this.queryString + '\n' + 'content-type:application/json' + '\n' + canonicalHeaders + '\n' + this.signedHeaders() + '\n' + payloadHash;
        return canonicalRequest;
    }

    signature() {
        var algorithm = 'AWS4-HMAC-SHA256';
        var credentialScope = this.datestamp() + '/' + this.awsCredentials.region + '/' + this.service + '/' + 'aws4_request';
        var stringToSign = algorithm + '\n' +  this.amzdate() + '\n' +  credentialScope + '\n' +  CryptoJS.SHA256(this.canonicalRequest());

        var signature = CryptoJS.HmacSHA256(stringToSign, this.getSignatureKey(), { asBytes: true });

        return algorithm + ' Credential=' + this.awsCredentials.accessKeyId + '/' + credentialScope + ', SignedHeaders=' + this.signedHeaders() + ', Signature=' + signature;
    }

    AuthorizationHeaders() {
        return { 'X-Amz-Date': this.amzdate(),
        'Authorization': this.signature(),
        'Content-Type': 'application/json' }
    }
}