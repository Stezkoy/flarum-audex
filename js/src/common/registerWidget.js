import makeAudexWidget from './components/makeAudexWidget';

/**
 * Registers the Audex widget with fof/forum-widgets-core. Called from both
 * the forum and admin initializers (the editor palette reads widgets
 * registered in the admin bundle).
 *
 * Runtime guard: fof/forum-widgets-core is an optional dependency — when it
 * is not enabled (or its widget manager is not booted yet) this stays silent
 * and the extension keeps working as head/foot only.
 */
export default function registerWidget(app) {
  const Widget = flarum.reg.get('fof-forum-widgets-core', 'common/components/Widget');
  const Widgets = flarum.reg.get('fof-forum-widgets-core', 'common/extend/Widgets');

  if (!Widget || !Widgets || !app.widgets) {
    return;
  }

  new Widgets()
    .add({
      key: 'audex-widget',
      component: makeAudexWidget(Widget),
      // Disabled for excluded users/groups (server-computed flag from the page
      // payload) and when no "widget" blocks are configured at all.
      isDisabled: () =>
        !!app.data['stezkoy-audex.excluded'] || !app.data['stezkoy-audex.widgetBlocks'],
      isUnique: true,
      placement: 'bottom',
      position: 0,
    })
    .extend(app, 'stezkoy-audex');
}
