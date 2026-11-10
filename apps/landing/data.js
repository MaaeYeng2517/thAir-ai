// AIverse — Data: AI Tools, Models & Resources

const AI_TOOLS = [
  // ===== CHATBOT & LLM =====
  {
    id: 1, name: "ChatGPT", company: "OpenAI", icon: "🤖",
    iconBg: "icon-bg-green", category: "chatbot", pricing: "freemium",
    tags: ["GPT-4o", "API", "Plugins"], rating: 4.8, votes: 98420,
    desc: "AI Chatbot ที่ทรงพลังที่สุด ตอบได้ทุกคำถาม เขียนโค้ด แปลภาษา วิเคราะห์ข้อมูล และอื่นๆ",
    url: "https://chat.openai.com", trending: true, isNew: false, isHot: true,
    date: "2022-11-30"
  },
  {
    id: 2, name: "Claude", company: "Anthropic", icon: "🧡",
    iconBg: "icon-bg-orange", category: "chatbot", pricing: "freemium",
    tags: ["Claude 3.5", "Long Context", "Safe AI"], rating: 4.8, votes: 54320,
    desc: "AI Assistant จาก Anthropic ที่เน้นความปลอดภัยและ Context Window ขนาดใหญ่ถึง 200K tokens",
    url: "https://claude.ai", trending: true, isNew: false, isHot: true,
    date: "2023-03-14"
  },
  {
    id: 3, name: "Gemini", company: "Google", icon: "✨",
    iconBg: "icon-bg-blue", category: "chatbot", pricing: "freemium",
    tags: ["Gemini 2.0", "Multimodal", "Google"], rating: 4.6, votes: 42150,
    desc: "AI รุ่นล่าสุดจาก Google DeepMind รองรับ Multimodal Input ทั้งข้อความ รูปภาพ วิดีโอ และเสียง",
    url: "https://gemini.google.com", trending: true, isNew: true, isHot: true,
    date: "2023-12-06"
  },
  {
    id: 4, name: "Perplexity AI", company: "Perplexity", icon: "🔮",
    iconBg: "icon-bg-purple", category: "search", pricing: "freemium",
    tags: ["AI Search", "Real-time", "Sources"], rating: 4.7, votes: 31200,
    desc: "Search Engine ที่ขับเคลื่อนด้วย AI ตอบคำถามพร้อมแหล่งอ้างอิง อัปเดต Real-time",
    url: "https://perplexity.ai", trending: true, isNew: false, isHot: true,
    date: "2022-08-01"
  },
  {
    id: 5, name: "Meta AI", company: "Meta", icon: "🔵",
    iconBg: "icon-bg-blue", category: "chatbot", pricing: "free",
    tags: ["Llama 3", "Free", "Social"], rating: 4.4, votes: 28900,
    desc: "AI Assistant ฟรีจาก Meta ใช้งานได้ใน WhatsApp, Instagram, Facebook และ Messenger",
    url: "https://ai.meta.com", trending: false, isNew: false, isHot: false,
    date: "2024-04-18"
  },
  {
    id: 6, name: "Mistral Chat", company: "Mistral AI", icon: "🌪️",
    iconBg: "icon-bg-cyan", category: "chatbot", pricing: "free",
    tags: ["Open Source", "Fast", "EU"], rating: 4.4, votes: 18700,
    desc: "Chatbot จาก Mistral AI บริษัท AI จากยุโรป ที่มี Model Open Source ชั้นนำ",
    url: "https://chat.mistral.ai", trending: false, isNew: false, isHot: false,
    date: "2024-02-26"
  },
  {
    id: 7, name: "Grok", company: "xAI", icon: "⚡",
    iconBg: "icon-bg-red", category: "chatbot", pricing: "paid",
    tags: ["Grok 3", "Real-time X", "Uncensored"], rating: 4.3, votes: 22400,
    desc: "AI Chatbot จาก xAI ของ Elon Musk เข้าถึง X (Twitter) Real-time สไตล์ตอบไม่เซ็นเซอร์",
    url: "https://grok.x.ai", trending: false, isNew: false, isHot: false,
    date: "2023-11-04"
  },
  {
    id: 8, name: "Copilot", company: "Microsoft", icon: "🪁",
    iconBg: "icon-bg-blue", category: "chatbot", pricing: "freemium",
    tags: ["GPT-4", "Office 365", "Bing"], rating: 4.3, votes: 35600,
    desc: "AI Assistant จาก Microsoft ผสานรวมกับ Windows, Office 365 และ Bing Search",
    url: "https://copilot.microsoft.com", trending: false, isNew: false, isHot: false,
    date: "2023-02-07"
  },

  // ===== IMAGE GENERATION =====
  {
    id: 9, name: "Midjourney", company: "Midjourney", icon: "🎨",
    iconBg: "icon-bg-purple", category: "image", pricing: "paid",
    tags: ["V7", "Art", "Discord"], rating: 4.9, votes: 76500,
    desc: "AI Art Generator ชั้นนำระดับโลก สร้างภาพสวยงามระดับ Professional ด้วย Prompt",
    url: "https://midjourney.com", trending: true, isNew: false, isHot: true,
    date: "2022-07-12"
  },
  {
    id: 10, name: "DALL-E 3", company: "OpenAI", icon: "🖼️",
    iconBg: "icon-bg-green", category: "image", pricing: "freemium",
    tags: ["Photorealistic", "ChatGPT", "API"], rating: 4.6, votes: 42300,
    desc: "AI Image Generator จาก OpenAI ที่เข้าใจ Prompt ภาษาธรรมชาติได้ดีที่สุด",
    url: "https://openai.com/dall-e-3", trending: false, isNew: false, isHot: false,
    date: "2023-10-04"
  },
  {
    id: 11, name: "Stable Diffusion", company: "Stability AI", icon: "🌈",
    iconBg: "icon-bg-pink", category: "image", pricing: "free",
    tags: ["Open Source", "Local", "SDXL"], rating: 4.5, votes: 58200,
    desc: "Image Generator Open Source ที่ทรงพลัง รันได้บน Local PC ไม่ต้องพึ่งคลาวด์",
    url: "https://stability.ai", trending: false, isNew: false, isHot: false,
    date: "2022-08-22"
  },
  {
    id: 12, name: "Adobe Firefly", company: "Adobe", icon: "🔥",
    iconBg: "icon-bg-orange", category: "image", pricing: "freemium",
    tags: ["Generative", "Creative Cloud", "Commercial"], rating: 4.5, votes: 31400,
    desc: "AI Generative สำหรับสร้างภาพ, ตัดสิ้นหลัง, แก้ภาพ ผ่าน Photoshop & Illustrator",
    url: "https://firefly.adobe.com", trending: false, isNew: false, isHot: false,
    date: "2023-03-21"
  },
  {
    id: 13, name: "Leonardo AI", company: "Leonardo.Ai", icon: "🦁",
    iconBg: "icon-bg-orange", category: "image", pricing: "freemium",
    tags: ["Game Art", "Consistency", "Video"], rating: 4.6, votes: 25800,
    desc: "AI Image Platform เน้น Game Art, Character Design ควบคุม Consistency ได้ดีเป็นพิเศษ",
    url: "https://leonardo.ai", trending: true, isNew: false, isHot: false,
    date: "2023-01-01"
  },
  {
    id: 14, name: "Flux", company: "Black Forest Labs", icon: "⚡",
    iconBg: "icon-bg-indigo", category: "image", pricing: "freemium",
    tags: ["FLUX.1", "Open Source", "SOTA"], rating: 4.8, votes: 29500,
    desc: "FLUX.1 โมเดล Image Generation รุ่นใหม่ล่าสุดที่ให้ Quality ระดับสูงสุด ทั้งฟรีและ Pro",
    url: "https://blackforestlabs.ai", trending: true, isNew: true, isHot: true,
    date: "2024-08-01"
  },
  {
    id: 15, name: "Ideogram", company: "Ideogram", icon: "💡",
    iconBg: "icon-bg-cyan", category: "image", pricing: "freemium",
    tags: ["Typography", "Text in Image", "V2"], rating: 4.5, votes: 18200,
    desc: "เน้นสร้างรูปที่มีตัวอักษร/ข้อความภายในภาพ แก้จุดอ่อนของ AI Image Generation ทั่วไป",
    url: "https://ideogram.ai", trending: false, isNew: false, isHot: false,
    date: "2023-08-21"
  },

  // ===== VIDEO AI =====
  {
    id: 16, name: "Sora", company: "OpenAI", icon: "🎬",
    iconBg: "icon-bg-green", category: "video", pricing: "paid",
    tags: ["Text-to-Video", "1080p", "60fps"], rating: 4.7, votes: 48900,
    desc: "AI Video Generator จาก OpenAI สร้างวิดีโอสมจริงจากข้อความ ยาวได้ถึง 60 วินาที",
    url: "https://sora.com", trending: true, isNew: true, isHot: true,
    date: "2024-02-15"
  },
  {
    id: 17, name: "Runway Gen-3", company: "Runway", icon: "🚀",
    iconBg: "icon-bg-purple", category: "video", pricing: "paid",
    tags: ["Video Gen", "Motion Brush", "Creative"], rating: 4.5, votes: 24300,
    desc: "AI Video Platform ระดับ Professional ใช้ใน Hollywood หลายเรื่อง Text/Image to Video",
    url: "https://runwayml.com", trending: false, isNew: false, isHot: false,
    date: "2024-06-17"
  },
  {
    id: 18, name: "Kling AI", company: "Kuaishou", icon: "🎥",
    iconBg: "icon-bg-red", category: "video", pricing: "freemium",
    tags: ["Video", "China", "Realistic"], rating: 4.6, votes: 19600,
    desc: "AI Video Generator จากจีนที่สร้างวิดีโอ Realistic ได้น่าทึ่ง คุณภาพสูง ราคาไม่แพง",
    url: "https://klingai.com", trending: true, isNew: false, isHot: true,
    date: "2024-05-01"
  },
  {
    id: 19, name: "HeyGen", company: "HeyGen", icon: "🧑‍💼",
    iconBg: "icon-bg-blue", category: "avatar", pricing: "paid",
    tags: ["AI Avatar", "Video Translate", "Talking Head"], rating: 4.6, votes: 22100,
    desc: "สร้างวิดีโอพรีเซนเตชั่นด้วย AI Avatar แปลวิดีโอพร้อม Lip Sync หลายภาษา",
    url: "https://heygen.com", trending: false, isNew: false, isHot: false,
    date: "2022-10-01"
  },
  {
    id: 20, name: "Synthesia", company: "Synthesia", icon: "🎭",
    iconBg: "icon-bg-cyan", category: "avatar", pricing: "paid",
    tags: ["AI Video", "Presenter", "160+ Languages"], rating: 4.4, votes: 16800,
    desc: "สร้างวิดีโอโปรดักชั่นด้วย AI Presenter รองรับ 160+ ภาษา ใช้ในองค์กรระดับ Fortune 500",
    url: "https://synthesia.io", trending: false, isNew: false, isHot: false,
    date: "2017-01-01"
  },

  // ===== AUDIO & MUSIC =====
  {
    id: 21, name: "Suno AI", company: "Suno", icon: "🎵",
    iconBg: "icon-bg-pink", category: "audio", pricing: "freemium",
    tags: ["Music Gen", "Lyrics", "v4"], rating: 4.7, votes: 38900,
    desc: "สร้างเพลงสมบูรณ์พร้อมเนื้อร้องและดนตรีจาก Text Prompt ใน 1 คลิก คุณภาพระดับสตูดิโอ",
    url: "https://suno.ai", trending: true, isNew: false, isHot: true,
    date: "2023-12-20"
  },
  {
    id: 22, name: "Udio", company: "Udio", icon: "🎶",
    iconBg: "icon-bg-purple", category: "audio", pricing: "freemium",
    tags: ["AI Music", "High Quality", "Stems"], rating: 4.6, votes: 22400,
    desc: "AI Music Generator คุณภาพสูง สร้างเพลงจาก Prompt รองรับทุกแนวเพลง แยก Stem ได้",
    url: "https://udio.com", trending: false, isNew: false, isHot: false,
    date: "2024-04-10"
  },
  {
    id: 23, name: "ElevenLabs", company: "ElevenLabs", icon: "🗣️",
    iconBg: "icon-bg-orange", category: "voice", pricing: "freemium",
    tags: ["Voice Clone", "TTS", "Dubbing"], rating: 4.8, votes: 45200,
    desc: "Text-to-Speech และ Voice Cloning ระดับโลก เสียงสมจริงที่สุด รองรับภาษาไทย",
    url: "https://elevenlabs.io", trending: true, isNew: false, isHot: true,
    date: "2022-01-01"
  },
  {
    id: 24, name: "Descript", company: "Descript", icon: "🎙️",
    iconBg: "icon-bg-blue", category: "audio", pricing: "freemium",
    tags: ["Podcast", "Video Edit", "Transcription"], rating: 4.5, votes: 18900,
    desc: "แก้ไขพอดแคสต์และวิดีโอโดยแก้ข้อความ AI ตัด filler words อัตโนมัติ",
    url: "https://descript.com", trending: false, isNew: false, isHot: false,
    date: "2017-01-01"
  },

  // ===== CODING AI =====
  {
    id: 25, name: "GitHub Copilot", company: "GitHub/MS", icon: "👨‍💻",
    iconBg: "icon-bg-indigo", category: "code", pricing: "paid",
    tags: ["Code Complete", "Chat", "PR Review"], rating: 4.7, votes: 62400,
    desc: "AI Code Assistant ที่นิยมที่สุด ช่วยเขียนโค้ด อธิบาย แก้ Bug ผ่าน IDE ทุกตัว",
    url: "https://github.com/features/copilot", trending: false, isNew: false, isHot: false,
    date: "2021-10-29"
  },
  {
    id: 26, name: "Cursor", company: "Anysphere", icon: "🖱️",
    iconBg: "icon-bg-blue", category: "code", pricing: "freemium",
    tags: ["AI IDE", "Agent", "Codebase Chat"], rating: 4.9, votes: 54800,
    desc: "AI-First Code Editor รองรับ Agent Mode คุยกับ Codebase ทั้งโปรเจกต์ เขียนโค้ดร่วมกับ AI",
    url: "https://cursor.sh", trending: true, isNew: false, isHot: true,
    date: "2023-01-01"
  },
  {
    id: 27, name: "v0 by Vercel", company: "Vercel", icon: "▲",
    iconBg: "icon-bg-purple", category: "code", pricing: "freemium",
    tags: ["React", "UI Gen", "Shadcn"], rating: 4.7, votes: 32100,
    desc: "สร้าง UI Component React/Next.js จาก Text Prompt พร้อม Deploy บน Vercel ทันที",
    url: "https://v0.dev", trending: true, isNew: false, isHot: true,
    date: "2023-10-04"
  },
  {
    id: 28, name: "Bolt.new", company: "StackBlitz", icon: "⚡",
    iconBg: "icon-bg-orange", category: "code", pricing: "freemium",
    tags: ["Full-Stack", "WebContainer", "Deploy"], rating: 4.6, votes: 28500,
    desc: "สร้าง Full-Stack App พร้อม Deploy ด้วย AI ใน Browser รองรับ React, Next.js, Node.js",
    url: "https://bolt.new", trending: true, isNew: true, isHot: true,
    date: "2024-10-01"
  },
  {
    id: 29, name: "Windsurf", company: "Codeium", icon: "🏄",
    iconBg: "icon-bg-cyan", category: "code", pricing: "freemium",
    tags: ["AI IDE", "Cascade", "Agent"], rating: 4.7, votes: 24200,
    desc: "AI Code Editor ใหม่จาก Codeium ที่มี Cascade Agent ทรงพลัง ฟรีในช่วงเริ่มต้น",
    url: "https://codeium.com/windsurf", trending: true, isNew: true, isHot: true,
    date: "2024-11-14"
  },
  {
    id: 30, name: "Replit AI", company: "Replit", icon: "🔧",
    iconBg: "icon-bg-orange", category: "code", pricing: "freemium",
    tags: ["Online IDE", "Agent", "Hosting"], rating: 4.4, votes: 19800,
    desc: "AI Coding Assistant ใน Browser พร้อม Hosting สร้าง Deploy App ด้วย AI Agent ใน Replit",
    url: "https://replit.com", trending: false, isNew: false, isHot: false,
    date: "2016-01-01"
  },

  // ===== WRITING =====
  {
    id: 31, name: "Jasper AI", company: "Jasper", icon: "✍️",
    iconBg: "icon-bg-purple", category: "writing", pricing: "paid",
    tags: ["Marketing", "Blog", "SEO"], rating: 4.4, votes: 24600,
    desc: "AI Writing Assistant เน้น Marketing Content, Blog, Social Media คุณภาพสูง",
    url: "https://jasper.ai", trending: false, isNew: false, isHot: false,
    date: "2021-01-01"
  },
  {
    id: 32, name: "Grammarly", company: "Grammarly", icon: "📝",
    iconBg: "icon-bg-green", category: "writing", pricing: "freemium",
    tags: ["Grammar", "Style", "GrammarlyGO"], rating: 4.6, votes: 56800,
    desc: "AI ตรวจแก้ไขภาษาอังกฤษ ไวยากรณ์ สไตล์ เจตนา ฝังได้ในทุก Browser และ App",
    url: "https://grammarly.com", trending: false, isNew: false, isHot: false,
    date: "2009-07-01"
  },
  {
    id: 33, name: "Notion AI", company: "Notion", icon: "📒",
    iconBg: "icon-bg-indigo", category: "productivity", pricing: "paid",
    tags: ["Notion", "Summarize", "Draft"], rating: 4.5, votes: 32400,
    desc: "AI ผสานอยู่ใน Notion ช่วยเขียน สรุป แปล จัดการข้อมูลใน Workspace ทุกอย่าง",
    url: "https://notion.so/ai", trending: false, isNew: false, isHot: false,
    date: "2023-02-22"
  },
  {
    id: 34, name: "Copy.ai", company: "Copy.ai", icon: "📋",
    iconBg: "icon-bg-blue", category: "writing", pricing: "freemium",
    tags: ["Copywriting", "GTM", "Workflow"], rating: 4.3, votes: 18200,
    desc: "AI สำหรับ Copywriting, Marketing Content, Sales Copy ครบครันมี Template หลายพัน",
    url: "https://copy.ai", trending: false, isNew: false, isHot: false,
    date: "2020-10-01"
  },

  // ===== DESIGN =====
  {
    id: 35, name: "Canva AI", company: "Canva", icon: "🎭",
    iconBg: "icon-bg-pink", category: "design", pricing: "freemium",
    tags: ["Magic Design", "Background Remove", "Presentation"], rating: 4.6, votes: 48500,
    desc: "AI ผสานในทุก Feature ของ Canva สร้างงานดีไซน์, Presentation, Social Media ด้วย AI",
    url: "https://canva.com", trending: false, isNew: false, isHot: false,
    date: "2013-01-01"
  },
  {
    id: 36, name: "Figma AI", company: "Figma", icon: "🖌️",
    iconBg: "icon-bg-purple", category: "design", pricing: "freemium",
    tags: ["UI Design", "Prototype", "Dev Mode"], rating: 4.5, votes: 28900,
    desc: "AI Feature ใน Figma ช่วยสร้าง UI จาก Text, Rename Layers, Grid, Auto Layout",
    url: "https://figma.com", trending: false, isNew: false, isHot: false,
    date: "2016-09-27"
  },
  {
    id: 37, name: "Framer AI", company: "Framer", icon: "🎪",
    iconBg: "icon-bg-orange", category: "design", pricing: "freemium",
    tags: ["Website", "No-Code", "CMS"], rating: 4.6, votes: 22400,
    desc: "สร้าง Website ที่สวยงาม Professional ด้วย AI ใน Seconds ไม่ต้องเขียนโค้ด",
    url: "https://framer.com", trending: true, isNew: false, isHot: false,
    date: "2014-01-01"
  },

  // ===== PRODUCTIVITY =====
  {
    id: 38, name: "Otter.ai", company: "Otter.ai", icon: "🦦",
    iconBg: "icon-bg-blue", category: "productivity", pricing: "freemium",
    tags: ["Transcription", "Meeting Notes", "Zoom"], rating: 4.5, votes: 24200,
    desc: "AI ถอดความประชุม สรุป Action Items ผสานกับ Zoom, Meet, Teams อัตโนมัติ",
    url: "https://otter.ai", trending: false, isNew: false, isHot: false,
    date: "2016-01-01"
  },
  {
    id: 39, name: "Zapier AI", company: "Zapier", icon: "⚡",
    iconBg: "icon-bg-orange", category: "productivity", pricing: "freemium",
    tags: ["Automation", "Workflow", "No-Code"], rating: 4.4, votes: 29800,
    desc: "AI ช่วยสร้าง Automation Workflow เชื่อม App 7000+ ด้วยภาษาพูดธรรมดา ไม่ต้องโค้ด",
    url: "https://zapier.com/ai", trending: false, isNew: false, isHot: false,
    date: "2011-10-01"
  },
  {
    id: 40, name: "Luma AI", company: "Luma", icon: "🌟",
    iconBg: "icon-bg-cyan", category: "video", pricing: "freemium",
    tags: ["Dream Machine", "Video", "3D"], rating: 4.5, votes: 21400,
    desc: "AI Video Generator Dream Machine สร้างวิดีโอสมจริงจาก Text & Image ฟรีในระดับพื้นฐาน",
    url: "https://lumalabs.ai", trending: true, isNew: false, isHot: false,
    date: "2024-06-12"
  },

  // ===== DATA =====
  {
    id: 41, name: "Julius AI", company: "Julius", icon: "📊",
    iconBg: "icon-bg-green", category: "data", pricing: "freemium",
    tags: ["Data Analysis", "Charts", "Python"], rating: 4.6, votes: 16800,
    desc: "AI วิเคราะห์ข้อมูล Excel, CSV สร้างกราฟ เขียน Python โค้ด แค่บอกว่าต้องการอะไร",
    url: "https://julius.ai", trending: false, isNew: false, isHot: false,
    date: "2023-01-01"
  },
  {
    id: 42, name: "Gamma App", company: "Gamma", icon: "🎯",
    iconBg: "icon-bg-purple", category: "productivity", pricing: "freemium",
    tags: ["Presentation", "AI Design", "Docs"], rating: 4.6, votes: 29500,
    desc: "สร้าง Presentation, Document, Webpage ด้วย AI สวยงามระดับ Professional ใน Seconds",
    url: "https://gamma.app", trending: true, isNew: false, isHot: true,
    date: "2022-01-01"
  },
  {
    id: 43, name: "Pika Labs", company: "Pika", icon: "🐣",
    iconBg: "icon-bg-yellow", category: "video", pricing: "freemium",
    tags: ["Video Gen", "Lip Sync", "Effects"], rating: 4.4, votes: 18200,
    desc: "AI Video Generator ที่มี Feature พิเศษ Lip Sync, Pikaffects, Modify Region",
    url: "https://pika.art", trending: false, isNew: false, isHot: false,
    date: "2023-11-28"
  },
  {
    id: 44, name: "DeepL", company: "DeepL", icon: "🌍",
    iconBg: "icon-bg-blue", category: "writing", pricing: "freemium",
    tags: ["Translation", "30+ Languages", "API"], rating: 4.8, votes: 42600,
    desc: "AI แปลภาษาที่แม่นยำที่สุด รองรับ 30+ ภาษา ดีกว่า Google Translate ในหลายภาษา",
    url: "https://deepl.com", trending: false, isNew: false, isHot: false,
    date: "2017-08-28"
  },
  {
    id: 45, name: "Synthesia", company: "Synthesia", icon: "🤵",
    iconBg: "icon-bg-cyan", category: "avatar", pricing: "paid",
    tags: ["AI Video", "Presenter", "160+ Lang"], rating: 4.4, votes: 16800,
    desc: "สร้างวิดีโอ AI Avatar ระดับมืออาชีพ รองรับ 160+ ภาษา ใช้ใน Fortune 500 Companies",
    url: "https://synthesia.io", trending: false, isNew: false, isHot: false,
    date: "2017-01-01"
  },
  {
    id: 46, name: "Adobe Podcast", company: "Adobe", icon: "🎤",
    iconBg: "icon-bg-red", category: "audio", pricing: "freemium",
    tags: ["Audio Enhance", "Podcast", "AI Remove Noise"], rating: 4.6, votes: 22100,
    desc: "AI ปรับปรุงคุณภาพเสียง Record ให้ชัดเหมือนอัดในสตูดิโอ ตัดเสียงรบกวนได้ดีเยี่ยม",
    url: "https://podcast.adobe.com", trending: false, isNew: false, isHot: false,
    date: "2022-10-04"
  },
  {
    id: 47, name: "Make (Integromat)", company: "Make", icon: "🔗",
    iconBg: "icon-bg-purple", category: "productivity", pricing: "freemium",
    tags: ["Automation", "Visual", "1000+ Apps"], rating: 4.5, votes: 21400,
    desc: "Visual Automation Platform เชื่อม App กว่า 1000+ ด้วย AI ช่วยสร้าง Scenario",
    url: "https://make.com", trending: false, isNew: false, isHot: false,
    date: "2016-01-01"
  },
  {
    id: 48, name: "Lovable", company: "Lovable", icon: "💜",
    iconBg: "icon-bg-pink", category: "code", pricing: "freemium",
    tags: ["Full-Stack", "React", "Supabase"], rating: 4.7, votes: 19800,
    desc: "สร้าง Full-Stack Web App ด้วยการพิมพ์ภาษาธรรมชาติ ผสาน Supabase, Stripe ได้ทันที",
    url: "https://lovable.dev", trending: true, isNew: true, isHot: true,
    date: "2024-01-01"
  },
];

