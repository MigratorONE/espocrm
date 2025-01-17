<?php
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

//de HACK
//de Must pass Espo-Portal-ID header:
//de i.e. nginx: proxy_set_header Espo-Portal-ID $espocrm_portal;

if (function_exists('apache_request_headers') ) {
        $headers = apache_request_headers();
        if (array_key_exists("Espo-Portal-ID", $headers)) {
                $_SERVER['ESPO_PORTAL_ID'] = apache_request_headers()['Espo-Portal-ID'];
                if ($_SERVER['ESPO_PORTAL_ID']) {
                        $_SERVER['ESPO_PORTAL_IS_CUSTOM_URL'] = true;
                }
        }
}

include "../../bootstrap.php";

use Espo\Core\Application;
use Espo\Core\Application\Runner\Params;
use Espo\Core\ApplicationRunners\EntryPoint;
use Espo\Core\ApplicationRunners\PortalClient;
use Espo\Core\Portal\Utils\Url;

$app = new Application();

if (!$app->isInstalled()) {
    exit;
}

$basePath = null;

if (Url::detectIsInPortalDir()) {
    $basePath = '../';

    if (Url::detectIsInPortalWithId()) {
        $basePath = '../../';
    }

    $app->setClientBasePath($basePath);
}

if (filter_has_var(INPUT_GET, 'entryPoint')) {
    $app->run(EntryPoint::class);

    exit;
}

$app->run(
    PortalClient::class,
    Params::create()->with('basePath', $basePath)
);
