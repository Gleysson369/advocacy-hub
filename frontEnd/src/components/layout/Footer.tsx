export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-6 mt-auto">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Lado Esquerdo: Copyright */}
        <div className="text-sm text-slate-500">
          © {new Date().getFullYear()} <span className="font-bold text-slate-900 uppercase">LexOffice</span>. 
          Todos os direitos reservados.
        </div>

        {/* Lado Direito: Info e Status */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-slate-600">Sistema Online</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 hover:text-[#d99117] cursor-pointer transition-colors">
            Suporte: (62) 98546-0349
          </span>
          <span className="text-slate-300">|</span>
          <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-mono text-slate-400">
            v1.0.0
          </span>
        </div>

      </div>
    </footer>
  );
}