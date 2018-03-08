const DEFAULT_STREAM_THROTTLE = 100;

class Stream {

    static all(streams) {

        let master = new Stream(() => { });
        streams.forEach((stream, index) => {
            stream.own(master, index);
        });

        return master;

    }

    constructor(handler) {

        this.give = this.give.bind(this);
        this.next = this.next.bind(this);
        this.reject = this.reject.bind(this);
        this.terminate = this.terminate.bind(this);

        this.queue = [];
        this.throttle(DEFAULT_STREAM_THROTTLE);

        handler(this.give, this.reject, this.terminate, this.next);

    }

    catch(_catch) {

        if (typeof _catch === 'function') {
            this._catch = _catch;
        }

        return this;

    }

    finish(_finish) {

        if (typeof _finish === 'function') {
            this._finish = _finish;
        }

        return this;

    }

    give() {

        if (this._take) {
            this._take(...arguments);
        }

    }

    kill() {

        clearInterval(this.throttle_interval);

    }

    next(next) {

        if (this.master) {
            this.master.next(next);
        } else {
            this.queue.push(next);
        }

    }

    own(master, index) {

        this.master = master;

        this.take(function () {
            master.give(...arguments, index);
        });

        this.catch(function () {
            master.reject(...arguments, index);
        });

        this.finish(function () {
            master.terminate(...arguments, index);
        });

        this.kill();
        this.kill = master.kill;

    }

    reject() {

        if (this._catch) {
            this._catch(...arguments);
        }

        this.terminate();

    }

    shift() {

        if (this.queue.length) {
            (this.queue.shift())();
        }

    }

    take(_take) {

        if (typeof _take === 'function') {
            this._take = _take;
        }

        return this;

    }

    terminate() {

        if (this._finish) {
            this._finish(...arguments);
        }

        clearInterval(this.throttle_interval);

    }

    throttle(delay) {

        this.kill();
        this.last_throttle_interval = delay !== undefined ? delay : DEFAULT_STREAM_THROTTLE;

        this.throttle_interval = setInterval(() => {
            this.shift();
        }, this.last_throttle_interval);

        return this;

    }

}

module.exports = Stream;