/*
 * Copied from iview/src/index.js
 * For load iView components on demand
 */

import 'core-js/fn/array/find'
import 'core-js/fn/array/find-index'

import locale from 'iview/src/locale'
import 'iview/src/styles/index.less'

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

import AutoComplete from 'iview/src/components/auto-complete'
import Avatar from 'iview/src/components/avatar'
import Button from 'iview/src/components/button'
import Card from 'iview/src/components/card'
import Dropdown from 'iview/src/components/dropdown'
import Form from 'iview/src/components/form'
import Icon from 'iview/src/components/icon'
import Input from 'iview/src/components/input'
import Menu from 'iview/src/components/menu'
import Message from 'iview/src/components/message'
import Modal from 'iview/src/components/modal'
import Page from 'iview/src/components/page'
import Poptip from 'iview/src/components/poptip'
import Spin from 'iview/src/components/spin'
import Table from 'iview/src/components/table'
import Tabs from 'iview/src/components/tabs'
import { Row, Col } from 'iview/src/components/grid'
import {
  Select,
  Option
} from 'iview/src/components/select'

const iview = {
  AutoComplete,
  iAutoComplete: AutoComplete,
  Avatar,
  iAvatar: Avatar,
  Button,
  iButton: Button,
  Card,
  iCard: Card,
  Col,
  iCol: Col,
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
  MenuItem: Menu.Item,
  iMenuItem: Menu.Item,
  Submenu: Menu.Sub,
  Message,
  Modal,
  iModal: Modal,
  Option,
  iOption: Option,
  Page,
  iPage: Page,
  Poptip,
  iPoptip: Poptip,
  Row,
  Select,
  iSelect: Select,
  Spin,
  iSpin: Spin,
  iTable: Table,
  Table,
  Tabs: Tabs,
  TabPane: Tabs.Pane,
  iTabs: Tabs,
  iTabPane: Tabs.Pane
}

const install = function (Vue, opts = {}) {
  locale.use(opts.locale)
  locale.i18n(opts.i18n)

  Object.keys(iview).forEach((key) => {
    Vue.component(key, iview[key])
  })

  Vue.prototype.$Message = Message
  Vue.prototype.$Modal = Modal
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default Object.assign(iview, {install})
