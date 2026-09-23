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

use Flarum\Settings\SettingsRepositoryInterface;

class SettingsProvider
{
    public function __construct(
        protected readonly SettingsRepositoryInterface $settings,
    ) {}

    /**
     * @return array<int, array{name: string, code: string, position: string, enabled: bool}>
     */
    public function scripts(): array
    {
        return Audex::parseScripts($this->settings->get(Audex::SCRIPTS));
    }

    /**
     * @return array<int, int>
     */
    public function excludedUserIds(): array
    {
        return Audex::parseIds($this->settings->get(Audex::EXCLUDED_USERS));
    }

    /**
     * @return array<int, int>
     */
    public function excludedGroupIds(): array
    {
        return Audex::parseIds($this->settings->get(Audex::EXCLUDED_GROUPS));
    }
}
