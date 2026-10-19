
const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
function money(s){return s}
function esc(v){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function getCourse(id){return window.GE_COURSES.find(x=>x.id===Number(id))}
function getBook(id){const books=Array.isArray(window.GE_BOOKS)?window.GE_BOOKS:[];const key=String(id??'').trim();return books.find(x=>String(x.id)===key)||books.find(x=>Number(x.id)===Number(id))}
function toast(msg){const t=$('#toast'); if(!t)return; t.textContent=msg;t.style.display='block';setTimeout(()=>t.style.display='none',2800)}
function setupNav(){
 const btn=$('.menu'), links=$('.links'); if(btn&&links){btn.onclick=()=>{const opened=links.classList.toggle('open');btn.setAttribute('aria-expanded',String(opened));};}
 const path=location.pathname.split('/').pop();
 $$('.links a').forEach(a=>{if(a.getAttribute('href')===path)a.classList.add('active')});
}
function courseCard(c){
 return `<article class="card"><div class="course-cover"><div class="cover-label"><small>Godwin Empire Academy</small><strong>${esc(c.name)}</strong></div></div><div class="card-body"><h3>${esc(c.name)}</h3><p class="muted">${esc(c.description)}</p><div class="tags"><span class="tag">2 Weeks</span><span class="tag">1 Month</span><span class="tag">1 Year</span></div><div class="price">From ${c.twoWeek}</div><div class="card-actions"><a class="btn outline small" href="course.html?id=${c.id}">View Details</a><a class="btn small" href="checkout.html?type=course&id=${c.id}">Enroll</a></div></div></article>`
}
function bookCard(b){
 return `<article class="card"><div class="book-cover"><div class="cover-label"><small>${esc(b.course)}</small><strong>${esc(b.title)}</strong></div></div><div class="card-body"><h3>${esc(b.title)}</h3><p class="muted">${esc(b.description)}</p><div class="price">${b.price}</div><div class="card-actions"><a class="btn outline small" href="book.html?id=${b.id}">View Details</a><a class="btn small" href="checkout.html?type=book&id=${b.id}">Buy Book</a></div></div></article>`
}
function courseArea(name){
 const n=name.toLowerCase();
 if(/forex|crypto|stock|bond|option|technical analysis|risk management|personal finance|wealth/.test(n)) return 'Finance & Trading';
 if(/business|entrepreneur|freelanc|dropshipping|e-commerce|project management|accounting|customer service/.test(n)) return 'Business & Entrepreneurship';
 if(/marketing|affiliate|social media|copywriting|sales|negotiation|brand strategy|chatgpt monetization|amazon kdp|facebook marketing|email marketing|youtube automation/.test(n)) return 'Marketing & Sales';
 if(/graphic design|ui\/ux|video editing|content creation|youtube|canva|public speaking|communication/.test(n)) return 'Creative & Media';
 if(/web development|frontend|backend|full-stack|software|python|javascript|react|mobile app|ai|prompt engineering|cybersecurity|cloud|devops|sql|database|data analysis|power bi|automation|data science|business analytics/.test(n)) return 'Technology & AI';
 return 'Professional Skills';
}
function renderCourses(){
 const el=$('#courseGrid'); if(!el)return;
 const input=$('#courseSearch'), area=$('#courseArea');
 const isHome=location.pathname.endsWith('/index.html')||location.pathname==='/'||location.pathname==='';
 const featuredIds=[11,14,16,23,29,38];
 const draw=()=>{
  const q=(input?.value||'').toLowerCase().trim(), selectedArea=area?.value||'';
  const source=isHome ? window.GE_COURSES.filter(c=>featuredIds.includes(c.id)) : window.GE_COURSES;
  el.innerHTML=source.filter(c=>{
   const text=(c.name+' '+c.description).toLowerCase();
   return (!q||text.includes(q)) && (!selectedArea||courseArea(c.name)===selectedArea);
  }).map(courseCard).join('');
  if(!el.innerHTML) el.innerHTML='<div class="notice" style="grid-column:1/-1">No courses found. Try another search or learning area.</div>';
 };
 input?.addEventListener('input',draw); area?.addEventListener('change',draw); draw();
}
function renderBooks(){
 const el=$('#bookGrid'); if(!el)return;
 const input=$('#bookSearch'), select=$('#bookCourse');
 window.GE_COURSES.forEach(c=>select?.insertAdjacentHTML('beforeend',`<option value="${c.id}">${esc(c.name)}</option>`));
 const draw=()=>{const q=(input?.value||'').toLowerCase(), cid=select?.value||''; el.innerHTML=window.GE_BOOKS.filter(b=>(!cid||b.courseId==cid)&&(b.title.toLowerCase().includes(q)||b.course.toLowerCase().includes(q))).map(bookCard).join('')};
 input?.addEventListener('input',draw);select?.addEventListener('change',draw);draw();
}
function renderCourseDetail(){
 const id=new URLSearchParams(location.search).get('id')||1,c=getCourse(id);if(!c)return;
 $('#courseTitle').textContent=c.name;$('#courseDesc').textContent=c.description;
 $('#courseHero').innerHTML=`<div class="course-cover" style="height:320px"><div class="cover-label"><small>GODWIN EMPIRE</small><strong style="font-size:2.4rem">${esc(c.name)}</strong></div></div>`;
 $('#benefits').innerHTML=c.benefits.map(x=>`<li>${esc(x)}</li>`).join('');
 $('#curriculum').innerHTML=c.curriculum.map((x,i)=>`<li><strong>Module ${i+1}:</strong> ${esc(x)}</li>`).join('');
 $('#schedule').textContent=`Starts ${c.start} · ${c.schedule}`;
 $('#plans').innerHTML=[['2 Weeks',c.twoWeek],['1 Month',c.month],['1 Year',c.year]].map((p,i)=>`<a class="plan plan-link" href="checkout.html?type=course&id=${c.id}&duration=${i}"><span>${p[0]}</span><strong>${p[1]}</strong><span>→</span></a>`).join('');
 $('#enrollLink').href=`checkout.html?type=course&id=${c.id}`;
}
function renderBookDetail(){
 const params=new URLSearchParams(location.search);
 const rawId=params.get('id')||params.get('bookId')||'1';
 const books=Array.isArray(window.GE_BOOKS)?window.GE_BOOKS:[];
 let b=books.find(x=>String(x.id)===String(rawId));
 if(!b) b=books.find(x=>Number(x.id)===Number(rawId));
 if(!b) b=books[0];
 if(!b)return;
 const price=b.price||'₦0';
 $('#bookTitle').textContent=b.title;
 $('#bookCourse').textContent=b.course;
 $('#bookPrice').textContent=price;
 $('#buyPrice').textContent=price;
 $('#bookHero').innerHTML=`<div class="book-cover" style="height:380px"><div class="cover-label"><small>${esc(b.course)}</small><strong style="font-size:2.2rem">${esc(b.title)}</strong><span class="detail-price">${esc(price)}</span></div></div>`;
 $('#bookDetails').innerHTML=`<div class="eyebrow">About this book</div><h2>${esc(b.title)}</h2><p class="book-description">${esc(b.details||b.description||'A practical Godwin Empire guide created to support your learning journey.')}</p><h3>How this book can help you</h3><ul class="list">${(b.benefits||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="tags"><span class="tag">${esc(b.format||'Digital guide / eBook')}</span><span class="tag">Related: ${esc(b.course)}</span><span class="tag">Instant checkout</span></div>`;
 $('#buyLink').href=`checkout.html?type=book&id=${encodeURIComponent(b.id)}`;
}

function renderCheckout(){
 const p=new URLSearchParams(location.search),type=p.get('type')||'course',id=Number(p.get('id'))||1;
 const item=type==='book'?getBook(id):getCourse(id); if(!item)return;
 const isCourse=type==='course';
 const options=isCourse?[['1 Year',item.year]]:[['Book purchase',item.price]];
 $('#checkoutTitle').textContent=isCourse?item.name:item.title;
 $('#checkoutDesc').textContent=isCourse?item.description:(item.details||item.description);
 $('#checkoutSummary').innerHTML=isCourse
   ?`<div class="checkout-item"><span>Course</span><strong>${esc(item.name)}</strong></div><div class="checkout-item"><span>Enrollment period</span><strong>1 Year</strong></div><div class="checkout-item total"><span>Total to pay</span><strong class="gold">${esc(item.year)}</strong></div>`
   :`<div class="checkout-item"><span>Book</span><strong>${esc(item.title)}</strong></div><div class="checkout-item total"><span>Total to pay</span><strong class="gold">${esc(item.price)}</strong></div>`;
 $('#checkoutPlans').innerHTML=isCourse?'':options.map((x,i)=>`<label class="plan"><span><input type="radio" name="duration" value="${i}" checked> ${x[0]}</span><strong>${x[1]}</strong></label>`).join('');
 if($('#paymentFor')) $('#paymentFor').value=isCourse?`Enrollment for course: ${item.name} — 1 Year`:`Purchase of book: ${item.title}`;
 if(isCourse){
   const provider=document.querySelector('input[name="paymentProvider"][value="Paystack"]');
   if(provider)provider.checked=true;
   $$('input[name="paymentProvider"]').forEach(x=>{if(x.value!=='Paystack')x.closest('.provider-choice')?.remove();});
 }
 const updateProvider=()=>{const m=document.querySelector('input[name="paymentProvider"]:checked')?.value||'Paystack';$('#payBtn').textContent=`Continue to ${m}`;if($('#paymentStatus'))$('#paymentStatus').textContent=`You will be redirected to ${m}'s secure checkout after you submit your details.`};
 $$('input[name="paymentProvider"]').forEach(x=>x.addEventListener('change',updateProvider)); updateProvider();
 $('#payBtn').onclick=async()=>{
   const name=$('#candidateName').value.trim(),email=$('#candidateEmail').value.trim(),phone=$('#candidatePhone')?.value.trim()||'',description=$('#paymentFor').value.trim();
   if(!name||!email||!phone){toast('Name, email and phone number are required.');return}
   if(!description){toast('Please confirm what you are paying for.');return}
   const method=document.querySelector('input[name="paymentProvider"]:checked')?.value||'Paystack';
   const durationIndex=isCourse?2:Number($('input[name="duration"]:checked')?.value||0),chosen=isCourse?['1 Year',item.year]:options[durationIndex];
   const receipt={studentId:'',examPin:'',candidateName:name,candidateEmail:email,candidatePhone:phone,paymentFor:description,item:type==='book'?item.title:item.name,type,duration:chosen[0],amount:chosen[1],method,date:new Date().toISOString(),transactionId:'',status:'PENDING'};
   localStorage.setItem('ge_pending_receipt',JSON.stringify(receipt));
   if(location.protocol!=='file:'){
     try{
       const payload={provider:method,email,name,phone,description,courseId:isCourse?item.id:null,duration:isCourse?2:durationIndex,bookId:type==='book'?item.id:null};
       const resp=await fetch('/api/payment/initialize',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(payload)});
       const live=await resp.json();
       if(resp.ok&&live.authorization_url){receipt.transactionId=live.reference||'';receipt.amount=chosen[1];localStorage.setItem('ge_pending_receipt',JSON.stringify(receipt));location.href=live.authorization_url;return}
       toast(live.error||'Payment provider is not configured yet.');return;
     }catch(e){toast('Payment server unavailable. Start the Godwin Empire server first.');return}
   }
   toast('Open the website through the Godwin Empire Node server (npm start) to use Paystack checkout.');
 };
}
async function renderReceipt(){
 const params=new URLSearchParams(location.search); const provider=params.get('provider')||'Paystack'; const reference=params.get('reference')||params.get('trxref')||params.get('tx_ref')||''; const transactionId=params.get('transaction_id')||'';
 const local=JSON.parse(localStorage.getItem('ge_pending_receipt')||localStorage.getItem('ge_last_receipt')||'null');
 if(reference||transactionId){
   $('#receipt').innerHTML=`<div class="panel"><div class="eyebrow">Verifying payment</div><h2>Checking your ${esc(provider)} payment…</h2><p class="muted">Please wait while we confirm the transaction.</p></div>`;
   try{
     const verifyUrl=String(provider).toLowerCase()==='flutterwave'?`/api/payment/verify-flutterwave?transaction_id=${encodeURIComponent(transactionId)}&tx_ref=${encodeURIComponent(reference)}`:`/api/payment/verify?reference=${encodeURIComponent(reference)}`;
     const r=await fetch(verifyUrl,{credentials:'include'}); const out=await r.json();
     if(!r.ok||!out.ok){$('#receipt').innerHTML=`<div class="notice error"><strong>Payment could not be verified.</strong><br>${esc(out.error||'Please contact support with your transaction reference.')}</div>`;return;}
     const p=out.payment||{};
     const receipt={...local,...p,transactionId:p.transactionId||reference,status:p.status,method:provider,amount:p.amount||local?.amount,date:p.paidAt||new Date().toISOString(),studentId:p.studentId||local?.studentId||''};
     localStorage.setItem('ge_last_receipt',JSON.stringify(receipt));
     if(!out.paid){$('#receipt').innerHTML=`<div class="notice"><strong>Payment is not confirmed yet.</strong><br>Reference: ${esc(reference)}<br>Please wait a little and refresh this page.</div>`;return;}
     const extra=receipt.studentId?`<tr><th>Student ID</th><td><strong class="gold">${esc(receipt.studentId)}</strong></td></tr>`:'';
     $('#receipt').innerHTML=`<div class="notice success"><strong>Payment successful</strong><br>Your payment has been verified by Godwin Empire.</div>
      <div class="panel" style="margin-top:15px"><div class="eyebrow">Godwin Empire</div><h2>Payment Receipt</h2><div class="table-wrap"><table class="table">
      <tr><th>Student ID</th><td>${esc(receipt.studentId||'')}</td></tr><tr><th>Candidate Name</th><td>${esc(receipt.candidateName||'')}</td></tr><tr><th>Email</th><td>${esc(receipt.candidateEmail||'')}</td></tr><tr><th>Phone</th><td>${esc(receipt.candidatePhone||'')}</td></tr><tr><th>Payment Description</th><td>${esc(receipt.paymentFor||receipt.item||'')}</td></tr><tr><th>Payment For</th><td>${esc(receipt.item||'')}</td></tr><tr><th>Duration</th><td>${esc(receipt.duration||'')}</td></tr><tr><th>Transaction</th><td>${esc(receipt.transactionId||reference)}</td></tr>${extra}<tr><th>Amount</th><td>${esc(receipt.amount||'')}</td></tr><tr><th>Method</th><td>${esc(provider)}</td></tr><tr><th>Date</th><td>${esc(receipt.date||'')}</td></tr><tr><th>Status</th><td><span class="tag">PAID</span></td></tr></table></div><p class="muted">Keep your Student ID and transaction reference safe.</p></div>`;
   }catch(e){$('#receipt').innerHTML=`<div class="notice error"><strong>Unable to verify payment.</strong><br>Make sure the Godwin Empire server is running, then refresh this page.</div>`;}
   return;
 }
 if(!local){$('#receipt').innerHTML='<div class="notice">No payment receipt was found.</div>';return;}
 $('#receipt').innerHTML=`<div class="notice"><strong>Payment receipt</strong><br>Reference: ${esc(local.transactionId||'')}</div>`;
}
function studentPortal(){
 const id=$('#studentId'),out=$('#studentResult'); if(!id)return;
 $('#studentLookup').onclick=()=>{const v=id.value.trim(); if(!v){out.innerHTML='<div class="notice danger">Enter your Student ID.</div>';return}
 const r=JSON.parse(localStorage.getItem('ge_last_receipt')||'null');
 if(r&&r.studentId===v) out.innerHTML=`<div class="notice success"><strong>Student verified.</strong><br>${esc(r.item)} · ${esc(r.amount)} · ${esc(r.date)}</div><div class="panel" style="margin-top:15px"><h3>Student services</h3><div class="card-actions"><a class="btn" href="renew.html?id=${encodeURIComponent(v)}">Renew</a><a class="btn outline" href="exams.html">Exams</a></div></div>`;
 else out.innerHTML='<div class="notice danger">Student ID not found in this demo browser. In production this lookup will use the secure database.</div>'};
}
function examPage(){
 const login=$('#pinLogin'), exam=$('#examArea'); if(!login)return;
 let state={active:false,index:0,answers:{},seconds:1800};
 $('#startExam').onclick=()=>{const pin=$('#examPin').value.trim(); if(pin.length<4){toast('Enter a valid exam PIN.');return} state.active=true;login.style.display='none';exam.style.display='block';renderQuestion();tick()};
 const questions=[
  {q:'Which principle helps limit risk on a single trade?',a:['Risk management','Random entries','No position sizing','Ignoring stops'],c:0},
  {q:'What does HTML primarily provide?',a:['Page structure','Database storage','Payment settlement','DNS hosting'],c:0},
  {q:'Which is commonly used to style web pages?',a:['CSS','SQL','SMTP','JSON'],c:0},
  {q:'Which practice helps protect an account?',a:['Strong unique passwords','Sharing PINs','Publishing secrets','Disabling all security'],c:0},
  {q:'What is a database commonly used for?',a:['Storing structured information','Drawing logos only','Replacing electricity','Sending physical mail'],c:0}
 ];
 function renderQuestion(){const q=questions[state.index];$('#questionNo').textContent=`Question ${state.index+1} of ${questions.length}`;$('#questionText').textContent=q.q;$('#options').innerHTML=q.a.map((x,i)=>`<div class="option ${state.answers[state.index]===i?'selected':''}" data-i="${i}">${String.fromCharCode(65+i)}. ${x}</div>`).join('');$$('.option').forEach(o=>o.onclick=()=>{state.answers[state.index]=Number(o.dataset.i);renderQuestion()});$('#prevQ').disabled=state.index===0;$('#nextQ').textContent=state.index===questions.length-1?'Submit Exam':'Next'};
 function submit(reason='Submitted'){exam.style.display='none';$('#examResult').style.display='block';let score=0;questions.forEach((q,i)=>{if(state.answers[i]===q.c)score++});$('#examResult').innerHTML=`<div class="panel"><div class="eyebrow">Exam complete</div><h2>${reason}</h2><p>Your score: <strong>${score}/${questions.length}</strong></p><p class="muted">This demo shows the CBT flow. Production exam questions, PIN validation, attempts and results should be handled server-side.</p></div>`}
 $('#prevQ').onclick=()=>{if(state.index>0){state.index--;renderQuestion()}};$('#nextQ').onclick=()=>{if(state.index===questions.length-1)submit();else{state.index++;renderQuestion()}};
 document.addEventListener('visibilitychange',()=>{if(state.active&&document.hidden)submit('Auto-submitted because the exam page was left.')});
 function tick(){const t=setInterval(()=>{if(!state.active){clearInterval(t);return}state.seconds--;$('#timer').textContent=`${String(Math.floor(state.seconds/60)).padStart(2,'0')}:${String(state.seconds%60).padStart(2,'0')}`;if(state.seconds<=0){clearInterval(t);submit('Time expired — exam auto-submitted.')}},1000)}
}
function initAdminDashboard(){
 const ps=JSON.parse(localStorage.getItem('ge_payments')||'[]');
 $('#paymentCount').textContent=ps.length;
 const total=ps.reduce((x,p)=>x+Number(String(p.amount).replace(/[^\d]/g,'')),0);
 $('#totalRevenue').textContent='₦'+total.toLocaleString();
 $('#paymentRows').innerHTML=ps.map(p=>`<tr><td>${esc(p.transactionId)}</td><td>${esc(p.candidateName)}</td><td>${esc(p.candidateEmail)}</td><td>${esc(p.item)}</td><td>${esc(p.duration)}</td><td>${esc(p.amount)}</td><td>${esc(p.studentId||p.examPin||'—')}</td></tr>`).join('')||'<tr><td colspan="7">No payments yet.</td></tr>';
 $('#studentRows').innerHTML=ps.filter(p=>p.studentId).map(p=>`<tr><td>${esc(p.studentId)}</td><td>${esc(p.candidateName)}</td><td>${esc(p.course||p.item)}</td><td>${esc(p.candidateEmail)}</td></tr>`).join('')||'<tr><td colspan="4">No students yet.</td></tr>';
 const tabs=$$('.admin-nav button'),sections=$$('.admin-section');
 tabs.forEach(b=>b.onclick=()=>{tabs.forEach(x=>x.classList.remove('active'));b.classList.add('active');sections.forEach(s=>s.style.display=s.id===b.dataset.tab?'block':'none')});
 const cv=$('#revenueChart');
 if(cv){
  const ctx=cv.getContext('2d'),w=cv.clientWidth||700,h=220;cv.width=w*2;cv.height=h*2;ctx.scale(2,2);
  const vals=[0,0,0,0,0,0,0],now=Date.now();
  ps.forEach(p=>{const d=Math.floor((now-new Date(p.date).getTime())/86400000);if(d>=0&&d<7)vals[6-d]+=Number(String(p.amount).replace(/[^\d]/g,''))});
  const max=Math.max(1,...vals);
  vals.forEach((v,i)=>{const bw=Math.max(18,(w-70)/7-10),x=40+i*((w-55)/7),bh=v/max*145;ctx.fillStyle='#d9a83f';ctx.fillRect(x,185-bh,bw,bh);ctx.fillStyle='#aaa';ctx.font='11px Arial';ctx.fillText(i===6?'Today':`-${6-i}d`,x,205)})
 }
}

