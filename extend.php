<?php

/*
 * This file is part of stezkoy/flarum-audex.
 *
 * Copyright (c) Stezkoy.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Stezkoy\FlarumAudex;

use Flarum\Extend;
use Flarum\Settings\SettingsValidator;
use Stezkoy\FlarumAudex\Api\Controller\WidgetContentController;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->content(AddAdScripts::class),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),

    new Extend\Locales(__DIR__ . '/locale'),

    (new Extend\Settings())
        ->default('stezkoy-audex.scripts', '[]')
        ->default('stezkoy-audex.excluded_users', '[]')
        ->default('stezkoy-audex.excluded_groups', '[]'),

    // Validate the JSON payloads when settings are saved from the admin panel
    // (POST /api/settings runs core's SettingsValidator for every key).
    (new Extend\Validator(SettingsValidator::class))
        ->configure(AudexSettingsRules::class),

    // Optional forum-widgets-core integration ("widget" placement): the
    // content endpoint only exists while that extension is enabled. The
    // frontend registers the widget itself with a runtime guard, so it stays
    // silent when fof/forum-widgets-core is absent.
    (new Extend\Conditional())
        ->whenExtensionEnabled('fof-forum-widgets-core', function () {
            return [
                (new Extend\Routes('api'))
                    ->get('/audex/widget', 'audex.widget', WidgetContentController::class),
            ];
        }),
];
