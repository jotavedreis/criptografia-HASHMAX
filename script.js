// ─── Matrix Rain ────────────────────────────────────────────────────────────
(function(){
  const c=document.getElementById('matrix-bg');
  const ctx=c.getContext('2d');
  function resize(){c.width=innerWidth;c.height=innerHeight}
  resize();window.addEventListener('resize',resize);
  const chars='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEF0123456789<>{}[]|/\\';
  let cols=Math.floor(c.width/16);
  let drops=Array(cols).fill(1);
  setInterval(()=>{
    cols=Math.floor(c.width/16);
    if(drops.length<cols)drops=[...drops,...Array(cols-drops.length).fill(1)];
    ctx.fillStyle='rgba(5,5,5,0.05)';
    ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='#00ff41';
    ctx.font='14px "Fira Code",monospace';
    for(let i=0;i<cols;i++){
      const ch=chars[Math.floor(Math.random()*chars.length)];
      ctx.fillText(ch,i*16,drops[i]*16);
      if(drops[i]*16>c.height&&Math.random()>.975)drops[i]=0;
      drops[i]++;
    }
  },50);
})();

// ─── History ─────────────────────────────────────────────────────────────────
let history=[];
try{history=JSON.parse(localStorage.getItem('hashmax_history')||'[]')}catch(e){}

function saveHistory(){localStorage.setItem('hashmax_history',JSON.stringify(history))}

function addHistory(op,algo,result){
  history.push({id:Date.now()+Math.random(),operation:op,algorithm:algo,result,timestamp:new Date().toISOString()});
  saveHistory();renderHistory();
}

function renderHistory(){
  const body=document.getElementById('history-body');
  if(!history.length){body.innerHTML='<div class="history-empty">Ainda não há operações</div>';return}
  body.innerHTML=[...history].reverse().map(h=>`
    <div class="h-item">
      <div class="h-item-top">
        <div><div class="h-op">${h.operation}</div><div class="h-algo">${h.algorithm}</div></div>
        <button class="h-copy" onclick="copyText(${JSON.stringify(h.result)})" title="Copiar saída">⎘</button>
      </div>
      <div class="h-result">${escHtml(h.result)}</div>
      <div class="h-time">${new Date(h.timestamp).toLocaleString('pt-BR')}</div>
    </div>`).join('');
}

function clearHistory(){history=[];saveHistory();renderHistory();toast('Histórico limpo!','success')}
function openHistory(){document.getElementById('history-overlay').classList.add('open');renderHistory()}
function closeHistory(){document.getElementById('history-overlay').classList.remove('open')}
function closeHistoryOverlay(e){if(e.target===document.getElementById('history-overlay'))closeHistory()}

// ─── Toast ────────────────────────────────────────────────────────────────────
function toast(msg,type='success'){
  const t=document.createElement('div');
  t.className=`toast ${type}`;t.textContent=msg;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(()=>t.remove(),2800);
}

function showLoading(){
  const overlay=document.getElementById('loading-overlay');
  const app=document.getElementById('app');
  overlay.classList.add('open');
  app.classList.add('is-loading');
}

function hideLoading(){
  const overlay=document.getElementById('loading-overlay');
  const app=document.getElementById('app');
  overlay.classList.remove('open');
  app.classList.remove('is-loading');
}

function runWithLoading(task){
  showLoading();
  setTimeout(()=>{
    try{
      task();
    } finally {
      hideLoading();
    }
  },60);
}

// ─── Utils ───────────────────────────────────────────────────────────────────
function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function copyText(t){navigator.clipboard.writeText(t).then(()=>toast('Copiado!','success'))}
function copyResult(id){const v=document.getElementById(id).value;if(v)copyText(v);else toast('Nenhum resultado para copiar','error')}

function loadFile(inputId,fileId,nameId){
  const f=document.getElementById(fileId).files[0];
  if(!f)return;
  const r=new FileReader();
  r.onload=e=>{document.getElementById(inputId).value=e.target.result;
    document.getElementById(nameId).textContent=f.name;
    // atualiza contador se existir
    updateCharCounter(inputId);
    toast(`Arquivo carregado: ${f.name}`,'success')};
  r.readAsText(f);
}

// ─── Novas funções (suas adições) ────────────────────────────────────────────

// Exibe descrição do algoritmo de codificação selecionado
function updateAlgoInfo(selectId, infoId){
  const algo=document.getElementById(selectId).value;
  const info=document.getElementById(infoId);
  if(!info)return;
  const descriptions={
    base64:'Codifica dados binários em texto ASCII usando 64 caracteres (A–Z, a–z, 0–9, +, /).',
    hex:'Representa cada byte como dois dígitos hexadecimais (0–9, A–F).',
    binary:'Converte cada caractere para sua representação binária de 8 bits.',
    url:'Codifica caracteres especiais para uso seguro em URLs (RFC 3986).',
    morse:'Converte texto em código Morse usando pontos (.) e traços (-).'
  };
  info.textContent=descriptions[algo]||'';
}

