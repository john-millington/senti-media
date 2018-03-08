const Config = require('./../../senti.config.js');

const Instagram = require('instagram');

const Plugin = require('./Plugin');
const Stream = require('./../Utilities/Stream');

class InstagramPlugin extends Plugin {

    constructor() {
        super(...arguments);

        this.client = Instagram.createClient(
            config.InstagramAPI.clientId,
            config.InstagramAPI.clientSecret
        );

    }

    search(terms, options = {}) {

        terms = terms instanceof Array ? terms.join(' ') : terms;

        return new Stream((give, reject, terminate, next) => {
            const handle = (data, error) => {
                give(data);
                terminate();
            };

            // this.client.tags.media(terms, handle);
        });

    }

}

module.exports = InstagramPlugin;