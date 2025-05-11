import { Link, useNavigate } from "react-router-dom";
import smartCityIcon from '../assets/smart-city-icon.png';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/home" className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-8"
                src={smartCityIcon}
                alt="Logo Cidade Inteligente"
              />
              <span className="ml-2 text-xl font-bold"> Smart City</span>
            </Link>
            
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                <NavLink to="/sensors" text="Sensores" />
                <NavLink to="/environments" text="Ambientes" />
                <NavLink to="/history" text="Histórico" />
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition duration-300"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}

const NavLink = ({ to, text }) => (
  <Link
    to={to}
    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition duration-300"
  >
    {text}
  </Link>
);