// Atualiza contador de caracteres de um textarea
function updateCharCounter(inputId){
  const input=document.getElementById(inputId);
  const counter=document.getElementById(inputId+'-counter');
  if(!input||!counter)return;
  const len=input.value.length;
  counter.textContent=len===1?'1 caractere':`${len} caracteres`;
}

// Limpa todos os campos de um painel
function clearPanel(panelName){
  const panel=document.getElementById('panel-'+panelName);
  if(!panel)return;
  panel.querySelectorAll('textarea, input[type=text]').forEach(el=>el.value='');
  // reseta contadores
  panel.querySelectorAll('.char-counter').forEach(el=>el.textContent='0 caracteres');
  toast('Campos limpos!','success');
}

// Usa a saída como nova entrada (encadeamento de operações)
function useOutputAsInput(outputId, inputId){
  const output=document.getElementById(outputId);
  const input=document.getElementById(inputId);
  if(!output||!input)return;
  if(!output.value.trim()){toast('Nenhuma saída para usar!','error');return}
  input.value=output.value;
  updateCharCounter(inputId);
  input.focus();
  toast('Saída copiada para a entrada!','success');
}

// ─── Members (static examples) ──────────────────────────────────────────────
const members = [
  {
    name: 'João Vitor Reis',
    role: 'MVP e Full-stack',
    photo: 'https://avatars.githubusercontent.com/u/141349338?v=4',
    github: 'https://github.com/jotavedreis',
    description: 'Contribuiu em todas as áreas do projeto, desde a concepção até a implementação, testes e documentação.'
  },
  {
    name: 'Jorge Hermes',
    role: 'Tech Leader',
    photo: 'https://avatars.githubusercontent.com/u/91022739?v=4',
    github: 'https://github.com/jhermesn',
    description: 'Responsável pela liderança técnica da equipe, garantindo o desenvolvimento de soluções eficientes, promovendo boas práticas e alinhando tecnologia aos objetivos do projeto.'
  },
  {
    name: 'Júlio Brandão',
    role: 'Idealizador',
    photo: '/public/foto-juliobrandao.jpg',
    github: 'https://github.com/juliokauan',
    description: 'Co-idealizador, contribuiu com a concepção do projeto, definição de funcionalidades e estratégias de implementação.'
  },
  {
    name: 'Willian Kelvin',
    role: 'Desenvolvedor Front-end',
    photo: 'https://avatars.githubusercontent.com/u/262694608?v=4',
    github: 'https://github.com/williankfa',
    description: 'Responsável pelo desenvolvimento da interface do usuário, garantindo uma experiência intuitiva e responsiva.'
  },
  {
    name: 'Bruno Santiago',
    role: 'Desenvolvedor Back-end',
    photo: 'https://avatars.githubusercontent.com/u/179386822?v=4',
    github: 'https://github.com/Bruno-dev1s',
    description: 'Responsável pelo desenvolvimento do backend, implementação de lógica de negócio e integração com bancos de dados.'
  },
  {
    name: 'Daniel Piedade',
    role: 'Ajudante',
    photo: 'public/foto-danielpiedade.jpg',
    github: 'https://github.com/daniel7365',
    description: 'Contribuiu com testes, documentação e suporte geral ao projeto, auxiliando em diversas tarefas para garantir a qualidade do produto final.'
  },
  {
    name: 'Andre Felipe',
    role: 'Ajudante',
    photo: 'public/foto-andre.jpeg',
    github: 'https://github.com/Andre-Moura-75',
    description: 'Contribuiu com testes, documentação e suporte geral ao projeto, auxiliando em diversas tarefas para garantir a qualidade do produto final.'
  },
  {
    name: 'Wesley de Oliveira',
    role: 'Ajudante',
    photo: 'public/foto-wesley.jpg',
    github: 'https://github.com/wes7t',
    description: 'Contribuiu com testes, documentação e suporte geral ao projeto, auxiliando em diversas tarefas para garantir a qualidade do produto final.'
  },
  {
    name: 'Jorge Eduardo',
    role: 'Ajudante',
    photo: 'public/foto-jorgeeduardo.jpeg',
    github: 'https://github.com/jorgeeduSG',
    description: 'Contribuiu com testes, documentação e suporte geral ao projeto, auxiliando em diversas tarefas para garantir a qualidade do produto final.'
  },
];

