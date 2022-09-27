const Handlebars = require('handlebars');
const { expect } = require('chai');

class TestClass {}
TestClass.prototype.accessMe = 'I am a prototype property';

describe('Handlebars.UnitTests', () => {
  it('should allow prototype property access', () => {
    const template = Handlebars.compile('{{accessMe}}');
    const result = template(new TestClass());
    expect(result).to.eql('I am a prototype property');
  });
});
