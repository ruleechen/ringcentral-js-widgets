import React from 'react';
import PropTypes from 'prop-types';
import i18n from './i18n';
import styles from './styles.scss';
import Modal from '../Modal';
import Button from '../Button';
import CloseIcon from '../../assets/images/CloseIcon.svg';

export default function ConfirmMergeModal({
  currentLocale,
  show,
  onMerge,
  onCancel,
}) {
  return (
    <Modal
      show={show}
      currentLocale={currentLocale}
      onConfirm={onMerge}
      onCancel={onCancel}
      className={styles.confirmMergeModal}
      modalClassName={styles.confirmMergeModal}
      cancelBtnClassName={styles.cancelBtn}
      confirmBtnClassName={styles.confirmBtn}
      // title={i18n.getString('confirmation', currentLocale)}
      closeBtn={
        <Button
          className={styles.closeBtn}
          onClick={onCancel}
        >
          <CloseIcon />
        </Button>
      }
    >
      <div className={styles.contentText}>
        {i18n.getString('confirmMergeToConference', currentLocale)}
      </div>
    </Modal>
  );
}
ConfirmMergeModal.propTypes = {
  currentLocale: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onMerge: PropTypes.func,
  onCancel: PropTypes.func,
};

ConfirmMergeModal.defaultProps = {
  onMerge() {},
  onCancel() {}
};
