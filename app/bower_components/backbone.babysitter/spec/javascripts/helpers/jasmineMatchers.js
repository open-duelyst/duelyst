beforeEach(function() {
  jasmine.addMatchers({
    toHaveOwnProperty: function(expectedProperty) {
      var obj = this.actual;
      return obj.hasOwnProperty(expectedProperty);
    }
  });
});
