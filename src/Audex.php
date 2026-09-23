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

final class Audex
{
    public const SCRIPTS = 'stezkoy-audex.scripts';
    public const EXCLUDED_USERS = 'stezkoy-audex.excluded_users';
    public const EXCLUDED_GROUPS = 'stezkoy-audex.excluded_groups';

    /**
     * Maximum size of a single script block body, in bytes.
     */
    public const MAX_CODE_LENGTH = 50000;

    /**
     * Maximum number of script blocks.
     */
    public const MAX_BLOCKS = 50;

    /**
     * @return array<int, array{name: string, code: string, position: string, enabled: bool}>
     */
    public static function parseScripts(?string $json): array
    {
        $decoded = json_decode((string) $json, true);

        if (! is_array($decoded)) {
            return [];
        }

        $blocks = [];

        foreach ($decoded as $item) {
            if (! is_array($item)) {
                continue;
            }

            $blocks[] = [
                'name' => is_string($item['name'] ?? null) ? $item['name'] : '',
                'code' => is_string($item['code'] ?? null) ? $item['code'] : '',
                'position' => ($item['position'] ?? null) === 'foot' ? 'foot' : 'head',
                'enabled' => ($item['enabled'] ?? null) === true,
            ];
        }

        return $blocks;
    }

    /**
     * Accepts either a flat list of ids ([1, 2]) or a list of objects with an
     * "id" key ([{id: 1, name: "..."}]). Returns a flat list of positive ints.
     *
     * @return array<int, int>
     */
    public static function parseIds(?string $json): array
    {
        $decoded = json_decode((string) $json, true);

        if (! is_array($decoded)) {
            return [];
        }

        $ids = [];

        foreach ($decoded as $item) {
            if (is_array($item)) {
                $item = $item['id'] ?? null;
            }

            if (is_int($item) || (is_string($item) && ctype_digit($item))) {
                $id = (int) $item;

                if ($id > 0) {
                    $ids[] = $id;
                }
            }
        }

        return array_values(array_unique($ids));
    }
}
