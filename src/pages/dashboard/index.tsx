import { useState, useEffect, useContext, useRef } from "react";
import { Button, Badge, TextInput, Pagination } from "flowbite-react";
import {
  Plus,
  Search,
  Calendar,
  Edit3,
  Trash2,
  ImageIcon,
  Link as LinkIcon,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Container } from "../../components/container";
import api from "../../server/api";
import { DeleteProjectModal } from "../../components/delete/DeletarProjeto";
import { AuthContext } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

interface UsuarioProps {
  id: string;
  nome: string;
}

interface ProjetoProps {
  id: string;
  titulo: string;
  categoria: string;
  createdAt: string;
  imagemCapa: string;
  usuario: UsuarioProps;
}

export default function Dashboard() {
  const [projetos, setProjetos] = useState<ProjetoProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, refreshUser } = useContext(AuthContext);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // --- ESTADOS DA BUSCA ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [projectToDelete, setProjectToDelete] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const avatarUrl = user?.fotoPerfil
    ? user.fotoPerfil.startsWith("http")
      ? user.fotoPerfil
      : `${apiUrl}/files/${user.fotoPerfil}`
    : null;

  const canEditProfilePhoto = !!user && !user.isGoogleUser;

  const handleUpdateProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("fotoPerfil", file);

      const token = localStorage.getItem("token");

      await api.put(
        "/me/photo",
        formData,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );

      toast.success("Foto de perfil atualizada!");
      await refreshUser();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || "Erro ao atualizar foto de perfil";
      toast.error(msg);
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleCopyPortfolioLink = async () => {
    if (!user?.id) return;
    const url = `${window.location.origin}/portfolio/${user.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  const customInputTheme = {
    field: {
      icon: {
        svg: "text-zinc-900",
      },
      input: {
        colors: {
          custom:
            "bg-inputs border-inputs text-primary focus:border-detalhes focus:ring-detalhes placeholder:text-zinc-900 hover:bg-input-hover transition-colors",
        },
      },
    },
  };

  useEffect(() => {
    async function carregarProjetos() {
      try {
        const res = await api.get("/project");
        setProjetos(res.data.projetos);
        console.log(res.data.projetos);
        setLoading(true);
      } catch (err) {
        console.error("Erro ao buscar projetos:", err);
        setProjetos([]);
      } finally {
        setLoading(false);
      }
    }

    carregarProjetos();
  }, []);

  // --- LÓGICA DE FILTRAGEM (AQUI QUE A MÁGICA ACONTECE) ---
  const filteredProjects = projetos.filter((p) => {
    // Garante que o titulo existe, converte tudo pra minúsculo e compara
    const titulo = p.titulo || "";
    return titulo.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // --- PAGINAÇÃO BASEADA NO FILTRO ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  // Quando digita, atualiza o termo e VOLTA PRA PÁGINA 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Finalizado":
        return "success";
      case "Em Obra":
        return "warning";
      case "Cancelado":
        return "failure";
      default:
        return "indigo";
    }
  };

  const renderPreview = (projeto: ProjetoProps) => {
    let fileName = null;

    fileName = projeto.imagemCapa;

    if (fileName && !fileName.includes("placeholder")) {
      const fullUrl = fileName.startsWith("http")
        ? fileName
        : `${apiUrl}/files/${fileName}`;

      return (
        <img
          src={fullUrl}
          alt="Preview"
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
        />
      );
    }
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#dad7cd]/30 text-secundary">
        <ImageIcon size={48} />
      </div>
    );
  };

  return (
    <>
      <div className="w-full max-h-72 bg-inputs flex flex-col justify-center pl-10">
        <Container>
          <div className="mt-9 flex items-center gap-4">
            <div className={canEditProfilePhoto ? "relative group" : "relative"}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`Foto de perfil de ${user?.nome || "usuário"}`}
                  className="h-12 w-12 rounded-full object-cover border border-gray-200 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-secundary border border-gray-200 shadow-sm" />
              )}

              {canEditProfilePhoto && (
                <>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpdateProfilePhoto}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    title="Alterar foto de perfil"
                    className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-hover:bg-black/30 transition-all disabled:opacity-0"
                  >
                    <Upload
                      size={18}
                      className="text-white opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                </>
              )}
            </div>
            <h1 className="text-5xl font-serif">Bem vindo(a), {user?.nome}</h1>
          </div>
          <p className="mt-2 text-xl font-serif">
            Gerencie seu portifólio de projetos
          </p>
        </Container>
      </div>
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center my-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Projetos</h1>
            {/* Mostra quantos achou na busca */}
            <p className="text-gray-500 mt-1">
              {filteredProjects.length}{" "}
              {filteredProjects.length === 1
                ? "projeto encontrado"
                : "projetos encontrados"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard/new">
              <Button className="bg-buttons hover:bg-buttonsHover cursor-pointer transition-all border-none shadow-md font-bold">
                <Plus className="mr-2 h-5 w-5" /> Adicionar projeto
              </Button>
            </Link>

            <Button
              type="button"
              onClick={handleCopyPortfolioLink}
              className="!bg-[#936049] hover:!bg-[#936039] opacity-90 hover:opacity-100 cursor-pointer transition-all border-none shadow-md font-bold"
              title="Copiar link do seu portifólio"
            >
              <LinkIcon className="mr-2 h-5 w-5" /> Copiar link
            </Button>
          </div>
        </div>

        {/* CAMPO DE BUSCA */}
        <div className="mb-8 max-w-md">
          <TextInput
            id="search"
            type="text"
            icon={Search}
            placeholder="Buscar por nome do projeto..."
            value={searchTerm}
            onChange={handleSearchChange}
            theme={customInputTheme}
            color="custom"
            className="shadow-sm"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md h-64">
                <Skeleton width={100} className="mb-4" /> <Skeleton count={3} />
              </div>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentProjects.map((projeto) => (
                <section
                  key={projeto.id}
                  className="w-full bg-secundary rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-40 w-full rounded-md overflow-hidden border border-gray-100 relative mb-4">
                    {renderPreview(projeto)}
                  </div>
                  <div className="flex justify-between items-center mx-4">
                    <h5
                      className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2 line-clamp-1"
                      title={projeto.titulo}
                    >
                      {projeto.titulo}
                    </h5>
                    <Badge
                      color={getStatusColor(projeto.categoria)}
                      className="px-3 py-1"
                    >
                      {projeto.categoria || "Geral"}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1 mt-2 mb-2">
                    <p className="font-normal text-gray-900 flex items-center gap-2 mt-1 ml-4">
                      <Calendar size={18} />
                      {projeto.createdAt
                        ? new Date(projeto.createdAt).toLocaleDateString(
                            "pt-BR",
                          )
                        : "Sem data"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center m-4 gap-2">
                    <button className="w-1/2 min-h-10 border-none flex justify-center shadow-sm bg-buttons text-white rounded-lg cursor-pointer hover:bg-buttonsHover transition-all">
                      <Link
                        to={`/dashboard/edit/${projeto.id}`}
                        className="flex items-center"
                      >
                        <Edit3 size={16} className="mr-2" />
                        Editar
                      </Link>
                    </button>
                    <button
                      className="w-1/2 min-h-10 border flex justify-center items-center gap-1.5 shadow-sm bg-[#936049] text-white rounded-lg cursor-pointer hover:bg-[#936039] transition-all"
                      onClick={() =>
                        setProjectToDelete({
                          id: projeto.id,
                          nome: projeto.titulo,
                        })
                      }
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>
                </section>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex overflow-x-auto sm:justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                  showIcons
                  previousLabel="Anterior"
                  nextLabel="Próxima"
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">
              Nenhum projeto encontrado
            </h3>
            {searchTerm && (
              <p className="text-gray-500 mt-2">
                Não encontramos nada com "{searchTerm}"
              </p>
            )}
          </div>
        )}

        <DeleteProjectModal
          isOpen={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onSuccess={() => {
            setProjetos((old) =>
              old.filter((p) => p.id !== projectToDelete?.id),
            );
            setProjectToDelete(null);
          }}
          projectId={projectToDelete?.id}
          projectName={projectToDelete?.nome || ""}
        />
      </Container>
    </>
  );
}