function renderMembers(){
  const list=document.getElementById('members-list');
  if(!list)return;
  list.innerHTML=members.map(member=>{
    const githubBtn = member.github ? `
      <a class="github-btn" href="${member.github}" target="_blank" rel="noopener noreferrer" title="GitHub — ${escHtml(member.name)}">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 .297a12 12 0 00-3.793 23.397c.6.11.82-.26.82-.577v-2.042c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.76-1.605-2.665-.305-5.467-1.333-5.467-5.93 0-1.31.467-2.381 1.235-3.221-.124-.303-.536-1.526.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 016 0c2.29-1.552 3.296-1.23 3.296-1.23.655 1.65.243 2.873.12 3.176.77.84 1.233 1.91 1.233 3.221 0 4.61-2.807 5.62-5.48 5.92.43.37.815 1.102.815 2.222v3.293c0 .32.218.694.825.576A12 12 0 0012 .297"/>
        </svg>
      </a>` : '';

    return `
    <article class="member-card">
      <img class="member-photo" src="${member.photo}" alt="Foto de ${escHtml(member.name)}">
      <div class="member-role">${escHtml(member.role)}</div>
      <div class="member-name">${escHtml(member.name)}</div>
      <p class="member-desc">${escHtml(member.description)}</p>
      <div class="member-actions">${githubBtn}</div>
    </article>
  `}).join('');
}

