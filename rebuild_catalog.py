import json,re
from pathlib import Path
p=Path('/mnt/data/godwin_edit/assets/data.js')
s=p.read_text()
courses=json.loads(re.search(r'window\.GE_COURSES\s*=\s*(\[.*?\]);',s,re.S).group(1))

T={
"Web Development":["Complete Guide to Web Development","Practical Web Development Handbook","Responsive Website Builder Guide","HTML & CSS Project Workbook","JavaScript for Website Creators","Website Launch & Deployment Guide","Web Projects Field Manual","Professional Web Design Notes"],
"Frontend Development":["Frontend Foundations","Responsive Interface Handbook","Modern CSS Layouts","Accessible UI Workbook","Frontend Projects Lab","JavaScript UI Patterns","Frontend Performance Guide","Design-to-Code Workflow"],
"Backend Development":["Backend Foundations","API Design Handbook","Database-Driven Applications","Authentication & Security Guide","Server-Side Projects Lab","Node & API Workbook","Backend Architecture Field Guide","Production API Checklist"],
"Full-Stack Development":["Full-Stack Roadmap","Full-Stack Projects Handbook","Frontend + Backend Integration","Production App Blueprint","Full-Stack Developer Field Guide","Database & API Workbook","Deployment for Full-Stack Apps","Real-World Full-Stack Projects"],
"Software Development":["Software Engineering Foundations","Clean Code Field Guide","Software Testing & QA Handbook","Software Architecture Notes","Developer Workflow Manual","Debugging & Problem Solving","Agile Software Projects","Professional Software Engineering Guide"],
"Python Programming":["Python from Zero","Python Automation Handbook","Python Projects Lab","Practical Python Patterns","Python for Business Tasks","Python APIs & Web Tools","Python Data Toolkit","Python Problem-Solving Workbook"],
"JavaScript Mastery":["JavaScript Mastery Guide","Async JavaScript Handbook","DOM & Browser Projects","Modern JavaScript Patterns","JavaScript Interview Workbook","ESNext Practical Guide","JavaScript Automation Lab","Advanced JavaScript Field Manual"],
"React Development":["React Foundations","React Projects Handbook","Components & State Guide","Modern React Patterns","React App Deployment Manual","React Hooks Workbook","React Performance Guide","Production React Field Manual"],
"Mobile App Development":["Mobile App Foundations","Cross-Platform App Handbook","Mobile UI Projects","App Launch Field Guide","Mobile Developer Workbook","App Business & Monetization","Mobile UX Guide","Practical App Publishing"],
"AI & Machine Learning":["AI Odyssey","AI Engineering Foundations","AI Foundations","Machine Learning Practical Guide","Model Building Workbook","Applied AI Projects","AI Evaluation Handbook","Deep Learning Starter Guide","AI Data Preparation Manual","Responsible AI Field Guide"],
"AI Automation":["World of AI Automation","ChatGPT Monetization Guide","AI Automation Playbook","Business Workflow Automation","AI Agents & Tasks Guide","Automation Projects Lab","No-Code AI Systems","AI Automation for Small Business","Practical AI Workflow Blueprint"],
"Prompt Engineering":["Prompt Engineering Master Guide","Prompt Patterns Workbook","Reliable AI Instructions","Prompt Testing & Evaluation","AI Workflow Promptbook","Advanced Prompt Design","Prompt Engineering for Business","Practical ChatGPT Prompt Guide"],
"Technical Analysis":["Technical Analysis Foundations","Market Structure Handbook","Candlestick & Chart Guide","Indicators & Setups Workbook","Technical Analysis Field Manual","Price Action Blueprint","Trading Chart Patterns","Technical Analysis Risk Guide"],
"Forex Trading":["Simplified Forex","Forex Trading Foundations","Price Action Forex Guide","Forex Risk Management","Forex Trading Psychology","Forex Setups Field Manual","Beginner's Forex Blueprint","Forex Journal & Strategy Workbook"],
"Crypto Trading":["Crypto Trading Foundations","Crypto Staking Guide","Crypto Market Structure","Digital Asset Risk Guide","Crypto Technical Analysis","Crypto Trading Psychology","Crypto Trading Blueprint","Bitcoin & Altcoin Trading Guide","Crypto Portfolio & Risk Workbook"],
"Stock Trading":["Stock Trading Foundations","Price Action for Stocks","Stock Risk Management","Trading Psychology for Stocks","Stock Trading Field Guide","Stock Market Beginner's Guide","Equity Trading Blueprint","Stock Trading Journal Workbook"],
"Stock Market Analysis":["Stock Market Analysis Foundations","Company Research Handbook","Fundamental Analysis Workbook","Valuation & Research Guide","Market Analysis Field Manual","Financial Statements for Investors","Equity Research Blueprint","Stock Screening Guide"],
"Bond Trading":["Bond Market Foundations","Yields & Duration Handbook","Fixed Income Analysis","Bond Trading Risk Guide","Fixed Income Field Manual","Bond Pricing & Valuation Guide","Government Bond Trading Guide","Bond Portfolio Workbook"],
"Options Trading":["Options Trading Foundations","Calls & Puts Handbook","Options Risk Management","Strategies & Greeks Workbook","Options Trading Field Guide","Options Pricing Simplified","Covered Calls & Spreads Guide","Options Trading Journal"],
"Risk Management":["Risk Management Foundations","Position Sizing Handbook","Capital Protection Guide","Trading Risk Workbook","Risk Management Field Manual","Portfolio Risk Blueprint","Risk Psychology Guide","Practical Risk Controls"],
"Dropshipping":["World of Dropshipping","Dropshipping Foundations","Product Research Handbook","Store Launch Guide","Supplier & Fulfillment Manual","Dropshipping Growth Workbook","Winning Product Blueprint","Dropshipping Ads & Conversion Guide"],
"E-commerce":["E-commerce Foundations","Online Store Handbook","Product Page Playbook","E-commerce Operations Guide","Digital Store Growth Manual","E-commerce Customer Service Guide","Store Conversion Blueprint","Online Business Systems"],
"Digital Marketing":["Digital Marketing Foundations","Growth Hacking Blueprint","Digital Marketing Blueprint","Content Marketing Handbook","Paid Ads Workbook","Marketing Analytics Guide","Digital Growth Field Manual","Email Marketing Playbook","Customer Acquisition Guide"],
"Affiliate Marketing":["Affiliate Marketing Foundations","Offer Research Handbook","Affiliate Content Playbook","Conversion Guide","Affiliate Growth Workbook","Affiliate Marketing Blueprint","Niche Research Guide","Affiliate Sales Funnel Manual"],
"Graphic Design":["Graphic Design Foundations","Design Principles Handbook","Visual Communication Workbook","Brand Graphics Guide","Graphic Design Project Lab","Logo Design Blueprint","Social Media Graphics Guide","Creative Portfolio Handbook"],
"UI/UX Design":["UI/UX Foundations","User Research Handbook","Wireframing & Prototyping Guide","Interface Design Workbook","UX Project Field Guide","Design Systems Handbook","Usability Testing Guide","UX Portfolio Blueprint"],
"Cybersecurity":["Cyber Friend: Online Safety & Cybersecurity Guide","Cybersecurity Foundations","Network Security Handbook","Secure Systems Guide","Security Awareness Workbook","Cyber Defense Field Manual","Ethical Hacking Starter Guide","Cybersecurity Career Blueprint"],
"Data Analysis":["Data Analysis Foundations","Excel & Data Workbook","Data Cleaning Handbook","Data Visualization Guide","Practical Analytics Projects","Data Analysis with Spreadsheets","Business Data Analysis Blueprint","Analytics Reporting Guide"],
"Business & Entrepreneurship":["Amazon KDP Blueprint","Entrepreneurship Foundations","Business Model Handbook","Startup Planning Guide","Small Business Growth Workbook","Entrepreneur's Field Manual","GTL Blueprint","Business Launch Blueprint","Profit & Growth Strategy Guide"],
"Freelancing & Digital Skills":["Freelancing Foundations","Client Acquisition Handbook","Portfolio & Proposal Guide","Digital Skills Workbook","Freelancer Growth Manual","Freelance Business Blueprint","Remote Work Starter Guide","Client Retention Playbook"],
"Cloud Computing":["Cloud Computing Foundations","Cloud Architecture Handbook","Cloud Services Guide","Cloud Projects Workbook","Cloud Practitioner Field Manual","Cloud Security Basics","Cloud Deployment Blueprint","Practical Cloud Operations"],
"DevOps Engineering":["DevOps Foundations","CI/CD Handbook","Containers & Deployment Guide","Infrastructure Automation Workbook","DevOps Projects Field Manual","Docker & Kubernetes Starter Guide","Release Engineering Blueprint","DevOps Security Guide"],
"SQL & Database Management":["SQL Foundations","Database Design Handbook","SQL Query Workbook","Database Administration Guide","Practical SQL Projects","SQL Reporting Guide","Relational Database Blueprint","SQL Performance Handbook"],
"Power BI & Business Intelligence":["Power BI Foundations","Dashboard Design Handbook","DAX & Data Models Workbook","Business Intelligence Guide","Power BI Projects Field Manual","Business Dashboard Blueprint","Power BI Reporting Guide","Analytics Storytelling Handbook"],
"No-Code Automation":["No-Code Foundations","Workflow Automation Handbook","Business Automation Guide","No-Code Projects Workbook","Automation Field Manual","No-Code Business Blueprint","Forms & Workflow Systems","Practical Automation Recipes"],
"Social Media Management":["Social Media Foundations","Content Calendar Handbook","Community Management Guide","Social Growth Workbook","Social Media Field Manual","Social Media Strategy Blueprint","Facebook Beginner's Guide","Instagram & TikTok Growth Guide"],
"Copywriting":["Copywriting Foundations","Sales Copy Handbook","Persuasive Writing Workbook","Landing Page Copy Guide","Copywriter's Field Manual","Direct Response Blueprint","Email Copywriting Guide","High-Converting Headlines Workbook"],
"Video Editing":["Video Editing Foundations","Editing Workflow Handbook","Storytelling for Video","Short-Form Video Workbook","Video Creator Field Guide","CapCut Editing Blueprint","Premiere Pro Starter Guide","Professional Video Editing Handbook"],
"Brand Strategy":["Brand Strategy Foundations","Brand Positioning Handbook","Identity & Messaging Guide","Brand Growth Workbook","Strategic Branding Field Manual","Personal Brand Blueprint","Brand Storytelling Guide","Customer Perception Handbook"],
"Personal Finance & Wealth Building":["Personal Finance Foundations","Money Management Handbook","Saving & Investing Guide","Wealth Building Workbook","Personal Finance Field Manual","Smart Money Blueprint","Budgeting & Cashflow Guide","Long-Term Wealth Planning"],
"Data Science & Analytics":["Data Science Foundations","Python for Data Science","Statistics for Practical Analysis","Data Visualization Handbook","Machine Learning for Analysts","Data Science Project Guide","Predictive Analytics Blueprint","Practical Data Science Workbook"],
"Billionaire Mindset & Personal Growth":["Billionaire Mindset Playbook","The Boy Who Refused to Think: A Mindset Guide","Small Steps, Big Wealth","Discipline & Deep Work Handbook","The Wealth Habits Workbook","Millionaire Habits Blueprint","Confidence & Personal Growth Guide","Goals, Focus & Execution Manual"],
"Business Strategy & Leadership":["Business Strategy Foundations","Leadership Principles Handbook","Decision-Making Workbook","Team Building & Culture Guide","Business Growth Field Manual","GTL Blueprint: Leadership Edition","Strategic Planning Handbook","Executive Thinking Workbook"],
"Content Creation & YouTube":["Content Creation Foundations","YouTube Channel Playbook","Video Content Strategy Handbook","Audience Growth Workbook","Creator Business Field Guide","YouTube Monetization Blueprint","Content Planning & Scripting Guide","Creator Brand Handbook"],
"Canva & Creative Design":["Canva Foundations","Canva Social Media Design Handbook","Canva Brand Kit Workbook","Presentation Design Guide","Creative Design Field Manual","Canva Business Blueprint","Canva Marketing Templates Guide","Canva for Digital Products"],
}

