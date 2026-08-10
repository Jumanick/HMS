import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-slate-800">
          Welcome, {user?.first_name} ({user?.role})
        </h1>
        <button
          onClick={logout}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          Log out
        </button>
      </div>
      <p className="text-slate-500 text-sm">
        Dashboard content goes here — patient list, appointments, etc.
      </p>
    </div>
  );
}