export type Lang = 'ar' | 'en'

const ar = {
  'app.title': 'متاهة الذاكرة الضوئية',
  'app.kicker': 'PHOTON DECAY LABYRINTH',
  'app.tagline':
    'الغبار والملح والسخام يحجبون الضوء عن خلايا السيليكون. انزل داخل الخلية، وجّه الفوتونات عبر المناشير، وبدّل طول الموجة لتنظيف المسار وإعادة المحطة الشمسية إلى كفاءتها الكاملة.',
  'intro.lab': 'PV CELL · SOILING LAB',
  'intro.hintRotate': 'اضغط على المنشور لتدويره',
  'intro.hintSwitch': 'بدّل الطيف من الشريط العلوي أو المفاتيح 1 · 2 · 3',

  'menu.start': 'ابدأ المهمة',
  'menu.continue': 'متابعة · الخلية {n}',
  'menu.levels': 'المستويات',
  'menu.records': 'السجلات',
  'menu.settings': 'الإعدادات',
  'menu.createProfile': 'إنشاء ملف لاعب',

  'common.close': 'إغلاق',
  'common.cancel': 'إلغاء',
  'common.save': 'حفظ',
  'common.on': 'تشغيل',
  'common.off': 'إيقاف',
  'common.seconds': 'ث',

  'quality.high': 'سينمائية',
  'quality.low': 'خفيفة',

  'profile.title': 'ملفات اللاعبين',
  'profile.createTitle': 'ملف لاعب جديد',
  'profile.renameTitle': 'تعديل الاسم',
  'profile.nameLabel': 'اسم اللاعب',
  'profile.namePlaceholder': 'اكتب اسمك',
  'profile.nameHint': 'من 2 إلى 16 حرفًا',
  'profile.nameShort': 'الاسم قصير، اكتب حرفين على الأقل',
  'profile.nameTaken': 'هذا الاسم مستخدم في ملف آخر على هذا الجهاز',
  'profile.avatar': 'الشعار',
  'profile.create': 'إنشاء الملف',
  'profile.active': 'نشط',
  'profile.use': 'اختيار',
  'profile.rename': 'تعديل',
  'profile.delete': 'حذف',
  'profile.confirmDelete': 'حذف ملف «{name}» وكل تقدمه نهائيًا؟',
  'profile.confirmYes': 'نعم، احذف',
  'profile.addNew': 'ملف جديد',
  'profile.localNote': 'الملفات والتقدم محفوظة في هذا المتصفح على هذا الجهاز فقط.',
  'profile.summary': '{clears} مستويات مكتملة · {stars} نجوم',

  'levels.title': 'اختر الخلية',
  'levels.locked': 'مقفلة · أكمل الخلية السابقة',
  'levels.best': 'أفضل وقت {time}',
  'levels.notPlayed': 'لم تُلعب بعد',
  'levels.play': 'العب',

  'settings.title': 'الإعدادات',
  'settings.language': 'اللغة',
  'settings.quality': 'جودة الرسوميات',
  'settings.qualityHint': 'السينمائية تضيف الانعكاسات وعمق الميدان وأشعة الشمس. الخفيفة أنسب للجوال.',
  'settings.volume': 'مستوى الصوت',
  'settings.mute': 'كتم الصوت',
  'settings.motion': 'تقليل الحركة',
  'settings.motionHint': 'يوقف اهتزاز الكاميرا والاقتراب التلقائي.',

  'records.title': 'السجلات',
  'records.note': 'أفضل النتائج من كل الملفات على هذا الجهاز.',
  'records.empty': 'لا توجد نتائج بعد. أكمل خلية لتظهر هنا.',
  'records.player': 'اللاعب',
  'records.time': 'الوقت',
  'records.moves': 'تدوير',
  'records.stars': 'النجوم',

  'hud.wavelength': 'طول الموجة',
  'hud.efficiency': 'كفاءة الخلية المستعادة',
  'hud.pause': 'إيقاف مؤقت',
  'hud.mute': 'كتم الصوت',
  'hud.unmute': 'تشغيل الصوت',
  'hud.key': 'مفتاح',

  'wl.ir.name': 'تحت الأحمر',
  'wl.ir.hint': 'يبخّر سحب الغبار الناعم',
  'wl.vis.name': 'مرئي',
  'wl.vis.hint': 'الملاحة السريعة وتغذية المستقبِلات',
  'wl.uv.name': 'فوق البنفسجي',
  'wl.uv.hint': 'يكسر بلورات الملح',

  'level.1.name': 'قشرة الصحراء',
  'level.1.place': 'الربع الخالي',
  'level.1.intro':
    'الغبار الصحراوي يغطي خلية السيليكون. استخدم الأشعة تحت الحمراء لتبخير السحب، ثم وجّه الطيف المرئي إلى المستقبِل.',
  'level.2.name': 'الحاجز الملحي',
  'level.2.place': 'الساحل البحري',
  'level.2.intro':
    'رذاذ البحر ترك قشرة ملحية بلورية. الأشعة فوق البنفسجية تكسر البلورات، وحلقات الطاقة تغيّر طول الموجة في منتصف الطريق.',
  'level.3.name': 'الضباب الصناعي',
  'level.3.place': 'المدينة الصناعية',
  'level.3.intro':
    'سخام الكربون يتحرك بين الممرات. الدوامات المغناطيسية تثني الشعاع، والبوابات لا تمرّر إلا طول موجة واحد. راقب التوقيت.',

  'lumen.role': 'مساعد هولوغرافي',
  'lumen.ready': 'لومن جاهز. بانتظار الفوتون الأول.',
  'lumen.levelIntro': '{name} · {place}. {intro}',
  'lumen.switch': 'تم التبديل إلى {wl} ({nm}): {hint}.',
  'lumen.burn': 'تبخّرت سحابة الغبار. الأشعة تحت الحمراء تحمل طاقة حرارية تفكك الجسيمات الناعمة بدون تلامس.',
  'lumen.shatter': 'تحطّمت البلورة الملحية. طاقة الفوتونات فوق البنفسجية أعلى من طاقة الروابط الأيونية في الملح.',
  'lumen.receiverLocked': 'المستقبِل مقفل على الطيف المرئي. وجّه الشعاع إلى المستقبِل التالي.',
  'lumen.cellDone': 'اكتملت استعادة الخلية. تيار الطاقة يتدفق بكفاءة كاملة.',
  'lumen.finale': 'المحطة الشمسية تعمل بكفاءة 100%. الطاقة النظيفة تضيء المدينة.',
  'lumen.autoQuality': 'لاحظت انخفاض الإطارات، فخففت الجودة تلقائيًا. تقدر ترجعها «سينمائية» من الإعدادات.',

  'clear.rotations': 'تدوير',
  'clear.burned': 'تبخير',
  'clear.shattered': 'تحطيم',
  'clear.time': 'الوقت',
  'clear.body': 'الشعاع وصل إلى كل المستقبِلات. البيئة تتحول من الغبار إلى زجاج نظيف وقنوات طاقة.',
  'clear.bodyLast': 'اكتملت الخلايا الثلاث. المحطة تعود إلى كفاءتها الكاملة.',
  'clear.next': 'المستوى التالي',
  'clear.impact': 'عرض الأثر',
  'clear.retry': 'إعادة المحاولة',
  'clear.menu': 'القائمة',
  'clear.newRecord': 'رقم قياسي جديد',
  'clear.par': 'نجمة للوقت تحت {s} ث · نجمة لـ {r} تدويرات أو أقل',

  'finale.title': 'المحطة الشمسية تعمل بكامل طاقتها',
  'finale.effLabel': 'كفاءة المحطة',
  'finale.effNote': 'بعد إزالة الغبار والملح والسخام',
  'finale.lossLabel': 'خسائر الاتساخ المستعادة',
  'finale.lossNote': 'نطاق نموذجي للتربة الصحراوية',
  'finale.cellsLabel': 'الخلايا المستعادة',
  'finale.cellsNote': 'الربع الخالي · الساحل · المدينة',
  'finale.energyLabel': 'الطاقة النظيفة',
  'finale.energyValue': 'مستمرة',
  'finale.energyNote': 'تغذي مدينة المستقبل',
  'finale.stars': 'مجموع نجومك {n} / {max}',
  'finale.disclaimer': 'الأرقام توضيحية لغرض التجربة التفاعلية وليست قياسات فعلية.',
  'finale.menu': 'القائمة الرئيسية',

  'pause.title': 'إيقاف مؤقت',
  'pause.resume': 'متابعة',
  'pause.retry': 'إعادة الخلية',
  'pause.quit': 'الخروج للقائمة',

  'loading.text': 'تجهيز المشهد',
}

