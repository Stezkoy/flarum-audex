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

use Flarum\Frontend\Document;
use Flarum\Http\RequestUtil;
use Flarum\User\User;
use Psr\Http\Message\ServerRequestInterface;

/**
 * Injects ad script blocks into the forum <head> / before </body>,
 * skipping users and groups configured as excluded.
 *
 * Excluded users never receive the scripts at all — nothing is loaded,
 * nothing is executed in their browser.
 */
class AddAdScripts
{
    public function __construct(
        protected readonly SettingsProvider $settings,
    ) {}

    public function __invoke(Document $document, ServerRequestInterface $request): void
    {
        $scripts = $this->settings->scripts();

        if (count($scripts) === 0) {
            return;
        }

        $actor = RequestUtil::getActor($request);

        if ($this->isExcluded($actor)) {
            return;
        }

        foreach ($scripts as $script) {
            if (! $script['enabled'] || $script['code'] === '') {
                continue;
            }

            $code = $script['code'];

            // A snippet without any script tag is treated as plain JavaScript
            // and wrapped — otherwise the browser would render it as visible
            // text. Full snippets (with their own script tags) pass verbatim.
            if (stripos($code, '<script') === false) {
                $code = '<script>' . $code . '</script>';
            }

            // The code is inserted verbatim (the admin is a trusted role, just
            // like with Flarum's own custom-header feature). Only the comment
            // label is escaped so it can never break out of the HTML comment.
            $html = '<!-- audex: ' . e($script['name']) . ' -->' . "\n" . $code;

            if ($script['position'] === 'foot') {
                $document->foot[] = $html;
            } else {
                $document->head[] = $html;
            }
        }
    }

    protected function isExcluded(User $actor): bool
    {
        // Guests always see ads (by design).
        if ($actor->isGuest()) {
            return false;
        }

        if (in_array($actor->id, $this->settings->excludedUserIds(), true)) {
            return true;
        }

        $actorGroupIds = $actor->groups->pluck('id')->all();

        return count(array_intersect($actorGroupIds, $this->settings->excludedGroupIds())) > 0;
    }
}
