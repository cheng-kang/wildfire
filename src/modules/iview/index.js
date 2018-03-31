/* eslint import/first: 0 */
/*
 * Copied from iview/src/index.js
 * For loading iView components on demand
 */

import locale from 'iview/src/locale';
import '../../assets/iview.css';

/*
 * Select the components blow you want to use globally in Vue
 *
 * if you want to use a component locally, please copy the
 * import code in your local *.vue file, and add the component
 * into the components object:
 *
 *    import Affix from 'iview/src/components/affix'
 *    export default {
 *      name: 'my-component',
 *      components: { Affix }
 *    }
 */

import Alert from 'iview/src/components/alert';
import AutoComplete from 'iview/src/components/auto-complete';
import Button from 'iview/src/components/button';
import Card from 'iview/src/components/card';
import Collapse from './components/collapse';
import Dropdown from './components/dropdown';
import Form from 'iview/src/components/form';
import Icon from 'iview/src/components/icon';
import Input from 'iview/src/components/input';
import Menu from 'iview/src/components/menu';
import Message from './components/message';
import Modal from './components/modal';
import Page from 'iview/src/components/page';
import Poptip from './components/poptip';
import { Row, Col } from 'iview/src/components/grid';
import Spin from 'iview/src/components/spin';
import iSwitch from './components/switch';
import {
  Select,
  Option,
} from 'iview/src/components/select';
import Tooltip from './components/tooltip';
import Tabs from './components/tabs';

const iview = {
  Alert,
  iAlert: Alert,
  AutoComplete,
  iAutoComplete: AutoComplete,
  Button,
  iButton: Button,
  Card,
  iCard: Card,
  Col,
  iCol: Col,
  Collapse,
  iCollapse: Collapse,
  Panel: Collapse.Panel,
  iPanel: Collapse.Panel,
  Dropdown,
  DropdownItem: Dropdown.Item,
  DropdownMenu: Dropdown.Menu,
  iDropdown: Dropdown,
  iDropdownItem: Dropdown.Item,
  iDropdownMenu: Dropdown.Menu,
  Form,
  iForm: Form,
  FormItem: Form.Item,
  iFormItem: Form.Item,
  Icon,
  iIcon: Icon,
  Input,
  iInput: Input,
  Menu,
  iMenu: Menu,
  MenuGroup: Menu.Group,
  iMenuGroup: Menu.Group,
  MenuItem: Menu.Item,
  iMenuItem: Menu.Item,
  Submenu: Menu.Sub,
  iSubmenu: Menu.Sub,
  Message,
  Option,
  iOption: Option,
  Page,
  iPage: Page,
  Row,
  iRow: Row,
  Select,
  iSelect: Select,
  Spin,
  iSpin: Spin,
  iSwitch,
  TabPane: Tabs.Pane,
  iTabPane: Tabs.Pane,
  Tooltip,
  iTooltip: Tooltip,
};

const _iview = {
  Modal,
  iModal: Modal,
  Poptip,
  iPoptip: Poptip,
  Tabs,
  iTabs: Tabs,
};

const install = (Vue, opts = {}) => {
  locale.use(opts.locale);
  locale.i18n(opts.i18n);

  Object.keys(iview).forEach((key) => {
    if (Vue.options.components[key]) { return; }
    Vue.component(key, iview[key]);
  });

  // Customized iView components
  Object.keys(_iview).forEach((key) => {
    Vue.component(key, _iview[key]);
  });

  Vue.prototype.$Message = Message;
  Vue.prototype.$Modal = Modal;
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default Object.assign(iview, _iview, { install });
