import Component from 'flarum/common/Component';
import Switch from 'flarum/common/components/Switch';
import Button from 'flarum/common/components/Button';
import extractText from 'flarum/common/utils/extractText';

const PREFIX = 'stezkoy-audex.admin.';

export default class ScriptListItem extends Component {
  view() {
    const { script, loading, ontoggle, onedit, onmoveup, onmovedown, ondelete } = this.attrs;

    // A "widget" block renders nowhere while fof/forum-widgets-core is
    // disabled — mark the badge accordingly so the admin notices.
    const widgetOff = script.position === 'widget' && !flarum.extensions['fof-forum-widgets-core'];

    let badge;
    let badgeHelpKey;

    if (script.position === 'foot') {
      badge = 'body';
      badgeHelpKey = 'badge_body_help';
    } else if (widgetOff) {
      badge = extractText(app.translator.trans(PREFIX + 'badge_widget_off'));
      badgeHelpKey = 'badge_widget_off_help';
    } else if (script.position === 'widget') {
      badge = 'widget';
      badgeHelpKey = 'badge_widget_help';
    } else {
      badge = 'head';
      badgeHelpKey = 'badge_head_help';
    }

    return m('li.AudexScriptListItem' + (script.enabled ? '' : '.disabled'), [
      m('.AudexScriptListItem-main', [
        m('.AudexScriptListItem-name', [
          script.name || '—',
          m(
            'span.AudexScriptListItem-position' + (widgetOff ? '.AudexScriptListItem-position--off' : ''),
            {
              title: extractText(app.translator.trans(PREFIX + badgeHelpKey)),
            },
            badge
          ),
        ]),
        m('.AudexScriptListItem-code', script.code || ''),
      ]),
      m('.AudexScriptListItem-controls', [
        m(Switch, {
          state: script.enabled,
          loading,
          disabled: loading,
          onchange: ontoggle,
        }, ''),
        m(
          Button,
          {
            className: 'Button Button--icon',
            icon: 'fas fa-arrow-up',
            title: app.translator.trans(PREFIX + 'move_up'),
            'aria-label': app.translator.trans(PREFIX + 'move_up'),
            disabled: loading || !onmoveup,
            onclick: () => onmoveup && onmoveup(),
          }
        ),
        m(
          Button,
          {
            className: 'Button Button--icon',
            icon: 'fas fa-arrow-down',
            title: app.translator.trans(PREFIX + 'move_down'),
            'aria-label': app.translator.trans(PREFIX + 'move_down'),
            disabled: loading || !onmovedown,
            onclick: () => onmovedown && onmovedown(),
          }
        ),
        m(
          Button,
          {
            className: 'Button Button--icon',
            icon: 'fas fa-pencil-alt',
            title: app.translator.trans(PREFIX + 'edit_button'),
            'aria-label': app.translator.trans(PREFIX + 'edit_button'),
            disabled: loading,
            onclick: onedit,
          }
        ),
        m(
          Button,
          {
            className: 'Button Button--icon Button--danger',
            icon: 'fas fa-trash-alt',
            title: app.translator.trans(PREFIX + 'delete_button'),
            'aria-label': app.translator.trans(PREFIX + 'delete_button'),
            disabled: loading,
            onclick: ondelete,
          }
        ),
      ]),
    ]);
  }
}
