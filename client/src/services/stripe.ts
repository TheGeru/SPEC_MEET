import { loadStripe } from '@stripe/stripe-js';

// Usamos la variable de entorno que creaste en el paso anterior
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TU_CLAVE_PUBLICA_AQUI';
const stripePromise = loadStripe(stripePublicKey);

// 1. Le decimos a TypeScript que bookingData es un objeto cualquiera (any) explícitamente
export const createPaymentSession = async (bookingData: any) => {
  try {
    // Usamos tu URL de Render usando import.meta.env
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${API_URL}/reservations/create-payment-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookingDetails: bookingData
      })
    });
    
    const session = await response.json();

    const stripe = await stripePromise;
    
    // 2. Protegemos el código en caso de que Stripe falle al cargar (resuelve el error de null)
    if (!stripe) {
      console.error("No se pudo cargar Stripe.");
      return;
    }

    // Como ya comprobamos que no es null, el error de redirectToCheckout desaparece
    const result = await (stripe as any).redirectToCheckout({
      sessionId: session.id
    });
    
    if (result.error) {
      console.error(result.error.message);
    }
  } catch (error) {
    console.error('Error al procesar el pago:', error);
  }
};

// 3. Le decimos a TypeScript que sessionId siempre será un texto (string)
export const getPaymentStatus = async (sessionId: string) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${API_URL}/payment-status/${sessionId}`);
    
    return await response.json();
  } catch (error) {
    console.error('Error al verificar el estado del pago:', error);
    return {
      status: 'error'
    };
  }
};