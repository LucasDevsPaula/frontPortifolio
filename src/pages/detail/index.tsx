import { useState, useEffect, type FormEvent } from "react";
import {
  Button,
  Card,
  Badge,
  Modal,
  Label,
  TextInput,
  Textarea,
  Carousel,
} from "flowbite-react";
import {
  ArrowLeft,
  Edit3,
  Calendar,
  User,
  FileText,
  File as FileIcon,
  Image as ImageIcon,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from "react-hot-toast";

import api from "../../server/api";

interface Projeto {
  id: string;
  titulo: string;
  categoria: string;
  descricao: string;
  cliente?: string;
  responsavel?: string;
  prazo?: string;
  ImagemProjeto?: { id: string; url: string }[];
  usuario?: {
    nome: string;
    email: string;
  };
}

export default function Detail() {
  const { id } = useParams();
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados do Formulário de Contato
  const [openContactModal, setOpenContactModal] = useState(false);
  const [nomeCliente, setNomeCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [telCliente, setTelCliente] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function loadProject() {
      try {
        const response = await api.get(`/project/${id}`);
        setProjeto(response.data);
      } catch (error) {
        console.error("Erro ao carregar", error);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

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

  const handleSendContact = (e: FormEvent) => {
    e.preventDefault();

    if (!projeto?.usuario?.email) {
      toast.error("O email do arquiteto não está disponível.");
      return;
    }

    const assunto = `Interesse no projeto: ${projeto.titulo}`;
    const corpo = `Olá ${projeto.usuario.nome},

Meu nome é ${nomeCliente}.
Vi seu projeto "${projeto.titulo}" no ArqManager e gostaria de mais informações.

-- Meus Dados de Contato --
Nome: ${nomeCliente}
Email: ${emailCliente}
Telefone: ${telCliente}

Mensagem:
${mensagem}`;

    const mailtoLink = `mailto:${
      projeto.usuario.email
    }?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;

    window.location.href = mailtoLink;

    setOpenContactModal(false);
    toast.success("Redirecionando para seu e-mail...");
    setMensagem("");
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-800 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center text-[#588157] hover:text-primary mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={20} className="mr-2" /> Voltar para a Home
        </Link>

        {loading ? (
          <Skeleton height={400} />
        ) : projeto ? (
          <Card className="shadow-xl border-none overflow-hidden p-0 bg-white">
            {projeto.ImagemProjeto && projeto.ImagemProjeto.length > 0 ? (
              <div className="relative">
                <Carousel slideInterval={5000} className="h-96">
                  {projeto.ImagemProjeto?.map((item) => (
              <div key={item.id} className="relative h-96 w-full">
                <img
                  src={`http://localhost:3333/files/${item.url}`}
                  alt="Imagem do projeto"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-8 text-white">
                  <Badge color={getStatusColor(projeto.categoria)} className="mb-3 w-fit px-3 py-1 text-sm">
                    {projeto.categoria}
                  </Badge>
                  <h1 className="text-5xl font-bold drop-shadow-lg">{projeto.titulo}</h1>
                </div>
              </div>
            ))}
                </Carousel>
              </div>
            ) : (
              <div className="bg-[#dad7cd] h-48 flex items-center justify-center border-b border-gray-200">
                <div className="text-center">
                  <h1 className="text-4xl front-bold text-primary">{projeto.titulo}</h1>
                  <Badge color={getStatusColor(projeto.categoria)} className="mb-3 w-fit px-3 py-1 text-sm">
                    {projeto.categoria}
                  </Badge>
                </div>
              </div>
            )}

            <div className="p-8">
              {/* GRID INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Cliente
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {projeto.cliente || "Não informado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Previsão Entrega
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {projeto.prazo
                        ? new Date(projeto.prazo).toLocaleDateString("pt-BR")
                        : "A definir"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ESCOPO */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <FileText size={24} className="text-[#588157]" /> Escopo do
                  Projeto
                </h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-6 border border-gray-200 rounded-xl">
                  {projeto.descricao || "Sem descrição disponível."}
                </div>
              </div>

              {/* GALERIA */}
              {projeto.ImagemProjeto && projeto.ImagemProjeto.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <ImageIcon size={24} className="text-[#588157]" /> Arquivos
                    e Imagens
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {projeto.ImagemProjeto.map((file) => {
                      const isDoc =
                        file.url.endsWith(".pdf") ||
                        file.url.endsWith(".doc") ||
                        file.url.endsWith(".docx") ||
                        file.url.endsWith(".odt");
                      const fileName = file.url.split("/").pop() || "Arquivo";

                      return (
                        <a
                          key={file.id}
                          href={`http://localhost:3333/files/${file.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative h-32 border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col items-center justify-center bg-white text-center p-2 text-decoration-none"
                        >
                          {isDoc ? (
                            <>
                              <FileIcon
                                size={40}
                                className="text-[#588157] mb-2"
                              />
                              <span className="text-[11px] text-gray-600 line-clamp-2 break-all font-medium px-2">
                                {fileName}
                              </span>
                            </>
                          ) : (
                            <img
                              src={`http://localhost:3333/files/${file.url}`}
                              alt="Galeria"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ACTION BAR */}
              <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 gap-4 mt-8 bg-gray-50 p-6 rounded-lg">
                <div className="text-center md:text-left">
                  <h4 className="font-bold text-primary text-lg">
                    Interessado neste projeto?
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Entre em contato diretamente com o responsável.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Link to={`/dashboard/edit/${projeto.id}`}>
                    <Button
                      color="gray"
                      className="border-gray-300 text-gray-700"
                    >
                      <Edit3 size={18} className="mr-2" /> Editar
                    </Button>
                  </Link>

                  <Button
                    className="bg-[#588157]! hover:bg-buttons! shadow-md px-4"
                    onClick={() => setOpenContactModal(true)}
                  >
                    <MessageCircle size={18} className="mr-2" /> Falar com
                    Arquiteto
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            Carregando detalhes...
          </p>
        )}

        {/* --- MODAL DE CONTATO CORRIGIDO (SEM Header/Body explícitos) --- */}
        <Modal
          show={openContactModal}
          size="md"
          onClose={() => setOpenContactModal(false)}
          popup
        >
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 p-6">
            {/* Botão X para fechar */}
            <button
              type="button"
              onClick={() => setOpenContactModal(false)}
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            >
              <X size={20} />
            </button>

            <div className="text-center px-2">
              <div className="mx-auto mb-4 h-14 w-14 text-[#588157] bg-[#dad7cd]/30 p-3 rounded-full flex items-center justify-center">
                <MessageCircle size={28} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-800">
                Entre em Contato
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Envie um e-mail para{" "}
                <b>{projeto?.usuario?.nome || "o responsável"}</b>.
              </p>

              <form
                onSubmit={handleSendContact}
                className="flex flex-col gap-4 text-left"
              >
                <div>
                  <div className="mb-1 block">
                    <Label htmlFor="nome" className="text-primary">
                      Seu Nome
                    </Label>
                  </div>
                  <TextInput
                    id="nome"
                    required
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                    placeholder="Ex: Maria"
                  />
                </div>
                <div>
                  <div className="mb-1 block">
                    <Label htmlFor="email" className="text-primary">
                      Seu Email
                    </Label>
                  </div>
                  <TextInput
                    id="email"
                    type="email"
                    required
                    value={emailCliente}
                    onChange={(e) => setEmailCliente(e.target.value)}
                    placeholder="Ex: maria@email.com"
                  />
                </div>
                <div>
                  <div className="mb-1 block">
                    <Label htmlFor="tel" className="text-primary">
                      Seu Telefone
                    </Label>
                  </div>
                  <TextInput
                    id="tel"
                    required
                    value={telCliente}
                    onChange={(e) => setTelCliente(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <div className="mb-1 block">
                    <Label htmlFor="msg" className="text-primary">
                      Mensagem
                    </Label>
                  </div>
                  <Textarea
                    id="msg"
                    required
                    rows={3}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Olá, gostaria de saber mais..."
                  />
                </div>

                <div className="mt-4">
                  <Button
                    type="submit"
                    className="w-full bg-[#588157]! hover:bg-buttons!"
                  >
                    <Send size={16} className="mr-2" /> Enviar E-mail
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
