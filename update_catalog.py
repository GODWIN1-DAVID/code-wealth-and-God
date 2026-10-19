import json,re,random
from pathlib import Path
p=Path('/mnt/data/godwin_work/assets/data.js')
s=p.read_text()
m=re.search(r'window\.GE_COURSES\s*=\s*(\[.*?\]);',s,re.S)
courses=json.loads(m.group(1))
new_courses=[
{"name":"Data Science & Analytics","description":"Learn data cleaning, statistics, Python analysis, visualization and practical decision-making with data.","twoWeek":"₦60,000","month":"₦105,000","year":"₦340,000","schedule":"Monday & Wednesday · 9:00 AM – 11:00 AM","start":"2026-10-26"},
{"name":"Billionaire Mindset & Personal Growth","description":"Build disciplined thinking, financial habits, goal setting, confidence and long-term personal growth skills.","twoWeek":"₦35,000","month":"₦60,000","year":"₦200,000","schedule":"Tuesday & Thursday · 10:00 AM – 12:00 PM","start":"2026-11-02"},
{"name":"Business Strategy & Leadership","description":"Develop practical skills in strategy, leadership, decision-making, team building and business growth.","twoWeek":"₦55,000","month":"₦95,000","year":"₦310,000","schedule":"Monday & Wednesday · 2:00 PM – 4:00 PM","start":"2026-11-23"},
{"name":"Content Creation & YouTube","description":"Plan, create and grow useful digital content for YouTube and social platforms using repeatable workflows.","twoWeek":"₦45,000","month":"₦75,000","year":"₦250,000","schedule":"Tuesday & Thursday · 2:00 PM – 4:00 PM","start":"2026-12-01"},
{"name":"Canva & Creative Design","description":"Create professional social graphics, presentations, marketing materials and brand assets with Canva.","twoWeek":"₦35,000","month":"₦60,000","year":"₦200,000","schedule":"Monday & Wednesday · 4:00 PM – 6:00 PM","start":"2026-12-07"},
]
base_benefits=["Practical lessons and projects","Mentor-led learning structure","Student community access","Certificate pathway","Exam and assessment access"]
base_curr=["Foundations & setup","Core concepts","Hands-on exercises","Real-world project","Assessment & next steps"]
for i,nc in enumerate(new_courses, start=len(courses)+1):
    nc={"id":i,**nc,"benefits":base_benefits,"curriculum":base_curr}
    courses.append(nc)

