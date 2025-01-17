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

define('views/stream/modals/create-post', ['views/modal'], function (Dep) {

    return Dep.extend({

        templateContent: '<div class="record">{{{record}}}</div>',

        shortcutKeys: {
            'Control+Enter': 'post',
        },

        setup: function () {
            this.headerText = this.translate('Create Post');

            this.buttonList = [
                {
                    name: 'post',
                    label: 'Post',
                    style: 'primary',
                    title: 'Ctrl+Enter',
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                    onClick: function (dialog) {
                        dialog.close();
                    },
                    title: 'Esc',
                }
            ];

            this.wait(true);

            this.getModelFactory().create('Note', (model) => {
                this.createView('record', 'views/stream/record/edit', {
                    model: model,
                    selector: '.record',
                }, view => {
                    this.listenTo(view, 'after:save', () => {
                        this.trigger('after:save');
                    });

                    this.listenTo(view, 'disable-post-button', () => this.disableButton('post'));
                    this.listenTo(view, 'enable-post-button', () => this.enableButton('post'));
                });

                this.wait(false);
            });
        },

        actionPost: function () {
            this.getView('record').save();
        },
    });
});
