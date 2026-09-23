import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import Checkbox from 'flarum/common/components/Checkbox';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import UserSelectionModal from 'flarum/common/components/UserSelectionModal';
import saveSettings from 'flarum/admin/utils/saveSettings';
import ScriptModal from './ScriptModal';
import ScriptListItem from './ScriptListItem';
import ConfirmModal from './ConfirmModal';

const PREFIX = 'stezkoy-audex.admin.';

const SETTING_SCRIPTS = 'stezkoy-audex.scripts';
const SETTING_EXCLUDED_USERS = 'stezkoy-audex.excluded_users';
const SETTING_EXCLUDED_GROUPS = 'stezkoy-audex.excluded_groups';

// The Guest group is intentionally not offered: guests always see ads.
const GUEST_GROUP_ID = '2';

function parseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

export default class AudexAdminPage extends ExtensionPage {
  oninit(vnode) {
    super.oninit(vnode);

    this.scripts = parseJson(app.data.settings[SETTING_SCRIPTS], []);
    this.excludedUsers = parseJson(app.data.settings[SETTING_EXCLUDED_USERS], []);
    this.excludedGroups = parseJson(app.data.settings[SETTING_EXCLUDED_GROUPS], []);

    this.saving = false;
  }

  content() {
    return m(
      '.ExtensionPage-settings',
      m(
        '.container',
        m('div.AudexAdmin', [
          this.helpBlock(),
          this.scriptsSection(),
          this.exclusionsSection(),
        ])
      )
    );
  }

  helpBlock() {
    return m('.AudexAdmin-help', app.translator.trans(PREFIX + 'help_block'));
  }

  scriptsSection() {
    const total = this.scripts.length;
    const enabled = this.scripts.filter((s) => s.enabled).length;

    return m('section.AudexAdmin-section', [
      m('.AudexAdmin-sectionHeader', [
        m('.AudexAdmin-sectionHeader-text', [
          m('h3', [
            app.translator.trans(PREFIX + 'scripts_section'),
            total
              ? m('span.AudexAdmin-sectionCounter', app.translator.trans(PREFIX + 'section_counter', { enabled, total }))
              : null,
          ]),
          m('p.helpText', app.translator.trans(PREFIX + 'scripts_section_help')),
        ]),
        m(
          Button,
          {
            className: 'Button Button--primary',
            icon: 'fas fa-plus',
            onclick: () => this.openModal(null),
          },
          app.translator.trans(PREFIX + 'add_button')
        ),
      ]),

      total
        ? m(
            'ul.AudexScriptList',
            this.scripts.map((script, index) =>
              m(ScriptListItem, {
                key: index,
                script,
                loading: this.saving,
                ontoggle: (value) => this.updateScript(index, { enabled: value }),
                onedit: () => this.openModal(index),
                onmoveup: index > 0 ? () => this.moveScript(index, -1) : null,
                onmovedown: index < total - 1 ? () => this.moveScript(index, 1) : null,
                ondelete: () => this.confirmDelete(index),
              })
            )
          )
        : m('.AudexAdmin-empty', app.translator.trans(PREFIX + 'empty')),
    ]);
  }