# Curated book-title families by course. Every course receives books; web development is deliberately reduced.
templates={
"Web Development":["Complete Guide to Web Development","Practical Handbook for Web Development","Web Developer's Project Guide","Frontend to Backend Roadmap","Building Responsive Websites","Modern HTML & CSS Workbook","JavaScript for Web Creators","Web Projects Field Manual","Website Launch Checklist","The Beginner's Web Lab","Professional Web Development Notes","Web Development Quick Reference"],
"Frontend Development":["Frontend Foundations","Responsive Interface Handbook","Modern CSS Layouts","Accessible UI Workbook","Frontend Projects Lab"],
"Backend Development":["Backend Foundations","API Design Handbook","Database-Driven Applications","Authentication & Security Guide","Server-Side Projects Lab"],
"Full-Stack Development":["Full-Stack Roadmap","Full-Stack Projects Handbook","Frontend + Backend Integration","Production App Blueprint","Full-Stack Developer Field Guide"],
"Software Development":["Software Engineering Foundations","Clean Code Field Guide","Testing & Debugging Handbook","Software Architecture Notes","Developer Workflow Manual"],
"Python Programming":["Python from Zero","Python Automation Handbook","Python Projects Lab","Practical Python Patterns","Python for Business Tasks"],
"JavaScript Mastery":["JavaScript Mastery Guide","Async JavaScript Handbook","DOM & Browser Projects","Modern JavaScript Patterns","JavaScript Interview Workbook"],
"React Development":["React Foundations","React Projects Handbook","Components & State Guide","Modern React Patterns","React App Deployment Manual"],
"Mobile App Development":["Mobile App Foundations","Cross-Platform App Handbook","Mobile UI Projects","App Launch Field Guide","Mobile Developer Workbook"],
"AI & Machine Learning":["AI Foundations","Machine Learning Practical Guide","Model Building Workbook","Applied AI Projects","AI Evaluation Handbook"],
"AI Automation":["AI Automation Playbook","Business Workflow Automation","AI Agents & Tasks Guide","Automation Projects Lab","Practical AI Systems"],
"Prompt Engineering":["Prompt Engineering Master Guide","Prompt Patterns Workbook","Reliable AI Instructions","Prompt Testing & Evaluation","AI Workflow Promptbook"],
"Technical Analysis":["Technical Analysis Foundations","Market Structure Handbook","Candlestick & Chart Guide","Indicators & Setups Workbook","Technical Analysis Field Manual"],
"Forex Trading":["Forex Trading Foundations","Price Action Forex Guide","Forex Risk Management","Trading Psychology Workbook","Forex Setups Field Manual"],
"Crypto Trading":["Crypto Trading Foundations","Crypto Market Structure","Digital Asset Risk Guide","Crypto Technical Analysis","Crypto Trading Psychology"],
"Stock Trading":["Stock Trading Foundations","Price Action for Stocks","Stock Risk Management","Trading Psychology for Stocks","Stock Trading Field Guide"],
"Stock Market Analysis":["Stock Market Analysis Foundations","Company Research Handbook","Fundamental Analysis Workbook","Valuation & Research Guide","Market Analysis Field Manual"],
"Bond Trading":["Bond Market Foundations","Yields & Duration Handbook","Fixed Income Analysis","Bond Trading Risk Guide","Fixed Income Field Manual"],
"Options Trading":["Options Trading Foundations","Calls & Puts Handbook","Options Risk Management","Strategy & Greeks Workbook","Options Trading Field Guide"],
"Risk Management":["Risk Management Foundations","Position Sizing Handbook","Capital Protection Guide","Trading Risk Workbook","Risk Management Field Manual"],
"Dropshipping":["Dropshipping Foundations","Product Research Handbook","Store Launch Guide","Supplier & Fulfillment Manual","Dropshipping Growth Workbook"],
"E-commerce":["E-commerce Foundations","Online Store Handbook","Product Page Playbook","E-commerce Operations Guide","Digital Store Growth Manual"],
"Digital Marketing":["Digital Marketing Foundations","Content Marketing Handbook","Paid Ads Workbook","Marketing Analytics Guide","Digital Growth Field Manual"],
"Affiliate Marketing":["Affiliate Marketing Foundations","Offer Research Handbook","Affiliate Content Playbook","Conversion Guide","Affiliate Growth Workbook"],
"Graphic Design":["Graphic Design Foundations","Design Principles Handbook","Visual Communication Workbook","Brand Graphics Guide","Graphic Design Project Lab"],
"UI/UX Design":["UI/UX Foundations","User Research Handbook","Wireframing & Prototyping Guide","Interface Design Workbook","UX Project Field Guide"],
"Cybersecurity":["Cybersecurity Foundations","Network Security Handbook","Secure Systems Guide","Security Awareness Workbook","Cyber Defense Field Manual"],
"Data Analysis":["Data Analysis Foundations","Excel & Data Workbook","Data Cleaning Handbook","Data Visualization Guide","Practical Analytics Projects"],
"Business & Entrepreneurship":["Entrepreneurship Foundations","Business Model Handbook","Startup Planning Guide","Small Business Growth Workbook","Entrepreneur's Field Manual"],
"Freelancing & Digital Skills":["Freelancing Foundations","Client Acquisition Handbook","Portfolio & Proposal Guide","Digital Skills Workbook","Freelancer Growth Manual"],
"Cloud Computing":["Cloud Computing Foundations","Cloud Architecture Handbook","Cloud Services Guide","Cloud Projects Workbook","Cloud Practitioner Field Manual"],
"DevOps Engineering":["DevOps Foundations","CI/CD Handbook","Containers & Deployment Guide","Infrastructure Automation Workbook","DevOps Projects Field Manual"],
"SQL & Database Management":["SQL Foundations","Database Design Handbook","SQL Query Workbook","Database Administration Guide","Practical SQL Projects"],
"Power BI & Business Intelligence":["Power BI Foundations","Dashboard Design Handbook","DAX & Data Models Workbook","Business Intelligence Guide","Power BI Projects Field Manual"],
"No-Code Automation":["No-Code Foundations","Workflow Automation Handbook","Business Automation Guide","No-Code Projects Workbook","Automation Field Manual"],
"Social Media Management":["Social Media Foundations","Content Calendar Handbook","Community Management Guide","Social Growth Workbook","Social Media Field Manual"],
"Copywriting":["Copywriting Foundations","Sales Copy Handbook","Persuasive Writing Workbook","Landing Page Copy Guide","Copywriter's Field Manual"],
"Video Editing":["Video Editing Foundations","Editing Workflow Handbook","Storytelling for Video","Short-Form Video Workbook","Video Creator Field Guide"],
"Brand Strategy":["Brand Strategy Foundations","Brand Positioning Handbook","Identity & Messaging Guide","Brand Growth Workbook","Strategic Branding Field Manual"],
"Personal Finance & Wealth Building":["Personal Finance Foundations","Money Management Handbook","Saving & Investing Guide","Wealth Building Workbook","Personal Finance Field Manual"],
"Data Science & Analytics":["Data Science Foundations","Python for Data Science","Statistics for Practical Analysis","Data Visualization Handbook","Machine Learning for Analysts"],
"Billionaire Mindset & Personal Growth":["Billionaire Mindset Playbook","The Boy Who Refused to Think: A Mindset Guide","Small Steps, Big Wealth","Discipline & Deep Work Handbook","The Wealth Habits Workbook"],
"Business Strategy & Leadership":["Business Strategy Foundations","Leadership Principles Handbook","Decision-Making Workbook","Team Building & Culture Guide","Business Growth Field Manual"],
"Content Creation & YouTube":["Content Creation Foundations","YouTube Channel Playbook","Video Content Strategy Handbook","Audience Growth Workbook","Creator Business Field Guide"],
"Canva & Creative Design":["Canva Foundations","Canva Social Media Design Handbook","Canva Brand Kit Workbook","Presentation Design Guide","Creative Design Field Manual"],
}

