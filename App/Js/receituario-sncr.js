/* MedUnity — SNCR API v3 adapter (admin-only test gate)
 * Endpoints and validation are based on the supplied Anvisa SNCR API Manual,
 * 3rd edition (September 2026). Requires the companion Cloudflare Worker.
 * Never use this test gate as a substitute for institutional authentication.
 */
(() => {
  "use strict";
  const API = String(window.MEDUNITY_SNCR_WORKER_URL || "").replace(/\/$/, "");
  const ADMIN_KEY = "medunity_sncr_test_admin_key";
  const SESSION_KEY = "medunity_sncr_test_session";
  const TYPES = [
    { code:"NRA", label:"Notificação de Receita A (amarela)", group:"notification" },
    { code:"NRB", label:"Notificação de Receita B (azul)", group:"notification" },
    { code:"NRB2", label:"Notificação de Receita B2", group:"notification" },
    { code:"NRR", label:"Notificação de Receita Especial — retinoides", group:"notification" },
    { code:"NRT", label:"Notificação de Receita — talidomida", group:"notification" },
    { code:"RCE", label:"Receita de Controle Especial", group:"special" },
    { code:"RET", label:"Receita Sujeita à Retenção", group:"special" }
  ];
  const el = id => document.getElementById(id);
  let adminUnlocked = false;
  let busy = false;

  function status(message, kind="") {
    const target=el("sncrStatus");
    if(!target)return;
    target.className="status"+(kind?" "+kind:"");
    target.replaceChildren();
    const dot=document.createElement("span");dot.className="dot";target.append(dot,document.createTextNode(message));
  }
  function button(label, id, className="btn secondary", handler=null) {
    const b=document.createElement("button");b.type="button";b.id=id;b.className=className;b.textContent=label;
    if(handler)b.addEventListener("click",handler);return b;
  }
  function field(label,id,placeholder="",type="text") {
    const wrap=document.createElement("div"), lab=document.createElement("label"), input=document.createElement("input");
    lab.htmlFor=id;lab.textContent=label;input.id=id;input.type=type;input.placeholder=placeholder;input.autocomplete="off";
    wrap.append(lab,input);return wrap;
  }
  function addFields() {
    const card=el("sncrCard");if(!card||el("sncrAdminLock"))return;
    // Keep the operational panel out of the public-facing view until explicitly opened.
    card.hidden=true;
    const publicPanel=el("sncrComingSoon");
    if(publicPanel&&!el("sncrAdminEntryBtn")){
      const entry=document.createElement("button");
      entry.type="button";entry.id="sncrAdminEntryBtn";entry.className="btn secondary";
      entry.textContent="🔒 Acesso administrativo de teste";
      entry.addEventListener("click",()=>{
        card.hidden=false;
        entry.textContent="Área de teste aberta — autenticação administrativa obrigatória";
        entry.disabled=true;
        card.scrollIntoView({behavior:"smooth",block:"start"});
      });
      const actions=document.createElement("div");actions.className="actions";actions.append(entry);
      publicPanel.append(actions);
    }
    const notice=card.querySelector(".notice");
    const lock=document.createElement("div");lock.id="sncrAdminLock";lock.className="notice";
    lock.innerHTML='<span aria-hidden="true">🔒</span> <strong>Teste restrito ao administrador</strong> — a área SNCR só abre com a chave administrativa de teste.';
    notice?.after(lock);
    const configNotice=document.createElement("div");
    configNotice.id="sncrConfigNotice";
    configNotice.className="notice";
    configNotice.setAttribute("role","status");
    configNotice.textContent=API
      ? "Integração SNCR configurada para teste. A comunicação real ainda depende da validação do backend, das credenciais oficiais e do fluxo de autenticação."
      : "Integração SNCR em configuração. Os comandos permanecem indisponíveis até a URL oficial do Worker ser configurada e validada.";
    lock.after(configNotice);
    const grid=card.querySelector(".form-grid");
    if(grid) {
      const extra=document.createElement("div");extra.id="sncrExtraFields";extra.className="form-grid full";
      extra.style.marginTop="12px";
      extra.append(
        field("Conselho profissional (ex.: CRM)","sncrCouncil","CRM"),
        field("UF do conselho","sncrUF","GO"),
        field("Número do documento profissional","sncrDocument","CRM / registro"),
        field("CNPJ da plataforma de prescrição","sncrCNPJ","00.000.000/0000-00")
      );
      grid.after(extra);
    }
    const actions=card.querySelector(".actions");
    if(actions) {
      actions.replaceChildren();
      actions.append(button("🔓 Desbloquear (administrador)","sncrUnlockBtn","btn primary",unlockAdmin));
      actions.append(button("Entrar no SNCR","sncrLoginBtn","btn secondary",startLogin));
      actions.append(button("Solicitar numeração","sncrPrepareBtn","btn gold",requestNumbers));
      actions.append(button("Encerrar sessão","sncrLogoutBtn","btn secondary",logout));
      if(!API) actions.querySelectorAll("button").forEach(b=>{b.disabled=true;b.title="Aguardando configuração e validação da URL do Worker.";});
    }
    const qty=el("sncrQuantity");if(qty){qty.min="10";qty.max="50";qty.step="1";qty.value="10";}
    el("sncrType")?.addEventListener("change",updateFields);
    updateFields();
  }
  function renderTypes(){
    const select=el("sncrType");if(!select)return;
    select.replaceChildren(new Option("Selecione o tipo",""));
    TYPES.forEach(t=>select.add(new Option(t.label,t.code)));
  }
  function setUnlocked(value){
    adminUnlocked=value;
    const lock=el("sncrAdminLock"), extra=el("sncrExtraFields");
    const type=el("sncrType"), qty=el("sncrQuantity");
    if(lock)lock.hidden=value;
    if(extra)extra.hidden=!value;
    if(type)type.disabled=!value;
    if(qty)qty.disabled=!value;
    ["sncrLoginBtn","sncrPrepareBtn","sncrLogoutBtn"].forEach(id=>{if(el(id))el(id).disabled=!value;});
    if(el("sncrUnlockBtn"))el("sncrUnlockBtn").textContent=value?"🔓 Administrador autorizado":"🔒 Desbloquear (administrador)";
    if(!value)status("Área SNCR bloqueada. Acesso de teste exclusivo do administrador.");
  }
  async function api(path, options={}) {
    if(!API)throw new Error("Configure window.MEDUNITY_SNCR_WORKER_URL com a URL do Worker.");
    const key=sessionStorage.getItem(ADMIN_KEY)||"";
    const headers=new Headers(options.headers||{});
    headers.set("X-MedUnity-Admin-Key",key);
    if(options.body && typeof options.body!=="string"){headers.set("Content-Type","application/json");options.body=JSON.stringify(options.body);}
    const response=await fetch(API+path,{...options,headers,cache:"no-store",credentials:"omit"});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data?.error?.message||data?.message||("HTTP "+response.status));
    return data;
  }
  async function unlockAdmin(){
    if(busy)return;
    const current=sessionStorage.getItem(ADMIN_KEY);
    const key=window.prompt("Chave administrativa temporária para o teste SNCR:");
    if(key===null)return;
    if(!key.trim()){status("Informe a chave administrativa de teste.");return;}
    busy=true;
    try{
      sessionStorage.setItem(ADMIN_KEY,key.trim());
      const result=await api("/admin/session");
      setUnlocked(true);
      status("Acesso administrativo de teste confirmado · ambiente "+(result.environment||"não informado")+".", "ok");
      const pending=sessionStorage.getItem("medunity_sncr_pending_callback");
      if(pending){
        const callback=JSON.parse(pending);
        await completeCallback(callback.session_id,callback.state);
      } else if(sessionStorage.getItem(SESSION_KEY)) {
        status("Administrador autorizado. Sessão SNCR temporária presente nesta aba.","ok");
      }
    }catch(e){
      sessionStorage.removeItem(ADMIN_KEY);setUnlocked(false);
      status("Acesso negado: "+e.message,"err");
    }finally{busy=false;}
  }
  async function startLogin(){
    if(!adminUnlocked)return status("🔒 Desbloqueie com a chave administrativa primeiro.");
    try{
      const result=await api("/auth/login",{method:"POST",body:{}});
      if(!result.authorization_url)throw new Error("O serviço não retornou a URL de autenticação.");
      window.location.assign(result.authorization_url);
    }catch(e){status("Não foi possível iniciar autenticação SNCR: "+e.message,"err");}
  }
  async function processCallback(){
    const params=new URLSearchParams(window.location.search);
    const sessionId=params.get("session_id"),state=params.get("state");
    const providerError=params.get("error");
    const hasCallbackParams=params.has("session_id")||params.has("state")||params.has("error");
    if(!hasCallbackParams)return;
    // Strip one-use values and provider errors from the address bar before any network request.
    params.delete("session_id");params.delete("state");params.delete("error");params.delete("error_description");
    const query=params.toString();
    history.replaceState({},document.title,location.pathname+(query?"?"+query:"")+location.hash);
    if(providerError){
      sessionStorage.removeItem("medunity_sncr_pending_callback");
      status("A autenticação SNCR não foi concluída pelo provedor. Inicie novamente quando estiver pronto.","warn");
      return;
    }
    if(!sessionId||!state){
      status("Retorno incompleto do SNCR: faltam os parâmetros de sessão. Não foi feita nenhuma troca de token.","err");
      return;
    }
    if(!sessionStorage.getItem(ADMIN_KEY)){
      status("Retorno do SNCR recebido, mas a área está bloqueada. Desbloqueie como administrador para concluir o teste.","warn");
      sessionStorage.setItem("medunity_sncr_pending_callback",JSON.stringify({session_id:sessionId,state}));
      return;
    }
    await completeCallback(sessionId,state);
  }
  async function completeCallback(sessionId,state){
    status("Validando retorno e trocando a sessão de uso único…");
    const result=await api("/auth/callback",{method:"POST",body:{session_id:sessionId,state}});
    if(!result.session_id)throw new Error("O serviço não retornou uma sessão interna.");
    sessionStorage.setItem(SESSION_KEY,result.session_id);
    sessionStorage.removeItem("medunity_sncr_pending_callback");
    status("Autenticação SNCR concluída. Confira a identidade/permissão ao solicitar numeração.","ok");
  }
  async function requestNumbers(){
    if(!adminUnlocked)return status("🔒 Desbloqueie com a chave administrativa primeiro.");
    const type=el("sncrType")?.value;
    if(!type)return status("Selecione o tipo de receituário.");
    const session_id=sessionStorage.getItem(SESSION_KEY);
    if(!session_id)return status("Autentique-se no SNCR antes de solicitar numeração.");
    const common={
      conselho:el("sncrCouncil")?.value.trim(),
      uf:el("sncrUF")?.value.trim().toUpperCase(),
      documento:el("sncrDocument")?.value.trim(),
      session_id
    };
    if(!common.conselho||!common.uf||!common.documento)return status("Preencha conselho, UF e número do documento profissional.");
    const qty=Number(el("sncrQuantity")?.value);
    if(type==="RCE"||type==="RET"){
      const cnpj=el("sncrCNPJ")?.value.trim();
      if(!cnpj)return status("Informe o CNPJ da plataforma de prescrição.");
      try{
        const data=await api("/numeracoes/receita-especial-retencao",{method:"POST",body:{...common,tipo:type,cnpj}});
        status("Resposta SNCR: "+JSON.stringify(data),"ok");
      }catch(e){status("SNCR: "+e.message,"err");}
    }else{
      if(!Number.isInteger(qty)||qty<10||qty>50)return status("A quantidade deve ser um inteiro entre 10 e 50.");
      try{
        const data=await api("/numeracoes/notificacao-receita",{method:"POST",body:{...common,receita:type,quantidade:qty}});
        status("Resposta SNCR: "+JSON.stringify(data),"ok");
      }catch(e){status("SNCR: "+e.message,"err");}
    }
  }
  function updateFields(){
    const type=el("sncrType")?.value;
    const qtyWrap=el("sncrQuantity")?.closest("div");
    const cnpj=el("sncrCNPJ")?.closest("div");
    if(qtyWrap)qtyWrap.hidden=Boolean(type==="RCE"||type==="RET");
    if(cnpj)cnpj.hidden=!(type==="RCE"||type==="RET");
  }
  function logout(){
    sessionStorage.removeItem(SESSION_KEY);
    status("Sessão SNCR local encerrada. Isso não cancela receitas ou numerações emitidas.");
  }
  async function init(){
    renderTypes();addFields();setUnlocked(false);
    if(!API){
      status("Módulo em configuração: URL do Worker ainda não definida. Nenhuma chamada ao SNCR será realizada.");
      return;
    }
    try{await processCallback();}catch(e){status("Erro no retorno de autenticação: "+e.message,"err");}
    if(sessionStorage.getItem(ADMIN_KEY)){
      try{await api("/admin/session");setUnlocked(true);}catch{sessionStorage.removeItem(ADMIN_KEY);setUnlocked(false);}
    }
    const pending=sessionStorage.getItem("medunity_sncr_pending_callback");
    if(pending&&adminUnlocked){
      try{const p=JSON.parse(pending);await completeCallback(p.session_id,p.state);}catch(e){status("Não foi possível concluir o callback pendente: "+e.message,"err");}
    }
    updateFields();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