# Add books for every existing course. These are original Godwin Empire catalog guides; named topics are titles, not claims about third-party publications.
prices=[7500,9000,10500,12000,13500,15000,16500,18000,19500,21000,22500,24000,12500,17500,25000]
books=[]; bid=1
for c in courses:
    name=c['name']; titles=T.get(name,[f"{name} Foundations",f"Practical {name} Handbook",f"{name} Workbook",f"{name} Blueprint",f"{name} Field Guide",f"{name} Projects Manual",f"{name} for Beginners",f"Advanced {name} Guide"])
    count=8 if name in {"Web Development","Frontend Development","Backend Development","Full-Stack Development","Software Development","Python Programming","JavaScript Mastery","React Development"} else 12
    for j in range(count):
        title=titles[j%len(titles)] if j < len(titles) else f"{titles[j%len(titles)]} — Vol. {j//len(titles)+1}"
        if j>=len(titles): title=f"{titles[j%len(titles)]} — Vol. {j//len(titles)+1}"
        price=prices[(bid+j*2)%len(prices)]
        desc=f"A practical Godwin Empire learning guide for {name.lower()}, with explanations, examples, exercises and useful reference material."
        details=f"This digital guide supports the {name} course and gives learners a practical way to study, review concepts, follow examples and practise useful skills outside class."
        benefits=[f"Build a practical foundation in {name}","Learn with clear examples and step-by-step explanations",f"Use the book alongside the {name} course","Practise with exercises, checklists and projects","Keep a reusable digital reference for future learning"]
        books.append({"id":bid,"courseId":c["id"],"course":name,"title":title,"price":f"₦{price:,}","description":desc,"author":"Godwin Empire Academy","details":details,"benefits":benefits,"format":"Digital guide / eBook"})
        bid+=1
p.write_text('window.GE_COURSES = '+json.dumps(courses,ensure_ascii=False)+';\nwindow.GE_BOOKS = '+json.dumps(books,ensure_ascii=False)+';\n')
print(f'courses={len(courses)} books={len(books)}')
