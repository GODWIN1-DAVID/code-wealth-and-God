// Godwin Empire Academy backend
// Run: npm install && npm start
// Secrets belong in environment variables, never in frontend assets.
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_a74acb53c49d49be6c51d4718bea18930d0a567d';
const DB_FILE = path.join(__dirname, 'godwin-db.json');
const ADMIN_COOKIE = 'ge_admin_session';
const USER_COOKIE = 'ge_user_session';
const IMP_COOKIE = 'ge_impersonation';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const IMP_TTL_MS = 60 * 60 * 1000;
const secret = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'change-me';

function loadCatalog(){
  try{
    const source=fs.readFileSync(path.join(__dirname,'data.js'),'utf8');
    const sandbox={window:{}}; vm.runInNewContext(source,sandbox,{timeout:1000});
    return {courses:Array.isArray(sandbox.window.GE_COURSES)?sandbox.window.GE_COURSES:[],books:Array.isArray(sandbox.window.GE_BOOKS)?sandbox.window.GE_BOOKS:[]};
  }catch{return {courses:[],books:[]};}
}
function nairaNumber(v){return Number(String(v??'').replace(/[^0-9.]/g,''))||0;}
function coursePlan(course,duration){
  const plans=[['2 Weeks',course?.twoWeek],['1 Month',course?.month],['1 Year',course?.year]];
  const i=Number(duration); return Number.isInteger(i)&&plans[i]&&nairaNumber(plans[i][1])>0?{label:plans[i][0],amount:nairaNumber(plans[i][1]),display:plans[i][1]}:null;
}

app.use(cors({origin:true, credentials:true}));
app.use(express.json({limit:'1mb', verify:(req,res,buf)=>{req.rawBody=buf}}));
app.use(express.urlencoded({extended:true}));

function ensureDb(){
  const dir=path.dirname(DB_FILE); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  if(!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({students:[],payments:[],notifications:[],teachers:[],assignments:[],webinars:[],activity:[]},null,2));
}
ensureDb();
function db(){try{return JSON.parse(fs.readFileSync(DB_FILE,'utf8'));}catch{return {students:[],payments:[],notifications:[],teachers:[],assignments:[],webinars:[],activity:[]};}}
function save(data){fs.writeFileSync(DB_FILE,JSON.stringify(data,null,2));}
function id(prefix){return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;}
function safeUser(u){if(!u)return null; const {passwordHash,...rest}=u; return rest;}
function hash(v){return crypto.createHash('sha256').update(String(v)).digest('hex');}
function signToken(type,payload,ttl){const exp=Date.now()+ttl; const body=JSON.stringify({type,payload,exp}); const b=Buffer.from(body).toString('base64url'); const sig=crypto.createHmac('sha256',secret()).update(b).digest('hex'); return `${b}.${sig}`;}
function verifyToken(token,type){try{if(!token)return null;const [b,sig]=String(token).split('.');const expected=crypto.createHmac('sha256',secret()).update(b).digest('hex');if(!crypto.timingSafeEqual(Buffer.from(sig||''),Buffer.from(expected)))return null;const x=JSON.parse(Buffer.from(b,'base64url').toString());if(x.type!==type||x.exp<Date.now())return null;return x.payload;}catch{return null;}}
function cookies(req){return Object.fromEntries(String(req.headers.cookie||'').split(';').filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i).trim(),decodeURIComponent(x.slice(i+1))]}));}
function setCookie(res,name,value,maxAge,secure=process.env.NODE_ENV==='production'){res.setHeader('Set-Cookie',`${name}=${encodeURIComponent(value)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor(maxAge/1000)}${secure?'; Secure':''}`)}
function clearCookie(res,name){setCookie(res,name,'',0)}
function adminOnly(req,res,next){const a=verifyToken(cookies(req)[ADMIN_COOKIE],'admin');if(!a)return res.status(401).json({error:'Admin authentication required'});req.admin=a;next();}
function teacherOnly(req,res,next){const t=verifyToken(cookies(req)[USER_COOKIE],'teacher');if(!t)return res.status(401).json({error:'Teacher authentication required'});req.teacher=t;next();}
function studentContext(req){
  const imp=verifyToken(cookies(req)[IMP_COOKIE],'imp'); if(imp)return {studentId:imp.studentId,admin:true};
  const s=verifyToken(cookies(req)[USER_COOKIE],'student'); if(s)return {studentId:s.studentId,admin:false};
  return null;
}
function studentOnly(req,res,next){const s=studentContext(req);if(!s)return res.status(401).json({error:'Student authentication required'});req.student=s;next();}
function log(action,meta={}){const d=db();d.activity.unshift({id:id('ACT'),action,meta,date:new Date().toISOString()});d.activity=d.activity.slice(0,1000);save(d);}

