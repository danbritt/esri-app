'use strict';

Polymer({
    is: 'example-el',
    properties: {
        'resources': Object,
        'testVar': String
    },
    ready: function ready() {},
    attached: function attached() {
        this.testVar = 'Test Successful';
    }
});