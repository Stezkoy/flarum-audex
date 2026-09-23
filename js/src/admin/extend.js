import Extend from 'flarum/common/extenders';
import AudexAdminPage from './components/AudexAdminPage';

export default [
  new Extend.Admin().page(AudexAdminPage),
];
