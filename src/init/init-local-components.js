import WfAddedPluginOptionForm from '../components/WfAddedPluginOptionForm';
import WfAdminHelpers from '../components/WfAdminHelpers';
import WfAuthForm from '../components/WfAuthForm';
import WfCommentCard from '../components/WfCommentCard';
import WfMarkedContent from '../components/WfMarkedContent';
import WfPersonalCenter from '../components/WfPersonalCenter';
import WfReplyArea from '../components/WfReplyArea';
import WfReportManagement from '../components/WfReportManagement';
import WfSeparator from '../components/WfSeparator';
import WfFootnote from '../components/WfFootnote';
import WfUserInfoModal from '../components/WfUserInfoModal';
import WfUserSetting from '../components/WfUserSetting';
import WfPluginCenter from '../components/WfPluginCenter';

const localComponents = {
  WfAddedPluginOptionForm,
  WfAdminHelpers,
  WfAuthForm,
  WfCommentCard,
  WfMarkedContent,
  WfPersonalCenter,
  WfReplyArea,
  WfReportManagement,
  WfSeparator,
  WfFootnote,
  WfUserInfoModal,
  WfUserSetting,
  WfPluginCenter,
};

export default (_Vue) => {
  Object.keys(localComponents).forEach(key => {
    _Vue.component(key, localComponents[key]);
  });
};
