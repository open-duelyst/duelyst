'use strict';

var Session = require('app/common/session2');
var validator = require('validator');
var Logger = require('app/common/logger');
var Animations = require("app/ui/views/animations");
var FormPromptModalItemView = require('./form_prompt_modal');
var ForgotPasswordTmpl = require('app/ui/templates/item/forgot_password.hbs');
var i18next = require('i18next')

var ForgotPasswordItemView = FormPromptModalItemView.extend({

	template: ForgotPasswordTmpl,

	id: "app-forgot-password",

	ui: {
		$form: ".prompt-form",
		$email: ".email",
		$submit: ".prompt-submit",
		$submitted: ".prompt-submitted",
		$error: ".prompt-error",
		$errorMessage: ".error-message",
		$success: ".prompt-success"
	},

	_hasModifiedEmail: false,

	/* region EVENTS */

	onFormControlChangeContent: function (event) {

		// update modified state
		var $target = $(event.target);
		if (this.ui.$email.is($target)) {
			this._hasModifiedEmail = true;
		}

		FormPromptModalItemView.prototype.onFormControlChangeContent.apply(this, arguments);
	},

	onSubmit: function(e) {
		FormPromptModalItemView.prototype.onSubmit.apply(this, arguments);

		var email = this.ui.$email.val();
		Session.forgot(email).bind(this)
		.then(function (res) {
			this.onSuccess(res)
		})
		.catch(function (e) {
			// onError expects a string not an actual error
			this.onError(e.innerMessage || e.message)
		})
	},

	/* endregion EVENTS */

	/* region STATE */

	updateValidState: function () {
		FormPromptModalItemView.prototype.updateValidState.apply(this, arguments);

		var email = this.ui.$email.val();
		var isValid = true;

		// check email
		if (this._hasModifiedEmail && !validator.isEmail(email)) {
			this.showInvalidFormControl(this.ui.$email, i18next.t("login.invalid_email_message"));
			isValid = false;
		} else {
			this.showValidFormControl(this.ui.$email);
		}

		// set valid state
		this.isValid = isValid && this._hasModifiedEmail;
	}

	/* endregion STATE */

});

// Expose the class either via CommonJS or the global object
module.exports = ForgotPasswordItemView;
