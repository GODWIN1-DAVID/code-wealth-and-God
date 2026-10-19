import json,re
from pathlib import Path

root=Path('/mnt/data/godwin_edit')
data=root/'assets'/'data.js'
s=data.read_text()
cm=re.search(r'window\.GE_COURSES\s*=\s*(\[.*?\]);\s*window\.GE_BOOKS',s,re.S)
bm=re.search(r'window\.GE_BOOKS\s*=\s*(\[.*\]);\s*$',s,re.S)
courses=json.loads(cm.group(1)); books=json.loads(bm.group(1))

new_courses=[
{"id":46,"name":"Public Speaking & Communication","description":"Build confidence, presentation skills, storytelling and professional communication for school, business and everyday life.","twoWeek":"₦35,000","month":"₦60,000","year":"₦200,000","schedule":"Monday & Wednesday · 10:00 AM – 12:00 PM","start":"2026-10-26","benefits":["Practical lessons and speaking exercises","Presentation and communication practice","Mentor-led learning structure","Certificate pathway","Exam and assessment access"],"curriculum":["Communication foundations","Public speaking & confidence","Storytelling and presentation","Real-world speaking projects","Assessment & next steps"]},
{"id":47,"name":"Sales & Negotiation","description":"Learn prospecting, selling, negotiation, customer psychology and practical techniques for closing business deals.","twoWeek":"₦40,000","month":"₦70,000","year":"₦230,000","schedule":"Tuesday & Thursday · 11:00 AM – 1:00 PM","start":"2026-10-27","benefits":["Practical sales exercises","Negotiation frameworks","Customer psychology lessons","Certificate pathway","Exam and assessment access"],"curriculum":["Sales foundations","Prospecting and lead generation","Negotiation skills","Closing and retention","Assessment & next steps"]},
{"id":48,"name":"Project Management","description":"Learn how to plan, organize, execute and track projects using practical project management methods and tools.","twoWeek":"₦45,000","month":"₦75,000","year":"₦250,000","schedule":"Monday & Wednesday · 12:00 PM – 2:00 PM","start":"2026-10-28","benefits":["Practical project planning","Project tools and workflows","Risk and timeline management","Certificate pathway","Exam and assessment access"],"curriculum":["Project foundations","Planning and scheduling","Team and resource management","Risk and delivery","Assessment & next steps"]},
{"id":49,"name":"Accounting & Bookkeeping","description":"Understand bookkeeping, financial records, budgeting, cash flow and practical accounting for individuals and businesses.","twoWeek":"₦40,000","month":"₦70,000","year":"₦230,000","schedule":"Tuesday & Thursday · 10:00 AM – 12:00 PM","start":"2026-10-29","benefits":["Practical bookkeeping exercises","Business finance fundamentals","Budgeting and cash-flow practice","Certificate pathway","Exam and assessment access"],"curriculum":["Accounting foundations","Recording transactions","Financial statements","Budgeting and cash flow","Assessment & next steps"]},
{"id":50,"name":"Customer Service & Business Communication","description":"Develop customer service, professional communication, complaint handling, relationship management and service excellence skills.","twoWeek":"₦35,000","month":"₦60,000","year":"₦200,000","schedule":"Monday & Wednesday · 2:00 PM – 4:00 PM","start":"2026-10-30","benefits":["Practical customer-service scenarios","Professional communication skills","Complaint and conflict handling","Certificate pathway","Exam and assessment access"],"curriculum":["Service foundations","Communication and listening","Customer experience","Conflict and retention","Assessment & next steps"]}
]

# avoid duplicates if rerun
existing={c['id'] for c in courses}
courses += [c for c in new_courses if c['id'] not in existing]

book_titles={
46:["Public Speaking Foundations","Confident Speaker Handbook","Presentation Skills Workbook","Storytelling for Business","Professional Communication Guide","Speech Writing Blueprint","Interview & Speaking Skills","Communication Mastery Field Guide","Body Language Handbook","Persuasive Speaking Guide","Public Speaking Practice Lab","Communication for Leaders"],
47:["Sales Foundations","Sales Psychology Handbook","Prospecting & Lead Generation Guide","Closing Sales Workbook","Negotiation Mastery Guide","Customer Psychology for Sales","Sales Funnel Blueprint","B2B Sales Field Manual","Objection Handling Handbook","High-Value Sales Guide","Sales Conversation Workbook","Relationship Selling Playbook"],
48:["Project Management Foundations","Project Planning Handbook","Project Scheduling Workbook","Agile Project Guide","Project Risk Management","Team Management for Projects","Project Documentation Guide","Project Management Field Manual","Project Budgeting Workbook","Project Delivery Blueprint","Project Tracking & Reporting","Practical Project Management Lab"],
49:["Accounting Foundations","Bookkeeping Handbook","Financial Records Workbook","Small Business Accounting Guide","Budgeting & Cash Flow","Financial Statements Simplified","Practical Bookkeeping Lab","Accounting for Entrepreneurs","Business Finance Field Manual","Profit & Loss Guide","Cash Management Workbook","Accounting & Bookkeeping Blueprint"],
50:["Customer Service Foundations","Business Communication Handbook","Customer Experience Workbook","Professional Email & Phone Skills","Complaint Handling Guide","Service Excellence Field Manual","Customer Retention Blueprint","Conflict Resolution Workbook","Customer Relationship Guide","Front Desk & Support Handbook","Business Etiquette Guide","Customer Service Practice Lab"]
}
prices=[7500,9000,10500,12000,13500,15000,16500,18000,19500,21000,22500,24000]
next_id=max(b['id'] for b in books)+1
course_map={c['id']:c for c in courses}
for cid,titles in book_titles.items():
    c=course_map[cid]
    # only add if course has no books yet
    if any(b['courseId']==cid for b in books):
        continue
    for j,title in enumerate(titles):
        price=prices[(next_id+j)%len(prices)]
        name=c['name']
        books.append({
            'id':next_id,'courseId':cid,'course':name,'title':title,'price':f'₦{price:,}',
            'description':f'A practical Godwin Empire learning guide for {name.lower()}, with explanations, examples, exercises and useful reference material.',
            'author':'Godwin Empire Academy',
            'details':f'This digital guide supports the {name} course and gives learners a practical way to study, review concepts, follow examples and practise useful skills outside class.',
            'benefits':[f'Build a practical foundation in {name}','Learn with clear examples and step-by-step explanations',f'Use the book alongside the {name} course','Practise with exercises, checklists and projects','Keep a reusable digital reference for future learning'],
            'format':'Digital guide / eBook'
        })
        next_id+=1

data.write_text('window.GE_COURSES = '+json.dumps(courses,ensure_ascii=False)+';\nwindow.GE_BOOKS = '+json.dumps(books,ensure_ascii=False)+';\n')

p=root/'courses.html'
t=p.read_text().replace('45 courses across coding, AI, business, creative skills and market education.','50 courses across coding, AI, business, finance, communication, creative skills and market education.')
p.write_text(t)

# Update README summary if present
rp=root/'README.md'
if rp.exists():
    txt=rp.read_text()
    txt=re.sub(r'45 courses', '50 courses', txt, flags=re.I)
    rp.write_text(txt)

print('courses',len(courses),'books',len(books),'new books',len(books)-508)
print('new courses:',', '.join(c['name'] for c in new_courses))
