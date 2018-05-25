import React from 'react';
import PropTypes from 'prop-types';
import i18n from './i18n';
import styles from './styles.scss';
import Modal from '../Modal';
import Button from '../Button';
import CloseIcon from '../../assets/images/CloseIcon.svg';

export function ConfirmDeleteModal({
  currentLocale,
  show,
  onDelete,
  onCancel,
}) {
  return (
    <Modal
      show={show}
      currentLocale={currentLocale}
      onConfirm={onDelete}
      onCancel={onCancel}
      className={styles.confirmDeleteModal}
      modalClassName={styles.confirmDeleteModal}
      cancelBtnClassName={styles.cancelBtn}
      confirmBtnClassName={styles.confirmBtn}
      title={i18n.getString('confirmation', currentLocale)}
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
ConfirmDeleteModal.propTypes = {
  currentLocale: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onDelete: PropTypes.func,
  onCancel: PropTypes.func,
};

ConfirmDeleteModal.defaultProps = {
  onDelete() {},
  onCancel() {}
};
