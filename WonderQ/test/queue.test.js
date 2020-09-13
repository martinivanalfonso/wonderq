const Scarlet = require("scarlet-task");
const should = require("should");
const Redis = require("redis");
const WonderQ = require("..").WonderQ;

describe("[create queue]", () => {
    const queueName = "mocha";
    let queue;
    let redis;
    before(done => {
        redis = Redis.createClient();
        queue = new WonderQ({name: queueName});
        queue.deleteQueue(() => {
            done();
        });
    });

    describe("#_buildQueueName()", () => {
        it("should equal to _bearer_:mocha", done => {
            queue.queueName.should.eql("_bearer_:" + queueName);
            done();
        });
    });

    describe("#queueName", () => {
        it("should equal to _bearer_:mocha", done => {
            queue.queueName.should.eql("_bearer_:" + queueName);
            done();
        });
    });

    describe("#@when empty", () => {
        it("get length from an empty queue", done => {
            queue.length((err, l) => {
                l.should.eql(0);
                done();
            });
        });


        it("get length from an unexists queue", done => {
            queue.length((err, l) => {
                l.should.eql(0);
                done();
            });
        });
    });

    describe("#destroy", () => {
        it("destroy this instance", done => {
            queue.destroy();
            (queue.redis === undefined).should.eql(true);
            done();
        });

        it("get error when do something", done => {
            const scarlet = new Scarlet(10);
            scarlet.push(undefined, TO => {
                queue.push(1, err => {
                    err.should.be.an.instanceof(Error);
                    scarlet.taskDone(TO);
                });
            });

            scarlet.afterFinish(1, () => {
                done();
            });
        });
    });
});