// ===== AI MODELS =====
const AI_MODELS = [
  {
    id: "m1",
    name: "GPT-4o",
    creator: "OpenAI",
    icon: "🤖",
    iconBg: "model-bg-green",
    desc: "โมเดล Multimodal ชั้นนำจาก OpenAI รองรับข้อความ, รูปภาพ, เสียง, วิดีโอ ทำงานเร็วกว่า GPT-4 Turbo",
    specs: [
      { icon: "⚡", label: "Real-time Multimodal" },
      { icon: "🧠", label: "128K Context" },
      { icon: "🌐", label: "API & ChatGPT" },
    ],
    type: "Commercial",
    link: "https://openai.com/gpt-4o",
    docsLink: "https://platform.openai.com",
    badges: ["freemium"],
    highlight: "#10b981"
  },
  {
    id: "m2",
    name: "Claude 3.5 Sonnet",
    creator: "Anthropic",
    icon: "🧡",
    iconBg: "model-bg-orange",
    desc: "โมเดลใหม่ล่าสุดจาก Anthropic โดดเด่นด้านการเขียนโค้ด วิเคราะห์ข้อมูล และ Context 200K tokens",
    specs: [
      { icon: "💻", label: "Top Coding Performance" },
      { icon: "🧠", label: "200K Context" },
      { icon: "🔒", label: "Constitutional AI" },
    ],
    type: "Commercial",
    link: "https://claude.ai",
    docsLink: "https://docs.anthropic.com",
    badges: ["freemium"],
    highlight: "#f59e0b"
  },
  {
    id: "m3",
    name: "Gemini 2.0 Flash",
    creator: "Google DeepMind",
    icon: "✨",
    iconBg: "model-bg-blue",
    desc: "โมเดลรุ่นล่าสุดจาก Google ที่เร็วที่สุดในตระกูล Gemini รองรับ Multimodal และ Real-time Streaming",
    specs: [
      { icon: "⚡", label: "Ultra Fast" },
      { icon: "🎯", label: "1M Context" },
      { icon: "🌐", label: "Multilingual" },
    ],
    type: "Commercial",
    link: "https://gemini.google.com",
    docsLink: "https://ai.google.dev",
    badges: ["free", "new"],
    highlight: "#3b82f6"
  },
  {
    id: "m4",
    name: "Llama 3.3",
    creator: "Meta AI",
    icon: "🦙",
    iconBg: "model-bg-purple",
    desc: "Open Source LLM ที่ทรงพลังที่สุดจาก Meta ประสิทธิภาพเทียบเท่า GPT-4 แต่รันได้ Local โดยสมบูรณ์",
    specs: [
      { icon: "🔓", label: "Open Source" },
      { icon: "💻", label: "Run Locally" },
      { icon: "🧠", label: "70B Parameters" },
    ],
    type: "Open Source",
    link: "https://llama.meta.com",
    docsLink: "https://huggingface.co/meta-llama",
    badges: ["free", "open"],
    highlight: "#8b5cf6"
  },
  {
    id: "m5",
    name: "Mistral Large",
    creator: "Mistral AI",
    icon: "🌪️",
    iconBg: "model-bg-cyan",
    desc: "โมเดลชั้นนำจากยุโรป ประสิทธิภาพสูงมาก ราคาถูกกว่า GPT-4 มี Open Source รุ่นย่อย Mistral 7B",
    specs: [
      { icon: "🌍", label: "EU Based" },
      { icon: "💰", label: "Cost Efficient" },
      { icon: "🔓", label: "Open Weights" },
    ],
    type: "Commercial + Open",
    link: "https://mistral.ai",
    docsLink: "https://docs.mistral.ai",
    badges: ["freemium", "open"],
    highlight: "#06b6d4"
  },
  {
    id: "m6",
    name: "DeepSeek R1",
    creator: "DeepSeek",
    icon: "🔍",
    iconBg: "model-bg-red",
    desc: "โมเดล Reasoning จากจีนที่สร้างแรงสั่นสะเทือน ประสิทธิภาพเทียบเท่า o1 แต่ Open Source ฟรีหมด",
    specs: [
      { icon: "🧮", label: "Chain-of-Thought" },
      { icon: "🔓", label: "Full Open Source" },
      { icon: "💰", label: "Free / Cheap API" },
    ],
    type: "Open Source",
    link: "https://deepseek.com",
    docsLink: "https://huggingface.co/deepseek-ai",
    badges: ["free", "open", "hot"],
    highlight: "#ef4444"
  },
  {
    id: "m7",
    name: "FLUX.1 Pro",
    creator: "Black Forest Labs",
    icon: "🖼️",
    iconBg: "model-bg-purple",
    desc: "โมเดล Image Generation SOTA รุ่นล่าสุด คุณภาพภาพสูงสุดในโลก ณ ปัจจุบัน ใช้ใน Freepik, Replicate",
    specs: [
      { icon: "🎨", label: "SOTA Image Quality" },
      { icon: "⚡", label: "Fast Generation" },
      { icon: "🌐", label: "API Available" },
    ],
    type: "Commercial",
    link: "https://blackforestlabs.ai",
    docsLink: "https://replicate.com/black-forest-labs",
    badges: ["paid", "new"],
    highlight: "#8b5cf6"
  },
  {
    id: "m8",
    name: "Whisper Large v3",
    creator: "OpenAI",
    icon: "🎤",
    iconBg: "model-bg-green",
    desc: "โมเดล Speech-to-Text Open Source จาก OpenAI แม่นยำสูงสุด รองรับ 100+ ภาษา รวมภาษาไทย",
    specs: [
      { icon: "🔓", label: "Open Source" },
      { icon: "🌐", label: "100+ Languages" },
      { icon: "🎯", label: "High Accuracy" },
    ],
    type: "Open Source",
    link: "https://openai.com/research/whisper",
    docsLink: "https://huggingface.co/openai/whisper-large-v3",
    badges: ["free", "open"],
    highlight: "#10b981"
  },
  {
    id: "m9",
    name: "Gemma 3",
    creator: "Google",
    icon: "💎",
    iconBg: "model-bg-blue",
    desc: "Open Source LLM จาก Google เน้น Efficiency รันได้บน Device ทุกขนาด ตั้งแต่ 1B ถึง 27B Parameters",
    specs: [
      { icon: "🔓", label: "Open Source" },
      { icon: "📱", label: "On-Device" },
      { icon: "⚡", label: "1B-27B Sizes" },
    ],
    type: "Open Source",
    link: "https://ai.google.dev/gemma",
    docsLink: "https://huggingface.co/google",
    badges: ["free", "open", "new"],
    highlight: "#3b82f6"
  },
];

