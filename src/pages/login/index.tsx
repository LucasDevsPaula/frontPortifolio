import logoImg from "../../assets/logo.jpeg";
import { Container } from "../../components/container";
import { Input } from "../../components/input";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";

const schema = z.object({
  email: z
    .string()
    .email("Insira um email válido")
    .nonempty("O campo é obrigatório"),
  senha: z.string().min(4, "O campo senha é obrigatório"),
});

type FormData = z.infer<typeof schema>;

export function Login() {
  const [params] = useSearchParams();
  const { login, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      loginWithGoogle(token).then(() => {
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      });
    }
  }, []);

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      await login(data.email, data.senha);
      toast.success("Bem-vindo!");
      navigate("/dashboard");
    } catch (error) {
      const err: any = error;
      const msg =
        err?.response?.data?.error || err?.message || "Email/Senha incorreto!";
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
        <Link to={"/"} className="mb-6 max-w-sm w-3xs">
          <img src={logoImg} alt="Logo do site" className="w-full" />
        </Link>

        <form
          className="bg-secundary w-full max-w-xl rounded-lg p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-3">
            <Input
              type="email"
              placeholder="Digite seu email"
              name="email"
              error={errors.email?.message}
              register={register}
            />
          </div>
          <div className="mb-3">
            <Input
              type="password"
              placeholder="Digite sua senha"
              name="senha"
              error={errors.senha?.message}
              register={register}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-buttons hover:bg-buttonsHover transition-all w-full rounded-lg text-white h-10 font-medium mb-4 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Carregando..." : "Acessar"}
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
          Não possui uma conta?{" "}
          <Link
            to={"/register"}
            className="text-[#588157] font-bold hover:underline"
          >
            Cadastre-se!
          </Link>
        </p>
      </div>
    </Container>
  );
}