// ---------------- AUTH ----------------
app.post('/api/admin/login',(req,res)=>{
  const password=String(req.body?.password||'');
  if(!process.env.ADMIN_PASSWORD)return res.status(503).json({error:'ADMIN_PASSWORD is not configured on the server'});
  if(password!==process.env.ADMIN_PASSWORD)return res.status(401).json({error:'Incorrect admin password'});
  setCookie(res,ADMIN_COOKIE,signToken('admin',{role:'admin'},SESSION_TTL_MS),SESSION_TTL_MS);
  log('Admin login'); res.json({ok:true});
});
app.get('/api/admin/me',(req,res)=>{const a=verifyToken(cookies(req)[ADMIN_COOKIE],'admin');res.status(a?200:401).json({authenticated:!!a});});
app.post('/api/admin/logout',(req,res)=>{clearCookie(res,ADMIN_COOKIE);clearCookie(res,IMP_COOKIE);res.json({ok:true});});

app.post('/api/student/login',(req,res)=>{
  const studentId=String(req.body?.studentId||'').trim(); const d=db(); const s=d.students.find(x=>x.studentId===studentId && x.active!==false);
  if(!s)return res.status(401).json({error:'Student ID not found'});
  setCookie(res,USER_COOKIE,signToken('student',{studentId:s.studentId},SESSION_TTL_MS),SESSION_TTL_MS); res.json({ok:true,student:safeUser(s)});
});
app.post('/api/student/logout',(req,res)=>{clearCookie(res,USER_COOKIE);res.json({ok:true});});
app.get('/api/student/me',studentOnly,(req,res)=>{
  const d=db(),s=d.students.find(x=>x.studentId===req.student.studentId && x.active!==false); if(!s)return res.status(404).json({error:'Student not found'});
  const courseIds=[...(s.enrollments||[]).map(e=>Number(e.courseId)),...(s.courseId!=null?[Number(s.courseId)]:[])].filter((v,i,a)=>Number.isFinite(v)&&a.indexOf(v)===i);
  res.json({student:safeUser(s),courseIds,notifications:d.notifications.filter(n=>n.audience==='all'||n.studentIds?.includes(s.studentId)||courseIds.some(cid=>n.courseIds?.includes(cid))).slice(0,100),assignments:d.assignments.filter(a=>courseIds.includes(Number(a.courseId))).slice(0,100)});
});

app.post('/api/teacher/login',(req,res)=>{
  const email=String(req.body?.email||'').trim().toLowerCase(), password=String(req.body?.password||''); const d=db(); const t=d.teachers.find(x=>x.email===email && x.passwordHash===hash(password) && x.active!==false);
  if(!t)return res.status(401).json({error:'Invalid teacher login'});
  setCookie(res,USER_COOKIE,signToken('teacher',{teacherId:t.id},SESSION_TTL_MS),SESSION_TTL_MS); res.json({ok:true,teacher:safeUser(t)});
});
app.post('/api/teacher/logout',(req,res)=>{clearCookie(res,USER_COOKIE);res.json({ok:true});});
app.get('/api/teacher/me',teacherOnly,(req,res)=>{const d=db(),t=d.teachers.find(x=>x.id===req.teacher.teacherId);if(!t)return res.status(404).json({error:'Teacher not found'});const students=d.students.filter(s=>(t.courseIds||[]).includes(s.courseId));res.json({teacher:safeUser(t),students,assignments:d.assignments.filter(a=>(t.courseIds||[]).includes(a.courseId)),webinars:d.webinars.filter(w=>(t.courseIds||[]).includes(w.courseId))});});

