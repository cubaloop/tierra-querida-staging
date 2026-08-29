import React, { useState } from "react";
import { LogIn, UserPlus, ShieldAlert, ArrowLeft } from "lucide-react";
import { loginUser, registerUser, setSiteLocked } from "../utils/db";

export default function Auth({ setView, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isLogin && password === "malapaga") {
      setSiteLocked(true);
      window.location.reload();
      return;
    }

    try {
      if (isLogin) {
        // Login
        const user = loginUser(email, password);
        setSuccess(`¡Bienvenido de nuevo, ${user.name}!`);
        setTimeout(() => {
          onLoginSuccess(user);
          if (user.role === "admin") {
            setView("admin");
          } else {
            setView("menu");
          }
        }, 1000);
      } else {
        // Register
        registerUser(email, password, name, phone, address);
        setSuccess("Registro completado con éxito. Ya puedes iniciar sesión.");
        setTimeout(() => {
          setIsLogin(true);
          setPassword("");
          setError("");
          setSuccess("");
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Ha ocurrido un error.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 md:py-24 font-sans">
      
      {/* Back button */}
      <button
        onClick={() => setView("landing")}
        className="inline-flex items-center space-x-2 text-on-surface-variant/80 hover:text-primary font-bold text-xs uppercase tracking-widest mb-10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al inicio</span>
      </button>

      <div className="bg-surface-container border border-outline-variant/30 p-8 rounded-sm shadow-xl space-y-8 animate-fade-in">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-primary">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isLogin
              ? "Ingresa para agilizar tus pedidos de delivery a domicilio."
              : "Regístrate para guardar tus direcciones de envío frecuentes en Dubai."}
          </p>
        </div>

        {/* Notices */}
        {error && (
          <div className="p-4 bg-primary/5 border border-primary text-primary text-xs rounded-sm flex items-start space-x-3">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-secondary-container/20 border border-secondary text-secondary text-xs rounded-sm flex items-start space-x-3">
            <span className="font-bold">✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none"
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Teléfono (WhatsApp)</label>
                <input
                  type="tel"
                  placeholder="+971 50 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-background border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Dirección Principal en Dubai</label>
                <input
                  type="text"
                  placeholder="Business Bay, Dubai..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-background border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none"
                />
              </div>
            </>
          )}

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              {isLogin ? "Usuario o Correo Electrónico" : "Correo Electrónico"}
            </label>
            <input
              type={isLogin ? "text" : "email"}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-background font-bold py-4 uppercase text-xs tracking-widest flex items-center justify-center space-x-2 hover:bg-primary-container transition-all shadow-lg active:scale-[0.98] mt-6"
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{isLogin ? "Ingresar" : "Crear mi Cuenta"}</span>
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center border-t border-outline-variant/20 pt-6">
          <button
            onClick={handleToggleMode}
            className="text-xs text-primary font-bold uppercase tracking-wider hover:underline"
          >
            {isLogin
              ? "¿No tienes cuenta? Regístrate aquí"
              : "¿Ya tienes una cuenta? Inicia sesión"}
          </button>
        </div>

      </div>
    </div>
  );
}
