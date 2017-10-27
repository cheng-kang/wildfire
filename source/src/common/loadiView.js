/*
 * Copied from iview/src/index.js
 * For load iView components on demand
 */

import 'core-js/fn/array/find'
import 'core-js/fn/array/find-index'

import locale from 'iview/src/locale'
import 'iview/dist/styles/iview.css'

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

// import Affix from 'iview/src/components/affix'
// import Alert from 'iview/src/components/alert'
import AutoComplete from 'iview/src/components/auto-complete'
import Avatar from 'iview/src/components/avatar'
// import BackTop from 'iview/src/components/back-top'
// import Badge from 'iview/src/components/badge'
// import Breadcrumb from 'iview/src/components/breadcrumb'
import Button from 'iview/src/components/button'
import Card from 'iview/src/components/card'
// import Carousel from 'iview/src/components/carousel'
// import Cascader from 'iview/src/components/cascader'
// import Checkbox from 'iview/src/components/checkbox'
// import Circle from 'iview/src/components/circle'
// import Collapse from 'iview/src/components/collapse'
// import ColorPicker from 'iview/src/components/color-picker'
// import DatePicker from 'iview/src/components/date-picker'
import Dropdown from 'iview/src/components/dropdown'
import Form from 'iview/src/components/form'
import Icon from 'iview/src/components/icon'
import Input from 'iview/src/components/input'
// import InputNumber from 'iview/src/components/input-number'
// import LoadingBar from 'iview/src/components/loading-bar'
import Menu from 'iview/src/components/menu'
import Message from 'iview/src/components/message'
import Modal from 'iview/src/components/modal'
// import Notice from 'iview/src/components/notice'
import Page from 'iview/src/components/page'
import Poptip from 'iview/src/components/poptip'
// import Progress from 'iview/src/components/progress'
// import Radio from 'iview/src/components/radio'
// import Rate from 'iview/src/components/rate'
// import Slider from 'iview/src/components/slider'
import Spin from 'iview/src/components/spin'
// import Steps from 'iview/src/components/steps'
import Switch from 'iview/src/components/switch'
import Table from 'iview/src/components/table'
import Tabs from 'iview/src/components/tabs'
// import Tag from 'iview/src/components/tag'
// import Timeline from 'iview/src/components/timeline'
// import TimePicker from 'iview/src/components/time-picker'
// import Tooltip from 'iview/src/components/tooltip'
// import Transfer from 'iview/src/components/transfer'
// import Tree from 'iview/src/components/tree'
// import Upload from 'iview/src/components/upload'
import { Row, Col } from 'iview/src/components/grid'
import {
  Select,
  // OptionGroup,
  Option
} from 'iview/src/components/select'

const iview = {
  // Affix,
  // Alert,
  AutoComplete,
  iAutoComplete: AutoComplete,
  Avatar,
  iAvatar: Avatar,
  // BackTop,
  // Badge,
  // Breadcrumb,
  // BreadcrumbItem: Breadcrumb.Item,
  Button,
  iButton: Button,
  // ButtonGroup: Button.Group,
  Card,
  iCard: Card,
  // Carousel,
  // CarouselItem: Carousel.Item,
  // Cascader,
  // Checkbox,
  // CheckboxGroup: Checkbox.Group,
  // iCircle: Circle,
  Col,
  iCol: Col,
  // Collapse,
  // ColorPicker,
  // DatePicker,
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
  // InputNumber,
  // LoadingBar,
  Menu,
  iMenu: Menu,
  MenuGroup: Menu.Group,
  MenuItem: Menu.Item,
  iMenuItem: Menu.Item,
  Submenu: Menu.Sub,
  Message,
  Modal,
  iModal: Modal,
  // Notice,
  Option,
  iOption: Option,
  // OptionGroup,
  Page,
  iPage: Page,
  // Panel: Collapse.Panel,
  Poptip,
  iPoptip: Poptip,
  // Progress,
  // iProgress: Progress,
  // Radio,
  // RadioGroup: Radio.Group,
  // Rate,
  Row,
  Select,
  iSelect: Select,
  // Slider,
  Spin,
  iSpin: Spin,
  // Step: Steps.Step,
  // Steps,
  // Switch,
  iSwitch: Switch,
  iTable: Table,
  Table,
  Tabs: Tabs,
  TabPane: Tabs.Pane,
  iTabs: Tabs,
  iTabPane: Tabs.Pane
  // Tag,
  // Timeline,
  // TimelineItem: Timeline.Item,
  // TimePicker,
  // Tooltip
  // Transfer,
  // Tree,
  // Upload
}

const install = function (Vue, opts = {}) {
  locale.use(opts.locale)
  locale.i18n(opts.i18n)

  Object.keys(iview).forEach((key) => {
    Vue.component(key, iview[key])
  })

  // Vue.prototype.$Loading = LoadingBar
  Vue.prototype.$Message = Message
  Vue.prototype.$Modal = Modal
  // Vue.prototype.$Notice = Notice
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default Object.assign(iview, {install})
