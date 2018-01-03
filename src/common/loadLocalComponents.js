import WfAdminHelpers from '../components/WfAdminHelpers'
import WfAuthForm from '../components/WfAuthForm'
import WfCommentCard from '../components/WfCommentCard'
import WfMarkedContent from '../components/WfMarkedContent'
import WfPersonalCenter from '../components/WfPersonalCenter'
import WfReplyArea from '../components/WfReplyArea'
import WfReportManagement from '../components/WfReportManagement'
import WfTip from '../components/WfTip'
import WfUserInfoModal from '../components/WfUserInfoModal'
import WfUserSetting from '../components/WfUserSetting'

const localComponents = {
  WfAdminHelpers,
  WfAuthForm,
  WfCommentCard,
  WfMarkedContent,
  WfPersonalCenter,
  WfReplyArea,
  WfReportManagement,
  WfTip,
  WfUserInfoModal,
  WfUserSetting
}

export const initLocalComponents = (_Vue) => {
  Object.keys(localComponents).forEach(key => {
    _Vue.component(key, localComponents[key])
  })
}
