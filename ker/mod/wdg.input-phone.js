"use strict";
var Storage = require("tfw.storage").local;
var Widget = require("wdg");
var Input = require("wdg.input");

var T = Widget.tag;

/**
 * @example
 * var InputPhone = require("wdg.input-phone");
 * var instance = new InputPhone(options);
 * @class InputPhone
 */
var InputPhone = function(options) {
    Widget.call(this);
    this.addClass("wdg-input-phone");
    var inpSMS = new Input(
        {
            placeholder: "Phone Number",
            width: "10em"
        }
    );
    if (typeof options.save === 'string') {
        inpSMS.val(Storage.get(options.save, ''));
        inpSMS.Change(function () {
            Storage.set(options.save, inpSMS.val());
        });
    }
    
    this.append(inpSMS);
    if ('MozActivity' in window) {
        var btnContact = T("a").text("Contacts");
        this.append(btnContact);
        btnContact.Tap(function () {
            var pick = new MozActivity({
                name: "pick",
                data: {
                    type: "webcontacts/contact"
                }
            });
            pick.onsuccess = function () {
                var contact = this.result;
                if( contact ){
                    inpSMS.val(contact.number);
                }
            };
        });
    }
    this._inpSMS = inpSMS;
};

// Extension of Widget.
InputPhone.prototype = Object.create(Widget.prototype);
InputPhone.prototype.constructor = InputPhone;

// TODO: put your prototypes here...


InputPhone.create = function(options) {
    return new InputPhone(options);
};
module.exports = InputPhone;
