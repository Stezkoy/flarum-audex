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
use Psr\Http\Message\ServerRequestInterface;

/**
 * Injects ad script blocks into the forum <head> / before </body>,
 * skipping users and groups configured as excluded.
 *
 * Excluded users never receive the scripts at all — nothing is loaded,
 * nothing is executed in their browser.
 *
 * Also publishes payload flags used by the optional forum-widgets-core
 * integration ("widget" placement): the widget is disabled client-side for
 * excluded users, and the widget content itself is served by
 * WidgetContentController with the same exclusion rules.
 */
class AddAdScripts
{
    public function __construct(
        protected readonly SettingsProvider $settings,
    ) {}

    public function __invoke(Document $document, ServerRequestInterface $request): void
    {
        $scripts = $this->settings->scripts();
        $actor = RequestUtil::getActor($request);
        $excluded = $this->settings->isExcluded($actor);

        // Flags for the forum-widgets-core integration. Cheap scalars; the
        // widget JS reads them regardless of whether any script is configured.
        $widgetBlocks = $excluded ? [] : $this->settings->widgetBlocks();

        $document->payload['stezkoy-audex.excluded'] = $excluded;
        $document->payload['stezkoy-audex.widgetBlocks'] = count($widgetBlocks);
        // Revision of the widget content, used as a cache-busting query param.
        $document->payload['stezkoy-audex.widgetRev'] = $widgetBlocks
            ? substr(sha1(json_encode($widgetBlocks)), 0, 12)
            : '';

        if ($excluded) {
            return;
        }

        foreach ($scripts as $script) {
            if (! $script['enabled'] || $script['code'] === '') {
                continue;
            }

            // "widget" blocks are served by WidgetContentController instead.
            if ($script['position'] === 'widget') {
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
}
