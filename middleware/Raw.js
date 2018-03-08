const Middleware = require('./Middleware');

class Raw extends Middleware {

    id() {
        return 'senti.raw';
    }

    run(terms, results) {
        return results;
    }

}

module.exports = Raw;