# Build books fresh so titles are varied by skill instead of repetitive web-development volumes.
books=[]
book_id=1
prices=[7500,9000,10500,12000,13500,15000,16500,18000,19500,21000,22500,12000,15000,18000,24000,9500,12500,14500,17500,20000,25000,11000,16000,22000,27500]
for c in courses:
    name=c['name']
    base=templates.get(name,[f"{name} Foundations",f"Practical {name} Handbook",f"{name} Workbook",f"{name} Field Guide",f"{name} Projects Manual"])
    count=12 if name=="Web Development" else 25
    for j in range(count):
        family=base[j%len(base)]
        vol=j+1
        title=family if j < len(base) else f"{family} — Vol. {vol}"
        if j < len(base) and j>=5:
            title=f"{family} — Vol. {vol}"
        price=prices[(book_id*3+j)%len(prices)]
        desc=f"A practical {name.lower()} guide covering key concepts, examples, exercises and useful reference material."
        details=f"A practical Godwin Empire guide for {name.lower()}, designed to help learners understand the subject, practice the key skills and use the material as a reference alongside the related course."
        benefits=[f"Build a stronger foundation in {name}","Learn with practical examples and step-by-step explanations",f"Use the guide as a reference while taking the {name} course","Practice useful skills through exercises and projects","Keep a reusable digital reference for future learning"]
        books.append({"id":book_id,"courseId":c['id'],"course":name,"title":title,"price":f"₦{price:,}","description":desc,"author":"Godwin Empire Academy","details":details,"benefits":benefits,"format":"Digital guide / eBook"})
        book_id+=1

p.write_text('window.GE_COURSES = '+json.dumps(courses,ensure_ascii=False)+';\nwindow.GE_BOOKS = '+json.dumps(books,ensure_ascii=False)+';\n')
print('courses',len(courses),'books',len(books))