// ---------------- ADMIN: STUDENTS ----------------
app.get('/api/admin/students',adminOnly,(req,res)=>{const d=db();res.json({students:d.students.map(safeUser)});});
app.delete('/api/admin/students/:id',adminOnly,(req,res)=>{const d=db();const before=d.students.length;d.students=d.students.filter(s=>s.studentId!==req.params.id);if(d.students.length===before)return res.status(404).json({error:'Student not found'});save(d);log('Admin removed student',{studentId:req.params.id});res.json({ok:true});});
app.post('/api/admin/students/:id/impersonate',adminOnly,(req,res)=>{const d=db();const s=d.students.find(x=>x.studentId===req.params.id);if(!s)return res.status(404).json({error:'Student not found'});setCookie(res,IMP_COOKIE,signToken('imp',{studentId:s.studentId},IMP_TTL_MS),IMP_TTL_MS);log('Admin opened student portal',{studentId:s.studentId});res.json({ok:true,studentId:s.studentId,redirect:`student.html?adminView=1&studentId=${encodeURIComponent(s.studentId)}`});});
app.post('/api/admin/impersonate/exit',adminOnly,(req,res)=>{clearCookie(res,IMP_COOKIE);res.json({ok:true});});
app.get('/api/admin/student/:id/portal',adminOnly,(req,res)=>{const d=db(),s=d.students.find(x=>x.studentId===req.params.id);if(!s)return res.status(404).json({error:'Student not found'});res.json({student:safeUser(s),notifications:d.notifications.filter(n=>n.audience==='all'||n.studentIds?.includes(s.studentId)||n.courseIds?.includes(s.courseId)),assignments:d.assignments.filter(a=>a.courseId===s.courseId)});});

// ---------------- ADMIN: PAYMENTS / RECEIPTS / REVENUE ----------------
app.get('/api/admin/payments',adminOnly,(req,res)=>res.json({payments:db().payments}));
app.get('/api/admin/revenue',adminOnly,(req,res)=>{
  const payments=db().payments.filter(p=>String(p.status).toUpperCase()==='PAID'); const now=new Date();
  const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const weekStart=new Date(start);weekStart.setDate(start.getDate()-6);
  const monthStart=new Date(now.getFullYear(),now.getMonth(),1); const yearStart=new Date(now.getFullYear(),0,1);
  const amount=p=>Number(p.amountNaira||String(p.amount||'').replace(/[^\d.]/g,''))||0;
  const sum=fn=>payments.filter(p=>fn(new Date(p.date||p.createdAt))).reduce((a,p)=>a+amount(p),0);
  const daily=Array.from({length:7},(_,i)=>{const day=new Date(weekStart);day.setDate(weekStart.getDate()+i);const next=new Date(day);next.setDate(day.getDate()+1);return {date:day.toISOString().slice(0,10),amount:payments.filter(p=>{const d=new Date(p.date||p.createdAt);return d>=day&&d<next}).reduce((a,p)=>a+amount(p),0)}});
  res.json({today:sum(d=>d>=start),week:sum(d=>d>=weekStart),month:sum(d=>d>=monthStart),year:sum(d=>d>=yearStart),daily});
});

