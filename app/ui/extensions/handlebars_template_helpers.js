Backbone.Marionette.ItemView.prototype.mixinTemplateHelpers = function (target) {
  const self = this;
  let templateHelpers = Marionette.getOption(self, 'templateHelpers');
  const result = {};

  target = target || {};

  if (_.isFunction(templateHelpers)) {
    templateHelpers = templateHelpers.call(self);
  }

  // This _.each block is what we're adding
  _.each(templateHelpers, (helper, index) => {
    if (_.isFunction(helper)) {
      result[index] = helper.call(self);
    } else {
      result[index] = helper;
    }
  });

  return _.extend(target, result);
};