  exclusionsSection() {
    const groups = this.availableGroups();

    return m('section.AudexAdmin-section', [
      m('.AudexAdmin-sectionHeader', [
        m('.AudexAdmin-sectionHeader-text', [
          m('h3', app.translator.trans(PREFIX + 'exclusions_section')),
          m('p.helpText', app.translator.trans(PREFIX + 'exclusions_section_help')),
        ]),
      ]),

      m('.AudexAdmin-exclusions', [
        m('.Form-group', [
          m('label', app.translator.trans(PREFIX + 'groups_label')),
          m('p.helpText', app.translator.trans(PREFIX + 'groups_help')),
          groups.length
            ? m(
                '.AudexAdmin-groups',
                groups.map((group) =>
                  m(
                    '.AudexAdmin-group',
                    m(Checkbox, {
                      state: this.excludedGroups.indexOf(group.id()) !== -1,
                      disabled: this.saving,
                      onchange: (checked) => this.toggleGroup(group.id(), checked),
                    }, [
                      group.color()
                        ? m('span.AudexAdmin-groupDot', { style: { background: group.color() } })
                        : null,
                      group.namePlural(),
                    ])
                  )
                )
              )
            : m('.AudexAdmin-empty', app.translator.trans(PREFIX + 'groups_empty')),
        ]),

        m('.Form-group', [
          m('label', app.translator.trans(PREFIX + 'users_label')),
          m('p.helpText', app.translator.trans(PREFIX + 'users_help')),
          m('.AudexAdmin-usersControls', [
            m(
              Button,
              {
                className: 'Button',
                icon: 'fas fa-user-plus',
                disabled: this.saving,
                onclick: () => this.openUsersModal(),
              },
              app.translator.trans(PREFIX + 'users_add_button')
            ),
            this.excludedUsers.length
              ? m(
                  'span.AudexAdmin-usersCount',
                  app.translator.trans(PREFIX + 'users_selected', { count: this.excludedUsers.length })
                )
              : null,
          ]),
          this.excludedUsers.length
            ? m(
                '.AudexAdmin-users',
                this.excludedUsers.map((user) =>
                  m('.AudexAdmin-userPill', { key: user.id }, [
                    m('span.AudexAdmin-userPill-name', user.name || '#' + user.id),
                    m(
                      'button.AudexAdmin-userPill-remove.Button.Button--icon.Button--link',
                      {
                        type: 'button',
                        title: app.translator.trans(PREFIX + 'delete_button'),
                        'aria-label': app.translator.trans(PREFIX + 'delete_button'),
                        disabled: this.saving,
                        onclick: () => this.removeUser(user.id),
                      },
                      m('i.fas.fa-times')
                    ),
                  ])
                )
              )
            : m('.AudexAdmin-empty.AudexAdmin-usersEmpty', app.translator.trans(PREFIX + 'users_empty')),
        ]),
      ]),
    ]);
  }

  availableGroups() {
    return app.store.all('groups').filter((group) => group.id() !== GUEST_GROUP_ID);
  }

  openModal(index) {
    app.modal.show(ScriptModal, {
      script: index === null ? null : this.scripts[index],
      onsave: (data) => {
        if (index === null) {
          this.scripts.push(data);
        } else {
          Object.assign(this.scripts[index], data);
        }
        return this.save();
      },
    });
  }

  updateScript(index, patch) {
    Object.assign(this.scripts[index], patch);
    this.save();
  }

  moveScript(index, direction) {
    const target = index + direction;

    if (target < 0 || target >= this.scripts.length) {
      return;
    }

    const script = this.scripts.splice(index, 1)[0];
    this.scripts.splice(target, 0, script);

    this.save();
  }

  confirmDelete(index) {
    const script = this.scripts[index];

    app.modal.show(ConfirmModal, {
      title: app.translator.trans(PREFIX + 'delete_button'),
      message: app.translator.trans(PREFIX + 'confirm_delete', { name: script.name || '#' + (index + 1) }),
      onconfirm: () => {
        this.scripts.splice(index, 1);
        return this.save();
      },
    });
  }

  toggleGroup(groupId, checked) {
    if (checked) {
      if (this.excludedGroups.indexOf(groupId) === -1) {
        this.excludedGroups.push(groupId);
      }
    } else {
      this.excludedGroups = this.excludedGroups.filter((id) => id !== groupId);
    }

    this.save();
  }

  openUsersModal() {
    app.modal.show(UserSelectionModal, {
      title: app.translator.trans(PREFIX + 'users_add_button'),
      selected: [],
      onsubmit: (users) => {
        users.forEach((user) => {
          const id = user.id();
          if (!id) return;

          if (!this.excludedUsers.some((existing) => String(existing.id) === String(id))) {
            this.excludedUsers.push({ id: parseInt(id, 10), name: user.displayName() });
          }
        });

        this.save();
      },
    });
  }

  removeUser(id) {
    this.excludedUsers = this.excludedUsers.filter((user) => String(user.id) !== String(id));

    this.save();
  }

  save() {
    if (this.saving) {
      return Promise.resolve();
    }

    this.saving = true;
    m.redraw();

    return saveSettings({
      [SETTING_SCRIPTS]: JSON.stringify(this.scripts),
      [SETTING_EXCLUDED_USERS]: JSON.stringify(this.excludedUsers),
      [SETTING_EXCLUDED_GROUPS]: JSON.stringify(this.excludedGroups),
    })
      .then(() => {
        this.saving = false;
        app.alerts.show({ type: 'success' }, app.translator.trans(PREFIX + 'saved'));
        m.redraw();
      })
      .catch((error) => {
        this.saving = false;

        const errors = (error && error.response && error.response.errors) || [];
        const detail = errors.length ? errors[0].detail || errors[0].source?.pointer : null;

        app.alerts.show(
          { type: 'error' },
          detail || app.translator.trans(PREFIX + 'request_error')
        );

        m.redraw();
      });
  }
}
