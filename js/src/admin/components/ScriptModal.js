import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';
import Switch from 'flarum/common/components/Switch';
import extractText from 'flarum/common/utils/extractText';

const PREFIX = 'stezkoy-audex.admin.';

// Sample snippet shown as the textarea placeholder. Intentionally hardcoded
// (not a translation): the v2 translation parser treats raw tags as markup
// and would choke on the unbalanced/attributed tags in the sample.
const CODE_PLACEHOLDER = '<script async src="https://example.com/ad.js"></script>';

export default class ScriptModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);

    const script = this.attrs.script;

    this.isNew = !script;
    this.name = script ? script.name : '';
    this.position = script ? script.position || 'head' : 'head';
    this.enabled = script ? script.enabled === true : true;
    this.code = script ? script.code : '';
    this.loading = false;
  }

  className() {
    return 'AudexScriptModal Modal--large';
  }

  title() {
    return app.translator.trans(PREFIX + (this.isNew ? 'modal_title_create' : 'modal_title_edit'));
  }

  content() {
    return m('div.Modal-body', [
      m(
        'form.AudexScriptForm',
        {
          onsubmit: this.onsubmit.bind(this),
        },
        [
          m('.Form-group', [
            m('label', app.translator.trans(PREFIX + 'name_label')),
            m('input.FormControl', {
              type: 'text',
              placeholder: extractText(app.translator.trans(PREFIX + 'name_placeholder')),
              value: this.name,
              oninput: (e) => (this.name = e.target.value),
            }),
            m('p.helpText', app.translator.trans(PREFIX + 'name_help')),
          ]),

          m('.Form-group', [
            m('label', app.translator.trans(PREFIX + 'position_label')),
            Select.component({
              value: this.position,
              options: {
                head: extractText(app.translator.trans(PREFIX + 'position_head')),
                foot: extractText(app.translator.trans(PREFIX + 'position_foot')),
              },
              onchange: (value) => (this.position = value),
            }),
            m('p.helpText', app.translator.trans(PREFIX + 'position_help')),
          ]),

          m('.Form-group', [
            m(Switch, { state: this.enabled, onchange: (value) => (this.enabled = value) }, [
              m('strong', app.translator.trans(PREFIX + 'enabled_switch')),
              m('div.helpText', app.translator.trans(PREFIX + 'enabled_switch_help')),
            ]),
          ]),

          m('.Form-group', [
            m('label', app.translator.trans(PREFIX + 'code_label')),
            m('textarea.FormControl.AudexScriptForm-code', {
              placeholder: CODE_PLACEHOLDER,
              rows: 10,
              spellcheck: false,
              value: this.code,
              oninput: (e) => (this.code = e.target.value),
            }),
            m('p.helpText', app.translator.trans(PREFIX + 'code_help')),
          ]),

          m('.Form-group.Form-controls', [
            m(
              Button,
              {
                className: 'Button Button--primary',
                type: 'submit',
                loading: this.loading,
                disabled: this.loading,
              },
              app.translator.trans(PREFIX + 'save_button')
            ),
            m(
              Button,
              {
                className: 'Button',
                disabled: this.loading,
                onclick: () => this.hide(),
              },
              app.translator.trans(PREFIX + 'cancel_button')
            ),
          ]),
        ]
      ),
    ]);
  }

  onsubmit(e) {
    e.preventDefault();

    if (this.loading) {
      return;
    }

    this.loading = true;
    m.redraw();

    Promise.resolve(
      this.attrs.onsave({
        name: this.name.trim(),
        position: this.position,
        enabled: this.enabled,
        code: this.code,
      })
    )
      .then(() => {
        this.loading = false;
        m.redraw();
        this.hide();
      })
      .catch(() => {
        this.loading = false;
        m.redraw();
      });
  }
}
