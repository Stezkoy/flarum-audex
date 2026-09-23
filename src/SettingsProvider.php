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
use Flarum\User\User;

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
     * @return array<int, array{name: string, code: string}>
     */
    public function widgetBlocks(): array
    {
        return array_values(array_map(
            fn (array $script) => ['name' => $script['name'], 'code' => $script['code']],
            array_filter(
                $this->scripts(),
                fn (array $script) => $script['position'] === 'widget' && $script['enabled'] && $script['code'] !== ''
            )
        ));
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

    /**
     * Whether the actor must not receive any scripts at all.
     */
    public function isExcluded(User $actor): bool
    {
        // Guests always see scripts (by design).
        if ($actor->isGuest()) {
            return false;
        }

        if (in_array($actor->id, $this->excludedUserIds(), true)) {
            return true;
        }

        $actorGroupIds = $actor->groups->pluck('id')->all();

        return count(array_intersect($actorGroupIds, $this->excludedGroupIds())) > 0;
    }
}
