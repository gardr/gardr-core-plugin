/*jshint expr: true, nonew: false*/
var PluginApi = require('../lib/PluginApi.js'),
          xde = require('cross-domain-events'),
          api;

describe('PluginApi', function () {

    beforeEach(function () {
        api = new PluginApi();
    });

    afterEach(function () {
        api._reset();
    });

    describe('constructor', function () {

        it('should not throw if no arguments', function () {
            expect(function () {
                new PluginApi();
            }).not.to.throw();
        });
    });

    describe('events', function () {

        it('should exist', function () {
            expect(api.on).to.exist;
            expect(api.trigger).to.exist;
        });

        it('should allow adding listener', function () {
            var spy = sinon.spy();
            api.on('test', spy);
            expect(spy).to.not.have.been.called;
        });

        it('should trigger listeners', function () {
            var spy = sinon.spy();
            api.on('test', spy);
            api.trigger('test');
            expect(spy).to.have.been.calledOnce;
        });

        it('should pass arguments from trigger to the listeners', function () {
            var spy = sinon.spy();
            api.on('test', spy);
            api.trigger('test', 1, 2, 3);
            expect(spy).to.have.been.calledWith(1, 2, 3);
        });

        it('should allow multiple listeners', function () {
            var spy = sinon.spy();
            var spy2 = sinon.spy();
            api.on('test', spy);
            api.on('test', spy2);
            api.trigger('test');
            expect(spy).to.have.been.calledOnce;
            expect(spy2).to.have.been.calledOnce;
        });

        it('should allow triggering events without listeners', function () {
            expect(function () {
                api.trigger('foo');
            }).not.to.throw();
        });
    });

    describe('reqres', function () {

        describe('end-to-end', function () {
            var evtName = 'yoer:bar';
            var reqData = {fooInt : 1337};

            it('should call request.callback with proper params when there is a responder', function (done) {
                callRespondToPostMessage(api, evtName);
                callPostMessage(api, evtName, reqData, 1338, done);
            });
        });

        describe('errors', function () {
            it('should catch xde errors', function () {
                api.postMessage('test:event', {}, function (err) {
                    expect(err).to.exist;
                    expect(err.message).to.equal('otherWindow does not support postMessage');
                }, 'not a window object');
            });
        })
    });
});


function callRespondToPostMessage (api, evtName) {
    api.respondToPostMessage(evtName, onResponseMsg);

    function onResponseMsg (responseData, commCb) {
        var result = responseData.fooInt + 1;
        commCb({fooIntResult : result});
    }
}

function callPostMessage (api, evtName, reqData, expectedResult, done) {
    api.postMessage(evtName, reqData, onXdeCb, window);

    function onXdeCb (err, responseData) {
        expect(err).to.be.null;
        expect(responseData.fooIntResult).to.equal(expectedResult);
        done();
    }
}
