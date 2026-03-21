import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CircleUserRound } from "lucide-react";
import "react-loading-skeleton/dist/skeleton.css";

import { Container } from "../../components/container";
import api from "../../server/api";
import bgImage from "../../assets/poojan-thanekar-vFNPi8WwS2k-unsplash.jpg";

interface UsuarioPublico {
  id: string;
  nome: string | null;
  fotoPerfil?: string | null;
}

interface ProjetoProps {
  id: string;
  titulo: string;
  categoria: string;
  createdAt: string;
  imagemCapa?: string;
}

export function Portfolio() {
  const { userId } = useParams();
  const [usuario, setUsuario] = useState<UsuarioPublico | null>(null);
  const [projetos, setProjetos] = useState<ProjetoProps[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3333";

  const avatarUrl = useMemo(() => {
    if (!usuario?.fotoPerfil) return null;
    if (usuario.fotoPerfil.startsWith("http")) return usuario.fotoPerfil;
    return `${apiUrl}/files/${usuario.fotoPerfil}`;
  }, [usuario?.fotoPerfil, apiUrl]);

  useEffect(() => {
    async function load() {
      if (!userId) return;

      try {
        const res = await api.get(`/portfolio/${userId}`);
        setUsuario(res.data.usuario);
        setProjetos(res.data.projetos || []);
      } catch {
        setUsuario(null);
        setProjetos([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  return (
    <>
      <div className="relative">
        <img
          src={bgImage}
          alt="Capa"
          className="w-full max-h-64 object-cover"
        />

        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-[92%] max-w-4xl">
          <div className="bg-[#dad7cd] rounded-xl shadow-[0px_10px_11px_rgba(168,157,157,0.56)] px-6 py-5 flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden bg-inputs border border-gray-200 shadow-sm flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`Foto de perfil de ${usuario?.nome || "usuário"}`}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <CircleUserRound size={26} className="text-detalhes" />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm text-zinc-700">Portifólio</p>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 truncate">
                {loading ? "Carregando..." : usuario?.nome || "Usuário"}
              </h1>
              <p className="text-sm text-zinc-700">
                {loading
                  ? ""
                  : `${projetos.length} ${projetos.length === 1 ? "projeto" : "projetos"}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Container>
        <h2 className="font-bold text-left mt-20 text-3xl mb-4">Projetos</h2>

        <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pb-10">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full h-72 bg-gray-200 rounded-lg animate-pulse"
              />
            ))
          ) : projetos.length > 0 ? (
            projetos.map((projeto) => (
              <section
                key={projeto.id}
                className="w-full bg-secundary rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  className="w-full rounded-t-lg mb-2 h-56 object-cover hover:scale-102 transition-all"
                  src={
                    projeto.imagemCapa?.startsWith("http")
                      ? projeto.imagemCapa
                      : `${apiUrl}/files/${projeto.imagemCapa}`
                  }
                  alt={projeto.titulo}
                />

                <p className="font-bold mt-1 mb-2 px-2 text-lg">
                  {projeto.titulo}
                </p>
                <div className="flex flex-col px-2 pb-4">
                  <span className="text-zinc-800 mb-2 text-base">
                    Data:{" "}
                    {projeto.createdAt
                      ? new Date(projeto.createdAt).toLocaleDateString("pt-BR")
                      : "Recente"}{" "}
                    | Categoria: {projeto.categoria ?? "-"}
                  </span>

                  <div className="flex justify-between items-center gap-4 truncate">
                    <div className="bg-buttons text-secundary px-2 py-0.5 rounded-full hover:scale-102 transition-all hover:bg-buttonsHover">
                      <Link
                        to={
                          userId
                            ? {
                                pathname: `/project/${projeto.id}`,
                                search: `?from=portfolio&back=${encodeURIComponent(
                                  `/portfolio/${userId}`
                                )}`,
                              }
                            : `/project/${projeto.id}`
                        }
                        state={
                          userId
                            ? {
                                from: "portfolio",
                                backTo: `/portfolio/${userId}`,
                              }
                            : undefined
                        }
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 mt-10">
              Nenhum projeto encontrado.
            </p>
          )}
        </main>
      </Container>
    </>
  );
}
