import React, { useState } from 'react';
import { Plus, Trash2, Printer } from 'lucide-react';

export default function PrescricaoHospitalar4Colunas() {
  const [paciente, setPaciente] = useState({
    nome: 'PACIENTE MODELO DA SILVA',
    dn: '04/08/1972',
    leito: 'UTI - 04',
    data: '22/11/2024',
  });

  const [linhas, setLinhas] = useState([
    { id: 1, conduta: 'DIETA ENTERAL PADRÃO', via: 'SNE', posologia: 'BIC 21 ML/H', aprazamento: '' },
    { id: 2, conduta: 'SF 0,9% 500 ML + KCL 10% 10 ML', via: 'EV', posologia: '24/24H', aprazamento: '' },
    { id: 3, conduta: 'DIPIRONA 1G + AD 10ML', via: 'EV', posologia: 'AGORA', aprazamento: '' },
    { id: 4, conduta: 'NORADRENALINA (4 AMP) + SG 5% 234 ML', via: 'EV', posologia: 'BIC ACM', aprazamento: '' },
    { id: 5, conduta: 'FENTANIL 50 MCG/ML (10 AMP) + SF 230 ML', via: 'EV', posologia: 'BIC ACM', aprazamento: '' },
    { id: 6, conduta: 'MIDAZOLAM 15 MG/3ML (5 AMP) + SF 235 ML', via: 'EV', posologia: 'BIC ACM', aprazamento: '' },
    { id: 7, conduta: 'CEFTRIAXONA 1G + SF 100 ML', via: 'EV', posologia: '08/08H', aprazamento: '' },
    { id: 8, conduta: 'ENOXAPARINA 40 MG', via: 'SC', posologia: '12/12H', aprazamento: '' },
    { id: 9, conduta: 'TRAMADOL 100 MG + SF 100 ML (SE DOR INTENSA)', via: 'EV', posologia: '4/4H ACM', aprazamento: '' },
    { id: 10, conduta: 'OMEPRAZOL 40 MG EV', via: 'EV', posologia: '24/24 HS', aprazamento: '' },
    { id: 11, conduta: 'ONDANSETRONA 8 MG (SE NÁUSEAS/VÔMITOS)', via: 'EV', posologia: '6/6 H SOS', aprazamento: '' },
    { id: 12, conduta: 'BROMOPRIDA 10 MG (SE NÁUSEAS REFRATÁRIAS)', via: 'EV', posologia: '8/8H SOS', aprazamento: '' },
    { id: 13, conduta: 'INSULINA REGULAR CONFORME HGT', via: 'SC', posologia: '6/6H', aprazamento: '' },
    { id: 14, conduta: 'GLICOSE 50% 40 ML SE HGT < 70 MG/DL (AVISAR PLANTONISTA!)', via: 'EV', posologia: 'SOS', aprazamento: '' },
    { id: 15, conduta: 'O2 EM CATETER NASAL 2 L/MIN SE SAT < 92%', via: 'EXT', posologia: 'CONTÍNUA', aprazamento: '' },
    { id: 16, conduta: 'MONITORIZAÇÃO MULTIPARAMÉTRICA CONTÍNUA', via: '-', posologia: 'CONTÍNUA', aprazamento: '' },
    { id: 17, conduta: 'CABECEIRA ELEVADA A 30º - 45º', via: '-', posologia: 'CONTÍNUO', aprazamento: '' },
    { id: 18, conduta: 'MUDANÇA DE DECÚBITO', via: 'EXT', posologia: '2/2H', aprazamento: '' },
  ]);

  const handleChange = (id, campo, valor) => {
    setLinhas(linhas.map(l => l.id === id ? { ...l, [campo]: valor } : l));
  };

  const adicionarLinha = () => {
    setLinhas([...linhas, { id: Date.now(), conduta: '', via: '', posologia: '', aprazamento: '' }]);
  };

  const removerLinha = (id) => {
    setLinhas(linhas.filter(l => l.id !== id));
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4 font-sans text-black">
      {/* Tabela Principal */}
      <div className="border-2 border-black bg-white">
        {/* Cabeçalho do Paciente */}
        <div className="border-b-2 border-black grid grid-cols-12 text-xs font-bold divide-x-2 divide-black">
          <div className="col-span-6 p-2 uppercase">
            <span>PACIENTE: </span>
            <input 
              type="text" 
              value={paciente.nome} 
              onChange={e => setPaciente({...paciente, nome: e.target.value})}
              className="font-bold uppercase outline-none bg-transparent w-3/4"
            />
          </div>
          <div className="col-span-3 p-2">
            <span>DN: </span>
            <input 
              type="text" 
              value={paciente.dn} 
              onChange={e => setPaciente({...paciente, dn: e.target.value})}
              className="outline-none bg-transparent w-20 font-mono"
            />
          </div>
          <div className="col-span-3 p-2">
            <span>DATA: </span>
            <input 
              type="text" 
              value={paciente.data} 
              onChange={e => setPaciente({...paciente, data: e.target.value})}
              className="outline-none bg-transparent w-24 font-mono"
            />
          </div>
        </div>

        {/* Títulos das 4 Colunas */}
        <div className="grid grid-cols-12 text-xs font-black uppercase tracking-wider border-b-2 border-black bg-slate-100 text-center divide-x-2 divide-black">
          <div className="col-span-6 p-2 text-left pl-3">MEDICAMENTO / CONDUTA</div>
          <div className="col-span-1 p-2">VIA</div>
          <div className="col-span-2 p-2">POSOLOGIA</div>
          <div className="col-span-3 p-2">APRAZAMENTO</div>
        </div>

        {/* Grade de Linhas */}
        <div className="divide-y divide-black text-xs">
          {linhas.map((l, index) => (
            <div key={l.id} className="grid grid-cols-12 divide-x-2 divide-black items-stretch group hover:bg-slate-50 min-h-[28px]">
              {/* Coluna 1: Conduta + Botão de exclusão */}
              <div className="col-span-6 flex items-center px-2 py-1 relative">
                <button 
                  onClick={() => removerLinha(l.id)} 
                  className="opacity-0 group-hover:opacity-100 text-red-600 mr-1 print:hidden transition-opacity"
                  title="Remover linha"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  value={l.conduta}
                  onChange={e => handleChange(l.id, 'conduta', e.target.value)}
                  placeholder="Descreva o item/conduta..."
                  className="w-full bg-transparent font-semibold uppercase outline-none text-[11px]"
                />
              </div>

              {/* Coluna 2: VIA */}
              <div className="col-span-1 flex items-center justify-center p-1">
                <input
                  type="text"
                  value={l.via}
                  onChange={e => handleChange(l.id, 'via', e.target.value)}
                  placeholder="-"
                  className="w-full text-center bg-transparent font-bold uppercase outline-none text-[11px]"
                />
              </div>

              {/* Coluna 3: POSOLOGIA */}
              <div className="col-span-2 flex items-center px-2 py-1">
                <input
                  type="text"
                  value={l.posologia}
                  onChange={e => handleChange(l.id, 'posologia', e.target.value)}
                  placeholder="-"
                  className="w-full text-center bg-transparent font-semibold uppercase outline-none text-[11px]"
                />
              </div>

              {/* Coluna 4: APRAZAMENTO (Grade de Enfermagem) */}
              <div className="col-span-3 grid grid-cols-6 divide-x divide-black bg-white">
                <div className="h-full"></div>
                <div className="h-full"></div>
                <div className="h-full"></div>
                <div className="h-full"></div>
                <div className="h-full"></div>
                <div className="h-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-between items-center print:hidden">
        <button
          onClick={adicionarLinha}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-black text-xs font-bold border border-black rounded transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Adicionar Linha
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-5 py-2 bg-black text-white text-xs font-bold rounded shadow hover:bg-slate-800 transition-all"
        >
          <Printer className="w-4 h-4" /> Imprimir Prescrição
        </button>
      </div>
    </div>
  );
}
