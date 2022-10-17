Backbone.Marionette.ItemView.prototype.mixinTemplateHelpers = function (target) {
  var self = this;
  var templateHelpers = Marionette.getOption(self, 'templateHelpers');
  var result = {};

  target = target || {};

  if (_.isFunction(templateHelpers)) {
    templateHelpers = templateHelpers.call(self);
  }

  // This _.each block is what we're adding
  _.each(templateHelpers, function (helper, index) {
    if (_.isFunction(helper)) {
      result[index] = helper.call(self);
    } else {
      result[index] = helper;
    }
  });

  return _.extend(target, result);
};
