import app from 'flarum/forum/app';
import registerWidget from './registerWidget';

app.initializers.add('stezkoy-audex', () => {
  registerWidget(app);
});
