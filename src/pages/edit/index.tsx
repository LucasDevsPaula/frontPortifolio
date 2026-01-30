import React, { useState, useEffect, useRef } from "react";
import {
  Label,
  TextInput,
  Textarea,
  Button,
  Card,
  HelperText, // Importante estar importado
  Modal,
} from "flowbite-react";
import { ArrowLeft, Save, AlertCircle, Trash2, X, Upload } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import api from "../../server/api";
import { DeleteProjectModal } from "../../components/delete/DeletarProjeto";

const editarProjetoSchema = z.object({
  nome: z.string().min(1, "O nome do projeto é obrigatório"),
  categoria: z.string().min(1, "A categoria é obrigatória"),
  descricao: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres"),
  cliente: z.string().optional(),
  prazo: z.string().optional(),
});

type EditarProjetoForm = z.infer<typeof editarProjetoSchema>;

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [dadosParaSalvar, setDadosParaSalvar] =
    useState<EditarProjetoForm | null>(null);
  const [novasImagens, setNovasImagens] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<
    { url: string; id?: string; isNew: boolean; name?: string }[]
  >([]);
  const [imagensParaRemover, setImagensParaRemover] = useState<string[]>([]);

  const galeriaInputRef = useRef<HTMLInputElement>(null);

  // --- TEMAS VISUAIS ---
  const customCardTheme = {
    root: {
      base: "flex rounded-2xl shadow-xl border-0",
      children:
        "flex h-full flex-col gap-4 p-0 border-none bg-secundary shadow-xl rounded-2xl",
    },
  };

  const customModalTheme = {
    root: { base: "fixed inset-0 z-50 overflow-y-auto overflow-x-hidden" },
    content: {
      base: "relative rounded-2xl bg-transparent",
    },
  };

  const customLabelTheme = {
    root: {
      base: "font-bold",
      colors: { arquitetura: "text-detalhes" },
    },
  };

  const customInputTheme = {
    field: {
      input: {
        colors: {
          arquitetura:
            "bg-inputs border-detalhes text-primary focus:border-detalhes focus:ring-detalhes placeholder-detalhes/70",
        },
      },
    },
  };

  const customTextareaTheme = {
    colors: {
      arquitetura:
        "bg-inputs border-detalhes text-primary focus:border-detalhes focus:ring-detalhes placeholder-detalhes/70",
    },
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditarProjetoForm>({
    resolver: zodResolver(editarProjetoSchema),
  });

  useEffect(() => {
    async function loadProject() {
      try {
        const response = await api.get(`/project/${id}`);
        const dados = response.data;

        reset({
          nome: dados.titulo,
          categoria: dados.categoria,
          descricao: dados.descricao,
          cliente: dados.cliente || "",
          prazo: dados.prazo
            ? new Date(dados.prazo).toISOString().split("T")[0]
            : "",
        });

        if (dados.ImagemProjeto && Array.isArray(dados.ImagemProjeto)) {
          const imagensDoBanco = dados.ImagemProjeto.map((img: any) => ({
            url: `http://localhost:3333/files/${img.url}`,
            id: img.id,
            isNew: false,
            name: img.url.split("/").pop(),
          }));
          setPreviewUrls(imagensDoBanco);
        }
      } catch (error) {
        toast.error("Erro ao carregar projeto.");
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadProject();
  }, [id, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (previewUrls.length + filesArray.length > 10) {
        toast.error("Máximo de 10 arquivos permitidos.");
        return;
      }
      setNovasImagens((prev) => [...prev, ...filesArray]);
      const novosPreviews = filesArray.map((file) => ({
        url: URL.createObjectURL(file),
        isNew: true,
        name: file.name,
      }));
      setPreviewUrls((prev) => [...prev, ...novosPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const img = previewUrls[index];
    if (img.isNew) {
      let countNewBefore = 0;
      for (let i = 0; i < index; i++)
        if (previewUrls[i].isNew) countNewBefore++;
      setNovasImagens((prev) => prev.filter((_, i) => i !== countNewBefore));
    } else {
      if (img.id) setImagensParaRemover((prev) => [...prev, img.id!]);
    }
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data: EditarProjetoForm) => {
    setDadosParaSalvar(data);
    setOpenSaveModal(true);
  };

  const onInvalid = () => toast.error("Verifique os campos obrigatórios.");

  const confirmSave = async () => {
    if (!dadosParaSalvar) return;
    setIsSaving(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("titulo", dadosParaSalvar.nome);
      dataToSend.append("categoria", dadosParaSalvar.categoria);
      dataToSend.append("descricao", dadosParaSalvar.descricao);
      if (dadosParaSalvar.cliente)
        dataToSend.append("cliente", dadosParaSalvar.cliente);
      if (dadosParaSalvar.prazo)
        dataToSend.append("prazo", dadosParaSalvar.prazo);

      novasImagens.forEach((file) => dataToSend.append("imagens", file));

      if (imagensParaRemover.length > 0) {
        dataToSend.append(
          "imagensRemoveIds",
          JSON.stringify(imagensParaRemover),
        );
      }

      await api.put(`/project/${id}`, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOpenSaveModal(false);
      toast.success("Projeto salvo com sucesso!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      toast.error("Erro ao salvar.");
      setOpenSaveModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-5xl">
        <div className="flex items-center gap-4 mb-6 mt-4">
          <Link
            to="/dashboard"
            className="bg-secundary p-2 rounded-full hover:bg-inputs transition-all"
          >
            <ArrowLeft size={20} className="text-zinc-900" />
          </Link>
          <h1 className="text-2xl font-bold">Voltar para Dashboard</h1>
        </div>

        {isLoading ? (
          <Skeleton height={500} />
        ) : (
          <Card theme={customCardTheme}>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-detalhes mb-6">
                Editar Projeto
              </h2>

              <form
                onSubmit={handleSubmit(handleFormSubmit, onInvalid)}
                className="flex flex-col gap-6"
              >
                {/* LINHA 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-1 block">
                      <Label
                        htmlFor="nome"
                        theme={customLabelTheme}
                        color="arquitetura"
                      >
                        Nome do Projeto
                      </Label>
                    </div>
                    <TextInput
                      id="nome"
                      theme={customInputTheme}
                      color="arquitetura"
                      {...register("nome")}
                    />
                    {/* CORREÇÃO: HelperText fora do componente */}
                    {errors.nome && (
                      <HelperText className="mt-1" color="failure">
                        {errors.nome.message}
                      </HelperText>
                    )}
                  </div>
                  <div>
                    <div className="mb-1 block">
                      <Label
                        htmlFor="categoria"
                        theme={customLabelTheme}
                        color="arquitetura"
                      >
                        Categoria
                      </Label>
                    </div>
                    <TextInput
                      id="categoria"
                      theme={customInputTheme}
                      color="arquitetura"
                      {...register("categoria")}
                      placeholder="Ex: Residencial, Render"
                    />
                    {errors.categoria && (
                      <HelperText className="mt-1" color="failure">
                        {errors.categoria.message}
                      </HelperText>
                    )}
                  </div>
                </div>

                {/* LINHA 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-1 block">
                      <Label
                        htmlFor="cliente"
                        theme={customLabelTheme}
                        color="arquitetura"
                      >
                        Cliente
                      </Label>
                    </div>
                    <TextInput
                      id="cliente"
                      theme={customInputTheme}
                      color="arquitetura"
                      {...register("cliente")}
                    />
                  </div>
                  <div>
                    <div className="mb-1 block">
                      <Label
                        htmlFor="prazo"
                        theme={customLabelTheme}
                        color="arquitetura"
                      >
                        Previsão de Entrega
                      </Label>
                    </div>
                    <TextInput
                      type="date"
                      id="prazo"
                      theme={customInputTheme}
                      color="arquitetura"
                      {...register("prazo")}
                    />
                  </div>
                </div>

                {/* DESCRIÇÃO */}
                <div>
                  <div className="mb-1 block">
                    <Label
                      htmlFor="descricao"
                      theme={customLabelTheme}
                      color="arquitetura"
                    >
                      Descrição
                    </Label>
                  </div>
                  <Textarea
                    id="descricao"
                    rows={5}
                    theme={customTextareaTheme}
                    color="arquitetura"
                    {...register("descricao")}
                  />
                  {errors.descricao && (
                    <HelperText className="mt-1" color="failure">
                      {errors.descricao.message}
                    </HelperText>
                  )}
                </div>

                {/* GALERIA */}
                <div className="border-t border-detalhes/20 pt-4">
                  <Label
                    className="font-bold text-detalhes mb-4 block"
                    theme={customLabelTheme}
                    color="arquitetura"
                  >
                    Galeria de Imagens (Máx 10)
                  </Label>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewUrls.length < 10 && (
                      <div
                        className="flex flex-col items-center justify-center h-32 w-full border-2 border-dashed border-detalhes/40 rounded-xl cursor-pointer bg-inputs/30 hover:bg-inputs transition-colors"
                        onClick={() => galeriaInputRef.current?.click()}
                      >
                        <Upload className="w-8 h-8 text-detalhes mb-2" />
                        <p className="text-xs text-detalhes font-bold">
                          Adicionar
                        </p>
                        <input
                          ref={galeriaInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                        />
                      </div>
                    )}

                    {previewUrls.map((item, index) => {
                      return (
                        <div
                          key={index}
                          className="relative h-32 w-full border border-detalhes/20 rounded-xl overflow-hidden group bg-inputs flex items-center justify-center hover:shadow-md"
                        >
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center w-full h-full text-center p-2 text-decoration-none"
                          >
                            <img
                              src={item.url}
                              alt="Preview"
                              className="w-full h-full rounded-xl object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </a>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              removeImage(index);
                            }}
                            className="absolute top-1 right-1 bg-detalhes hover:bg-[#805C48] text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                          {item.isNew && (
                            <span className="absolute bottom-1 right-1 bg-buttons text-white text-[10px] px-1 rounded shadow-sm pointer-events-none">
                              Novo
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BOTÕES */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-6 border-t border-detalhes/20 items-center justify-between">
                  <Button
                    color="failure"
                    className="bg-detalhes hover:bg-[#805C48] text-white transition-all cursor-pointer w-full sm:w-auto"
                    onClick={() => setOpenDeleteModal(true)}
                  >
                    <Trash2 size={18} className="mr-2" /> Excluir
                  </Button>

                  <div className="flex gap-3 w-full sm:w-auto justify-end">
                    <Button
                      className="bg-transparent border border-detalhes text-detalhes hover:bg-detalhes/10 transition-all cursor-pointer"
                      onClick={() => window.history.back()}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-buttons hover:bg-buttonsHover transition-all cursor-pointer text-white border-0"
                      disabled={isSaving}
                    >
                      <Save size={18} className="mr-2" />{" "}
                      {isSaving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        )}
      </div>

      <Modal
        show={openSaveModal}
        size="md"
        theme={customModalTheme}
        onClose={() => setOpenSaveModal(false)}
        popup
      >
        <div className="relative bg-secundary rounded-lg shadow p-6">
          <button
            type="button"
            onClick={() => setOpenSaveModal(false)}
            className="absolute top-3 right-2.5 text-detalhes bg-transparent hover:bg-detalhes/30 hover:text-detalhes/40 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <X size={20} />
          </button>
          <div className="p-6 text-center">
            <AlertCircle className="mx-auto mb-4 h-14 w-14 text-detalhes bg-inputs rounded-full p-2" />
            <h3 className="mb-5 text-lg font-bold text-detalhes">
              Salvar alterações em <b>{dadosParaSalvar?.nome}</b>?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                className="bg-buttons hover:bg-buttonsHover text-white"
                onClick={confirmSave}
              >
                Sim, salvar
              </Button>
              <Button
                className="bg-transparent border border-detalhes text-detalhes hover:bg-detalhes/10"
                onClick={() => setOpenSaveModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <DeleteProjectModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onSuccess={() => navigate("/dashboard")}
        projectId={id}
        projectName={dadosParaSalvar?.nome || ""}
      />
    </div>
  );
}
