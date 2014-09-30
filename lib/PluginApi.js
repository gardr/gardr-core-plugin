var xde = require('cross-domain-events');
var data = {};
var i = 0;

function get (id, property) {
    if (data[id]) { return data[id][property]; }
}

function set (id, property, value) {
    data[id] = data[id] || {};
    data[id][property] = value;
}

function subscribe (id, subject, fn) {
    if (typeof id != 'number' && typeof subject != 'string' && typeof fn != 'function') {
        throw new Error('Invalid arguments');
    }
    var listeners = get(id, 'listeners');
    if (!listeners[subject]) {
        listeners[subject] = [];
    }
    listeners[subject].push(fn);
}

function publish (id, subject) {
    var subscribers = get(id, 'listeners')[subject];
    var args = Array.prototype.slice.call(arguments, 2);
    if (!subscribers) { return; }
    subscribers.forEach(function (fn) {
        fn.apply(null, args);
    });
}


 /**
 *
 * Gardr.reqres
 *
 * Request-response pattern for sending messages
 * between gardr hostplugins and ext banners and plugins.
 */

 // Sends a message to otherWindow with params
 // waits for the response, and calls callback upon that.
 function postMessage (subject, params, callback, otherWindow) {
     otherWindow = otherWindow || window.top;

     try {
         xde.sendTo(otherWindow, 'gardr:' + subject, params);

         xde.on('gardr:' + subject + ':response', function (evt) {
             callback(null, evt.data);
         });
     } catch(e) {
         callback(e);
     }
 }


// listens to postmessages with subject
// calls the given callback, and upon return
// sends the result back
function respondToPostMessage (subject, cb) {
     xde.on('gardr:' + subject, onRespondToMsg(subject, cb))

    function onRespondToMsg (subject, cb) {

        return function (evt) {
            // because cb can be async, it is responsible for
            // triggering the _onCallbackComplete function
            cb(evt.data, onCallbackComplete.bind(null, subject, evt));
        }
    }

    function onCallbackComplete (subject, evt, res) {
        xde.sendTo(evt.source, 'gardr:' + subject + ':response', res);
    }
}


var PluginApi = function () {
    this.id = i++;

    set(this.id, 'listeners', {});
    this.on      = subscribe.bind(null, this.id);
    this.trigger = publish.bind(null, this.id);

    // The reqres module enables gardr plugins to communicate after
    // the banner has been document writed.
    this.postMessage = postMessage;
    this.respondToPostMessage = respondToPostMessage;

    this._reset = function () { set(this.id, 'listeners', {}); };
};

module.exports = PluginApi;