// ---------------- ADMIN: NOTIFICATIONS ----------------
app.post('/api/admin/notifications',adminOnly,(req,res)=>{
  const {title,message,audience='all',courseId,studentIds=[]}=req.body||{}; if(!title||!message)return res.status(400).json({error:'Title and message are required'});
  const d=db();const n={id:id('NOT'),title:String(title),message:String(message),audience,courseIds:courseId?[Number(courseId)]:[],studentIds:Array.isArray(studentIds)?studentIds:[],from:'Admin',date:new Date().toISOString()};d.notifications.unshift(n);save(d);log('Admin sent notification',{audience,courseId,studentIds:n.studentIds});res.json({ok:true,notification:n});
});
app.get('/api/admin/notifications',adminOnly,(req,res)=>res.json({notifications:db().notifications}));

// ---------------- ADMIN: TEACHERS ----------------
app.get('/api/admin/teachers',adminOnly,(req,res)=>res.json({teachers:db().teachers.map(safeUser)}));
app.post('/api/admin/teachers',adminOnly,(req,res)=>{const {name,email,password,courseIds=[]}=req.body||{};if(!name||!email||!password)return res.status(400).json({error:'Name, email and password are required'});const d=db();if(d.teachers.some(t=>t.email===email.toLowerCase()))return res.status(409).json({error:'Teacher already exists'});const t={id:id('TCH'),name,email:email.toLowerCase(),passwordHash:hash(password),courseIds:Array.isArray(courseIds)?courseIds.map(Number):[],active:true,createdAt:new Date().toISOString()};d.teachers.push(t);save(d);log('Admin created teacher',{teacherId:t.id});res.json({teacher:safeUser(t)});});
app.delete('/api/admin/teachers/:id',adminOnly,(req,res)=>{const d=db();const t=d.teachers.find(x=>x.id===req.params.id);if(!t)return res.status(404).json({error:'Teacher not found'});t.active=false;save(d);log('Admin deactivated teacher',{teacherId:t.id});res.json({ok:true});});

// ---------------- ADMIN: WEBINARS ----------------
app.get('/api/admin/webinars',adminOnly,(req,res)=>res.json({webinars:db().webinars}));
app.post('/api/admin/webinars',adminOnly,(req,res)=>{const {title,courseId,startAt,liveUrl,description=''}=req.body||{};if(!title||!courseId||!startAt||!liveUrl)return res.status(400).json({error:'Title, course, start time and live URL are required'});const d=db();const w={id:id('WEB'),title,courseId:Number(courseId),startAt,liveUrl,description,host:'Admin',status:'scheduled',createdAt:new Date().toISOString()};d.webinars.unshift(w);save(d);log('Admin created webinar',{webinarId:w.id});res.json({webinar:w});});
app.post('/api/admin/webinars/:id/start',adminOnly,(req,res)=>{const d=db(),w=d.webinars.find(x=>x.id===req.params.id);if(!w)return res.status(404).json({error:'Webinar not found'});w.status='live';save(d);log('Admin started webinar',{webinarId:w.id});res.json({webinar:w});});

