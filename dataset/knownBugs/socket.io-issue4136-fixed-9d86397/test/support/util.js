var expect = require("expect.js");
var i = expect.stringify;
// add support for Set/Map
var contain = expect.Assertion.prototype.contain;
expect.Assertion.prototype.contain = function () {
    var _this = this;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (typeof this.obj === "object") {
        args.forEach(function (obj) {
            _this.assert(_this.obj.has(obj), function () {
                return "expected " + i(this.obj) + " to contain " + i(obj);
            }, function () {
                return "expected " + i(this.obj) + " to not contain " + i(obj);
            });
        });
        return this;
    }
    return contain.apply(this, args);
};
