import { createContext, useContext, useState } from "react";

// All 22 languages listed in the Eighth Schedule of the Indian Constitution,
// plus English (the interface default/fallback — not one of the 22, but
// included since it's the base language every other entry falls back to).
//
// ACCURACY NOTE: these are best-effort translations of a small set of
// short, safety-critical phrases. For a real launch, every non-English
// entry here should be reviewed by a native speaker before it reaches an
// actual fisherman — a wrong word in "Do Not Go" is not a cosmetic bug.
// As a safety net, the Go/Caution/Do-Not-Go verdict is never conveyed by
// text alone anywhere in the app — it always pairs with a fixed
// green/amber/maroon color and a ✅/⚠️/🛑 icon, so meaning still comes
// through even if a translation is imperfect.

const DICTIONARY = {
  en: { langName: "English", nativeName: "English", safeToFish: "Safe to go fishing today?", go: "Go", caution: "Caution", doNotGo: "Do Not Go", confidence: "Confidence", nearestHarbor: "Nearest safe harbor", emergencyCall: "Call Coast Guard", shareLocation: "Share my location", tripCalculator: "Trip cost calculator", catchPotential: "Catch potential", windSpeed: "Wind speed", waveHeight: "Wave height", fishermenZone: "Fishermen Zone", heroTitle: "See coastal danger before it reaches shore", forFishermen: "Built for fishermen, port authorities, and coast guard teams" },

  hi: { langName: "Hindi", nativeName: "हिन्दी", safeToFish: "आज मछली पकड़ने जाना सुरक्षित है?", go: "जाएँ", caution: "सावधानी", doNotGo: "न जाएँ", confidence: "विश्वास स्तर", nearestHarbor: "निकटतम सुरक्षित बंदरगाह", emergencyCall: "कोस्ट गार्ड को कॉल करें", shareLocation: "अपना स्थान साझा करें", tripCalculator: "यात्रा लागत कैलकुलेटर", catchPotential: "मछली पकड़ने की संभावना", windSpeed: "हवा की गति", waveHeight: "लहर की ऊँचाई", fishermenZone: "मछुआरा क्षेत्र", heroTitle: "तट पर खतरा पहुँचने से पहले ही देखें", forFishermen: "मछुआरों, बंदरगाह अधिकारियों और कोस्ट गार्ड के लिए बनाया गया" },

  bn: { langName: "Bengali", nativeName: "বাংলা", safeToFish: "আজ মাছ ধরতে যাওয়া কি নিরাপদ?", go: "যান", caution: "সতর্কতা", doNotGo: "যাবেন না", confidence: "আস্থার মাত্রা", nearestHarbor: "নিকটতম নিরাপদ বন্দর", emergencyCall: "কোস্ট গার্ডকে কল করুন", shareLocation: "আমার অবস্থান শেয়ার করুন", tripCalculator: "যাত্রার খরচ ক্যালকুলেটর", catchPotential: "মাছ ধরার সম্ভাবনা", windSpeed: "বাতাসের গতি", waveHeight: "ঢেউয়ের উচ্চতা", fishermenZone: "জেলে অঞ্চল", heroTitle: "উপকূলে বিপদ পৌঁছানোর আগেই দেখুন", forFishermen: "জেলে, বন্দর কর্তৃপক্ষ এবং কোস্ট গার্ডের জন্য তৈরি" },

  te: { langName: "Telugu", nativeName: "తెలుగు", safeToFish: "ఈరోజు చేపలు పట్టడానికి వెళ్లడం సురక్షితమేనా?", go: "వెళ్ళండి", caution: "జాగ్రత్త", doNotGo: "వెళ్ళవద్దు", confidence: "విశ్వాస స్థాయి", nearestHarbor: "సమీప సురక్షిత రేవు", emergencyCall: "కోస్ట్ గార్డ్‌కు కాల్ చేయండి", shareLocation: "నా స్థానాన్ని పంచుకోండి", tripCalculator: "ప్రయాణ ఖర్చు కాలిక్యులేటర్", catchPotential: "చేపల పట్టుబడి అవకాశం", windSpeed: "గాలి వేగం", waveHeight: "అల ఎత్తు", fishermenZone: "మత్స్యకారుల మండలం", heroTitle: "ప్రమాదం తీరానికి చేరకముందే చూడండి", forFishermen: "మత్స్యకారులు, పోర్టు అధికారులు మరియు కోస్ట్ గార్డ్ కోసం రూపొందించబడింది" },

  mr: { langName: "Marathi", nativeName: "मराठी", safeToFish: "आज मासेमारीला जाणे सुरक्षित आहे का?", go: "जा", caution: "सावधगिरी", doNotGo: "जाऊ नका", confidence: "विश्वास पातळी", nearestHarbor: "जवळचे सुरक्षित बंदर", emergencyCall: "कोस्ट गार्डला कॉल करा", shareLocation: "माझे स्थान शेअर करा", tripCalculator: "प्रवास खर्च कॅल्क्युलेटर", catchPotential: "मासे मिळण्याची शक्यता", windSpeed: "वाऱ्याचा वेग", waveHeight: "लाटेची उंची", fishermenZone: "मच्छीमार क्षेत्र", heroTitle: "किनाऱ्यावर धोका पोहोचण्याआधीच पाहा", forFishermen: "मच्छीमार, बंदर अधिकारी आणि कोस्ट गार्डसाठी तयार केले" },

  ta: { langName: "Tamil", nativeName: "தமிழ்", safeToFish: "இன்று மீன் பிடிக்க செல்வது பாதுகாப்பானதா?", go: "செல்லுங்கள்", caution: "எச்சரிக்கை", doNotGo: "செல்ல வேண்டாம்", confidence: "நம்பிக்கை நிலை", nearestHarbor: "அருகிலுள்ள பாதுகாப்பான துறைமுகம்", emergencyCall: "கடலோர காவல்படையை அழைக்கவும்", shareLocation: "எனது இருப்பிடத்தைப் பகிரவும்", tripCalculator: "பயண செலவு கால்குலேட்டர்", catchPotential: "மீன் பிடிப்பு வாய்ப்பு", windSpeed: "காற்றின் வேகம்", waveHeight: "அலை உயரம்", fishermenZone: "மீனவர் மண்டலம்", heroTitle: "கடற்கரையை அபாயம் அடையும் முன் காணுங்கள்", forFishermen: "மீனவர்கள், துறைமுக அதிகாரிகள் மற்றும் கடலோர காவல்படைக்காக உருவாக்கப்பட்டது" },

  ur: { langName: "Urdu", nativeName: "اردو", safeToFish: "کیا آج ماہی گیری کے لیے جانا محفوظ ہے؟", go: "جائیں", caution: "احتیاط", doNotGo: "مت جائیں", confidence: "اعتماد کی سطح", nearestHarbor: "قریب ترین محفوظ بندرگاہ", emergencyCall: "کوسٹ گارڈ کو کال کریں", shareLocation: "میری لوکیشن شیئر کریں", tripCalculator: "سفری لاگت کیلکولیٹر", catchPotential: "مچھلی پکڑنے کا امکان", windSpeed: "ہوا کی رفتار", waveHeight: "لہر کی اونچائی", fishermenZone: "ماہی گیر زون", heroTitle: "خطرہ ساحل تک پہنچنے سے پہلے دیکھیں", forFishermen: "ماہی گیروں، بندرگاہ حکام اور کوسٹ گارڈ کے لیے بنایا گیا" },

  gu: { langName: "Gujarati", nativeName: "ગુજરાતી", safeToFish: "આજે માછીમારી માટે જવું સલામત છે?", go: "જાઓ", caution: "સાવધાની", doNotGo: "જશો નહીં", confidence: "વિશ્વાસ સ્તર", nearestHarbor: "નજીકનું સલામત બંદર", emergencyCall: "કોસ્ટ ગાર્ડને કૉલ કરો", shareLocation: "મારું સ્થાન શેર કરો", tripCalculator: "પ્રવાસ ખર્ચ કેલ્ક્યુલેટર", catchPotential: "માછલી પકડવાની સંભાવના", windSpeed: "પવનની ઝડપ", waveHeight: "મોજાની ઊંચાઈ", fishermenZone: "માછીમાર ઝોન", heroTitle: "કિનારે ભય પહોંચે તે પહેલાં જુઓ", forFishermen: "માછીમારો, બંદર અધિકારીઓ અને કોસ્ટ ગાર્ડ માટે બનાવેલ" },

  kn: { langName: "Kannada", nativeName: "ಕನ್ನಡ", safeToFish: "ಇಂದು ಮೀನುಗಾರಿಕೆಗೆ ಹೋಗುವುದು ಸುರಕ್ಷಿತವೇ?", go: "ಹೋಗಿ", caution: "ಎಚ್ಚರಿಕೆ", doNotGo: "ಹೋಗಬೇಡಿ", confidence: "ವಿಶ್ವಾಸ ಮಟ್ಟ", nearestHarbor: "ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಬಂದರು", emergencyCall: "ಕೋಸ್ಟ್ ಗಾರ್ಡ್‌ಗೆ ಕರೆ ಮಾಡಿ", shareLocation: "ನನ್ನ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ", tripCalculator: "ಪ್ರಯಾಣ ವೆಚ್ಚ ಕ್ಯಾಲ್ಕುಲೇಟರ್", catchPotential: "ಮೀನು ಸಿಗುವ ಸಾಧ್ಯತೆ", windSpeed: "ಗಾಳಿಯ ವೇಗ", waveHeight: "ಅಲೆಯ ಎತ್ತರ", fishermenZone: "ಮೀನುಗಾರರ ವಲಯ", heroTitle: "ಅಪಾಯ ತೀರವನ್ನು ತಲುಪುವ ಮೊದಲೇ ನೋಡಿ", forFishermen: "ಮೀನುಗಾರರು, ಬಂದರು ಅಧಿಕಾರಿಗಳು ಮತ್ತು ಕೋಸ್ಟ್ ಗಾರ್ಡ್‌ಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ" },

  ml: { langName: "Malayalam", nativeName: "മലയാളം", safeToFish: "ഇന്ന് മീൻപിടിക്കാൻ പോകുന്നത് സുരക്ഷിതമാണോ?", go: "പോകുക", caution: "ജാഗ്രത", doNotGo: "പോകരുത്", confidence: "വിശ്വാസ നില", nearestHarbor: "അടുത്തുള്ള സുരക്ഷിത തുറമുഖം", emergencyCall: "കോസ്റ്റ് ഗാർഡിനെ വിളിക്കുക", shareLocation: "എന്റെ ലൊക്കേഷൻ പങ്കിടുക", tripCalculator: "യാത്രാ ചെലവ് കാൽക്കുലേറ്റർ", catchPotential: "മീൻ ലഭിക്കാനുള്ള സാധ്യത", windSpeed: "കാറ്റിന്റെ വേഗത", waveHeight: "തിരമാലയുടെ ഉയരം", fishermenZone: "മത്സ്യത്തൊഴിലാളി മേഖല", heroTitle: "അപകടം തീരത്ത് എത്തുന്നതിന് മുമ്പേ കാണുക", forFishermen: "മത്സ്യത്തൊഴിലാളികൾക്കും തുറമുഖ അധികൃതർക്കും കോസ്റ്റ് ഗാർഡിനും വേണ്ടി നിർമ്മിച്ചത്" },

  pa: { langName: "Punjabi", nativeName: "ਪੰਜਾਬੀ", safeToFish: "ਕੀ ਅੱਜ ਮੱਛੀ ਫੜਨ ਜਾਣਾ ਸੁਰੱਖਿਅਤ ਹੈ?", go: "ਜਾਓ", caution: "ਸਾਵਧਾਨੀ", doNotGo: "ਨਾ ਜਾਓ", confidence: "ਭਰੋਸੇ ਦਾ ਪੱਧਰ", nearestHarbor: "ਨਜ਼ਦੀਕੀ ਸੁਰੱਖਿਅਤ ਬੰਦਰਗਾਹ", emergencyCall: "ਕੋਸਟ ਗਾਰਡ ਨੂੰ ਕਾਲ ਕਰੋ", shareLocation: "ਮੇਰੀ ਲੋਕੇਸ਼ਨ ਸਾਂਝੀ ਕਰੋ", tripCalculator: "ਯਾਤਰਾ ਖਰਚ ਕੈਲਕੁਲੇਟਰ", catchPotential: "ਮੱਛੀ ਮਿਲਣ ਦੀ ਸੰਭਾਵਨਾ", windSpeed: "ਹਵਾ ਦੀ ਗਤੀ", waveHeight: "ਲਹਿਰ ਦੀ ਉਚਾਈ", fishermenZone: "ਮਛੇਰਾ ਖੇਤਰ", heroTitle: "ਕਿਨਾਰੇ ਤੱਕ ਖ਼ਤਰਾ ਪਹੁੰਚਣ ਤੋਂ ਪਹਿਲਾਂ ਦੇਖੋ", forFishermen: "ਮਛੇਰਿਆਂ, ਬੰਦਰਗਾਹ ਅਧਿਕਾਰੀਆਂ ਅਤੇ ਕੋਸਟ ਗਾਰਡ ਲਈ ਬਣਾਇਆ ਗਿਆ" },

  or: { langName: "Odia", nativeName: "ଓଡ଼ିଆ", safeToFish: "ଆଜି ମାଛ ଧରିବାକୁ ଯିବା ସୁରକ୍ଷିତ କି?", go: "ଯାଆନ୍ତୁ", caution: "ସତର୍କତା", doNotGo: "ଯାଆନ୍ତୁ ନାହିଁ", confidence: "ବିଶ୍ୱାସ ସ୍ତର", nearestHarbor: "ନିକଟତମ ସୁରକ୍ଷିତ ବନ୍ଦର", emergencyCall: "କୋଷ୍ଟ ଗାର୍ଡକୁ କଲ୍ କରନ୍ତୁ", shareLocation: "ମୋର ଅବସ୍ଥାନ ସେୟାର୍ କରନ୍ତୁ", tripCalculator: "ଯାତ୍ରା ଖର୍ଚ୍ଚ କାଲକୁଲେଟର", catchPotential: "ମାଛ ଧରାଯିବାର ସମ୍ଭାବନା", windSpeed: "ପବନ ବେଗ", waveHeight: "ଢେଉ ଉଚ୍ଚତା", fishermenZone: "ମତ୍ସ୍ୟଜୀବୀ ମଣ୍ଡଳ", heroTitle: "ବିପଦ ଉପକୂଳରେ ପହଞ୍ଚିବା ପୂର୍ବରୁ ଦେଖନ୍ତୁ", forFishermen: "ମତ୍ସ୍ୟଜୀବୀ, ବନ୍ଦର କର୍ତ୍ତୃପକ୍ଷ ଏବଂ କୋଷ୍ଟ ଗାର୍ଡ ପାଇଁ ନିର୍ମିତ" },

  as: { langName: "Assamese", nativeName: "অসমীয়া", safeToFish: "আজি মাছ ধৰিবলৈ যোৱা সুৰক্ষিত নে?", go: "যাওক", caution: "সাৱধানতা", doNotGo: "নাযাব", confidence: "বিশ্বাসৰ স্তৰ", nearestHarbor: "নিকটতম সুৰক্ষিত বন্দৰ", emergencyCall: "কোষ্ট গাৰ্ডক কল কৰক", shareLocation: "মোৰ অৱস্থান শ্বেয়াৰ কৰক", tripCalculator: "ভ্ৰমণ খৰচ কেলকুলেটৰ", catchPotential: "মাছ পোৱাৰ সম্ভাৱনা", windSpeed: "বতাহৰ গতি", waveHeight: "ঢৌৰ উচ্চতা", fishermenZone: "মৎস্যজীৱী অঞ্চল", heroTitle: "বিপদ উপকূললৈ অহাৰ আগতেই চাওক", forFishermen: "মৎস্যজীৱী, বন্দৰ কৰ্তৃপক্ষ আৰু কোষ্ট গাৰ্ডৰ বাবে নিৰ্মিত" },

  mai: { langName: "Maithili", nativeName: "मैथिली", safeToFish: "आइ मछरी पकड़ऽ जाइ सुरक्षित अछि?", go: "जाउ", caution: "सावधानी", doNotGo: "नहि जाउ", confidence: "विश्वास स्तर", nearestHarbor: "निकटतम सुरक्षित बंदरगाह", emergencyCall: "कोस्ट गार्ड के कॉल करू", shareLocation: "अपन स्थान साझा करू", tripCalculator: "यात्रा खर्च कैलकुलेटर", catchPotential: "मछरी भेटबाक संभावना", windSpeed: "हवा के गति", waveHeight: "लहरि के ऊँचाइ", fishermenZone: "मछुआरा क्षेत्र", heroTitle: "तट पर खतरा पहुँचबाक पहिने देखू", forFishermen: "मछुआरा, बंदरगाह प्राधिकरण आ कोस्ट गार्ड लेल बनल" },

  sat: { langName: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", safeToFish: "टेंगोन् नी ओड़ाक् सेनोक् बांचाव तायोम् कि?", go: "सेन मे", caution: "सावधान", doNotGo: "अलोम् सेन", confidence: "भरोसा माप्", nearestHarbor: "नाड़े बांचाव बंदर", emergencyCall: "कोस्ट गार्ड रे फोन मे", shareLocation: "इंग् ठाँय आग् मे", tripCalculator: "सफर खरचा हिसाब", catchPotential: "नी ओड़ाक् नामोक् संभावना", windSpeed: "हाओ गति", waveHeight: "दाड़ि उंचा", fishermenZone: "ओड़ाक् हड़ाम् एरिया", heroTitle: "पार सेते लाहा सेटेराक् आयेर् नेल मे", forFishermen: "ओड़ाक् हड़ाम्, बंदर अधिकारी आर कोस्ट गार्ड लागित बेनाव अकाना" },

  ks: { langName: "Kashmiri", nativeName: "کٲشُر", safeToFish: "کیا آز مَچھ کَڈُن ووٹھُن محفوظ چھُ؟", go: "گَژھِو", caution: "احتیاط", doNotGo: "مَ گَژھِو", confidence: "اعتماد سطح", nearestHarbor: "قریبٕک محفوظ بندرگاہ", emergencyCall: "کوسٹ گارڈ س کال کریو", shareLocation: "بے ہنٛز جاے شریک کریو", tripCalculator: "سفری خرچ کیلکولیٹر", catchPotential: "مَچھ ملُن ہٕنٛز اُمید", windSpeed: "حوایہٕ رفتار", waveHeight: "لہرَس بلندی", fishermenZone: "شکاریو ہنٛز علاقہ", heroTitle: "خطرہ کنٲرس پؠٹھ پھَتھُن برونٹھ ونٲوو", forFishermen: "شکاریو، بندرگاہی حکامو تہٕ کوسٹ گارڈ خٲطرٕ بنٲوومُت" },

  kok: { langName: "Konkani", nativeName: "कोंकणी", safeToFish: "आयज मासळी धरपाक वच्चें सुरक्षीत आसा?", go: "वचात", caution: "जपून", doNotGo: "वचूं नाका", confidence: "विश्वास पातळी", nearestHarbor: "लागसारचें सुरक्षीत बंदर", emergencyCall: "कोस्ट गार्डाक कॉल करात", shareLocation: "म्हजें थळ शेअर करात", tripCalculator: "प्रवास खर्च कॅल्क्युलेटर", catchPotential: "मासळी मेळपाची संघटा", windSpeed: "वाऱ्याची येगा", waveHeight: "लाटेची उंचाय", fishermenZone: "मासळकार क्षेत्र", heroTitle: "देगेर धोको पावचे आदीं पळयात", forFishermen: "मासळकार, बंदर अधिकारी आनी कोस्ट गार्डा खातीर तयार केला" },

  sd: { langName: "Sindhi", nativeName: "سنڌي", safeToFish: "ڇا اڄ مڇي مارڻ وڃڻ محفوظ آهي؟", go: "وڃو", caution: "خبردار", doNotGo: "نه وڃو", confidence: "اعتماد جو درجو", nearestHarbor: "ويجهي محفوظ بندرگاهه", emergencyCall: "ڪوسٽ گارڊ کي ڪال ڪريو", shareLocation: "منهنجي جڳهه شيئر ڪريو", tripCalculator: "سفر خرچ ڪئلڪيوليٽر", catchPotential: "مڇي ملڻ جو امڪان", windSpeed: "هوا جي رفتار", waveHeight: "لهر جي بلندي", fishermenZone: "مهاڻن جو علائقو", heroTitle: "خطرو ساحل تي پهچڻ کان اڳ ڏسو", forFishermen: "مهاڻن، بندرگاهه اختيارين ۽ ڪوسٽ گارڊ لاءِ ٺاهيو ويو" },

  ne: { langName: "Nepali", nativeName: "नेपाली", safeToFish: "आज माछा मार्न जानु सुरक्षित छ?", go: "जानुहोस्", caution: "सावधानी", doNotGo: "नजानुहोस्", confidence: "विश्वासको स्तर", nearestHarbor: "नजिकैको सुरक्षित बन्दरगाह", emergencyCall: "कोस्ट गार्डलाई कल गर्नुहोस्", shareLocation: "मेरो स्थान साझा गर्नुहोस्", tripCalculator: "यात्रा खर्च क्यालकुलेटर", catchPotential: "माछा पाइने सम्भावना", windSpeed: "हावाको गति", waveHeight: "छालको उचाइ", fishermenZone: "माझी क्षेत्र", heroTitle: "किनारमा खतरा पुग्नु अघि नै हेर्नुहोस्", forFishermen: "माझी, बन्दरगाह अधिकारी र कोस्ट गार्डका लागि निर्मित" },

  sa: { langName: "Sanskrit", nativeName: "संस्कृतम्", safeToFish: "अद्य मत्स्यग्रहणाय गमनं सुरक्षितम् अस्ति वा?", go: "गच्छतु", caution: "सावधानता", doNotGo: "मा गच्छतु", confidence: "विश्वासस्तरः", nearestHarbor: "निकटतमं सुरक्षितं पत्तनम्", emergencyCall: "तटरक्षकं आह्वयतु", shareLocation: "स्वस्थानं साझां करोतु", tripCalculator: "यात्रा-व्ययगणकम्", catchPotential: "मत्स्यप्राप्तेः सम्भावना", windSpeed: "वायोः वेगः", waveHeight: "तरङ्गस्य उच्चता", fishermenZone: "मत्स्यजीविनां क्षेत्रम्", heroTitle: "तटं प्रति भयम् आगमनात् पूर्वमेव पश्यतु", forFishermen: "मत्स्यजीविभ्यः, पत्तनाधिकारिभ्यः तटरक्षकाय च निर्मितम्" },

  brx: { langName: "Bodo", nativeName: "बड़ो", safeToFish: "दिनै नाथाय नुबाय बागोन जायो नोंथाङो?", go: "थांगोन", caution: "सांख्रिनाय", doNotGo: "थांबाय", confidence: "बिश्वासनि थाखो", nearestHarbor: "हार सोमोन्नाय बंदर", emergencyCall: "कोस्ट गार्दखौ फोन को", shareLocation: "आंनि जायगा सेयार को", tripCalculator: "बिजोबनि गोसो हिसाब", catchPotential: "नाथाय मोननाय संभावना", windSpeed: "बिहोरनि गति", waveHeight: "दैनि उसुं", fishermenZone: "नाथाय बायग्राबसारि थाखो", heroTitle: "बिपद बड़ोर सिमानाव थां आगोलनि सिगां नुगोन", forFishermen: "नाथायग्रा, बंदर अधिकारी आरो कोस्ट गार्दनि थाखाय सोरजिनाय" },

  doi: { langName: "Dogri", nativeName: "डोगरी", safeToFish: "क्या अज्ज मच्छी फड़ने जाना सुरक्षित ऐ?", go: "जाओ", caution: "सावधानी", doNotGo: "नेईं जाओ", confidence: "भरोसे दा दर्जा", nearestHarbor: "नेड़े दी सुरक्षित बंदरगाह", emergencyCall: "कोस्ट गार्ड जो कॉल करो", shareLocation: "मेरी थाह् सांझी करो", tripCalculator: "यात्रा खर्च कैलकुलेटर", catchPotential: "मच्छी मिलने दी उम्मीद", windSpeed: "हवा दी गति", waveHeight: "लैह् दी उचाई", fishermenZone: "मछेरे दा इलाका", heroTitle: "किनारे तक खतरा पुज्जने थमां पैह्ले दिक्खो", forFishermen: "मछेरयां, बंदरगाह अधिकारियां ते कोस्ट गार्ड आस्तै बणाया गेदा" },

  mni: { langName: "Manipuri", nativeName: "মৈতৈলোন্", safeToFish: "ঙসি ঙা হাবা চৎপা অসোকহনবা য়াবগে?", go: "চৎলো", caution: "চেক্সিন্নবা", doNotGo: "হন্না চৎকনু", confidence: "থাজবা মশা", nearestHarbor: "নকপা অসোকহনবা তুরেল", emergencyCall: "কোস্ট গার্দবু কল তৌবীয়ু", shareLocation: "ঐগী মফম শেয়র তৌবীয়ু", tripCalculator: "লৈখৎপা কর্চ ক্যালকুলেতর", catchPotential: "ঙা ফংবগী মশা", windSpeed: "নুংশিৎকী মশা", waveHeight: "ইনারোলগী মশা", fishermenZone: "ঙা হাবা মীওইশিং গী মফম", heroTitle: "ৱার নুংগী পাত্তা লক্তা মমাংদা য়েংবীয়ু", forFishermen: "ঙা হাবা মীওইশিং, তুরেল লাইরিক লৈনবা অমসুং কোস্ট গার্দ গীদমক শেম্লিবা" },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  const t = (key) => DICTIONARY[lang]?.[key] ?? DICTIONARY.en[key] ?? key;

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, t, languages: Object.keys(DICTIONARY), DICTIONARY }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