// ---------------- TEACHER TOOLS ----------------
app.post('/api/teacher/notifications',teacherOnly,(req,res)=>{const {title,message,courseId}=req.body||{};const t=db().teachers.find(x=>x.id===req.teacher.teacherId);if(!t||(courseId&&!t.courseIds.includes(Number(courseId))))return res.status(403).json({error:'Course access denied'});if(!title||!message)return res.status(400).json({error:'Title and message are required'});const d=db();const n={id:id('NOT'),title,message,audience:'course',courseIds:[Number(courseId)],studentIds:[],from:t.name,date:new Date().toISOString()};d.notifications.unshift(n);save(d);log('Teacher sent course notification',{teacherId:t.id,courseId});res.json({ok:true,notification:n});});
app.post('/api/teacher/assignments',teacherOnly,(req,res)=>{const {title,instructions,dueAt,courseId}=req.body||{};const t=db().teachers.find(x=>x.id===req.teacher.teacherId);if(!t||!t.courseIds.includes(Number(courseId)))return res.status(403).json({error:'Course access denied'});if(!title||!instructions)return res.status(400).json({error:'Title and instructions are required'});const d=db();const a={id:id('ASN'),title,instructions,dueAt,courseId:Number(courseId),teacherId:t.id,createdAt:new Date().toISOString()};d.assignments.unshift(a);save(d);log('Teacher created assignment',{teacherId:t.id,courseId});res.json({assignment:a});});
app.post('/api/teacher/webinars',teacherOnly,(req,res)=>{const {title,courseId,startAt,liveUrl,description=''}=req.body||{};const t=db().teachers.find(x=>x.id===req.teacher.teacherId);if(!t||!t.courseIds.includes(Number(courseId)))return res.status(403).json({error:'Course access denied'});if(!title||!startAt||!liveUrl)return res.status(400).json({error:'Title, start time and live URL are required'});const d=db();const w={id:id('WEB'),title,courseId:Number(courseId),startAt,liveUrl,description,host:t.name,status:'scheduled',createdAt:new Date().toISOString()};d.webinars.unshift(w);save(d);log('Teacher created webinar',{teacherId:t.id,webinarId:w.id});res.json({webinar:w});});
app.post('/api/teacher/webinars/:id/start',teacherOnly,(req,res)=>{const d=db(),w=d.webinars.find(x=>x.id===req.params.id),t=d.teachers.find(x=>x.id===req.teacher.teacherId);if(!w||!t||!t.courseIds.includes(w.courseId))return res.status(403).json({error:'Webinar access denied'});w.status='live';save(d);log('Teacher started webinar',{teacherId:t.id,webinarId:w.id});res.json({webinar:w});});

// ---------------- STUDENT / LIVE ----------------
app.get('/api/webinars', studentOnly, (req,res)=>{const d=db(),s=d.students.find(x=>x.studentId===req.student.studentId && x.active!==false); if(!s)return res.status(404).json({error:'Student not found'}); const ids=[...(s.enrollments||[]).map(e=>Number(e.courseId)),...(s.courseId!=null?[Number(s.courseId)]:[])]; res.json({webinars:d.webinars.filter(w=>(w.status==='live'||new Date(w.startAt)>=new Date())&&ids.includes(Number(w.courseId))).slice(0,50)});});
app.get('/api/notifications',studentOnly,(req,res)=>{const d=db(),s=d.students.find(x=>x.studentId===req.student.studentId);res.json({notifications:d.notifications.filter(n=>n.audience==='all'||n.studentIds?.includes(s.studentId)||n.courseIds?.includes(s.courseId))});});