document.addEventListener('DOMContentLoaded',()=>{setupNav();renderCourses();renderBooks();renderCourseDetail();renderBookDetail();renderCheckout();renderReceipt();studentPortal();examPage();});

// ================== SECURE PORTALS ==================
async function apiJson(url,opts={}){const r=await fetch(url,{credentials:'include',...opts,headers:{'Content-Type':'application/json',...(opts.headers||{})}});let d={};try{d=await r.json()}catch{}if(!r.ok)throw new Error(d.error||'Request failed');return d}
function naira(v){return '₦'+Number(v||0).toLocaleString()}
function courseName(id){const c=window.GE_COURSES?.find(x=>Number(x.id)===Number(id));return c?.name||String(id||'—')}
function portalTabs(selector,sectionSelector){const tabs=$$(selector),sections=$$(sectionSelector);tabs.forEach(b=>b.onclick=()=>{tabs.forEach(x=>x.classList.remove('active'));b.classList.add('active');sections.forEach(s=>s.style.display=s.id===b.dataset.tab?'block':'none')})}

async function initAdminDashboard(){
 try{
  const [pay,students,rev,notes,teachers,webinars]=await Promise.all([
   apiJson('/api/admin/payments'),apiJson('/api/admin/students'),apiJson('/api/admin/revenue'),apiJson('/api/admin/notifications'),apiJson('/api/admin/teachers'),apiJson('/api/admin/webinars')
  ]);
  const payments=pay.payments||[], ss=students.students||[];
  $('#paymentCount').textContent=payments.length;$('#studentCount').textContent=ss.length;
  const all=payments.filter(p=>String(p.status).toUpperCase()==='PAID').reduce((a,p)=>a+Number(p.amountNaira||0),0);$('#totalRevenue').textContent=naira(all);
  $('#revenueToday').textContent=naira(rev.today);$('#revenueWeek').textContent=naira(rev.week);$('#revenueMonth').textContent=naira(rev.month);$('#revenueYear').textContent=naira(rev.year);
  $('#paymentRows').innerHTML=payments.map(p=>`<tr><td>${esc(p.transactionId)}</td><td>${esc(p.candidateName)}</td><td>${esc(p.candidateEmail)}</td><td>${esc(p.paymentFor||p.item)}</td><td>${esc(p.amount||naira(p.amountNaira))}</td><td>${esc(p.method)}</td><td>${esc(p.status)}</td><td>${esc(new Date(p.date).toLocaleString())}</td></tr>`).join('')||'<tr><td colspan="8">No payments recorded yet.</td></tr>';
  $('#studentRows').innerHTML=ss.map(s=>`<tr><td>${esc(s.studentId)}</td><td>${esc(s.name||s.candidateName)}</td><td>${esc(s.courseName||courseName(s.courseId))}</td><td>${esc(s.email||s.candidateEmail)}</td><td><button class="btn small" onclick="adminOpenStudent('${esc(s.studentId)}')">Open Portal</button> <button class="btn outline small" onclick="adminRemoveStudent('${esc(s.studentId)}')">Remove</button></td></tr>`).join('')||'<tr><td colspan="5">No students yet.</td></tr>';
  $('#adminNoticeList').innerHTML=(notes.notifications||[]).slice(0,20).map(n=>`<div class="notice" style="margin:8px 0"><strong>${esc(n.title)}</strong><br>${esc(n.message)}<br><small>${esc(new Date(n.date).toLocaleString())}</small></div>`).join('')||'<p class="muted">No notifications yet.</p>';
  $('#teacherRows').innerHTML=(teachers.teachers||[]).map(t=>`<tr><td>${esc(t.name)}</td><td>${esc(t.email)}</td><td>${(t.courseIds||[]).map(courseName).map(esc).join(', ')}</td><td>${t.active===false?'Inactive':'Active'}</td><td>${t.active===false?'—':`<button class="btn outline small" onclick="deactivateTeacher('${esc(t.id)}')">Deactivate</button>`}</td></tr>`).join('')||'<tr><td colspan="5">No teachers yet.</td></tr>';
  $('#webinarList').innerHTML=(webinars.webinars||[]).map(w=>`<div class="notice" style="margin:8px 0"><strong>${esc(w.title)}</strong> · ${esc(courseName(w.courseId))}<br>${esc(new Date(w.startAt).toLocaleString())} · <span class="tag">${esc(w.status)}</span> · <a href="${esc(w.liveUrl)}" target="_blank" rel="noopener">Open live link</a>${w.status!=='live'?` <button class="btn small" onclick="startAdminWebinar('${esc(w.id)}')">Start Live</button>`:''}</div>`).join('')||'<p class="muted">No webinars scheduled.</p>';
  const act=await apiJson('/api/admin/notifications').catch(()=>({}));
  renderRevenueChart(rev.daily||[]); portalTabs('.admin-nav button','.admin-section');
 }catch(e){toast(e.message)}
}
function renderRevenueChart(days){const cv=$('#revenueChart');if(!cv)return;const w=cv.clientWidth||800,h=240,dpr=2;cv.width=w*dpr;cv.height=h*dpr;const c=cv.getContext('2d');c.scale(dpr,dpr);c.clearRect(0,0,w,h);const vals=days.map(x=>Number(x.amount||0)),max=Math.max(1,...vals),left=55,bottom=35,top=20,plotH=h-top-bottom,plotW=w-left-20;vals.forEach((v,i)=>{const bw=Math.max(16,plotW/Math.max(vals.length,1)-12),x=left+i*(plotW/Math.max(vals.length,1))+6,bh=v/max*plotH;c.fillStyle='#d9a83f';c.fillRect(x,top+plotH-bh,bw,bh);c.fillStyle='#777';c.font='11px Arial';c.fillText(days[i]?.date?.slice(5)||'',x, h-10);c.fillText(v?naira(v):'₦0',x,Math.max(12,top+plotH-bh-5))})}
async function adminOpenStudent(id){try{const d=await apiJson(`/api/admin/students/${encodeURIComponent(id)}/impersonate`,{method:'POST'});location.href=d.redirect}catch(e){toast(e.message)}}
async function adminRemoveStudent(id){if(!confirm('Remove this student account?'))return;try{await apiJson(`/api/admin/students/${encodeURIComponent(id)}`,{method:'DELETE'});toast('Student removed');initAdminDashboard()}catch(e){toast(e.message)}}
async function deactivateTeacher(id){try{await apiJson(`/api/admin/teachers/${encodeURIComponent(id)}`,{method:'DELETE'});toast('Teacher deactivated');initAdminDashboard()}catch(e){toast(e.message)}}
async function startAdminWebinar(id){try{await apiJson(`/api/admin/webinars/${encodeURIComponent(id)}/start`,{method:'POST'});toast('Webinar is live');initAdminDashboard()}catch(e){toast(e.message)}}

