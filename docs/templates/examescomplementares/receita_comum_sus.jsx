import React, { useState } from 'react';
import { Plus, Trash2, Printer, CheckCircle2 } from 'lucide-react';

export default function ReceituarioSUSComum() {
  const [unidade, setUnidade] = useState({
    municipio: 'PREFEITURA MUNICIPAL DE GOIÂNIA',
    secretaria: 'SECRETARIA MUNICIPAL DE SAÚDE',
    estabelecimento: 'CENTRO DE SAÚDE DA FAMÍLIA (CSF) / UBS VILA NOVA',
    cnes: '1234567',
  });

  const [paciente, setPaciente] = useState({
    nome: '',
    cns: '', // Cartão Nacional de Saúde
    endereco: '',
    dataNascimento: '',
  });

  const [medicamentos, setMedicamentos] = useState([
    {
      id: 1,
      nome: 'AMOXICILINA 500 MG',
      quantidade: '21 cápsulas',
      uso: 'Tomar 1 cápsula via oral de 8 em 8 horas durante 7 dias.',
      tipoUso: 'USO ORAL',
    },
    {
      id: 2,
      nome: 'PARACETAMOL 500 MG',
      quantidade: '10 comprimidos',
      uso: 'Tomar 1 comprimido via oral até de 6/6 horas se dor ou febre.',
      tipoUso: 'USO ORAL',
    },
  ]);

  const [novoMed, setNovoMed] = useState({
    nome: '',
    quantidade: '',
    uso: '',
    tipoUso: 'USO ORAL',
  });

  const adicionarMedicamento = (e) => {
    e.preventDefault();
    if (!novoMed.nome.trim()) return;
    setMedicamentos([...medicamentos, { ...novoMed, id: Date.now() }]);
    setNovoMed({ nome: '', quantidade: '', uso: '', tipoUso: 'USO ORAL' });
  };

  const removerMedicamento = (id) => {
    setMedicamentos(medicamentos.filter((m) => m.id !== id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-4 font-sans text-neutral-900">
      {/* Botões de Ação */}
      <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200 print:hidden">
        <span className="text-xs font-semibold text-slate-700">
          Receituário Padrão Ambulatorial — SUS
        </span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all shadow"
        >
          <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
        </button>
      </div>

      {/* Card: Formulário para Adicionar Medicamento */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm print:hidden">
        <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          + Adicionar Medicamento (Denominação Comum Brasileira)
        </p>
        <form onSubmit={adicionarMedicamento} className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-6">
              <input
                type="text"
                placeholder="Medicamento / Princípio Ativo (Ex: Dipirona 500mg/mL)"
                value={novoMed.nome}
                onChange={(e) => setNovoMed({ ...novoMed, nome: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                required
              />
            </div>
            <div className="md:col-span-3">
              <input
                type="text"
                placeholder="Qtd (Ex: 01 frasco)"
                value={novoMed.quantidade}
                onChange={(e) => setNovoMed({ ...novoMed, quantidade: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3">
              <select
                value={novoMed.tipoUso}
                onChange={(e) => setNovoMed({ ...novoMed, tipoUso: e.target.value })}
                className="w-full text-xs px-2 py-2 border rounded-lg outline-none bg-white font-semibold"
              >
                <option value="USO ORAL">USO ORAL</option>
                <option value="USO TÓPICO">USO TÓPICO</option>
                <option value="USO INALATÓRIO">USO INALATÓRIO</option>
                <option value="USO RETAL">USO RETAL</option>
                <option value="USO PARENTERAL">USO PARENTERAL</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Posologia / Instruções de Uso..."
              value={novoMed.uso}
              onChange={(e) => setNovoMed({ ...novoMed, uso: e.target.value })}
              className="flex-1 text-xs px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" /> Incluir
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* CORPO DA RECEITA DO SUS (MODELO PARA IMPRESSÃO EM FOLHA A4/A5)          */}
      {/* ========================================================================= */}
      <div className="border-2 border-neutral-800 bg-white p-6 space-y-4 min-h-[620px] flex flex-col justify-between text-xs">
        
        {/* CABEÇALHO INSTITUCIONAL OFICIAL COM LOGOS */}
        <div className="border-b-2 border-neutral-800 pb-3">
          <div className="flex justify-between items-center gap-4">
            
            {/* Logo Oficial do SUS (Vetor SVG) */}
            <div className="flex items-center gap-2">
              <svg className="h-10 w-auto" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Cruz Estilizada do SUS */}
                <rect x="2" y="18" width="16" height="34" rx="2" fill="#005CA9" />
                <rect x="18" y="2" width="34" height="16" rx="2" fill="#005CA9" />
                <rect x="18" y="52" width="34" height="16" rx="2" fill="#005CA9" />
                <rect x="52" y="18" width="16" height="34" rx="2" fill="#005CA9" />
                {/* Tipografia SUS */}
                <text x="75" y="48" fill="#005CA9" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="38" letterSpacing="-1">
                  SUS
                </text>
              </svg>
            </div>

            {/* Identificação do Município / Unidade de Saúde */}
            <div className="text-center flex-1 space-y-0.5">
              <p className="font-bold text-[11px] text-neutral-800 tracking-wider">
                {unidade.municipio}
              </p>
              <p className="font-semibold text-[10px] text-neutral-700">
                {unidade.secretaria}
              </p>
              <p className="font-black text-[11px] text-blue-900 uppercase">
                {unidade.estabelecimento}
              </p>
              <p className="text-[9px] text-neutral-500 font-mono">
                CNES: {unidade.cnes}
              </p>
            </div>

            {/* Logo Oficial do Ministério da Saúde / Governo Federal (Vetor SVG) */}
            <div className="flex flex-col items-end text-right">
              <div className="flex items-center gap-1.5">
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">Ministério da</span>
                  <span className="text-[11px] font-black text-blue-900 uppercase tracking-tighter">Saúde</span>
                </div>
                {/* Brasão / Símbolo Nacional Estilizado */}
                <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="46" stroke="#005CA9" strokeWidth="6" fill="#F8FAFC" />
                  <path d="M50 15 L58 38 L83 38 L62 53 L70 77 L50 62 L30 77 L38 53 L17 38 L42 38 Z" fill="#005CA9" />
                  <circle cx="50" cy="48" r="10" fill="#FDC82F" />
                </svg>
              </div>
              <span className="text-[8px] font-semibold text-neutral-500 mt-0.5 tracking-wider">GOVERNO FEDERAL</span>
            </div>

          </div>

          <div className="text-center font-bold text-xs uppercase tracking-widest border-t border-dashed border-neutral-400 mt-2.5 pt-1.5">
            RECEITUÁRIO AMBULATORIAL
          </div>
        </div>

        {/* IDENTIFICAÇÃO DO USUÁRIO / PACIENTE */}
        <div className="border border-neutral-700 p-2.5 space-y-1.5 bg-neutral-50/50 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-bold">PACIENTE:</span>
            <input
              type="text"
              placeholder="NOME COMPLETO DO PACIENTE"
              value={paciente.nome}
              onChange={(e) => setPaciente({ ...paciente, nome: e.target.value })}
              className="flex-1 border-b border-neutral-600 bg-transparent outline-none font-bold uppercase"
            />
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-7 flex items-center gap-1.5">
              <span className="font-bold">CARTÃO SUS (CNS):</span>
              <input
                type="text"
                placeholder="000 0000 0000 0000"
                value={paciente.cns}
                onChange={(e) => setPaciente({ ...paciente, cns: e.target.value })}
                className="flex-1 border-b border-neutral-600 bg-transparent outline-none font-mono text-[11px]"
              />
            </div>
            <div className="col-span-5 flex items-center justify-end gap-1.5">
              <span className="font-bold">DATA NASC:</span>
              <input
                type="text"
                placeholder="__ / __ / ______"
                value={paciente.dataNascimento}
                onChange={(e) => setPaciente({ ...paciente, dataNascimento: e.target.value })}
                className="w-24 border-b border-neutral-600 bg-transparent outline-none font-mono text-center text-[11px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold">ENDEREÇO:</span>
            <input
              type="text"
              placeholder="Rua, número, bairro e município"
              value={paciente.endereco}
              onChange={(e) => setPaciente({ ...paciente, endereco: e.target.value })}
              className="flex-1 border-b border-neutral-600 bg-transparent outline-none"
            />
          </div>
        </div>

        {/* CORPO DE ITENS PRESCRITOS */}
        <div className="flex-1 space-y-4 py-2">
          {medicamentos.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs italic">
              Nenhum medicamento prescrito. Preencha o formulário acima para adicionar itens.
            </div>
          ) : (
            medicamentos.map((item, index) => (
              <div key={item.id} className="group relative border-l-2 border-neutral-800 pl-3 py-0.5">
                <div className="flex justify-between items-baseline">
                  <div className="font-bold text-xs uppercase">
                    <span>{index + 1}. </span>
                    <span>{item.nome}</span>
                    <span className="text-[10px] text-neutral-500 font-normal ml-2">({item.tipoUso})</span>
                  </div>
                  <div className="font-bold text-xs">
                    -------------------- {item.quantidade}
                  </div>
                </div>
                <p className="text-[11px] text-neutral-700 mt-0.5 pl-4 leading-relaxed">
                  Orientação: {item.uso}
                </p>
                <button
                  onClick={() => removerMedicamento(item.id)}
                  className="absolute right-0 top-0 text-red-500 opacity-0 group-hover:opacity-100 print:hidden transition-opacity"
                  title="Remover medicamento"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* RODAPÉ: DATA, ASSINATURA E VALIDADE DISPENSAÇÃO FARMÁCIA POPULAR / SUS */}
        <div className="border-t-2 border-neutral-800 pt-4 space-y-6">
          <div className="grid grid-cols-12 items-end">
            <div className="col-span-5 text-left text-[11px] space-y-1">
              <p>Goiânia - GO,</p>
              <p className="font-mono font-bold">
                Data: {new Date().toLocaleDateString('pt-BR')}
              </p>
              <p className="text-[9px] text-neutral-500">
                * Válido por 30 dias em todo território nacional.
              </p>
            </div>

            <div className="col-span-7 text-center">
              <div className="border-b border-neutral-800 mb-1 w-4/5 mx-auto"></div>
              <p className="font-bold text-[11px] uppercase">
                Dr. Delyone de Paula Canedo Filho
              </p>
              <p className="text-[10px] text-neutral-600">
                Médico da Família e Comunidade • CRM/GO 000000
              </p>
            </div>
          </div>

          <div className="border border-neutral-400 p-1.5 text-center text-[9px] text-neutral-500 uppercase tracking-tight">
            ESTE MEDICAMENTO FOI PRESCRITO PELA SUA DENOMINAÇÃO COMUM BRASILEIRA (DCB) CONFORME LEI FEDERAL Nº 9.787/99
          </div>
        </div>

      </div>
    </div>
  );
}
