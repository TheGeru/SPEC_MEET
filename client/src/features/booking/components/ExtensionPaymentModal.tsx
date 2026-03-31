import React from 'react';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { XCircleIcon, PlusCircleIcon } from 'lucide-react';
import CheckoutForm from './CheckoutForm'; // 👈 IMPORTAS TU COMPONENTE EXISTENTE

// Usa la misma llave que usas en el flujo de reserva normal
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface ExtensionPaymentModalProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

const ExtensionPaymentModal: React.FC<ExtensionPaymentModalProps> = ({ 
  clientSecret, 
  amount, 
  onSuccess, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] px-4">
      <div className="bg-zinc-900 border border-emerald-500/30 rounded-2xl max-w-md w-full p-8 shadow-2xl">
        
        {/* Encabezado del Modal */}
        <div className="text-center mb-6">
          <div className="bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <PlusCircleIcon className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Extender Reserva</h3>
          <p className="text-gray-400 text-sm mt-1">Pago extra por tiempo adicional</p>
        </div>

        {/* 🛡️ PROVEEDOR DE STRIPE */}
        {/* Pasamos el clientSecret que recibimos del backend de extensiones */}
        <Elements 
          stripe={stripePromise} 
          options={{ 
            clientSecret, 
            appearance: { theme: 'night', variables: { colorPrimary: '#10b981' } } 
          }}
        >
          {/* USAS TU COMPONENTE TAL CUAL */}
          <CheckoutForm 
            totalAmount={amount} 
            onSuccess={onSuccess} 
            onError={(msg) => console.error(msg)} 
          />
        </Elements>

        <button 
          onClick={onClose} 
          className="w-full mt-4 text-gray-500 text-sm hover:text-white transition flex items-center justify-center gap-1"
        >
          <XCircleIcon className="h-4 w-4" /> Cancelar pago
        </button>
      </div>
    </div>
  );
};

export default ExtensionPaymentModal;