// ---------------- PAYMENTS ----------------
app.post('/api/payment/initialize', async (req,res)=>{
  try{
    const {provider,email,name,phone,description,courseId,duration,bookId}=req.body||{};
    const method=String(provider||'').trim();
    if(!['Paystack','Flutterwave'].includes(method)||!email||!name||!phone||!description)return res.status(400).json({error:'Missing payment details'});
    const catalog=loadCatalog(); let amountNaira=0,planLabel='',itemName=description,validatedCourseId=null;
    if(courseId!=null){
      const course=catalog.courses.find(c=>Number(c.id)===Number(courseId));
      const plan=coursePlan(course,duration);
      if(!course||!plan)return res.status(400).json({error:'Invalid course or course duration'});
      amountNaira=plan.amount;planLabel=plan.label;itemName=course.name;validatedCourseId=Number(course.id);
    }else if(bookId!=null){
      const book=catalog.books.find(b=>String(b.id)===String(bookId));
      amountNaira=nairaNumber(book?.price); if(!book||amountNaira<=0)return res.status(400).json({error:'Invalid book or book price'});
      planLabel='Book purchase'; itemName=book.title;
    }else{return res.status(400).json({error:'A course or book must be selected'});}
    if(amountNaira<=0)return res.status(400).json({error:'Invalid payment amount'});
    const ref=`GE-TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const d=db(); const payment={transactionId:ref,candidateName:String(name).trim(),candidateEmail:String(email).trim().toLowerCase(),candidatePhone:String(phone).trim(),paymentFor:description,item:itemName,type:courseId!=null?'course':'book',duration:planLabel,amount:courseId!=null?(coursePlan(catalog.courses.find(c=>Number(c.id)===Number(courseId)),duration).display):`₦${amountNaira.toLocaleString('en-NG')}`,amountNaira,status:'PENDING',method:method,date:new Date().toISOString(),courseId:validatedCourseId,bookId:bookId??null,studentId:''};
    d.payments.unshift(payment);save(d);log('Payment initialized',{reference:ref,provider:method,amount:amountNaira,courseId:validatedCourseId});
    if(method==='Paystack'){
      if(!process.env.PAYSTACK_SECRET_KEY)return res.status(503).json({error:'PAYSTACK_SECRET_KEY is not configured'});
      const r=await fetch('https://api.paystack.co/transaction/initialize',{method:'POST',headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({email:String(email).trim(),amount:Math.round(amountNaira*100),reference:ref,metadata:{candidateName:name,candidatePhone:phone,paymentFor:description,courseId:validatedCourseId,courseName:validatedCourseId?itemName:'',duration:planLabel},callback_url:`${BASE_URL}/receipt.html?provider=Paystack`})});
      const data=await r.json();if(!r.ok||!data.status)return res.status(400).json({error:data.message||'Paystack initialization failed'});return res.json({provider:method,authorization_url:data.data.authorization_url,reference:data.data.reference,amount:amountNaira});
    }
    if(!process.env.FLUTTERWAVE_SECRET_KEY)return res.status(503).json({error:'FLUTTERWAVE_SECRET_KEY is not configured'});
    const r=await fetch('https://api.flutterwave.com/v3/payments',{method:'POST',headers:{Authorization:`Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({tx_ref:ref,amount:amountNaira,currency:'NGN',redirect_url:`${BASE_URL}/receipt.html?provider=Flutterwave`,customer:{email:String(email).trim(),name:String(name).trim(),phone:String(phone).trim()},customizations:{title:'Godwin Empire',description},meta:{paymentFor:description,candidateName:name,candidatePhone:phone,courseId:validatedCourseId,courseName:validatedCourseId?itemName:'',duration:planLabel}})});
    const data=await r.json();if(!r.ok||data.status!=='success')return res.status(400).json({error:data.message||'Flutterwave initialization failed'});return res.json({provider:method,authorization_url:data.data.link,reference:ref,amount:amountNaira});
  }catch(err){res.status(500).json({error:'Payment initialization failed',detail:err.message});}
});

