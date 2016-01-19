Polymer({
    is: 'example-el',
    properties: {
        'resources': Object,
        'testVar': String
    },
	ready: function() {
	},
    attached: function() {
		this.testVar = 'Test Successful';
    }
});
