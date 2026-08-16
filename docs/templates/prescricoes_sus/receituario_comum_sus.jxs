import React, { useState } from 'react';
import { Printer } from 'lucide-react';

export default function FichaInternacaoEvolucao() {
  const [dados, setDados] = useState({
    dataInternacao: '',
    diasInternacao: '',
    nome: '',
    idade: '',
    sexo: '',
    naturalidade: '',
    residencia: '',
    profissao: '',
    etilista: '',
    etilistaDetalhe: '',
    tabagista: '',
    tabagistaCT: '',
    alergiasLinha1: '',
    alergiasLinha2: '',
    hd1: '',
    hd2: '',
    hd3: '',
    hd4: '',
    hd5: '',
    hd6: '',
    hda: '',
    dataEvolucao: '',
    evolucao: '',
    aparelhos: '',
    exameFisico: '',
  });

  const handleChange = (campo, valor) => {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-3 font-sans text-black">
      {/* Barra superior de ações */}
      <div className="flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-xs font-bold transition-all shadow"
        >
          <Printer className="w-4 h-4" /> Imprimir / Gerar PDF
        </button>
      </div>

      {/* Folha Física Clínica */}
      <div className="bg-white border-2 border-black p-5 space-y-2 text-xs leading-normal">
        
        {/* Cabeçalho: Data de Internação e Dias */}
        <div className="grid grid-cols-12 items-center font-bold text-xs py-1 border-b border-black">
          <div className="col-span-6 flex items-center">
            <span className="whitespace-nowrap">Data de Internação:</span>
            <input
              type="text"
              placeholder="__ / __ / ______"
              value={dados.dataInternacao}
              onChange={(e) => handleChange('dataInternacao', e.target.value)}
              className="ml-2 w-36 border-b border-black outline-none bg-transparent font-mono text-center font-bold"
            />
          </div>
          <div className="col-span-1 text-center font-normal text-black">|</div>
          <div className="col-span-5 flex items-center justify-end">
            <span className="whitespace-nowrap">Dias de Internação:</span>
            <input
              type="text"
              value={dados.diasInternacao}
              onChange={(e) => handleChange('diasInternacao', e.target.value)}
              className="mx-2 w-20 border-b border-black outline-none bg-transparent font-mono text-center font-black"
            />
            <span>dias</span>
          </div>
        </div>

        {/* 1. Identificação */}
        <div className="border border-black">
          <div className="bg-neutral-300 px-2 py-0.5 font-bold text-[11px] border-b border-black">
            Identificação:
          </div>
          <div className="p-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Nome:</span>
              <input
                type="text"
                value={dados.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className="flex-1 border border-black px-2 py-0.5 outline-none font-bold uppercase"
              />
              <span className="font-semibold ml-2">Idade:</span>
              <input
                type="text"
                value={dados.idade}
                onChange={(e) => handleChange('idade', e.target.value)}
                className="w-14 border border-black px-1 py-0.5 text-center outline-none font-bold"
              />
              <span>anos</span>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-3 flex items-center gap-2">
                <span className="font-semibold">Sexo:</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dados.sexo === 'M'}
                    onChange={() => handleChange('sexo', dados.sexo === 'M' ? '' : 'M')}
                    className="w-3.5 h-3.5"
                  />
                  <span>M</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dados.sexo === 'F'}
                    onChange={() => handleChange('sexo', dados.sexo === 'F' ? '' : 'F')}
                    className="w-3.5 h-3.5"
                  />
                  <span>F</span>
                </label>
              </div>
              <div className="col-span-4 flex items-center gap-1">
                <span className="font-semibold">Naturalidade:</span>
                <input
                  type="text"
                  value={dados.naturalidade}
                  onChange={(e) => handleChange('naturalidade', e.target.value)}
                  className="flex-1 border border-black px-1.5 py-0.5 outline-none"
                />
              </div>
              <div className="col-span-5 flex items-center gap-1">
                <span className="font-semibold">Residência:</span>
                <input
                  type="text"
                  value={dados.residencia}
                  onChange={(e) => handleChange('residencia', e.target.value)}
                  className="flex-1 border border-black px-1.5 py-0.5 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Profissão:</span>
              <input
                type="text"
                value={dados.profissao}
                onChange={(e) => handleChange('profissao', e.target.value)}
                className="w-1/2 border border-black px-1.5 py-0.5 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Comorbidades e Alergias */}
        <div className="border border-black grid grid-cols-12 divide-x divide-black">
          <div className="col-span-6 flex flex-col">
            <div className="bg-neutral-300 px-2 py-0.5 font-bold text-[11px] border-b border-black">
              Comorbidades:
            </div>
            <div className="p-2 space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Etilista:</span>
                <label className="flex items-center gap-0.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dados.etilista === 'N'}
                    onChange={() => handleChange('etilista', dados.etilista === 'N' ? '' : 'N')}
                    className="w-3.5 h-3.5"
                  />
                  <span>N</span>
                </label>
                <label className="flex items-center gap-0.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dados.etilista === 'S'}
                    onChange={() => handleChange('etilista', dados.etilista === 'S' ? '' : 'S')}
                    className="w-3.5 h-3.5"
                  />
                  <span>S</span>
                </label>
                <input
                  type="text"
                  value={dados.etilistaDetalhe}
                  onChange={(e) => handleChange('etilistaDetalhe', e.target.value)}
                  className="flex-1 border border-black px-1 py-0.5 outline-none ml-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Tabagista:</span>
                <label className="flex items-center gap-0.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dados.tabagista === 'N'}
                    onChange={() => handleChange('tabagista', dados.tabagista === 'N' ? '' : 'N')}
                    className="w-3.5 h-3.5"
                  />
                  <span>N</span>
                </label>
                <label className="flex items-center gap-0.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dados.tabagista === 'S'}
                    onChange={() => handleChange('tabagista', dados.tabagista === 'S' ? '' : 'S')}
                    className="w-3.5 h-3.5"
                  />
                  <span>S</span>
                </label>
                <span className="font-semibold ml-1">CT:</span>
                <input
                  type="text"
                  value={dados.tabagistaCT}
                  onChange={(e) => handleChange('tabagistaCT', e.target.value)}
                  className="flex-1 border border-black px-1 py-0.5 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="col-span-6 flex flex-col">
            <div className="bg-neutral-300 px-2 py-0.5 font-bold text-[11px] border-b border-black">
              Alergias:
            </div>
            <div className="p-2 space-y-1.5 flex-1">
              <input
                type="text"
                value={dados.alergiasLinha1}
                onChange={(e) => handleChange('alergiasLinha1', e.target.value)}
                className="w-full border border-black px-1.5 py-0.5 outline-none"
              />
              <input
                type="text"
                value={dados.alergiasLinha2}
                onChange={(e) => handleChange('alergiasLinha2', e.target.value)}
                className="w-full border border-black px-1.5 py-0.5 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Hipóteses Diagnósticas */}
        <div className="border border-black">
          <div className="bg-neutral-300 px-2 py-0.5 font-bold text-[11px] border-b border-black">
            Hipóteses Diagnósticas:
          </div>
          <div className="p-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold w-5">(1)</span>
              <input
                type="text"
                value={dados.hd1}
                onChange={(e) => handleChange('hd1', e.target.value)}
                className="flex-1 border border-black px-1.5 py-0.5 outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold w-5">(4)</span>
              <input
                type="text"
                value={dados.hd4}
                onChange={(e) => handleChange('hd4', e.target.value)}
                className="flex-1 border border-black px-1.5 py-0.5 outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold w-5">(2)</span>
              <input
                type="text"
                value={dados.hd2}
                onChange={(e) => handleChange('hd2', e.target.value)}
                className="flex-1 border border-black px-1.5 py-0.5 outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold w-5">(5)</span>
              <input
                type="text"
                value={dados.hd5}
                onChange={(e) => handleChange('hd5', e.target.value)}
                className="flex-1 border border-black px-1.5 py-0.5 outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold w-5">(3)</span>
              <input
                type="text"
                value={dados.hd3}
                onChange={(e) => handleChange('hd3', e.target.value)}
                className="flex-1 border border-black px-1.5 py-0.5 outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold w-5">(6)</span>
              <input
                type="text"
                value={dados.hd6}
                onChange={(e) => handleChange('hd6', e.target.value)}
                className="flex-1 border border-black px-1.5 py-0.5 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. História da Doença Atual */}
        <div className="border border-black">
          <div className="bg-neutral-300 px-2 py-0.5 font-bold text-[11px] border-b border-black">
            História da Doença Atual:
          </div>
          <div className="p-2">
            <textarea
              rows={4}
              value={dados.hda}
              onChange={(e) => handleChange('hda', e.target.value)}
              className="w-full bg-transparent resize-none outline-none leading-6 font-sans text-xs bg-[linear-gradient(transparent_23px,#525252_24px)] [background-size:100%_24px]"
            />
          </div>
        </div>

        {/* 5. Evolução e Aparelhos */}
        <div className="border border-black grid grid-cols-12 divide-x divide-black">
          <div className="col-span-9 flex flex-col">
            <div className="bg-neutral-300 px-2 py-0.5 font-bold text-[11px] border-b border-black flex justify-between items-center">
              <span>Evolução:</span>
              <div className="flex items-center font-normal">
                <span>[</span>
                <input
                  type="text"
                  placeholder="__ / __ / ______"
                  value={dados.dataEvolucao}
                  onChange={(e) => handleChange('dataEvolucao', e.target.value)}
                  className="w-28 text-center bg-transparent outline-none font-mono text-[10px]"
                />
                <span>]</span>
              </div>
            </div>
            <div className="p-2 flex-1">
              <textarea
                rows={9}
                value={dados.evolucao}
                onChange={(e) => handleChange('evolucao', e.target.value)}
                className="w-full h-full bg-transparent resize-none outline-none leading-6 font-sans text-xs bg-[linear-gradient(transparent_23px,#525252_24px)] [background-size:100%_24px]"
              />
            </div>
          </div>

          <div className="col-span-3 flex flex-col">
            <div className="bg-neutral-300 px-2 py-0.5 font-bold text-[11px] border-b border-black">
              Aparelhos:
            </div>
            <div className="p-2 flex-1">
              <textarea
                rows={9}
                value={dados.aparelhos}
                onChange={(e) => handleChange('aparelhos', e.target.value)}
                className="w-full h-full bg-transparent resize-none outline-none leading-6 font-sans text-xs bg-[linear-gradient(transparent_23px,#525252_24px)] [background-size:100%_24px]"
              />
            </div>
          </div>
        </div>

        {/* 6. Exame Físico */}
        <div className="border border-black">
          <div className="bg-neutral-300 px-2 py-0.5 font-bold text-[11px] border-b border-black">
            Exame Físico:
          </div>
          <div className="p-2">
            <textarea
              rows={4}
              value={dados.exameFisico}
              onChange={(e) => handleChange('exameFisico', e.target.value)}
              className="w-full bg-transparent resize-none outline-none leading-6 font-sans text-xs bg-[linear-gradient(transparent_23px,#525252_24px)] [background-size:100%_24px]"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