function finalizeCourseEnrollment(d,p,courseId,courseName,duration){
  if(!courseId)return;
  let student=d.students.find(s=>s.studentId===p.studentId);
  if(!student){
    let sid; do { sid=`GE-STU-${Math.floor(100000+Math.random()*900000)}`; } while(d.students.some(s=>s.studentId===sid));
    p.studentId=sid; student={studentId:sid,name:p.candidateName,email:p.candidateEmail,phone:p.candidatePhone||'',courseId:Number(courseId),courseName:courseName||courseNameFallback(courseId),enrollments:[],createdAt:new Date().toISOString(),active:true}; d.students.push(student);
  }
  student.enrollments=Array.isArray(student.enrollments)?student.enrollments:[];
  const existing=student.enrollments.find(e=>Number(e.courseId)===Number(courseId));
  const enrollment={courseId:Number(courseId),courseName:courseName||courseNameFallback(courseId),duration:duration||p.duration,transactionId:p.transactionId,enrolledAt:p.paidAt||new Date().toISOString(),status:'active'};
  if(existing)Object.assign(existing,enrollment); else student.enrollments.push(enrollment);
  student.courseId=Number(courseId);student.courseName=courseName||courseNameFallback(courseId);
}
app.get('/api/payment/verify', async (req,res)=>{
  try{
    const reference=String(req.query.reference||'').trim(); if(!reference)return res.status(400).json({error:'Missing payment reference'});
    if(!process.env.PAYSTACK_SECRET_KEY)return res.status(503).json({error:'PAYSTACK_SECRET_KEY is not configured'});
    const r=await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,{headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`}}); const data=await r.json();
    if(!r.ok||!data.status||!data.data)return res.status(400).json({error:data.message||'Unable to verify payment'});
    const tx=data.data,d=db(),p=d.payments.find(x=>x.transactionId===reference); if(!p)return res.status(404).json({error:'Payment record not found'});
    const expected=Math.round(Number(p.amountNaira||0)*100); if(Number(tx.amount)!==expected)return res.status(400).json({error:'Payment amount does not match the order'});
    const status=String(tx.status||'').toLowerCase();
    if(status==='success'){
      const wasPaid=String(p.status).toUpperCase()==='PAID'; p.status='PAID';p.paidAt=p.paidAt||new Date().toISOString();p.providerTransactionId=tx.id||'';p.channel=tx.channel||'';
      const meta=tx.metadata||{};finalizeCourseEnrollment(d,p,meta.courseId||p.courseId,meta.courseName,p.duration||meta.duration);
      if(!wasPaid){d.notifications.unshift({id:id('NOT'),title:'Payment confirmed',message:`Payment received for ${p.item}. Your enrollment and Student ID are now active.`,audience:'student',studentIds:p.studentId?[p.studentId]:[],courseIds:[],from:'Godwin Empire',date:new Date().toISOString()});log('Paystack payment verified',{reference,status:p.status,studentId:p.studentId});}
      save(d);return res.json({ok:true,paid:true,payment:p,transaction:tx});
    }
    p.status=status==='abandoned'?'FAILED':'PENDING';save(d);return res.json({ok:true,paid:false,status:p.status,payment:p});
  }catch(err){return res.status(500).json({error:'Payment verification failed',detail:err.message});}
});

app.get('/api/payment/verify-flutterwave',async(req,res)=>{
  try{
    const transactionId=String(req.query.transaction_id||'').trim(),txRef=String(req.query.tx_ref||'').trim();if(!transactionId&&!txRef)return res.status(400).json({error:'Missing Flutterwave transaction details'});
    if(!process.env.FLUTTERWAVE_SECRET_KEY)return res.status(503).json({error:'FLUTTERWAVE_SECRET_KEY is not configured'});
    let url=transactionId?`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`:null;if(!url)return res.status(400).json({error:'Missing Flutterwave transaction ID'});
    const r=await fetch(url,{headers:{Authorization:`Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`}}),data=await r.json();if(!r.ok||data.status!=='success'||!data.data)return res.status(400).json({error:data.message||'Unable to verify Flutterwave payment'});
    const tx=data.data,d=db(),reference=String(tx.tx_ref||txRef),p=d.payments.find(x=>x.transactionId===reference);if(!p)return res.status(404).json({error:'Payment record not found'});
    const expected=Number(p.amountNaira||0);if(Math.abs(Number(tx.amount)-expected)>0.01||String(tx.currency||'').toUpperCase()!=='NGN')return res.status(400).json({error:'Payment amount or currency does not match the order'});
    const paid=String(tx.status||'').toLowerCase()==='successful';if(paid){const wasPaid=String(p.status).toUpperCase()==='PAID';p.status='PAID';p.paidAt=p.paidAt||new Date().toISOString();p.providerTransactionId=tx.id||'';p.channel=tx.payment_type||'';const meta=tx.meta||{};finalizeCourseEnrollment(d,p,meta.courseId||p.courseId,meta.courseName,p.duration||meta.duration);if(!wasPaid){d.notifications.unshift({id:id('NOT'),title:'Payment confirmed',message:`Payment received for ${p.item}. Your enrollment and Student ID are now active.`,audience:'student',studentIds:p.studentId?[p.studentId]:[],courseIds:[],from:'Godwin Empire',date:new Date().toISOString()});log('Flutterwave payment verified',{reference,status:p.status,studentId:p.studentId});}save(d);return res.json({ok:true,paid:true,payment:p,transaction:tx});}
    p.status='FAILED';save(d);return res.json({ok:true,paid:false,status:p.status,payment:p});
  }catch(err){return res.status(500).json({error:'Flutterwave verification failed',detail:err.message});}
});

app.get('/api/paystack/config',(req,res)=>res.json({publicKey:PAYSTACK_PUBLIC_KEY}));

app.post('/api/payment/webhook',(req,res)=>{
  const provider=String(req.headers['x-payment-provider']||req.query.provider||'').toLowerCase();
  const body=req.rawBody||Buffer.from(JSON.stringify(req.body||{}));
  let verified=false;
  if(provider==='paystack' || req.headers['x-paystack-signature']){
    if(!process.env.PAYSTACK_SECRET_KEY)return res.status(503).json({error:'PAYSTACK_SECRET_KEY is not configured'});
    const expected=crypto.createHmac('sha512',process.env.PAYSTACK_SECRET_KEY).update(body).digest('hex');
    verified=String(req.headers['x-paystack-signature']||'')===expected;
  }else if(provider==='flutterwave' || req.headers['verif-hash']){
    const expected=process.env.FLUTTERWAVE_WEBHOOK_HASH||'';
    verified=!!expected && String(req.headers['verif-hash']||'')===expected;
  }else{
    return res.status(400).json({error:'Identify payment provider'});
  }
  if(!verified)return res.status(401).json({error:'Invalid payment webhook signature'});
  const b=req.body||{};
  const data=b.data||b;
  const reference=String(data.reference||data.tx_ref||data.transaction?.reference||data.id||'');
  if(!reference)return res.status(400).json({error:'Missing transaction reference'});
  const paidStatus=String(data.status||data.transaction?.status||'').toLowerCase();
  const d=db(); const p=d.payments.find(x=>x.transactionId===reference);
  if(!p)return res.status(404).json({error:'Payment record not found'});
  if(paidStatus && !['success','successful','paid'].includes(paidStatus)){p.status='FAILED';save(d);return res.json({received:true,status:p.status});}
  p.status='PAID'; p.paidAt=new Date().toISOString(); p.providerTransactionId=data.id||data.transaction_id||'';
  const meta=data.metadata||data.meta||{}; const courseId=meta.courseId||p.courseId;
  if(courseId && !d.students.some(s=>s.studentId===p.studentId && p.studentId)){
    const sid=p.studentId||`GE-STU-${Math.floor(100000+Math.random()*900000)}`; p.studentId=sid;
    if(!d.students.some(s=>s.studentId===sid)){d.students.push({studentId:sid,name:p.candidateName,email:p.candidateEmail,phone:p.candidatePhone||'',courseId:Number(courseId),courseName:meta.courseName||courseNameFallback(courseId),createdAt:new Date().toISOString(),active:true});}
  }
  d.notifications.unshift({id:id('NOT'),title:'Payment confirmed',message:`Payment received for ${p.paymentFor}. Your receipt and enrollment are available in your student portal.`,audience:'student',studentIds:p.studentId?[p.studentId]:[],courseIds:[],from:'Godwin Empire',date:new Date().toISOString()});
  save(d);log('Payment verified',{reference,status:p.status,studentId:p.studentId});res.json({received:true,status:p.status,studentId:p.studentId});
});
function courseNameFallback(id){return `Course ${id}`;}

// Serve the actual website so VS Code can run it with: npm start
app.use(express.static(__dirname));
app.get('/api/health',(req,res)=>res.json({ok:true,service:'godwin-empire'}));
app.listen(PORT,()=>console.log(`Godwin Empire running at ${BASE_URL}`));
