<?php

/*
 * This file is part of stezkoy/flarum-audex.
 *
 * Copyright (c) Stezkoy.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Stezkoy\FlarumAudex\Api\Controller;

use Flarum\Http\RequestUtil;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Stezkoy\FlarumAudex\SettingsProvider;

/**
 * Serves the blocks placed as "widget" for the forum-widgets-core
 * integration. Excluded users receive an empty list — the same rule as the
 * head/foot injection, enforced server-side.
 *
 * Cached privately per browser (content differs per actor); the rev query
 * param busts the cache when an admin edits the blocks.
 */
class WidgetContentController implements RequestHandlerInterface
{
    public function __construct(
        protected readonly SettingsProvider $settings,
    ) {}

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $actor = RequestUtil::getActor($request);

        $blocks = $this->settings->isExcluded($actor)
            ? []
            : $this->settings->widgetBlocks();

        return new JsonResponse(['blocks' => $blocks], 200, [
            'Cache-Control' => 'private, max-age=300',
        ]);
    }
}
