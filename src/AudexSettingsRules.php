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

use Flarum\Foundation\AbstractValidator;
use Flarum\Locale\TranslatorInterface;
use Illuminate\Validation\Validator;

/**
 * Structural validation for the Audex settings, attached to core's
 * SettingsValidator (runs on every POST /api/settings).
 *
 * Only the keys actually present in the payload are validated, so saving
 * settings of other extensions is unaffected.
 */
class AudexSettingsRules
{
    public function __construct(
        protected readonly TranslatorInterface $translator,
    ) {}

    public function __invoke(AbstractValidator $flarumValidator, Validator $validator): void
    {
        $data = $validator->getData();

        if (array_key_exists(Audex::SCRIPTS, $data)) {
            $validator->after(function (Validator $v) use ($data) {
                $this->validateScripts((string) $data[Audex::SCRIPTS], $v);
            });
        }

        if (array_key_exists(Audex::EXCLUDED_USERS, $data)) {
            $validator->after(function (Validator $v) use ($data) {
                $this->validateIdList((string) $data[Audex::EXCLUDED_USERS], $v, Audex::EXCLUDED_USERS, 'excluded_users');
            });
        }

        if (array_key_exists(Audex::EXCLUDED_GROUPS, $data)) {
            $validator->after(function (Validator $v) use ($data) {
                $this->validateIdList((string) $data[Audex::EXCLUDED_GROUPS], $v, Audex::EXCLUDED_GROUPS, 'excluded_groups');
            });
        }
    }

    protected function validateScripts(string $json, Validator $v): void
    {
        $key = Audex::SCRIPTS;

        $decoded = json_decode($json, true);

        if (! is_array($decoded)) {
            $v->errors()->add($key, $this->trans('error_json'));

            return;
        }

        if (count($decoded) > Audex::MAX_BLOCKS) {
            $v->errors()->add($key, $this->trans('error_too_many', ['count' => Audex::MAX_BLOCKS]));

            return;
        }

        foreach ($decoded as $index => $item) {
            $label = '#'.($index + 1);

            if (! is_array($item)) {
                $v->errors()->add($key, $this->trans('error_block_json', ['block' => $label]));

                continue;
            }

            $name = $item['name'] ?? '';

            if (! is_string($name) || mb_strlen($name) > 100) {
                $v->errors()->add($key, $this->trans('error_name', ['block' => $label]));
            }

            if (str_contains($name, '<') || str_contains($name, '>') || str_contains($name, '--')) {
                $v->errors()->add($key, $this->trans('error_name_html', ['block' => $label]));
            }

            $code = $item['code'] ?? '';

            if (! is_string($code) || trim($code) === '') {
                $v->errors()->add($key, $this->trans('error_code_empty', ['block' => $label]));
            } elseif (strlen($code) > Audex::MAX_CODE_LENGTH) {
                $v->errors()->add($key, $this->trans('error_code_too_long', [
                    'block' => $label,
                    'max' => Audex::MAX_CODE_LENGTH,
                ]));
            }

            if (($item['position'] ?? null) !== null && ! in_array($item['position'], ['head', 'foot'], true)) {
                $v->errors()->add($key, $this->trans('error_position', ['block' => $label]));
            }

            if (isset($item['enabled']) && ! is_bool($item['enabled'])) {
                $v->errors()->add($key, $this->trans('error_enabled', ['block' => $label]));
            }
        }
    }

    protected function validateIdList(string $json, Validator $v, string $key, string $translationPrefix): void
    {
        $decoded = json_decode($json, true);

        if (! is_array($decoded)) {
            $v->errors()->add($key, $this->trans('error_json'));

            return;
        }

        if (count($decoded) > 1000) {
            $v->errors()->add($key, $this->trans($translationPrefix.'.error_too_many'));

            return;
        }

        foreach ($decoded as $index => $item) {
            $id = is_array($item) ? ($item['id'] ?? null) : $item;

            if (! is_int($id) && ! (is_string($id) && ctype_digit($id))) {
                $v->errors()->add($key, $this->trans($translationPrefix.'.error_invalid', ['index' => $index + 1]));

                return;
            }

            // Optional display name for objects, capped defensively.
            if (is_array($item) && isset($item['name']) && (! is_string($item['name']) || mb_strlen($item['name']) > 100)) {
                $v->errors()->add($key, $this->trans($translationPrefix.'.error_invalid', ['index' => $index + 1]));

                return;
            }
        }
    }

    protected function trans(string $key, array $parameters = []): string
    {
        $translated = $this->translator->trans('stezkoy-audex.admin.'.$key, $parameters);

        return is_string($translated) ? $translated : $key;
    }
}
