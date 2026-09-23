import app from 'flarum/admin/app';
import registerWidget from '../common/registerWidget';

export { default as extend } from './extend';

app.initializers.add('stezkoy-audex', () => {
  // Register the widget here as well, so it appears in the fof Forum Widgets
  // editor: the editor palette reads widgets registered in the admin bundle.
  registerWidget(app);
});