// ===== RESOURCES =====
const RESOURCES = [
  {
    icon: "🎓",
    type: "คอร์สเรียน",
    title: "fast.ai — Practical Deep Learning",
    desc: "คอร์สสอน Deep Learning ฟรีจาก fast.ai เน้น Top-Down Approach ปฏิบัติจริง",
    url: "https://fast.ai"
  },
  {
    icon: "📺",
    type: "YouTube",
    title: "Andrej Karpathy Channel",
    desc: "อดีต Tesla & OpenAI สอน AI จากพื้นฐาน Neural Network, GPT ด้วยตัวเองจาก Scratch",
    url: "https://youtube.com/@AndrejKarpathy"
  },
  {
    icon: "🤗",
    type: "Platform",
    title: "Hugging Face",
    desc: "GitHub สำหรับ AI Models รวม Dataset, Model, Space ให้ใช้งาน Open Source ฟรี",
    url: "https://huggingface.co"
  },
  {
    icon: "📰",
    type: "Newsletter",
    title: "The Batch by DeepLearning.AI",
    desc: "Newsletter รายสัปดาห์ โดย Andrew Ng อัปเดตข่าว AI ที่สำคัญและ Commentary",
    url: "https://deeplearning.ai/the-batch"
  },
  {
    icon: "🏆",
    type: "Platform",
    title: "Kaggle",
    desc: "แข่ง ML Competition, เรียน Course ฟรี, ดาวน์โหลด Dataset ชุมชน Data Science ใหญ่ที่สุด",
    url: "https://kaggle.com"
  },
  {
    icon: "📖",
    type: "Research",
    title: "Papers With Code",
    desc: "รวม Research Paper AI/ML พร้อม Source Code ตาม Benchmark ล่าสุด",
    url: "https://paperswithcode.com"
  },
  {
    icon: "💬",
    type: "Community",
    title: "r/MachineLearning",
    desc: "Reddit Community สำหรับ ML ผู้เชี่ยวชาญ ถามตอบ แชร์ Paper ล่าสุด",
    url: "https://reddit.com/r/MachineLearning"
  },
  {
    icon: "🎯",
    type: "คอร์สเรียน",
    title: "DeepLearning.AI Short Courses",
    desc: "คอร์สสั้น AI ฟรีจาก Andrew Ng เน้น LLM, Prompt Engineering, RAG, Agents",
    url: "https://deeplearning.ai"
  },
];
