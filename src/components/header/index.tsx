import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.jpeg";
import { CircleUserRound, LogIn, LogOut } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

export function Header() {
  const navigate = useNavigate();
  const { signed, logout } = useContext(AuthContext);

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
            <Link to={"/dashboard"}>
              <CircleUserRound />
            </Link>
            <button
              onClick={handleLogout}
              className="text-zinc-900 hover:text-zinc-950 transition-colors cursor-pointer"
              title="Sair"
            >
              <LogOut size={24} />
            </button>
          </div>
        )}
        {!signed && (
          <Link to={"/login"}>
            <LogIn />
          </Link>
        )}
      </header>
    </div>
  );
}
