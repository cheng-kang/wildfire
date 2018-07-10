import Modal from './confirm';

let modalInstance;

function getModalInstance(render = undefined) {
  modalInstance = modalInstance || Modal.newInstance({
    closable: false,
    maskClosable: false,
    footerHide: true,
    render,
  });

  return modalInstance;
}

function confirm(options) {
  const render = ('render' in options) ? options.render : undefined;
  const instance = getModalInstance(render);

  options.onRemove = () => {
    modalInstance = null;
  };

  instance.show(options);
}

Modal.info = (props = {}) => {
  props.icon = 'info';
  props.showCancel = false;
  return confirm(props);
};

Modal.success = (props = {}) => {
  props.icon = 'success';
  props.showCancel = false;
  return confirm(props);
};

Modal.warning = (props = {}) => {
  props.icon = 'warning';
  props.showCancel = false;
  return confirm(props);
};

Modal.error = (props = {}) => {
  props.icon = 'error';
  props.showCancel = false;
  return confirm(props);
};

Modal.confirm = (props = {}) => {
  props.icon = 'confirm';
  props.showCancel = true;
  return confirm(props);
};

/* eslint-disable-next-line consistent-return */
Modal.remove = () => {
  // at loading status, remove after Cancel
  if (!modalInstance) {
    return false;
  }

  const instance = getModalInstance();

  instance.remove();
};

export default Modal;