function openMembersModal(){
  const modal=document.getElementById('members-modal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  renderMembers();
}

function closeMembersModal(event){
  const modal=document.getElementById('members-modal');
  if(event && event.target !== modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
}

function openQrModal(){
  const modal=document.getElementById('qr-modal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}

function closeQrModal(event){
  const modal=document.getElementById('qr-modal');
  if(event && event.target !== modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function switchTab(name,btn){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('panel-'+name).classList.add('active');
  btn.classList.add('active');
}

// ─── Symmetric Crypto ────────────────────────────────────────────────────────
const symAlgoLabels={'AES':'AES-256','AES128':'AES-128','DES':'DES','TripleDES':'3DES','Rabbit':'Rabbit','RC4':'RC4'};

function genSymKey(){
  const a=document.getElementById('sym-algo').value;
  const len=(a==='AES'||a==='AES128')?32:16;
  const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let k='';for(let i=0;i<len;i++)k+=chars[Math.floor(Math.random()*chars.length)];
  document.getElementById('sym-key').value=k;
  toast('Chave gerada!','success');
}

function symProcess(encrypt){
  const input=document.getElementById('sym-input').value;
  const key=document.getElementById('sym-key').value;
  const algoVal=document.getElementById('sym-algo').value;
  if(!input.trim()){toast('Digite ou carregue um texto!','error');return}
  if(!key.trim()){toast('Digite ou gere uma chave!','error');return}
  try{
    const algoKey=algoVal==='AES128'?'AES':algoVal;
    let out;
    if(encrypt){
      out=CryptoJS[algoKey].encrypt(input,key).toString();
      toast('Criptografia concluída!','success');
    } else {
      const dec=CryptoJS[algoKey].decrypt(input,key);
      out=dec.toString(CryptoJS.enc.Utf8);
      if(!out){toast('Falha ao descriptografar. Verifique a chave!','error');return}
      toast('Descriptografia concluída!','success');
    }
    document.getElementById('sym-output').value=out;
    addHistory(encrypt?'Criptografia':'Descriptografia',symAlgoLabels[algoVal],out);
  } catch(e){toast('Erro: '+e.message,'error')}
}

// ─── Asymmetric (RSA) ────────────────────────────────────────────────────────
function genKeyPair(){
  const btn=document.getElementById('keygen-btn');
  btn.innerHTML='<span class="spinner"></span> Gerando...';
  btn.disabled=true;
  setTimeout(()=>{
    try{
      const crypt=new JSEncrypt({default_key_size:2048});
      document.getElementById('asym-pubkey').value=crypt.getPublicKey();
      document.getElementById('asym-privkey').value=crypt.getPrivateKey();
      toast('Chaves RSA geradas!','success');
    } catch(e){toast('Erro ao gerar chaves','error')}
    btn.innerHTML='🔑 Gerar Par de Chaves';
    btn.disabled=false;
  },50);
}

function asymProcess(encrypt){
  const input=document.getElementById('asym-input').value;
  if(!input.trim()){toast('Digite um texto!','error');return}
  try{
    if(encrypt){
      const pub=document.getElementById('asym-pubkey').value;
      if(!pub.trim()){toast('Gere ou cole a chave pública!','error');return}
      const e=new JSEncrypt();e.setPublicKey(pub);
      const enc=e.encrypt(input);
      if(!enc){toast('Falha na criptografia!','error');return}
      document.getElementById('asym-output').value=enc;
      addHistory('Criptografia RSA','RSA-2048',enc);
      toast('Criptografia concluída!','success');
    } else {
      const priv=document.getElementById('asym-privkey').value;
      if(!priv.trim()){toast('Gere ou cole a chave privada!','error');return}
      const d=new JSEncrypt();d.setPrivateKey(priv);
      const dec=d.decrypt(input);
      if(!dec){toast('Falha ao descriptografar!','error');return}
      document.getElementById('asym-output').value=dec;
      addHistory('Descriptografia RSA','RSA-2048',dec);
      toast('Descriptografia concluída!','success');
    }
  } catch(e){toast('Erro: '+e.message,'error')}
}

// ─── Hashing ─────────────────────────────────────────────────────────────────
const hashFns={
  SHA256:t=>CryptoJS.SHA256(t).toString(),
  SHA512:t=>CryptoJS.SHA512(t).toString(),
  SHA1:t=>CryptoJS.SHA1(t).toString(),
  MD5:t=>CryptoJS.MD5(t).toString(),
  SHA3:t=>CryptoJS.SHA3(t).toString(),
  RIPEMD160:t=>CryptoJS.RIPEMD160(t).toString()
};
const hashLabels={SHA256:'SHA-256',SHA512:'SHA-512',SHA1:'SHA-1',MD5:'MD5',SHA3:'SHA-3',RIPEMD160:'RIPEMD-160'};

function genHash(){
  const input=document.getElementById('hash-input').value;
  if(!input.trim()){toast('Digite ou carregue um texto!','error');return}
  const algo=document.getElementById('hash-algo').value;
  try{
    const h=hashFns[algo](input);
    document.getElementById('hash-output').value=h;
    addHistory('Hashing',hashLabels[algo],h);
    toast('Hash concluído!','success');
  } catch(e){toast('Erro: '+e.message,'error')}
}

function verifyHash(){
  const generated=document.getElementById('hash-output').value;
  const verify=document.getElementById('hash-verify').value.trim();
  if(!generated){toast('Gere um hash primeiro!','error');return}
  if(!verify){toast('Cole um hash para comparar!','error');return}
  if(generated.toLowerCase()===verify.toLowerCase()){
    toast('Hashes correspondem!','success');
  } else {
    toast('Hashes não correspondem!','error');
  }
}

// ─── Encoding ────────────────────────────────────────────────────────────────
const MORSE={a:'.-',b:'-...',c:'-.-.',d:'-..',e:'.',f:'..-.',g:'--.',h:'....',i:'..',j:'.---',
  k:'-.-',l:'.-..',m:'--',n:'-.',o:'---',p:'.--.',q:'--.-',r:'.-.',s:'...',t:'-',
  u:'..-',v:'...-',w:'.--',x:'-..-',y:'-.--',z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....',
  '6':'-....','7':'--...','8':'---..','9':'----.',' ':'/'};
const MORSE_REV=Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]));

function encode(){
  runWithLoading(()=>{
    const input=document.getElementById('enc-input').value;
    if(!input.trim()){toast('Digite ou carregue um texto!','error');return}
    const algo=document.getElementById('enc-algo').value;
    try{
      let out;
      switch(algo){
        case 'base64': out=btoa(unescape(encodeURIComponent(input)));break;
        case 'hex': out=Array.from(input).map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join('');break;
        case 'binary': out=Array.from(input).map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');break;
        case 'url': out=encodeURIComponent(input);break;
        case 'morse':
          out=input.toLowerCase().split('').map(c=>MORSE[c]||'?').join(' ');break;
      }
      document.getElementById('enc-output').value=out;
      addHistory('Codificação',algo.toUpperCase(),out);
      toast('Codificação concluída!','success');
    } catch(e){toast('Erro: '+e.message,'error')}
  });
}

function decode(){
  const input=document.getElementById('enc-input').value;
  if(!input.trim()){toast('Digite o texto codificado!','error');return}
  const algo=document.getElementById('enc-algo').value;
  try{
    let out;
    switch(algo){
      case 'base64': out=decodeURIComponent(escape(atob(input.trim())));break;
      case 'hex': out=input.match(/.{1,2}/g).map(h=>String.fromCharCode(parseInt(h,16))).join('');break;
      case 'binary': out=input.split(' ').map(b=>String.fromCharCode(parseInt(b,2))).join('');break;
      case 'url': out=decodeURIComponent(input);break;
      case 'morse':
        out=input.split(' ').map(s=>MORSE_REV[s]||'?').join('');break;
    }
    document.getElementById('enc-output').value=out;
    addHistory('Decodificação',algo.toUpperCase(),out);
    toast('Decodificação concluída!','success');
  } catch(e){toast('Erro ao decodificar: '+e.message,'error')}
}

// init
renderHistory();
renderMembers();
