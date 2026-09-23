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

return [
    (new Extend\Frontend('forum'))
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
];