async function initStudentPortal(){
 portalTabs('.admin-nav button','.student-section');
 const qs=new URLSearchParams(location.search),adminView=qs.get('adminView')==='1',studentIdFromUrl=qs.get('studentId');
 async function load(){try{const d=await apiJson('/api/student/me');const s=d.student;$('#studentLoginBox').style.display='none';$('#studentDashboard').style.display='block';$('#studentWelcome').textContent=`Welcome, ${s.name||'Student'}`;$('#sId').textContent=s.studentId;$('#sCourse').textContent=s.courseName||courseName(s.courseId);$('#sEmail').textContent=s.email||'—';$('#studentNotifications').innerHTML=(d.notifications||[]).map(n=>`<div class="notice" style="margin:8px 0"><strong>${esc(n.title)}</strong><br>${esc(n.message)}<br><small>${esc(new Date(n.date).toLocaleString())}</small></div>`).join('')||'<p class="muted">No notifications yet.</p>';$('#studentAssignments').innerHTML=(d.assignments||[]).map(a=>`<div class="notice" style="margin:8px 0"><strong>${esc(a.title)}</strong><br>${esc(a.instructions)}<br><small>Due: ${esc(a.dueAt||'Not set')}</small></div>`).join('')||'<p class="muted">No assignments yet.</p>';const w=await apiJson('/api/webinars');const mine=(w.webinars||[]).filter(x=>Number(x.courseId)===Number(s.courseId));$('#studentWebinars').innerHTML=mine.map(x=>`<div class="notice ${x.status==='live'?'success':''}" style="margin:8px 0"><strong>${esc(x.title)}</strong> · ${esc(x.status)}<br>${esc(new Date(x.startAt).toLocaleString())}<br>${x.status==='live'?`<a class="btn small" target="_blank" rel="noopener" href="${esc(x.liveUrl)}">Join Live Class</a>`:`<span class="muted">Live class scheduled.</span>`}</div>`).join('')||'<p class="muted">No live classes scheduled.</p>';if(adminView){const b=document.createElement('button');b.className='btn outline small';b.textContent='Exit Admin Student View';b.onclick=async()=>{await apiJson('/api/admin/impersonate/exit',{method:'POST'});location.href='admin.html'};$('#sHome').prepend(b)}}catch(e){$('#studentLoginMsg').style.display='block';$('#studentLoginMsg').className='notice danger';$('#studentLoginMsg').textContent=e.message}}
 if(adminView){await load();return}
 const r=await fetch('/api/student/me',{credentials:'include'});if(r.ok){await load();return}
 $('#studentLookup').onclick=async()=>{const v=$('#studentId').value.trim();if(!v)return toast('Enter your Student ID');try{await apiJson('/api/student/login',{method:'POST',body:JSON.stringify({studentId:v})});await load()}catch(e){$('#studentLoginMsg').style.display='block';$('#studentLoginMsg').className='notice danger';$('#studentLoginMsg').textContent=e.message}};
 $('#studentLogout')?.addEventListener('click',async()=>{await apiJson('/api/student/logout',{method:'POST'});location.reload()});
}

