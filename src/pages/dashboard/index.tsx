import { useState, useEffect } from "react";
import { Button, Card, Badge, TextInput, Pagination } from "flowbite-react";
import {
  Plus,
  Search,
  Calendar,
  Edit3,
  Trash2,
  FolderOpen,
  ImageIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Container } from "../../components/container";
import api from "../../server/api";
import { DeleteProjectModal } from "../../components/delete/DeletarProjeto";

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

  // --- ESTADOS DA BUSCA ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [projectToDelete, setProjectToDelete] = useState<{
    id: string;
    nome: string;
  } | null>(null);

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
    indexOfLastItem
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
        : `http://localhost:3333/files/${fileName}`;

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
        <Link to="/dashboard/new">
          <Button className="bg-[#588157]! hover:bg-buttons! border-none shadow-md font-bold">
            <Plus className="mr-2 h-5 w-5" /> Adicionar projeto
          </Button>
        </Link>
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
              <Card
                key={projeto.id}
                className="shadow-md hover:shadow-xl transition-all duration-300 border-gray-200 overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <Badge
                    color={getStatusColor(projeto.categoria)}
                    className="px-3 py-1"
                  >
                    {projeto.categoria || "Geral"}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1 mt-2 mb-2">
                  <Link
                    to={`/project/${projeto.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    <div className="h-40 w-full rounded-md overflow-hidden border border-gray-100 relative mb-4">
                      {renderPreview(projeto)}
                    </div>
                    <h5
                      className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2 line-clamp-1"
                      title={projeto.titulo}
                    >
                      <FolderOpen size={20} className="text-gray-400" />
                      {projeto.titulo}
                    </h5>
                  </Link>
                  <p className="font-normal text-gray-500 flex items-center gap-2 text-xs mt-1">
                    <Calendar size={12} />
                    {projeto.createdAt
                      ? new Date(projeto.createdAt).toLocaleDateString("pt-BR")
                      : "Sem data"}
                  </p>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link to={`/dashboard/edit/${projeto.id}`} className="flex-1">
                    <Button color="gray" className="w-full border shadow-sm">
                      <Edit3 size={16} className="mr-2" /> Editar
                    </Button>
                  </Link>
                  <Button
                    color="gray"
                    className="border shadow-sm hover:bg-red-50 hover:text-red-600"
                    onClick={() =>
                      setProjectToDelete({
                        id: projeto.id,
                        nome: projeto.titulo,
                      })
                    }
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
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
          setProjetos((old) => old.filter((p) => p.id !== projectToDelete?.id));
          setProjectToDelete(null);
        }}
        projectId={projectToDelete?.id}
        projectName={projectToDelete?.nome || ""}
      />
    </Container>
  );
}
