import 'iview/dist/styles/iview.css'
import Dropdown from 'iview/src/components/dropdown'
import Menu from 'iview/src/components/menu'
import Button from 'iview/src/components/button'
import Input from 'iview/src/components/input'
import Icon from 'iview/src/components/icon'
import Form from 'iview/src/components/form'
import Spin from 'iview/src/components/spin'
import Message from 'iview/src/components/message'
import Tooltip from 'iview/src/components/tooltip'
import Poptip from 'iview/src/components/poptip'
import locale from 'iview/src/locale'

const iview = {
  Dropdown,
  DropdownItem: Dropdown.Item,
  DropdownMenu: Dropdown.Menu,
  Menu,
  MenuItem: Menu.Item,
  Form,
  FormItem: Form.Item,
  Button,
  Input,
  Icon,
  Spin,
  Tooltip,
  Poptip
}

const install = function (Vue, opts = {}) {
  locale.use(opts.locale)
  locale.i18n(opts.i18n)

  Object.keys(iview).forEach((key) => {
    Vue.component(key, iview[key])
  })

  // Vue.prototype.$Loading = LoadingBar
  Vue.prototype.$Message = Message
  // Vue.prototype.$Modal = Modal
  // Vue.prototype.$Notice = Notice
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export var iView = Object.assign(iview, {install})
