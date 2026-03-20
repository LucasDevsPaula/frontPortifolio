import logoImg from "../../assets/logo.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "../../components/container";

import { Input } from "../../components/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../server/api";
import { useContext, useState } from "react";
import toast from "react-hot-toast";

const schema = z.object({
  nome: z
    .string()
    .nonempty("O campo nome é obrigatório")
    .min(3, "O campo nome deve ter mais de 2 caracteres"),
  email: z
    .string()
    .email("Insira um email válido")
    .nonempty("O campo é obrigatório"),
  senha: z
    .string()
    .min(1, "O campo senha é obrigatório")
    .min(4, "A senha deve ter mais de 4 caracteres"),
  fotoPerfil: z
    .any()
    .refine((files) => files?.length === 1, "A foto de perfil é obrigatória"),
});

type FormData = z.infer<typeof schema>;

export function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("nome", data.nome);
      formData.append("email", data.email);
      formData.append("senha", data.senha);
      formData.append("fotoPerfil", data.fotoPerfil[0]);

      await api.post("/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Conta criada com sucesso!");

      try {
        await login(data.email, data.senha);
        navigate("/dashboard");
      } catch (loginError) {
        const err: any = loginError;
        const msg =
          err?.response?.data?.error ||
          "Erro no login automático. Por favor, entre com sua senha.";
        toast.error(msg);
        navigate("/login");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error || "Erro ao cadastrar. Verifique os dados.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleLogin() {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3333";
    window.location.href = `${apiUrl}/auth/google`;
  }

  return (
    <Container>
      <div className="w-full min-h-screen flex justify-center items-center flex-col gap-4">
        <Link to={"/"} className="mb-6 max-w-sm w-48">
          <img
            src={logoImg}
            alt="Logo do site"
            className="w-full object-contain"
          />
        </Link>

        <form
          className="bg-secundary w-full max-w-xl rounded-lg p-6 shadow-md border border-gray-200"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="text-2xl font-bold text-center mb-6 text-primary">
            Crie sua conta
          </h2>

          <div className="mb-3">
            <Input
              type="text"
              placeholder="Digite seu nome completo"
              name="nome"
              error={errors.nome?.message}
              register={register}
            />
          </div>
          <div className="mb-3">
            <Input
              type="email"
              placeholder="Digite seu email"
              name="email"
              error={errors.email?.message}
              register={register}
            />
          </div>
          <div className="mb-4">
            <Input
              type="password"
              placeholder="Crie uma senha"
              name="senha"
              error={errors.senha?.message}
              register={register}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-primary mb-1">
              Foto de perfil
            </label>
            <input
              type="file"
              accept="image/*"
              {...register("fotoPerfil")}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
            />
            {errors.fotoPerfil?.message && (
              <p className="text-red-600 text-sm mt-1">
                {String(errors.fotoPerfil.message)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-buttons hover:bg-buttonsHover w-full rounded-lg text-white h-10 font-bold cursor-pointer mb-4 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </button>

          <div className="flex items-center justify-between mb-4">
            <hr className="w-full border-gray-300" />
            <span className="px-2 text-gray-400 text-sm">Ou</span>
            <hr className="w-full border-gray-300" />
          </div>

          <button
            className="w-full border border-gray-300 rounded-lg h-10 font-medium cursor-pointer flex justify-center items-center gap-2 hover:bg-gray-50 transition-all text-gray-700"
            type="button"
            onClick={handleGoogleLogin}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Logo google"
              className="w-5 h-5"
            />
            <span>Entrar com Google</span>
          </button>
        </form>

        <p className="text-gray-600">
          Já possui uma conta?{" "}
          <Link
            to={"/login"}
            className="text-[#588157] font-bold hover:underline"
          >
            Faça o login!
          </Link>
        </p>
      </div>
    </Container>
  );
}
