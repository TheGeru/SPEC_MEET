import React, { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ClockIcon, CoffeeIcon, CreditCardIcon, CheckIcon, EyeIcon, XIcon } from 'lucide-react';
type BookingStep = 'date' | 'resources' | 'payment' | 'confirmation';
type PaymentMethod = 'card' | 'applepay' | 'googlepay' | 'spei';
const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<BookingStep>('date');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [selectedBeverages, setSelectedBeverages] = useState<{
    [key: string]: number;
  }>({});
  const [attendees, setAttendees] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [speiReference, setSpeiReference] = useState('');
  // Mock data
  const availableDates = ['2023-12-14', '2023-12-15', '2023-12-16', '2023-12-17', '2023-12-18', '2023-12-19', '2023-12-20'];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const beverages = [{
    id: 'coffee',
    name: 'Café',
    price: 30
  }, {
    id: 'water',
    name: 'Agua',
    price: 20
  }, {
    id: 'soda',
    name: 'Refresco',
    price: 25
  }];
  // Mock data for reservations
  const existingReservations = [{
    date: '2023-12-15',
    slots: ['09:00', '10:00', '11:00', '14:00', '15:00']
  }, {
    date: '2023-12-16',
    slots: ['12:00', '13:00', '16:00']
  }, {
    date: '2023-12-18',
    slots: ['09:00', '10:00', '17:00', '18:00']
  }, {
    date: '2023-12-20',
    slots: ['11:00', '12:00', '13:00']
  }];
  // Handlers
  const handleBeverageChange = (beverageId: string, quantity: number) => {
    setSelectedBeverages(prev => ({
      ...prev,
      [beverageId]: quantity
    }));
  };
  const handleNextStep = () => {
    switch (currentStep) {
      case 'date':
        if (selectedDate && selectedTimeSlot) {
          setCurrentStep('resources');
        }
        break;
      case 'resources':
        setCurrentStep('payment');
        break;
      case 'payment':
        // Simulate payment processing
        setTimeout(() => {
          setCurrentStep('confirmation');
        }, 1500);
        break;
      case 'confirmation':
        navigate('/dashboard');
        break;
    }
  };
  const handlePrevStep = () => {
    switch (currentStep) {
      case 'resources':
        setCurrentStep('date');
        break;
      case 'payment':
        setCurrentStep('resources');
        break;
      case 'confirmation':
        // Usually we wouldn't go back from confirmation, but just in case
        setCurrentStep('payment');
        break;
    }
  };
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentCalendarMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentCalendarMonth(newDate);
  };
  // Check if a time slot is available
  const isTimeSlotAvailable = (date: string, time: string) => {
    const reservation = existingReservations.find(r => r.date === date);
    if (!reservation) return true;
    return !reservation.slots.includes(time);
  };
  // Calculate total price
  const calculateTotal = () => {
    // Base price per hour
    const basePrice = 200 * selectedDuration;
    // Beverages price
    const beveragesPrice = Object.entries(selectedBeverages).reduce((sum, [id, quantity]) => {
      const beverage = beverages.find(b => b.id === id);
      return sum + (beverage ? beverage.price * quantity : 0);
    }, 0);
    return basePrice + beveragesPrice;
  };
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const days = [];
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), i));
    }
    return days;
  };
  // Check if a day has reservations
  const hasDayReservations = (day: Date) => {
    const dateString = day.toISOString().split('T')[0];
    return existingReservations.some(r => r.date === dateString);
  };
  // Render functions for each step
  const renderCalendarView = () => <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">
          {currentCalendarMonth.toLocaleDateString('es-ES', {
          month: 'long',
          year: 'numeric'
        })}
        </h3>
        <div className="flex space-x-2">
          <button onClick={() => navigateMonth('prev')} className="p-2 rounded-md bg-white bg-opacity-10 backdrop-blur-sm text-white hover:bg-opacity-20">
            &lt;
          </button>
          <button onClick={() => setCurrentCalendarMonth(new Date())} className="p-2 rounded-md bg-white bg-opacity-10 backdrop-blur-sm text-white hover:bg-opacity-20">
            Hoy
          </button>
          <button onClick={() => navigateMonth('next')} className="p-2 rounded-md bg-white bg-opacity-10 backdrop-blur-sm text-white hover:bg-opacity-20">
            &gt;
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => <div key={day} className="text-center p-2 font-medium text-white text-sm">
            {day}
          </div>)}
        {/* Calendar days */}
        {generateCalendarDays().map((day, index) => {
        if (!day) {
          return <div key={`empty-${index}`} className="h-20 bg-white bg-opacity-5 backdrop-blur-sm rounded-md"></div>;
        }
        const dateString = day.toISOString().split('T')[0];
        const isSelected = dateString === selectedDate;
        const hasReservations = hasDayReservations(day);
        const isToday = day.getDate() === new Date().getDate() && day.getMonth() === new Date().getMonth() && day.getFullYear() === new Date().getFullYear();
        return <div key={day.toString()} className={`h-20 p-1 rounded-md overflow-hidden cursor-pointer
                ${isSelected ? 'bg-white bg-opacity-30 backdrop-blur-sm border border-white border-opacity-30' : ''}
                ${isToday ? 'bg-white bg-opacity-15 backdrop-blur-sm border border-white border-opacity-20' : 'bg-white bg-opacity-10 backdrop-blur-sm'}
                ${!isSelected && !isToday ? 'hover:bg-white hover:bg-opacity-20' : ''}
              `} onClick={() => {
          const dateStr = day.toISOString().split('T')[0];
          setSelectedDate(dateStr);
        }}>
              <div className={`text-right p-1 text-sm ${isToday ? 'font-bold text-white' : 'text-white'}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {hasReservations && <div className="px-1 py-0.5 text-xs bg-red-500 bg-opacity-30 text-white rounded truncate backdrop-blur-sm">
                    Reservado
                  </div>}
              </div>
            </div>;
      })}
      </div>
      {selectedDate && <div className="mt-4 bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-lg">
          <h4 className="text-md font-medium text-white mb-3">
            Horarios disponibles para {formatDate(selectedDate)}
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {timeSlots.map(time => {
          const isAvailable = isTimeSlotAvailable(selectedDate, time);
          return <button key={time} type="button" disabled={!isAvailable} onClick={() => setSelectedTimeSlot(time)} className={`py-2 px-3 rounded-md text-center
                    ${!isAvailable ? 'bg-red-500 bg-opacity-30 text-white cursor-not-allowed' : selectedTimeSlot === time ? 'bg-white bg-opacity-30 text-white' : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'}
                  `}>
                  {time}
                  {!isAvailable && <div className="text-xs mt-1">Reservado</div>}
                </button>;
        })}
          </div>
        </div>}
    </div>;
  const renderDateSelection = () => <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white mb-4">
          Selecciona fecha y hora
        </h3>
      </div>
      {renderCalendarView()}
      {selectedTimeSlot && <div>
          <label className="block text-sm font-medium text-white mb-2">
            Duración (horas)
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(hours => <button key={hours} type="button" onClick={() => setSelectedDuration(hours)} className={`py-2 px-3 rounded-md text-center ${selectedDuration === hours ? 'bg-white bg-opacity-30 text-white' : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'}`}>
                {hours} {hours === 1 ? 'hora' : 'horas'}
              </button>)}
          </div>
        </div>}
      {selectedDate && selectedTimeSlot && <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-lg mt-6">
          <h4 className="text-sm font-medium text-white mb-2">Resumen</h4>
          <div className="flex items-center mb-2">
            <CalendarIcon className="h-5 w-5 text-white mr-2" />
            <span className="text-white">{formatDate(selectedDate)}</span>
          </div>
          <div className="flex items-center mb-2">
            <ClockIcon className="h-5 w-5 text-white mr-2" />
            <span className="text-white">
              {selectedTimeSlot} -{' '}
              {calculateEndTime(selectedTimeSlot, selectedDuration)}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-lg font-semibold text-white">
              ${200 * selectedDuration} MXN
            </span>
            <span className="text-sm text-white ml-1">+ IVA</span>
          </div>
        </div>}
    </div>;
  const renderResourcesSelection = () => <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Opciones adicionales
        </h3>
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Bebidas
          </label>
          <div className="space-y-3">
            {beverages.map(beverage => <div key={beverage.id} className="flex items-center justify-between bg-white bg-opacity-10 backdrop-blur-sm py-3 px-4 rounded-md">
                <div className="flex items-center">
                  <CoffeeIcon className="h-5 w-5 text-white mr-2" />
                  <span className="text-white">{beverage.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-white mr-3">
                    ${beverage.price} MXN c/u
                  </span>
                  <div className="flex items-center">
                    <button type="button" onClick={() => handleBeverageChange(beverage.id, Math.max(0, (selectedBeverages[beverage.id] || 0) - 1))} className="h-8 w-8 flex items-center justify-center rounded-md bg-white bg-opacity-10 text-white hover:bg-opacity-20">
                      -
                    </button>
                    <span className="mx-2 w-6 text-center text-white">
                      {selectedBeverages[beverage.id] || 0}
                    </span>
                    <button type="button" onClick={() => handleBeverageChange(beverage.id, (selectedBeverages[beverage.id] || 0) + 1)} className="h-8 w-8 flex items-center justify-center rounded-md bg-white bg-opacity-10 text-white hover:bg-opacity-20">
                      +
                    </button>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Número de asistentes
          </label>
          <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm py-3 px-4 rounded-md">
            <span className="text-white mr-auto">Personas</span>
            <div className="flex items-center">
              <button type="button" onClick={() => setAttendees(Math.max(1, attendees - 1))} className="h-8 w-8 flex items-center justify-center rounded-md bg-white bg-opacity-10 text-white hover:bg-opacity-20">
                -
              </button>
              <span className="mx-2 w-6 text-center text-white">
                {attendees}
              </span>
              <button type="button" onClick={() => setAttendees(Math.min(8, attendees + 1))} className="h-8 w-8 flex items-center justify-center rounded-md bg-white bg-opacity-10 text-white hover:bg-opacity-20">
                +
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Resumen</h4>
        <div className="space-y-2 mb-3">
          <div className="flex justify-between">
            <span className="text-white">
              Reserva de sala ({selectedDuration}{' '}
              {selectedDuration === 1 ? 'hora' : 'horas'})
            </span>
            <span className="text-white">${200 * selectedDuration} MXN</span>
          </div>
          {Object.entries(selectedBeverages).filter(([_, quantity]) => quantity > 0).map(([id, quantity]) => {
          const beverage = beverages.find(b => b.id === id);
          if (!beverage) return null;
          return <div key={id} className="flex justify-between">
                  <span className="text-white">
                    {beverage.name} x{quantity}
                  </span>
                  <span className="text-white">
                    ${beverage.price * quantity} MXN
                  </span>
                </div>;
        })}
        </div>
        <div className="border-t border-white border-opacity-20 pt-2">
          <div className="flex justify-between">
            <span className="font-medium text-white">Total</span>
            <div>
              <span className="font-semibold text-lg text-white">
                ${calculateTotal()} MXN
              </span>
              <span className="text-sm text-white ml-1">+ IVA</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
  const renderPaymentSelection = () => <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Información de pago
        </h3>
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Método de pago
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setPaymentMethod('card')} className={`py-3 px-4 rounded-md flex items-center justify-center ${paymentMethod === 'card' ? 'bg-white bg-opacity-30 text-white' : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'}`}>
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Tarjeta de Crédito
            </button>
            <button type="button" onClick={() => setPaymentMethod('spei')} className={`py-3 px-4 rounded-md flex items-center justify-center ${paymentMethod === 'spei' ? 'bg-white bg-opacity-30 text-white' : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'}`}>
              <span className="font-medium mr-2">SPEI</span>
              Transferencia
            </button>
          </div>
        </div>
        {paymentMethod === 'card' && <div className="space-y-4">
            <div>
              <label htmlFor="card-number" className="block text-sm font-medium text-white mb-1">
                Número de tarjeta
              </label>
              <input type="text" id="card-number" placeholder="1234 5678 9012 3456" className="w-full py-2 px-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-white mb-1">
                  Fecha de expiración
                </label>
                <input type="text" id="expiry" placeholder="MM/AA" className="w-full py-2 px-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm" />
              </div>
              <div>
                <label htmlFor="cvc" className="block text-sm font-medium text-white mb-1">
                  CVC
                </label>
                <input type="text" id="cvc" placeholder="123" className="w-full py-2 px-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm" />
              </div>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                Nombre en la tarjeta
              </label>
              <input type="text" id="name" placeholder="Juan Pérez" className="w-full py-2 px-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm" />
            </div>
          </div>}
        {paymentMethod === 'spei' && <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-md">
            <p className="text-white mb-4">
              Realiza una transferencia SPEI a la siguiente cuenta:
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-white opacity-80">Banco:</span>
                <span className="text-white font-medium">BBVA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white opacity-80">Beneficiario:</span>
                <span className="text-white font-medium">
                  SPEC.MEET S.A. de C.V.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white opacity-80">CLABE:</span>
                <span className="text-white font-mono font-medium">
                  012 345 6789 0123 45
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white opacity-80">Referencia:</span>
                <span className="text-white font-mono font-medium">
                  SM-{Math.floor(Math.random() * 10000)}
                </span>
              </div>
            </div>
            <p className="text-sm text-white opacity-80">
              Tu reserva se confirmará una vez que recibamos tu pago.
            </p>
          </div>}
        <div className="mt-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input id="terms" name="terms" type="checkbox" className="h-4 w-4 focus:ring-white focus:ring-opacity-50 border-white border-opacity-30 rounded bg-white bg-opacity-10" />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-white">
                Acepto los{' '}
                <a href="#" className="text-white underline hover:opacity-80">
                  Términos y Condiciones
                </a>{' '}
                y la{' '}
                <a href="#" className="text-white underline hover:opacity-80">
                  Política de Privacidad
                </a>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Resumen de pago</h4>
        <div className="space-y-2 mb-3">
          <div className="flex justify-between">
            <span className="text-white">Subtotal</span>
            <span className="text-white">${calculateTotal()} MXN</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white">IVA (16%)</span>
            <span className="text-white">
              ${(calculateTotal() * 0.16).toFixed(2)} MXN
            </span>
          </div>
        </div>
        <div className="border-t border-white border-opacity-20 pt-2">
          <div className="flex justify-between">
            <span className="font-medium text-white">Total a pagar</span>
            <span className="font-semibold text-lg text-white">
              ${(calculateTotal() * 1.16).toFixed(2)} MXN
            </span>
          </div>
        </div>
      </div>
    </div>;
  const renderConfirmation = () => <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-full p-4">
          <CheckIcon className="h-12 w-12 text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">
          ¡Reserva Confirmada!
        </h3>
        <p className="text-white">Tu reserva ha sido procesada exitosamente.</p>
      </div>
      <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-lg max-w-sm mx-auto">
        <div className="mb-4">
          <h4 className="text-lg font-medium text-white mb-2">
            Detalles de la reserva
          </h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-white mr-2" />
              <span className="text-white">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-white mr-2" />
              <span className="text-white">
                {selectedTimeSlot} -{' '}
                {calculateEndTime(selectedTimeSlot, selectedDuration)}
              </span>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-lg font-medium text-white mb-2">
            Código de acceso
          </h4>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-md py-3 px-4">
            <span className="font-mono text-2xl font-bold text-white">
              {generateAccessCode()}
            </span>
          </div>
          <p className="text-sm text-white mt-2">
            Usa este código para acceder a la sala durante tu reserva
          </p>
        </div>
        <div>
          <p className="text-sm text-white">
            Hemos enviado todos los detalles a tu correo electrónico.
          </p>
        </div>
      </div>
    </div>;
  // Helper functions
  function calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + duration;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  function generateAccessCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  // Render the progress bar
  const renderProgressBar = () => {
    const steps = [{
      key: 'date',
      label: 'Fecha y Hora'
    }, {
      key: 'resources',
      label: 'Recursos'
    }, {
      key: 'payment',
      label: 'Pago'
    }, {
      key: 'confirmation',
      label: 'Confirmación'
    }];
    const currentStepIndex = steps.findIndex(step => step.key === currentStep);
    return <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => <Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStepIndex ? 'bg-white bg-opacity-30 text-white' : 'bg-white bg-opacity-10 text-white'}`}>
                  {index < currentStepIndex ? <CheckIcon className="h-5 w-5" /> : index + 1}
                </div>
                <div className={`text-xs mt-1 ${index <= currentStepIndex ? 'text-white' : 'text-white opacity-70'}`}>
                  {step.label}
                </div>
              </div>
              {index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${index < currentStepIndex ? 'bg-white bg-opacity-30' : 'bg-white bg-opacity-10'}`}></div>}
            </Fragment>)}
        </div>
      </div>;
  };
  const handlePayment = async () => {
    if (currentStep === 'payment') {
      // Mostrar indicador de carga
      setIsProcessing(true);
      try {
        // Crear objeto con datos de la reserva
        const bookingData = {
          date: selectedDate,
          startTime: selectedTimeSlot,
          duration: selectedDuration,
          beverages: selectedBeverages,
          attendees,
          totalAmount: calculateTotal() * 1.16,
          paymentMethod
        };
        // Si es tarjeta de crédito, procesar con Stripe
        if (paymentMethod === 'card') {
          // Simulación de procesamiento de pago
          setTimeout(() => {
            setCurrentStep('confirmation');
            setIsProcessing(false);
          }, 1500);
        }
        // Si es SPEI, generar referencia bancaria
        else if (paymentMethod === 'spei') {
          // Simulación de generación de referencia
          setTimeout(() => {
            setSpeiReference(`SM-${Math.floor(Math.random() * 10000)}`);
            setCurrentStep('confirmation');
            setIsProcessing(false);
          }, 1000);
        }
      } catch (error) {
        console.error('Error en el proceso de pago:', error);
        setPaymentError('Hubo un problema al procesar tu pago. Por favor intenta nuevamente.');
        setIsProcessing(false);
      }
    }
  };
  return <div className="w-full min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 bg-cover bg-center z-0" style={{
      backgroundImage: "url('https://uploadthingy.s3.us-west-1.amazonaws.com/mnx4A3B36Dy2nyF5i8QPC8/PHOTO-2025-02-03-12-44-43.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center center'
    }}></div>
      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Reservar Sala</h1>
          <p className="text-white mt-2">
            Selecciona tus preferencias para reservar el espacio.
          </p>
        </div>
        {renderProgressBar()}
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6">
          {currentStep === 'date' && renderDateSelection()}
          {currentStep === 'resources' && renderResourcesSelection()}
          {currentStep === 'payment' && renderPaymentSelection()}
          {currentStep === 'confirmation' && renderConfirmation()}
          {currentStep !== 'confirmation' && <div className="mt-8 flex justify-between">
              {currentStep !== 'date' ? <button type="button" onClick={handlePrevStep} className="px-4 py-2 border border-white border-opacity-30 rounded-md text-white hover:bg-white hover:bg-opacity-10 backdrop-blur-sm">
                  Atrás
                </button> : <div></div>}
              <button type="button" onClick={currentStep === 'payment' ? handlePayment : handleNextStep} disabled={isProcessing} className="px-6 py-2 bg-white bg-opacity-15 backdrop-blur-sm text-white rounded-md hover:bg-opacity-30 transition-all border border-white border-opacity-30">
                {isProcessing ? 'Procesando...' : currentStep === 'payment' ? 'Pagar' : 'Continuar'}
              </button>
            </div>}
          {currentStep === 'confirmation' && <div className="mt-8">
              <button type="button" onClick={() => navigate('/dashboard')} className="w-full px-6 py-2 bg-white bg-opacity-15 backdrop-blur-sm text-white rounded-md hover:bg-opacity-30 transition-all border border-white border-opacity-30">
                Ir a Mi Panel
              </button>
            </div>}
          {paymentError && <div className="mt-4 p-3 bg-red-500 bg-opacity-30 text-white rounded-md">
              {paymentError}
            </div>}
        </div>
      </div>
    </div>;
};
export default BookingPage;