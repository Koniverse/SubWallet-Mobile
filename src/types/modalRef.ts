export interface ModalRef {
  onOpenModal: () => void;
  onCloseModal: () => void;
  isModalOpen: boolean;
  closeModal?: () => void;
}
