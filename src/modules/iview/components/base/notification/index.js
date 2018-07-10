import Vue from 'vue';
import Notification from './notification.vue';

/* eslint-disable no-restricted-globals */

Notification.newInstance = properties => {
  const _props = properties || {};

  const Instance = new Vue({
    data: _props,
    render(h) {
      return h(Notification, {
        props: _props,
      });
    },
  });

  const component = Instance.$mount();
  parent.document.body.appendChild(component.$el);
  const notification = Instance.$children[0];

  return {
    notice(noticeProps) {
      notification.add(noticeProps);
    },
    remove(name) {
      notification.close(name);
    },
    component: notification,
    destroy(element) {
      notification.closeAll();
      setTimeout(() => {
        parent.document.body.removeChild(parent.document.getElementsByClassName(element)[0]);
      }, 500);
    },
  };
};

export default Notification;
