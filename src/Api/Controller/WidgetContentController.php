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
use Flarum\Settings\SettingsRepositoryInterface;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Stezkoy\FlarumAudex\SettingsProvider;

/**
 * Serves the blocks placed as "widget" for the Audex forum-widgets-core
 * integration.
 *
 * Excluded users and members of excluded groups receive an empty list — the
 * same rule as the head/foot injection, enforced server-side so the code is
 * never even delivered to them.
 *
 * The response is cached privately per browser (never shared/public: the
 * content differs per actor). The Audex widget only requests it for
 * non-excluded users anyway; the rev query param (from the page payload)
 * busts the cache when an admin edits the blocks.
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
