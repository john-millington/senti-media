const Instagram = require('instagram');

const Plugin = require('./Plugin');
const Stream = require('./../utilities/Stream');

class InstagramPlugin extends Plugin {

    constructor(config) {

        super(...arguments);

        this.client = Instagram.createClient(
            config.client_id,
            config.client_secret
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