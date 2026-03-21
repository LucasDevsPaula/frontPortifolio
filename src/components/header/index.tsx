import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.jpeg";
import { CircleUserRound, LogIn, LogOut } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

export function Header() {
  const navigate = useNavigate();
  const { signed, logout, user } = useContext(AuthContext);

  const avatarUrl = user?.fotoPerfil ? user.fotoPerfil : null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="w-full flex items-center justify-center h-16 bg-primary drop-shadow">
      <header className="flex w-full max-w-7xl items-center justify-between px-4 mx-auto">
        <Link to={"/"}>
          <img src={Logo} alt="Logo do sistema" className="w-16" />
        </Link>
        {signed && (
          <div className="flex items-center gap-4">
            <Link to={"/dashboard"} title="Dashboard">
              <div className="h-9 w-9 shrink-0 rounded-full overflow-hidden border border-[#D2BE99]/60 shadow-sm flex items-center justify-center bg-secundary/10">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`Foto de perfil de ${user?.nome || "usuário"}`}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <CircleUserRound size={20} color="#D2BE99" />
                )}
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="text-zinc-900 hover:text-zinc-950 transition-colors cursor-pointer"
              title="Sair"
            >
              <LogOut size={24} color="#D2BE99" />
            </button>
          </div>
        )}
        {!signed && (
          <Link to={"/login"} title="Entrar">
            <LogIn size={24} color="#D2BE99" />
          </Link>
        )}
      </header>
    </div>
  );
}
