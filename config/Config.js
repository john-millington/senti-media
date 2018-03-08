const _ = require('lodash');

const DEFAULT_AWS_REGION = 'eu-west-1';

class Config {

    constructor() {
        this.config = {
            aws: {
                accessKeyId: '',
                secretAccessKey: '',
                region: DEFAULT_AWS_REGION
            },
            twitter: {
                consumer_key: '',
                consumer_secret: '',
                access_token_key: '',
                access_token_secret: ''
            },
            news: {
                api_key: ''
            },
            instagram: {
                client_id: '',
                client_secret: ''
            }
        };
    }

    consume(config) {

        this.config = Object.assign(this.config, config);

    }

    get(property) {

        return _.get(this.config, property) || {};

    }

    set(property, value) {

        _.set(this.config, property, value);

    }

}

module.exports = new Config();