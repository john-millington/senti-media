const Provider = require("./Provider");
const Stream = require("./../utilities/Stream");

const curl = require("curl");

const SERVICE_ENDPOINT = "https://api.stocktwits.com/api/2/search.json";

class StockTwitsProvider extends Provider {
    constructor(config = {}) {
        super(...arguments);

        this.config = config;
        this.access_token = this.config.access_token;
    }

    search(terms, options = {}) {
        terms = terms instanceof Array ? terms : [terms];
        return new Stream((give, reject, terminate, next) => {
            const handle = term => {
                let request = SERVICE_ENDPOINT + "?q=" + term;
                curl.get(request, {}, (err, response, body) => {
                    if (err) {
                        reject(err);
                    } else {
                        let parsed = JSON.stringify(response);
                        if (parsed.response && parsed.response.status && parsed.response.status === 200) {
                            if (terms.length) {
                            }
                        } else {
                            reject(parsed);
                        }
                    }
                });
            };

            handle(terms.shift());
        });
    }
}
