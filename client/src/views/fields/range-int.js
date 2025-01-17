/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014-2023 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * EspoCRM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * EspoCRM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EspoCRM. If not, see http://www.gnu.org/licenses/.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/fields/range-int',
['views/fields/base', 'views/fields/int', 'lib!autonumeric'], function (Dep, Int, AutoNumeric) {

    return Dep.extend({

        type: 'rangeInt',

        listTemplate: 'fields/range-int/detail',
        detailTemplate: 'fields/range-int/detail',
        editTemplate: 'fields/range-int/edit',

        validations: ['required', 'int', 'range', 'order'],

        data: function () {
            let data = Dep.prototype.data.call(this);

            data.ucName = Espo.Utils.upperCaseFirst(this.name);
            data.fromValue = this.model.get(this.fromField);
            data.toValue = this.model.get(this.toField);

            return data;
        },

        init: function () {
            var ucName = Espo.Utils.upperCaseFirst(this.options.defs.name);

            this.fromField = 'from' + ucName;
            this.toField = 'to' + ucName;

            Dep.prototype.init.call(this);
        },

        getValueForDisplay: function () {
            let fromValue = this.model.get(this.fromField);
            let toValue = this.model.get(this.toField);

            fromValue = isNaN(fromValue) ? null : fromValue;
            toValue = isNaN(toValue) ? null : toValue;

            if (fromValue !== null && toValue !== null) {
                return this.formatNumber(fromValue) + ' &#8211 ' + this.formatNumber(toValue);
            }
            else if (fromValue) {
                return '&#62;&#61; ' + this.formatNumber(fromValue);
            }
            else if (toValue) {
                return '&#60;&#61; ' + this.formatNumber(toValue);
            }
            else {
                return this.translate('None');
            }
        },

        setup: function () {
            if (this.getPreferences().has('decimalMark')) {
                this.decimalMark = this.getPreferences().get('decimalMark');
            }
            else {
                if (this.getConfig().has('decimalMark')) {
                    this.decimalMark = this.getConfig().get('decimalMark');
                }
            }

            if (this.getPreferences().has('thousandSeparator')) {
                this.thousandSeparator = this.getPreferences().get('thousandSeparator');
            }
            else {
                if (this.getConfig().has('thousandSeparator')) {
                    this.thousandSeparator = this.getConfig().get('thousandSeparator');
                }
            }
        },

        setupFinal: function () {
            Dep.prototype.setupFinal.call(this);

            this.setupAutoNumericOptions();
        },

        /**
         * @protected
         */
        setupAutoNumericOptions: function () {
            let separator = (!this.disableFormatting ? this.thousandSeparator : null) || '';
            let decimalCharacter = '.';

            if (separator === '.') {
                decimalCharacter = ',';
            }

            this.autoNumericOptions = {
                digitGroupSeparator: separator,
                decimalCharacter: decimalCharacter,
                modifyValueOnWheel: false,
                decimalPlaces: 0,
                selectOnFocus: false,
                formulaMode: true,
            };
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.mode === this.MODE_EDIT) {
                this.$from = this.$el.find('[data-name="' + this.fromField + '"]');
                this.$to = this.$el.find('[data-name="' + this.toField + '"]');

                this.$from.on('change', () => {
                    this.trigger('change');
                });

                this.$to.on('change', () => {
                    this.trigger('change');
                });

                if (this.autoNumericOptions) {
                    this.autoNumericInstance1 = new AutoNumeric(this.$from.get(0), this.autoNumericOptions);
                    this.autoNumericInstance2 = new AutoNumeric(this.$to.get(0), this.autoNumericOptions);
                }
            }
        },

        validateRequired: function () {
            var validate = (name) => {
                if (this.model.isRequired(name)) {
                    if (this.model.get(name) === null) {
                        var msg = this.translate('fieldIsRequired', 'messages')
                            .replace('{field}', this.getLabelText());

                        this.showValidationMessage(msg, '[data-name="'+name+'"]');

                        return true;
                    }
                }
            };

            let result = false;

            result = validate(this.fromField) || result;
            result = validate(this.toField) || result;

            return result;
        },

        validateInt: function () {
            let validate = (name) => {
                if (isNaN(this.model.get(name))) {
                    var msg = this.translate('fieldShouldBeInt', 'messages')
                        .replace('{field}', this.getLabelText());

                    this.showValidationMessage(msg, '[data-name="'+name+'"]');

                    return true;
                }
            };

            let result = false;

            result = validate(this.fromField) || result;
            result = validate(this.toField) || result;

            return result;
        },

        validateRange: function () {
            let validate = (name) => {
                var value = this.model.get(name);

                if (value === null) {
                    return false;
                }

                var minValue = this.model.getFieldParam(name, 'min');
                var maxValue = this.model.getFieldParam(name, 'max');

                if (minValue !== null && maxValue !== null) {
                    if (value < minValue || value > maxValue ) {
                        let msg = this.translate('fieldShouldBeBetween', 'messages')
                            .replace('{field}', this.translate(name, 'fields', this.entityType))
                            .replace('{min}', minValue)
                            .replace('{max}', maxValue);

                        this.showValidationMessage(msg, '[data-name="'+name+'"]');

                        return true;
                    }
                } else {
                    if (minValue !== null) {
                        if (value < minValue) {
                            let msg = this.translate('fieldShouldBeLess', 'messages')
                                .replace('{field}', this.translate(name, 'fields', this.entityType))
                                .replace('{value}', minValue);

                            this.showValidationMessage(msg, '[data-name="'+name+'"]');

                            return true;
                        }
                    } else if (maxValue !== null) {
                        if (value > maxValue) {
                            let msg = this.translate('fieldShouldBeGreater', 'messages')
                                .replace('{field}', this.translate(name, 'fields', this.entityType))
                                .replace('{value}', maxValue);

                            this.showValidationMessage(msg, '[data-name="'+name+'"]');

                            return true;
                        }
                    }
                }
            };

            let result = false;

            result = validate(this.fromField) || result;
            result = validate(this.toField) || result;

            return result;
        },

        validateOrder: function () {
            let fromValue = this.model.get(this.fromField);
            let toValue = this.model.get(this.toField);

            if (fromValue !== null && toValue !== null) {
                if (fromValue > toValue) {
                    let msg = this.translate('fieldShouldBeGreater', 'messages')
                        .replace('{field}', this.translate(this.toField, 'fields', this.entityType))
                        .replace('{value}', this.translate(this.fromField, 'fields', this.entityType));

                    this.showValidationMessage(msg, '[data-name="'+this.fromField+'"]');

                    return true;
                }
            }
        },

        isRequired: function () {
            return this.model.getFieldParam(this.fromField, 'required') ||
                this.model.getFieldParam(this.toField, 'required');
        },

        parse: function (value) {
            return Int.prototype.parse.call(this, value);
        },

        formatNumber: function (value) {
            return Int.prototype.formatNumberDetail.call(this, value);
        },

        fetch: function () {
            let data = {};

            data[this.fromField] = this.parse(this.$from.val().trim());
            data[this.toField] = this.parse(this.$to.val().trim());

            return data;
        },
    });
});
