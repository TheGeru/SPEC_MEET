import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserIcon, AtSignIcon, LockIcon, CheckIcon } from 'lucide-react';
import PlansModal from '../../components/plans/PlansModal';
const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const {
    register
  } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password);
      setShowPlansModal(true); // Show plans modal after successful registration
    } catch (error) {
      setError('Error al crear la cuenta. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  const handlePlansModalClose = () => {
    setShowPlansModal(false);
    navigate('/dashboard');
  };
  return <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Crear Cuenta</h2>
            <p className="mt-2 text-gray-400">
              Regístrate para comenzar a reservar tu sala de juntas
            </p>
          </div>
          {error && <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input id="name" name="name" type="text" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-md shadow-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500" placeholder="Juan Pérez" />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSignIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-md shadow-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500" placeholder="correo@ejemplo.com" />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-md shadow-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500" placeholder="••••••••" />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 8 caracteres con letras y números
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CheckIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-md shadow-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="terms" name="terms" type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-zinc-700 rounded bg-zinc-800" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-400">
                  Acepto los{' '}
                  <Link to="#" className="font-medium text-gray-400 hover:text-gray-300">
                    Términos y Condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link to="#" className="font-medium text-gray-400 hover:text-gray-300">
                    Política de Privacidad
                  </Link>
                </label>
              </div>
            </div>
            <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Creando cuenta...' : 'Registrarme'}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-medium text-gray-400 hover:text-gray-300">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* Plans Modal */}
      <PlansModal isOpen={showPlansModal} onClose={handlePlansModalClose} />
    </div>;
};
export default RegisterPage;