async function initTeacherPortal(){
 try{const d=await apiJson('/api/teacher/me');const t=d.teacher;$('#teacherName').textContent=`Welcome, ${t.name}`;$('#teacherStudentRows').innerHTML=(d.students||[]).map(s=>`<tr><td>${esc(s.studentId)}</td><td>${esc(s.name||s.candidateName)}</td><td>${esc(s.email||s.candidateEmail)}</td><td>${esc(s.courseName||courseName(s.courseId))}</td></tr>`).join('')||'<tr><td colspan="4">No students assigned.</td></tr>';$('#teacherWebinars').innerHTML=(d.webinars||[]).map(w=>`<div class="notice" style="margin:8px 0"><strong>${esc(w.title)}</strong> · ${esc(courseName(w.courseId))}<br>${esc(new Date(w.startAt).toLocaleString())} · ${esc(w.status)} ${w.status!=='live'?`<button class="btn small" onclick="startTeacherWebinar('${esc(w.id)}')">Start Live</button>`:''}</div>`).join('')||'<p class="muted">No webinars yet.</p>';portalTabs('.admin-nav button','.teacher-section');
  $('#tnSend').onclick=async()=>{try{await apiJson('/api/teacher/notifications',{method:'POST',body:JSON.stringify({courseId:Number($('#tnCourse').value),title:$('#tnTitle').value,message:$('#tnMessage').value})});toast('Class notification sent')}catch(e){toast(e.message)}};
  $('#asSend').onclick=async()=>{try{await apiJson('/api/teacher/assignments',{method:'POST',body:JSON.stringify({courseId:Number($('#asCourse').value),title:$('#asTitle').value,instructions:$('#asInstructions').value,dueAt:$('#asDue').value})});toast('Assignment published')}catch(e){toast(e.message)}};
  $('#tlCreate').onclick=async()=>{try{await apiJson('/api/teacher/webinars',{method:'POST',body:JSON.stringify({courseId:Number($('#tlCourse').value),title:$('#tlTitle').value,startAt:$('#tlStart').value,liveUrl:$('#tlUrl').value,description:$('#tlDesc').value})});toast('Live class scheduled');location.reload()}catch(e){toast(e.message)}};
  $('#teacherLogout').onclick=async()=>{await apiJson('/api/teacher/logout',{method:'POST'});location.href='teacher-login.html'};
 }catch(e){location.replace('teacher-login.html')}
}
async function startTeacherWebinar(id){try{await apiJson(`/api/teacher/webinars/${encodeURIComponent(id)}/start`,{method:'POST'});toast('Webinar is live');location.reload()}catch(e){toast(e.message)}}
