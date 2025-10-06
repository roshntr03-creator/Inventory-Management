'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'en' | 'ar';

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
};

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
  dir: 'ltr',
});

export const useI18n = () => useContext(I18nContext);

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.items': 'Items',
    'nav.receive': 'Receive',
    'nav.pick': 'Pick',
    'nav.transfer': 'Transfer',
    'nav.locations': 'Locations',
    'nav.scan': 'Scan',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.signOut': 'Sign Out',

    // Landing Page
    'landing.title': 'Inventory Management',
    'landing.subtitle': 'Powered by QR Codes',
    'landing.description': 'Track every item, scan to move stock, manage locations with precision. Real-time alerts keep you ahead of shortages and expirations.',
    'landing.getStarted': 'Get Started',
    'landing.contactSales': 'Contact Sales',
    'landing.features': 'Powerful Features',
    'landing.featuresDesc': 'Everything you need to manage inventory at scale',
    'landing.openApp': 'Open App',

    // Features
    'feature.qr.title': 'QR Code Labels',
    'feature.qr.desc': 'Generate and print QR labels for items and stock lots. Scan to instantly access details and perform actions.',
    'feature.location.title': 'Location Tracking',
    'feature.location.desc': 'Organize inventory with warehouse, aisle, rack, and bin hierarchy. Transfer stock with ease.',
    'feature.alerts.title': 'Smart Alerts',
    'feature.alerts.desc': 'Real-time notifications for low stock, near-expiry items, and negative balance prevention.',
    'feature.movements.title': 'Stock Movements',
    'feature.movements.desc': 'Track every receive, pick, transfer, and adjustment with complete audit trail and timestamps.',
    'feature.reports.title': 'Reports & Analytics',
    'feature.reports.desc': 'On-hand valuation, movement ledgers, and CSV exports for deeper analysis.',
    'feature.roles.title': 'Role-Based Access',
    'feature.roles.desc': 'Admin and staff roles with protected routes and secure authentication.',

    // Auth
    'auth.login': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.role': 'Role',
    'auth.staff': 'Staff',
    'auth.admin': 'Admin',
    'auth.signingIn': 'Signing in...',
    'auth.creatingAccount': 'Creating account...',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.createAccount': 'Create Account',
    'auth.signUpDesc': 'Sign up to start managing your inventory',
    'auth.signInDesc': 'Enter your credentials to access your account',
    'auth.welcomeBack': 'Welcome back!',
    'auth.accountCreated': 'Account created successfully!',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.desc': 'Overview of your inventory operations',
    'dashboard.totalValue': 'Total Inventory Value',
    'dashboard.lowStock': 'Low Stock Items',
    'dashboard.movementsToday': 'Movements Today',
    'dashboard.totalItems': 'Total Items',
    'dashboard.activeAlerts': 'Active Alerts',
    'dashboard.alertsDesc': 'Alerts require your attention',
    'dashboard.noAlerts': 'No active alerts',
    'dashboard.recentMovements': 'Recent Movements',
    'dashboard.movementsDesc': 'Latest stock movements today',
    'dashboard.noMovements': 'No movements today',
    'dashboard.receiveStock': 'Receive Stock',
    'dashboard.addInventory': 'Add new inventory',
    'dashboard.pickStock': 'Pick Stock',
    'dashboard.fulfillOrders': 'Fulfill orders',
    'dashboard.transferStock': 'Transfer Stock',
    'dashboard.moveBetween': 'Move between locations',

    // Items
    'items.title': 'Items',
    'items.desc': 'Manage your inventory items',
    'items.addItem': 'Add Item',
    'items.search': 'Search by name, SKU, or category...',
    'items.sku': 'SKU',
    'items.name': 'Name',
    'items.description': 'Description',
    'items.unit': 'Unit',
    'items.category': 'Category',
    'items.minStock': 'Min Stock',
    'items.reorderPoint': 'Reorder Point',
    'items.reorderQty': 'Reorder Quantity',
    'items.createItem': 'Create Item',
    'items.generateQR': 'Generate QR',
    'items.noItems': 'No items found. Create your first item to get started.',
    'items.cancel': 'Cancel',
    'items.addNewItem': 'Add New Item',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.view': 'View',
    'common.download': 'Download',
    'common.print': 'Print',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.quantity': 'Quantity',
    'common.notes': 'Notes',
    'common.required': 'Required',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.items': 'المواد',
    'nav.receive': 'استلام',
    'nav.pick': 'صرف',
    'nav.transfer': 'نقل',
    'nav.locations': 'المواقع',
    'nav.scan': 'مسح',
    'nav.reports': 'التقارير',
    'nav.settings': 'الإعدادات',
    'nav.signOut': 'تسجيل الخروج',

    // Landing Page
    'landing.title': 'إدارة المخزون',
    'landing.subtitle': 'بتقنية رموز QR',
    'landing.description': 'تتبع كل صنف، امسح لنقل المخزون، أدر المواقع بدقة. التنبيهات الفورية تبقيك في المقدمة من النقص والانتهاء.',
    'landing.getStarted': 'ابدأ الآن',
    'landing.contactSales': 'تواصل معنا',
    'landing.features': 'مميزات قوية',
    'landing.featuresDesc': 'كل ما تحتاجه لإدارة المخزون بنطاق واسع',
    'landing.openApp': 'فتح التطبيق',

    // Features
    'feature.qr.title': 'ملصقات رموز QR',
    'feature.qr.desc': 'إنشاء وطباعة ملصقات QR للمواد واللوتات. امسح للوصول الفوري للتفاصيل وتنفيذ الإجراءات.',
    'feature.location.title': 'تتبع المواقع',
    'feature.location.desc': 'نظم المخزون بتسلسل المستودع، الممر، الرف، والصندوق. انقل المخزون بسهولة.',
    'feature.alerts.title': 'تنبيهات ذكية',
    'feature.alerts.desc': 'إشعارات فورية للمخزون المنخفض، الأصناف القريبة من الانتهاء، ومنع الرصيد السالب.',
    'feature.movements.title': 'حركات المخزون',
    'feature.movements.desc': 'تتبع كل استلام، صرف، نقل، وتعديل مع سجل مراجعة كامل وتوقيتات.',
    'feature.reports.title': 'التقارير والتحليلات',
    'feature.reports.desc': 'تقييم المخزون الحالي، سجلات الحركات، وتصدير CSV لتحليل أعمق.',
    'feature.roles.title': 'الوصول حسب الدور',
    'feature.roles.desc': 'أدوار المدير والموظف مع مسارات محمية ومصادقة آمنة.',

    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.signup': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.fullName': 'الاسم الكامل',
    'auth.role': 'الدور',
    'auth.staff': 'موظف',
    'auth.admin': 'مدير',
    'auth.signingIn': 'جاري تسجيل الدخول...',
    'auth.creatingAccount': 'جاري إنشاء الحساب...',
    'auth.alreadyHaveAccount': 'لديك حساب بالفعل؟',
    'auth.dontHaveAccount': 'ليس لديك حساب؟',
    'auth.createAccount': 'إنشاء حساب',
    'auth.signUpDesc': 'سجل لبدء إدارة مخزونك',
    'auth.signInDesc': 'أدخل بياناتك للوصول إلى حسابك',
    'auth.welcomeBack': 'مرحباً بعودتك!',
    'auth.accountCreated': 'تم إنشاء الحساب بنجاح!',

    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.desc': 'نظرة عامة على عمليات المخزون',
    'dashboard.totalValue': 'القيمة الإجمالية للمخزون',
    'dashboard.lowStock': 'المواد المنخفضة',
    'dashboard.movementsToday': 'الحركات اليوم',
    'dashboard.totalItems': 'إجمالي المواد',
    'dashboard.activeAlerts': 'التنبيهات النشطة',
    'dashboard.alertsDesc': 'التنبيهات تحتاج انتباهك',
    'dashboard.noAlerts': 'لا توجد تنبيهات نشطة',
    'dashboard.recentMovements': 'الحركات الأخيرة',
    'dashboard.movementsDesc': 'أحدث حركات المخزون اليوم',
    'dashboard.noMovements': 'لا توجد حركات اليوم',
    'dashboard.receiveStock': 'استلام مخزون',
    'dashboard.addInventory': 'إضافة مخزون جديد',
    'dashboard.pickStock': 'صرف مخزون',
    'dashboard.fulfillOrders': 'تنفيذ الطلبات',
    'dashboard.transferStock': 'نقل مخزون',
    'dashboard.moveBetween': 'النقل بين المواقع',

    // Items
    'items.title': 'المواد',
    'items.desc': 'إدارة مواد المخزون',
    'items.addItem': 'إضافة مادة',
    'items.search': 'البحث بالاسم أو رقم SKU أو الفئة...',
    'items.sku': 'رقم SKU',
    'items.name': 'الاسم',
    'items.description': 'الوصف',
    'items.unit': 'الوحدة',
    'items.category': 'الفئة',
    'items.minStock': 'الحد الأدنى',
    'items.reorderPoint': 'نقطة إعادة الطلب',
    'items.reorderQty': 'كمية إعادة الطلب',
    'items.createItem': 'إنشاء مادة',
    'items.generateQR': 'توليد QR',
    'items.noItems': 'لا توجد مواد. أنشئ أول مادة للبدء.',
    'items.cancel': 'إلغاء',
    'items.addNewItem': 'إضافة مادة جديدة',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.submit': 'إرسال',
    'common.close': 'إغلاق',
    'common.view': 'عرض',
    'common.download': 'تحميل',
    'common.print': 'طباعة',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.sort': 'ترتيب',
    'common.actions': 'إجراءات',
    'common.status': 'الحالة',
    'common.date': 'التاريخ',
    'common.quantity': 'الكمية',
    'common.notes': 'ملاحظات',
    'common.required': 'مطلوب',
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}
