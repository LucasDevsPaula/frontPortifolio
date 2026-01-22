import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, Trash2, X, ArrowLeft } from "lucide-react";
import { Button } from "flowbite-react";
import toast from "react-hot-toast";

import api from "../../../server/api";
import { Container } from "../../../components/container";
import { Input } from "../../../components/input";
import { TextArea } from "../../../components/textArea";

const schema = z.object({
  titulo: z.string().nonempty("O título é obrigatório"),
  descricao: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres"),
  categoria: z.string().nonempty("A categoria é obrigatória"),
  cliente: z.string().optional(),
  prazo: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function New() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [galeriaFiles, setGaleriaFiles] = useState<File[]>([]);
  const [galeriaPreviews, setGaleriaPreviews] = useState<string[]>([]);
  const capaInputRef = useRef<HTMLInputElement>(null);
  const galeriaInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        console.log("Imagem excede 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  }

  const MAX_IMAGES = 10;

  function handleGaleriaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const maxSize = 5 * 1024 * 1024;

    const validFiles = files.filter((f) => f.size <= maxSize);
    if (validFiles.length !== files.length) {
      alert("Imagens forma ignoradas, > 5MB");
    }

    const verQntdDeSlot = MAX_IMAGES - galeriaFiles.length;
    if (verQntdDeSlot <= 0) {
      alert("Você já atingiu o limite de 10 imagens.");
      e.target.value = "";
      return;
    }

    const toAdd = validFiles.slice(0, verQntdDeSlot);

    const readers = toAdd.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then((dataUrls) => {
        setGaleriaFiles((prev) => [...prev, ...toAdd]);
        setGaleriaPreviews((prev) => [...prev, ...dataUrls]);
        e.target.value = "";
        const skipped = validFiles.length - toAdd.length;
        if (skipped > 0)
          alert(
            `Limite de ${MAX_IMAGES} imagens. ${skipped} não foram adicionadas.`
          );
      })
      .catch(() => {
        alert("Falha ao ler imagens.");
      });
  }

  function removerCapa() {
    setImageFile(null);
    setImagePreview(null);
  }

  function removerItemGaleria(index: number) {
    setGaleriaFiles((prev) => prev.filter((_, i) => i !== index));
    setGaleriaPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data: FormData) {
    console.log("Dados: ", data);
    console.log("Imagem da capa: ", imageFile);
    console.log("Imagens da galeria: ", galeriaFiles);
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("titulo", data.titulo);
      formData.append("descricao", data.descricao);
      formData.append("categoria", data.categoria);

      if (data.cliente) formData.append("cliente", data.cliente);
      if (data.prazo) formData.append("prazo", data.prazo);
      if (imageFile) formData.append("capa", imageFile);

      galeriaFiles.forEach((file) => formData.append("imagens", file));

      const token = localStorage.getItem("token");

      console.log("=== DADOS ENVIADOS ===");
      console.log("Token:", token ? "Presente" : "Ausente");
      console.log("Título:", data.titulo);
      console.log("Descrição:", data.descricao);
      console.log("Categoria:", data.categoria);
      console.log("Capa presente:", !!imageFile);
      console.log("Qtd imagens galeria:", galeriaFiles.length);

      const create = await api.post("/project", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Projeto cadastrado com sucesso!");
      navigate("/dashboard");
      console.log(`Projeto: ${create.data}`);
    } catch (err: any) {
      console.error("=== ERRO DETALHADO ===");
      console.error("Status:", err.response?.status);
      console.error(
        "Data completo:",
        JSON.stringify(err.response?.data, null, 2)
      );
      console.error("Headers:", err.response?.headers);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        "Erro ao cadastrar projeto.";

      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : JSON.stringify(errorMessage)
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container>
      <div className="flex items-center gap-4 mb-6 mt-4">
        <Link
          to="/dashboard"
          className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition"
        >
          <ArrowLeft size={20} className="text-zinc-900" />
        </Link>
        <h1 className="text-2xl font-bold">Novo projeto</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="pb-10">
        <div className="w-full mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div
              className="w-full h-40 rounded-lg border-2 border-dashed border-zinc-400 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden"
              onClick={() => capaInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Capa"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-1 cursor-pointer hover:bg-red-600 hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      removerCapa();
                    }}
                  >
                    <Trash2 size={16} color="#fff" />
                  </div>
                </>
              ) : (
                <>
                  <Upload className="mb-2 text-zinc-500" size={32} />
                  <span className="text-zinc-500 text-sm font-medium">
                    Imagem de Capa
                  </span>
                </>
              )}
              <input
                type="file"
                ref={capaInputRef}
                name="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <div
              className="w-full h-40 rounded-lg border-2 border-dashed border-zinc-400 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => galeriaInputRef.current?.click()}
            >
              <Upload className="mb-2 text-zinc-500" size={32} />
              <span className="text-zinc-500 text-sm font-medium">
                Adicionar imagens á galeria
              </span>
              <input
                type="file"
                ref={galeriaInputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGaleriaChange}
              />
            </div>
          </div>
        </div>

        {/* PREVIEWS */}
        {galeriaPreviews.length > 0 && (
          <div className="mb-6 p-2 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto flex gap-4">
            {galeriaPreviews.map((item, index) => {
              return (
                <div
                  key={index}
                  className="relative w-24 h-24 shrink-0 border rounded-lg bg-white flex items-center justify-center overflow-hidden group"
                >
                  <img
                    src={item}
                    alt={`Imagem ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover rounded-md border"
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removerItemGaleria(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 hover:scale-105 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mb-3">
          <Input
            type="text"
            name="titulo"
            placeholder="Título do Projeto"
            register={register}
            error={errors.titulo?.message}
          />
        </div>

        <div className="mb-3">
          <TextArea
            name="descricao"
            placeholder="Descreva o escopo e detalhes do projeto..."
            register={register}
            error={errors.descricao?.message}
          />
        </div>

        <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="categoria"
            placeholder="Categoria (ex: Residencial, Comercial)"
            register={register}
            type="text"
            error={errors.categoria?.message}
          />

          <Input
            name="cliente"
            placeholder="Nome do Cliente"
            register={register}
            type="text"
            error={errors.cliente?.message}
          />
        </div>

        <div className="mb-6">
          <Input
            name="prazo"
            placeholder="Data de Entrega"
            type="date"
            register={register}
            error={errors.prazo?.message}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#588157]! enabled:hover:bg-buttons! border-none cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Cadastrando..." : "Cadastrar Projeto"}
        </Button>
      </form>
    </Container>
  );
}
