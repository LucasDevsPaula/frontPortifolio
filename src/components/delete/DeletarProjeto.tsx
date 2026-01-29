import { useState } from "react";
import { Modal, Button } from "flowbite-react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../server/api";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string | undefined;
  projectName: string;
}

export const DeleteProjectModal = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  projectName,
}: DeleteProjectModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!projectId) return;

    setIsDeleting(true);
    try {
      await api.delete(`/project/${projectId}`);

      toast.success("Projeto excluído permanentemente.", {
        style: { background: "#EF4444", color: "#fff" },
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir projeto.");
    } finally {
      setIsDeleting(false);
    }
  };

  const customModalTheme = {
    root: { base: "fixed inset-0 z-50 overflow-y-auto overflow-x-hidden" },
    content: {
      base: `bg-transparent`,
    },
  };

  const customButtonTheme = {
    color: {
      delete:
        "text-white bg-detalhes hover:bg-[#805C48] transition-all cursor-pointer",
      arquitetura:
        "text-white bg-buttons hover:bg-buttonsHover transition-all cursor-pointer",
    },
  };

  return (
    <Modal
      theme={customModalTheme}
      show={isOpen}
      size="md"
      onClose={onClose}
      popup
    >
      <div className="p-6 text-center rounded-2xl bg-secundary">
        <Trash2 className="mx-auto mb-4 h-14 w-14 text-detalhes bg-inputs rounded-full p-2" />

        <h3 className="mb-2 text-lg font-bold text-detalhes">
          Tem certeza absoluta?
        </h3>
        <p className="mb-5 text-sm text-detalhes">
          Você está prestes a excluir o projeto <b>{projectName}</b>. <br />
          Essa ação não pode ser desfeita.
        </p>

        <div className="flex justify-center gap-4">
          <Button theme={customButtonTheme} color="delete" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Excluindo..." : "Sim, excluir projeto"}
          </Button>

          <Button theme={customButtonTheme} color="arquitetura" onClick={onClose} disabled={isDeleting}>
            Não, manter
          </Button>
        </div>
      </div>
    </Modal>
  );
};