export type StringKey = keyof typeof ar

const en: Record<StringKey, string> = {
  'app.title': 'Photon Decay Labyrinth',
  'app.kicker': 'متاهة الذاكرة الضوئية',
  'app.tagline':
    'Dust, salt and soot are starving the silicon cells of light. Dive inside the cell, steer photons through prisms and switch wavelengths to clear the path until the solar plant runs at full efficiency.',
  'intro.lab': 'PV CELL · SOILING LAB',
  'intro.hintRotate': 'Click or tap a prism to rotate it',
  'intro.hintSwitch': 'Switch wavelength from the top bar or keys 1 · 2 · 3',

  'menu.start': 'Start mission',
  'menu.continue': 'Continue · Cell {n}',
  'menu.levels': 'Levels',
  'menu.records': 'Records',
  'menu.settings': 'Settings',
  'menu.createProfile': 'Create player profile',

  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.on': 'On',
  'common.off': 'Off',
  'common.seconds': 's',

  'quality.high': 'Cinematic',
  'quality.low': 'Performance',

  'profile.title': 'Player profiles',
  'profile.createTitle': 'New player profile',
  'profile.renameTitle': 'Rename profile',
  'profile.nameLabel': 'Player name',
  'profile.namePlaceholder': 'Enter your name',
  'profile.nameHint': '2 to 16 characters',
  'profile.nameShort': 'Name is too short, use at least 2 characters',
  'profile.nameTaken': 'Another profile on this device already uses that name',
  'profile.avatar': 'Emblem',
  'profile.create': 'Create profile',
  'profile.active': 'Active',
  'profile.use': 'Select',
  'profile.rename': 'Rename',
  'profile.delete': 'Delete',
  'profile.confirmDelete': 'Permanently delete “{name}” and all its progress?',
  'profile.confirmYes': 'Yes, delete',
  'profile.addNew': 'New profile',
  'profile.localNote': 'Profiles and progress are saved in this browser on this device only.',
  'profile.summary': '{clears} cells cleared · {stars} stars',

  'levels.title': 'Choose a cell',
  'levels.locked': 'Locked · clear the previous cell',
  'levels.best': 'Best time {time}',
  'levels.notPlayed': 'Not played yet',
  'levels.play': 'Play',

  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.quality': 'Graphics quality',
  'settings.qualityHint': 'Cinematic adds reflections, depth of field and sun rays. Performance suits phones.',
  'settings.volume': 'Volume',
  'settings.mute': 'Mute',
  'settings.motion': 'Reduce motion',
  'settings.motionHint': 'Turns off camera shake and automatic push-ins.',

  'records.title': 'Records',
  'records.note': 'Best results from every profile on this device.',
  'records.empty': 'No results yet. Clear a cell to appear here.',
  'records.player': 'Player',
  'records.time': 'Time',
  'records.moves': 'Rotations',
  'records.stars': 'Stars',

  'hud.wavelength': 'Wavelength',
  'hud.efficiency': 'Restored cell efficiency',
  'hud.pause': 'Pause',
  'hud.mute': 'Mute',
  'hud.unmute': 'Unmute',
  'hud.key': 'Key',

  'wl.ir.name': 'Infrared',
  'wl.ir.hint': 'vaporizes soft dust clouds',
  'wl.vis.name': 'Visible',
  'wl.vis.hint': 'fast travel, and the only band that charges receivers',
  'wl.uv.name': 'Ultraviolet',
  'wl.uv.hint': 'shatters salt crystals',

  'level.1.name': 'The Desert Crust',
  'level.1.place': 'Rub al Khali',
  'level.1.intro':
    'Desert dust is smothering the silicon cell. Use infrared to vaporize the clouds, then steer visible light into the receiver.',
  'level.2.name': 'The Saline Barrier',
  'level.2.place': 'The Coast',
  'level.2.intro':
    'Sea spray has left a crystalline salt crust. Ultraviolet shatters the crystals, and energy rings change the wavelength mid-flight.',
  'level.3.name': 'The Urban Smog',
  'level.3.place': 'The Industrial City',
  'level.3.intro':
    'Carbon soot drifts between the corridors. Magnetic vortices bend the beam and gates pass only one wavelength. Watch the timing.',

  'lumen.role': 'Holographic assistant',
  'lumen.ready': 'Lumen online. Waiting for the first photon.',
  'lumen.levelIntro': '{name} · {place}. {intro}',
  'lumen.switch': 'Switched to {wl} ({nm}): {hint}.',
  'lumen.burn': 'Dust cloud vaporized. Infrared carries thermal energy that breaks up fine particles without contact.',
  'lumen.shatter': 'Salt crystal shattered. Ultraviolet photons carry more energy than the ionic bonds in salt.',
  'lumen.receiverLocked': 'Receiver locked on visible light. Steer the beam to the next receiver.',
  'lumen.cellDone': 'Cell fully restored. Current is flowing at full efficiency.',
  'lumen.finale': 'The solar plant is at 100% efficiency. Clean energy is lighting the city.',
  'lumen.autoQuality': 'The frame rate dropped, so I switched to Performance quality. You can switch back in Settings.',

  'clear.rotations': 'Rotations',
  'clear.burned': 'Vaporized',
  'clear.shattered': 'Shattered',
  'clear.time': 'Time',
  'clear.body': 'The beam reached every receiver. The cell shifts from dust to clean glass and live energy conduits.',
  'clear.bodyLast': 'All three cells are restored. The plant is back at full efficiency.',
  'clear.next': 'Next cell',
  'clear.impact': 'View impact',
  'clear.retry': 'Retry',
  'clear.menu': 'Menu',
  'clear.newRecord': 'New record',
  'clear.par': 'Star for under {s}s · star for {r} rotations or fewer',

  'finale.title': 'The solar plant is running at full power',
  'finale.effLabel': 'Plant efficiency',
  'finale.effNote': 'After clearing dust, salt and soot',
  'finale.lossLabel': 'Soiling losses recovered',
  'finale.lossNote': 'Typical range for desert soiling',
  'finale.cellsLabel': 'Cells restored',
  'finale.cellsNote': 'Rub al Khali · Coast · City',
  'finale.energyLabel': 'Clean energy',
  'finale.energyValue': 'Online',
  'finale.energyNote': 'Powering the city of the future',
  'finale.stars': 'Your total stars {n} / {max}',
  'finale.disclaimer': 'Figures are illustrative for this interactive experience, not real measurements.',
  'finale.menu': 'Main menu',

  'pause.title': 'Paused',
  'pause.resume': 'Resume',
  'pause.retry': 'Restart cell',
  'pause.quit': 'Quit to menu',

  'loading.text': 'Preparing the scene',
}

export const STRINGS: Record<Lang, Record<StringKey, string>> = { ar, en }

export type Params = Record<string, string | number>

export function translate(lang: Lang, key: StringKey, params?: Params) {
  const raw = STRINGS[lang][key] ?? STRINGS.ar[key] ?? key
  if (!params) return raw
  return raw.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m))
}

export function levelText(lang: Lang, id: number) {
  const k = (s: 'name' | 'place' | 'intro') => `level.${id}.${s}` as StringKey
  const other: Lang = lang === 'ar' ? 'en' : 'ar'
  return {
    name: translate(lang, k('name')),
    place: translate(lang, k('place')),
    intro: translate(lang, k('intro')),
    altName: translate(other, k('name')),
  }
}

export function formatTime(seconds: number) {
  const s = Math.max(0, Math.round(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
