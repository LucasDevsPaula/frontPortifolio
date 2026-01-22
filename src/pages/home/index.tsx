import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import "react-loading-skeleton/dist/skeleton.css";

import { Container } from "../../components/container";
import api from "../../server/api";

interface UsuarioProps {
  id: string;
  nome: string;
}

interface ProjetoProps {
  id: string;
  titulo: string;
  categoria: string;
  createdAt: string;
  imagemCapa?: string;
  usuario: UsuarioProps;
}

export function Home() {
  const [projetos, setProjetos] = useState<ProjetoProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function carregarProjetos() {
      try {
        const res = await api.get("/projects");

        let dados = [];
        if (Array.isArray(res.data)) {
          dados = res.data;
        } else if (res.data.projetos && Array.isArray(res.data.projetos)) {
          dados = res.data.projetos;
        }
        setProjetos(dados);
      } catch (err) {
        console.log("Erro ao carregar", err);
      } finally {
        setLoading(false);
      }
    }

    carregarProjetos();
  }, []);

  // --- LÓGICA DE FILTRO INTELIGENTE ---
  const filteredProjects = projetos.filter((p) => {
    const term = searchTerm.toLowerCase();

    const matchTitulo = (p.titulo || "").toLowerCase().includes(term);

    const matchCategoria = (p.categoria || "").toLowerCase().includes(term);

    const matchArquiteto = (p.usuario?.nome || "").toLowerCase().includes(term);

    const dataFormatada = p.createdAt
      ? new Date(p.createdAt).toLocaleDateString("pt-BR")
      : "";
    const matchData = dataFormatada.includes(term);

    return matchTitulo || matchCategoria || matchArquiteto || matchData;
  });

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <Container>
      <form
        onSubmit={handleSearchSubmit}
        className="p-4 rounded-lg w-full mx-auto flex justify-center items-center gap-2 bg-secundary"
      >
        <div className="relative w-full flex items-center">
          <div className="absolute left-3 pointer-events-none">
            <Search size={20} className="text-gray-500" />
          </div>
          <input
            type="text"
            // MUDANÇA NO PLACEHOLDER PARA AVISAR O USUÁRIO
            placeholder="Pesquise por nome, categoria, data ou arquiteto..."
            className="w-full border-primary rounded-lg h-9 pl-10 pr-3 outline-none focus:ring-2 focus:ring-[#588157]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-buttons h-9 px-8 rounded-lg text-white font-bold text-lg hover:opacity-90 transition-opacity">
          Buscar
        </button>
      </form>

      <h1 className="font-bold text-left mt-6 text-3xl mb-4">Projetos</h1>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pb-10">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full h-72 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((projeto) => (
            <Link to={`/project/${projeto.id}`} key={projeto.id}>
              <section className="w-full bg-secundary rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <img
                  className="w-full rounded-t-lg mb-2 h-56 object-cover hover:scale-102 transition-all"
                  src={`http://localhost:3333/files/${projeto.imagemCapa}`}
                  alt={projeto.titulo}
                />

                <p className="font-bold mt-1 mb-2 px-2 text-lg">
                  {projeto.titulo}
                </p>
                <div className="flex flex-col px-2 pb-4">
                  <span className="text-zinc-800 mb-2 text-sm">
                    Data:{" "}
                    {projeto.createdAt
                      ? new Date(projeto.createdAt).toLocaleDateString("pt-BR")
                      : "Recente"}{" "}
                    | Categoria: {projeto.categoria ?? "-"}
                  </span>

                  <strong className="font-medium text-sm text-zinc-600">
                    Arquiteto(a): {projeto.usuario?.nome || "Não informado"}
                  </strong>
                </div>
              </section>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 mt-10">
            Nenhum projeto encontrado com esse termo.
          </p>
        )}
      </main>
    </Container>
  );
}
