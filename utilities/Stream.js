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

        this.handlers = {
            catch: [],
            finish: [],
            take: []
        };
        
        this.throttle(DEFAULT_STREAM_THROTTLE);

        setTimeout(() => {
            handler(this.give, this.reject, this.terminate, this.next);
        }, 0);

    }

    catch(cat) {

        if (typeof cat === 'function') {
            this.handlers.catch.push(cat);
        }

        return this;

    }

    finish(finish) {

        if (typeof finish === 'function') {
            this.handlers.finish.push(finish);
        }

        return this;

    }

    give() {

        this.trigger('take', [...arguments]);

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

        this.trigger('catch', [...arguments]);
        this.terminate();

    }

    shift() {

        if (this.queue.length) {
            (this.queue.shift())();
        }

    }

    take(take) {

        if (typeof take === 'function') {
            this.handlers.take.push(take);
        }

        return this;

    }

    terminate() {

        this.trigger('finish', [...arguments]);
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

    trigger(type, args) {

        if (this.handlers[type]) {
            this.handlers[type].forEach(handle => handle(...args));
        }

    }

}

module.exports = Stream;