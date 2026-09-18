import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmergencyRequest, EmergencyAIResponse } from '../types';

interface LocationState {
  lat: number | null;
  lng: number | null;
  address: string;
  loading: boolean;
  permissionGranted: boolean;
  error?: string;
}

interface EmergencyContextType {
  location: LocationState;
  refreshLocation: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  translate: (key: string) => string;
  activeEmergency: EmergencyRequest | null;
  setActiveEmergency: (req: EmergencyRequest | null) => void;
  cachedAnalysis: EmergencyAIResponse | null;
  setCachedAnalysis: (analysis: EmergencyAIResponse | null) => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

const translations: Record<string, Record<string, string>> = {
  en: {},
  ta: {
    'auth.registerTitle': 'பதிலளிப்பவர் கணக்கை உருவாக்கவும்',
    'auth.loginTitle': 'உதவியாளரில் உள்நுழைக',
    'auth.registerSubtitle': 'சம்பவ வரலாறு, அவசர தொடர்புகள் மற்றும் தனிப்பட்ட விருப்பங்களைச் சேமிக்கவும்.',
    'auth.loginSubtitle': 'உங்கள் அவசர வரலாறு மற்றும் சுயவிவரத்தை அணுகவும்.',
    'auth.fullName': 'முழுப் பெயர்',
    'auth.email': 'மின்னஞ்சல் முகவரி',
    'auth.password': 'கடவுச்சொல்',
    'auth.phone': 'அவசர தொலைபேசி எண் (விருப்பம்)',
    'auth.submitRegister': 'பதிவை முடிக்கவும்',
    'auth.submitLogin': 'உள்நுழைக',
    'auth.existing': 'ஏற்கனவே பதிவு செய்துள்ளீர்களா? உள்நுழைக',
    'auth.new': 'கணக்கு இல்லையா? இப்போது உருவாக்கவும்',
    'auth.failed': 'அங்கீகாரம் தோல்வியடைந்தது. உங்கள் தகவல்களைச் சரிபார்க்கவும்.',
    'analysis.loading': 'AI அவசர பகுப்பாய்வு உருவாக்கப்படுகிறது...',
    'analysis.notFound': 'சம்பவம் கிடைக்கவில்லை',
    'analysis.detected': 'கண்டறியப்பட்ட அவசரநிலை',
    'analysis.reported': 'புகாரளிக்கப்பட்டது',
    'analysis.priority': 'முன்னுரிமை',
    'analysis.situation': 'புகாரளிக்கப்பட்ட நிலை',
    'analysis.assessment': 'அவசர சேவை மதிப்பீடு',
    'analysis.response': 'முழு பதில் மற்றும் நேரடி வரைபடத்தைத் திறக்கவும்',
    'home.badge': 'நிகழ்நேர அவசர உதவி மற்றும் வகைப்படுத்தல்',
    'home.title': 'நாங்கள் எவ்வாறு உதவலாம்?',
    'home.subtitle': 'உங்கள் அவசர நிலையை விவரித்து உடனடி பாதுகாப்பு வழிகாட்டுதலைப் பெறுங்கள்.',
    'home.describe': 'அவசர நிலையை விவரிக்கவும்',
    'home.category': 'அவசர வகை',
    'home.autoDetect': 'விளக்கத்திலிருந்து தானாக கண்டறி',
    'home.location': 'GPS இட அணுகல்',
    'home.refreshGps': 'GPS புதுப்பி',
    'home.getHelp': 'உடனடி அவசர உதவி பெறுங்கள்',
    'home.quickCategories': 'விரைவு அவசர வகைகள்',
    'history.title': 'அவசர சம்பவப் பதிவு',
    'history.subtitle': 'முந்தைய அவசர கோரிக்கைகள் மற்றும் சரிபார்க்கப்பட்ட வழிமுறைகள்.',
    'history.new': 'புதிய அவசர கோரிக்கை',
    'history.loading': 'சம்பவப் பதிவுகளைப் பெறுகிறது...',
    'history.empty': 'அவசரப் பதிவுகள் எதுவும் இல்லை',
    'history.view': 'வகைப்படுத்தல் விவரங்களைக் காண்க',
    'settings.title': 'அமைப்புகள் மற்றும் அவசர விருப்பங்கள்',
    'settings.subtitle': 'மொழி, அவசர தொடர்புகள் மற்றும் தனியுரிமையை அமைக்கவும்.',
    'settings.language': 'மொழி மற்றும் உள்ளூர்மயமாக்கல்',
    'settings.location': 'இடம் மற்றும் புவியிடம்',
    'settings.contacts': 'தனிப்பட்ட அவசர தொடர்புகள்',
    'settings.saved': 'விருப்பங்கள் சேமிக்கப்பட்டன',
    'nav.report': 'அவசர அறிக்கை',
    'nav.history': 'அவசர வரலாறு',
    'nav.settings': 'அமைப்புகள் மற்றும் தொடர்புகள்',
    'nav.sos': 'SOS 112 / 911',
    'nav.logout': 'வெளியேறு',
    'report.title': 'அவசர சம்பவத்தைப் புகாரளிக்கவும்',
    'report.type': 'அவசர வகை',
    'report.description': 'விளக்கம்',
    'report.severity': 'தீவிரம்',
    'report.location': 'இடம்',
    'report.analyze': 'AI மூலம் பகுப்பாய்வு செய்',
    'report.submit': 'அறிக்கையைச் சமர்ப்பிக்கவும்',
    'report.result': 'AI பகுப்பாய்வு முடிவு',
  },
  es: {
    'auth.registerTitle': 'Crear cuenta de responder',
    'auth.loginTitle': 'Iniciar sesión en el asistente',
    'auth.registerSubtitle': 'Guarda el historial, contactos de emergencia y preferencias personales.',
    'auth.loginSubtitle': 'Accede a tu historial de emergencias y perfil.',
    'auth.fullName': 'Nombre completo',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.phone': 'Teléfono de emergencia (opcional)',
    'auth.submitRegister': 'Completar registro',
    'auth.submitLogin': 'Iniciar sesión',
    'auth.existing': '¿Ya estás registrado? Inicia sesión',
    'auth.new': '¿No tienes una cuenta? Créala ahora',
    'auth.failed': 'La autenticación falló. Comprueba tus datos.',
    'analysis.loading': 'Generando análisis de emergencia con IA...',
    'analysis.notFound': 'Incidente no encontrado',
    'analysis.detected': 'Emergencia detectada',
    'analysis.reported': 'Informado',
    'analysis.priority': 'Prioridad',
    'analysis.situation': 'Situación informada',
    'analysis.assessment': 'Evaluación del despachador',
    'analysis.response': 'Abrir respuesta completa y mapa en vivo',
    'home.badge': 'Asistencia y clasificación de emergencias en tiempo real',
    'home.title': '¿Cómo podemos ayudarte?',
    'home.subtitle': 'Describe tu emergencia y recibe orientación inmediata de seguridad.',
    'home.describe': 'Describe la situación de emergencia',
    'home.category': 'Categoría de emergencia',
    'home.autoDetect': 'Detectar automáticamente desde la descripción',
    'home.location': 'Acceso a ubicación GPS',
    'home.refreshGps': 'Actualizar GPS',
    'home.getHelp': 'Obtener ayuda de emergencia inmediata',
    'home.quickCategories': 'Categorías rápidas de emergencia',
    'history.title': 'Registro de incidentes de emergencia',
    'history.subtitle': 'Registro histórico de solicitudes y respuestas de emergencia verificadas.',
    'history.new': 'Nueva solicitud de emergencia',
    'history.loading': 'Obteniendo registros de incidentes...',
    'history.empty': 'No se encontraron registros de emergencia',
    'history.view': 'Ver detalles de triaje',
    'settings.title': 'Ajustes y preferencias de emergencia',
    'settings.subtitle': 'Configura el idioma, contactos de emergencia y privacidad.',
    'settings.language': 'Idioma y localización',
    'settings.location': 'Ubicación y geolocalización',
    'settings.contacts': 'Contactos personales de emergencia',
    'settings.saved': 'Preferencias guardadas',
    'nav.report': 'Informe de emergencia',
    'nav.history': 'Historial de emergencias',
    'nav.settings': 'Ajustes y contactos',
    'nav.sos': 'SOS 112 / 911',
    'nav.logout': 'Cerrar sesión',
    'report.title': 'Informar un incidente de emergencia',
    'report.type': 'Tipo de emergencia',
    'report.description': 'Descripción',
    'report.severity': 'Gravedad',
    'report.location': 'Ubicación',
    'report.analyze': 'Analizar con IA',
    'report.submit': 'Enviar informe',
    'report.result': 'Resultado del análisis de IA',
  },
  hi: {
    'auth.registerTitle': 'उत्तरदाता खाता बनाएं',
    'auth.loginTitle': 'सहायक में साइन इन करें',
    'auth.registerSubtitle': 'घटना इतिहास, आपातकालीन संपर्क और व्यक्तिगत प्राथमिकताएं सहेजें।',
    'auth.loginSubtitle': 'अपना आपातकालीन इतिहास और प्रोफ़ाइल खोलें।',
    'auth.fullName': 'पूरा नाम',
    'auth.email': 'ईमेल पता',
    'auth.password': 'पासवर्ड',
    'auth.phone': 'आपातकालीन फोन नंबर (वैकल्पिक)',
    'auth.submitRegister': 'पंजीकरण पूरा करें',
    'auth.submitLogin': 'साइन इन करें',
    'auth.existing': 'पहले से पंजीकृत हैं? साइन इन करें',
    'auth.new': 'खाता नहीं है? अभी बनाएं',
    'auth.failed': 'प्रमाणीकरण विफल हुआ। कृपया जानकारी जांचें।',
    'analysis.loading': 'AI आपातकालीन विश्लेषण तैयार किया जा रहा है...',
    'analysis.notFound': 'घटना नहीं मिली',
    'analysis.detected': 'पहचाना गया आपातकाल',
    'analysis.reported': 'रिपोर्ट किया गया',
    'analysis.priority': 'प्राथमिकता',
    'analysis.situation': 'रिपोर्ट की गई स्थिति',
    'analysis.assessment': 'डिस्पैचर का आकलन',
    'analysis.response': 'पूरा उत्तर और लाइव मानचित्र खोलें',
    'home.badge': 'रियल-टाइम आपातकालीन सहायता और वर्गीकरण',
    'home.title': 'हम आपकी कैसे सहायता कर सकते हैं?',
    'home.subtitle': 'अपातकाल का वर्णन करें और तुरंत सुरक्षा मार्गदर्शन प्राप्त करें।',
    'home.describe': 'आपातकालीन स्थिति का वर्णन करें',
    'home.category': 'आपातकालीन श्रेणी',
    'home.autoDetect': 'विवरण से स्वतः पहचानें',
    'home.location': 'GPS स्थान पहुंच',
    'home.refreshGps': 'GPS ताज़ा करें',
    'home.getHelp': 'तुरंत आपातकालीन सहायता प्राप्त करें',
    'home.quickCategories': 'त्वरित आपातकालीन श्रेणियां',
    'history.title': 'आपातकालीन घटना लॉग',
    'history.subtitle': 'पिछली आपातकालीन अनुरोधों और सत्यापित निर्देशों का रिकॉर्ड।',
    'history.new': 'नया आपातकालीन अनुरोध',
    'history.loading': 'घटना रिकॉर्ड प्राप्त हो रहे हैं...',
    'history.empty': 'कोई आपातकालीन रिकॉर्ड नहीं मिला',
    'history.view': 'ट्रायेज विवरण देखें',
    'settings.title': 'सेटिंग्स और आपातकालीन प्राथमिकताएं',
    'settings.subtitle': 'भाषा, आपातकालीन संपर्क और गोपनीयता कॉन्फ़िगर करें।',
    'settings.language': 'भाषा और स्थानीयकरण',
    'settings.location': 'स्थान और जियोलोकेशन',
    'settings.contacts': 'व्यक्तिगत आपातकालीन संपर्क',
    'settings.saved': 'प्राथमिकताएं सहेजी गईं',
    'nav.report': 'आपातकालीन रिपोर्ट',
    'nav.history': 'आपातकालीन इतिहास',
    'nav.settings': 'सेटिंग्स और संपर्क',
    'nav.sos': 'SOS 112 / 911',
    'nav.logout': 'लॉग आउट',
    'report.title': 'आपातकालीन घटना की रिपोर्ट करें',
    'report.type': 'आपातकाल का प्रकार',
    'report.description': 'विवरण',
    'report.severity': 'गंभीरता',
    'report.location': 'स्थान',
    'report.analyze': 'AI से विश्लेषण करें',
    'report.submit': 'रिपोर्ट भेजें',
    'report.result': 'AI विश्लेषण परिणाम',
  },
  fr: {
    'auth.registerTitle': 'Créer un compte intervenant',
    'auth.loginTitle': "Se connecter à l'assistant",
    'auth.registerSubtitle': "Enregistrez l'historique, les contacts d'urgence et vos préférences.",
    'auth.loginSubtitle': "Accédez à votre historique d'urgence et à votre profil.",
    'auth.fullName': 'Nom complet',
    'auth.email': 'Adresse e-mail',
    'auth.password': 'Mot de passe',
    'auth.phone': "Téléphone d'urgence (facultatif)",
    'auth.submitRegister': "Terminer l'inscription",
    'auth.submitLogin': 'Se connecter',
    'auth.existing': 'Déjà inscrit ? Connectez-vous',
    'auth.new': 'Pas de compte ? Créez-en un',
    'auth.failed': "Échec de l'authentification. Vérifiez vos informations.",
    'analysis.loading': "Génération de l'analyse d'urgence par IA...",
    'analysis.notFound': 'Incident introuvable',
    'analysis.detected': "Urgence détectée",
    'analysis.reported': 'Signalé',
    'analysis.priority': 'Priorité',
    'analysis.situation': 'Situation signalée',
    'analysis.assessment': 'Évaluation du répartiteur',
    'analysis.response': 'Ouvrir la réponse complète et la carte en direct',
    'home.badge': "Assistance et triage d'urgence en temps réel",
    'home.title': 'Comment pouvons-nous vous aider ?',
    'home.subtitle': "Décrivez votre urgence et recevez des conseils de sécurité immédiats.",
    'home.describe': "Décrivez la situation d'urgence",
    'home.category': "Catégorie d'urgence",
    'home.autoDetect': 'Détecter automatiquement depuis la description',
    'home.location': 'Accès à la localisation GPS',
    'home.refreshGps': 'Actualiser le GPS',
    'home.getHelp': "Obtenir une aide d'urgence immédiate",
    'home.quickCategories': "Catégories d'urgence rapides",
    'history.title': "Journal des incidents d'urgence",
    'history.subtitle': "Historique des demandes et consignes d'urgence vérifiées.",
    'history.new': "Nouvelle demande d'urgence",
    'history.loading': 'Récupération des incidents...',
    'history.empty': "Aucun incident d'urgence trouvé",
    'history.view': 'Voir les détails du triage',
    'settings.title': "Paramètres et préférences d'urgence",
    'settings.subtitle': "Configurez la langue, les contacts d'urgence et la confidentialité.",
    'settings.language': 'Langue et localisation',
    'settings.location': 'Lieu et géolocalisation',
    'settings.contacts': "Contacts personnels d'urgence",
    'settings.saved': 'Préférences enregistrées',
    'nav.report': "Rapport d'urgence",
    'nav.history': "Historique des urgences",
    'nav.settings': 'Paramètres et contacts',
    'nav.sos': 'SOS 112 / 911',
    'nav.logout': 'Déconnexion',
    'report.title': "Signaler un incident d'urgence",
    'report.type': "Type d'urgence",
    'report.description': 'Description',
    'report.severity': 'Gravité',
    'report.location': 'Lieu',
    'report.analyze': "Analyser avec l'IA",
    'report.submit': 'Envoyer le rapport',
    'report.result': "Résultat de l'analyse IA",
  },
  de: {
    'auth.registerTitle': 'Responder-Konto erstellen',
    'auth.loginTitle': 'Beim Assistenten anmelden',
    'auth.registerSubtitle': 'Ereignisverlauf, Notfallkontakte und persönliche Einstellungen speichern.',
    'auth.loginSubtitle': 'Notfallverlauf und Profil aufrufen.',
    'auth.fullName': 'Vollständiger Name',
    'auth.email': 'E-Mail-Adresse',
    'auth.password': 'Passwort',
    'auth.phone': 'Notfalltelefon (optional)',
    'auth.submitRegister': 'Registrierung abschließen',
    'auth.submitLogin': 'Anmelden',
    'auth.existing': 'Bereits registriert? Anmelden',
    'auth.new': 'Noch kein Konto? Jetzt erstellen',
    'auth.failed': 'Anmeldung fehlgeschlagen. Bitte Daten prüfen.',
    'analysis.loading': 'KI-Notfallanalyse wird erstellt...',
    'analysis.notFound': 'Ereignis nicht gefunden',
    'analysis.detected': 'Erkannter Notfall',
    'analysis.reported': 'Gemeldet',
    'analysis.priority': 'Priorität',
    'analysis.situation': 'Gemeldete Situation',
    'analysis.assessment': 'Bewertung der Leitstelle',
    'analysis.response': 'Vollständige Antwort und Live-Karte öffnen',
    'home.badge': 'Echtzeit-Notfallhilfe und Triage',
    'home.title': 'Wie können wir helfen?',
    'home.subtitle': 'Beschreiben Sie Ihren Notfall und erhalten Sie sofortige Sicherheitshinweise.',
    'home.describe': 'Notfallsituation beschreiben',
    'home.category': 'Notfallkategorie',
    'home.autoDetect': 'Aus der Beschreibung automatisch erkennen',
    'home.location': 'GPS-Standortzugriff',
    'home.refreshGps': 'GPS aktualisieren',
    'home.getHelp': 'Sofortige Notfallhilfe erhalten',
    'home.quickCategories': 'Schnelle Notfallkategorien',
    'history.title': 'Notfall-Ereignisprotokoll',
    'history.subtitle': 'Historische Aufzeichnungen verifizierter Notfallanfragen und Hinweise.',
    'history.new': 'Neue Notfallanfrage',
    'history.loading': 'Ereignisaufzeichnungen werden geladen...',
    'history.empty': 'Keine Notfallaufzeichnungen gefunden',
    'history.view': 'Triage-Details anzeigen',
    'settings.title': 'Einstellungen und Notfallpräferenzen',
    'settings.subtitle': 'Sprache, Notfallkontakte und Datenschutz konfigurieren.',
    'settings.language': 'Sprache und Lokalisierung',
    'settings.location': 'Standort und Geolokalisierung',
    'settings.contacts': 'Persönliche Notfallkontakte',
    'settings.saved': 'Einstellungen gespeichert',
    'nav.report': 'Notfallbericht',
    'nav.history': 'Notfallverlauf',
    'nav.settings': 'Einstellungen und Kontakte',
    'nav.sos': 'SOS 112 / 911',
    'nav.logout': 'Abmelden',
    'report.title': 'Notfall melden',
    'report.type': 'Notfalltyp',
    'report.description': 'Beschreibung',
    'report.severity': 'Schweregrad',
    'report.location': 'Ort',
    'report.analyze': 'Mit KI analysieren',
    'report.submit': 'Bericht senden',
    'report.result': 'Ergebnis der KI-Analyse',
  },
  ar: {
    'auth.registerTitle': 'إنشاء حساب المستجيب',
    'auth.loginTitle': 'تسجيل الدخول إلى المساعد',
    'auth.registerSubtitle': 'احفظ سجل الحوادث وجهات اتصال الطوارئ والتفضيلات الشخصية.',
    'auth.loginSubtitle': 'افتح سجل الطوارئ والملف الشخصي.',
    'auth.fullName': 'الاسم الكامل',
    'auth.email': 'عنوان البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.phone': 'رقم هاتف الطوارئ (اختياري)',
    'auth.submitRegister': 'إكمال التسجيل',
    'auth.submitLogin': 'تسجيل الدخول',
    'auth.existing': 'مسجل بالفعل؟ تسجيل الدخول',
    'auth.new': 'ليس لديك حساب؟ أنشئ حساباً الآن',
    'auth.failed': 'فشلت المصادقة. يرجى التحقق من بياناتك.',
    'analysis.loading': 'جارٍ إنشاء تحليل الطوارئ بالذكاء الاصطناعي...',
    'analysis.notFound': 'لم يتم العثور على الحادث',
    'analysis.detected': 'حالة الطوارئ المكتشفة',
    'analysis.reported': 'تم الإبلاغ',
    'analysis.priority': 'الأولوية',
    'analysis.situation': 'الوضع المبلغ عنه',
    'analysis.assessment': 'تقييم غرفة الطوارئ',
    'analysis.response': 'فتح الاستجابة الكاملة والخريطة المباشرة',
    'home.badge': 'مساعدة وفرز حالات الطوارئ في الوقت الحقيقي',
    'home.title': 'كيف يمكننا مساعدتك؟',
    'home.subtitle': 'صف حالة الطوارئ واحصل على إرشادات سلامة فورية.',
    'home.describe': 'صف حالة الطوارئ',
    'home.category': 'فئة الطوارئ',
    'home.autoDetect': 'اكتشاف تلقائي من الوصف',
    'home.location': 'الوصول إلى موقع GPS',
    'home.refreshGps': 'تحديث GPS',
    'home.getHelp': 'احصل على مساعدة طوارئ فورية',
    'home.quickCategories': 'فئات الطوارئ السريعة',
    'history.title': 'سجل حوادث الطوارئ',
    'history.subtitle': 'سجل طلبات الطوارئ السابقة وتعليمات الاستجابة الموثقة.',
    'history.new': 'طلب طوارئ جديد',
    'history.loading': 'جارٍ استرجاع سجلات الحوادث...',
    'history.empty': 'لم يتم العثور على سجلات طوارئ',
    'history.view': 'عرض تفاصيل الفرز',
    'settings.title': 'الإعدادات وتفضيلات الطوارئ',
    'settings.subtitle': 'اضبط اللغة وجهات اتصال الطوارئ والخصوصية.',
    'settings.language': 'اللغة والتوطين',
    'settings.location': 'الموقع وتحديد الموقع الجغرافي',
    'settings.contacts': 'جهات اتصال الطوارئ الشخصية',
    'settings.saved': 'تم حفظ التفضيلات',
    'nav.report': 'بلاغ طوارئ',
    'nav.history': 'سجل الطوارئ',
    'nav.settings': 'الإعدادات وجهات الاتصال',
    'nav.sos': 'SOS 112 / 911',
    'nav.logout': 'تسجيل الخروج',
    'report.title': 'الإبلاغ عن حادث طارئ',
    'report.type': 'نوع الطوارئ',
    'report.description': 'الوصف',
    'report.severity': 'الخطورة',
    'report.location': 'الموقع',
    'report.analyze': 'تحليل بالذكاء الاصطناعي',
    'report.submit': 'إرسال البلاغ',
    'report.result': 'نتيجة تحليل الذكاء الاصطناعي',
  },
};

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationState>({
    lat: 40.7128,
    lng: -74.0060,
    address: 'Midtown Manhattan, New York, NY (Default)',
    loading: false,
    permissionGranted: false,
  });

  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('emergency_lang') || 'en';
  });

  const [activeEmergency, setActiveEmergency] = useState<EmergencyRequest | null>(null);
  const [cachedAnalysis, setCachedAnalysis] = useState<EmergencyAIResponse | null>(null);

  const setLanguage = (lang: string) => {
    localStorage.setItem('emergency_lang', lang);
    setLanguageState(lang);
  };

  const translate = (key: string) => translations[language]?.[key] || translations.en[key] || key;

  const refreshLocation = () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: undefined }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let addr = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° W`;
        try {
          // Quick reverse-geocode via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`,
            { headers: { 'User-Agent': 'EmergencyAssistantApp/1.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(',');
              addr = parts.slice(0, 3).join(', ');
            }
          }
        } catch {
          // Fallback to formatted coordinates
        }

        setLocation({
          lat: latitude,
          lng: longitude,
          address: addr,
          loading: false,
          permissionGranted: true,
        });
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: 'Location access denied or timed out. Using approximate coordinates.',
        }));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    // Attempt location fetch on mount
    refreshLocation();
  }, []);

  return (
    <EmergencyContext.Provider
      value={{
        location,
        refreshLocation,
        language,
        setLanguage,
        translate,
        activeEmergency,
        setActiveEmergency,
        cachedAnalysis,
        setCachedAnalysis,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error('useEmergency must be used within an EmergencyProvider');
  return ctx;
};
