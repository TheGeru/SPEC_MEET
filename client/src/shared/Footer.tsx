import React from 'react';
import { Link } from 'react-router-dom';
const Footer: React.FC = () => {
  return <footer className="bg-background">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <div className='h-10 w-40 relative overflow-hidden flex items-center  -ml-6'>
                <img src="/MEET.svg" alt=".MEET" className="h-25 w-auto object-contain  brightness-0 invert" />
              </div>
            </div>
            <p className="text-secondary/40 text-sm">
              La solución integral para la gestión inteligente de salas de
              juntas.
            </p>
          </div>
          
          <div>
            <h3 className="text-secondary/40 font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms-and-conditions" className="text-secondary/40 hover:text-secondary text-sm ">
                  Términos y Condiciones
                </Link>
              </li>
              {/*  <li>
                <Link to="#" className="text-secondary/40 hover:text-secondary text-xs tracking-widest">
                  Política de Privacidad
                </Link>
              </li>*/}
              {/*  <li>
                <Link to="#" className="text-secondary/40 hover:text-secondary text-xs tracking-widest">
                  Política de Cookies
                </Link>
              </li>*/}
            </ul>
          </div>
          <div>
            <h3 className="text-secondary/40 font-medium mb-4">Contacto</h3>
            <p className="text-secondary/45 text-sm">
            <a href="mailto:spec.meet@gmail.com" className=" hover:text-secondary text-sm">
              spec.meet@gmail.com
            </a>
              <br />
              +52 1 446 117 0931
              <br />
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <p className=" text-secondary text-sm text-center">
            &copy; {new Date().getFullYear()} .MEET Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;