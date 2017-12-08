"use strict";

var Tfw = require("$");

var CODE_BEHIND = {
  onTap: onTap,
  onLanguageChanged: onLanguageChanged
};


function onTap() {

};

function onLanguageChanged( code ) {
  if( code === '' ) {
    this.language = Tfw.lang();
    return;
  }
  var name = findLanguageNameFromCode( code ) || "";
  this.languageName = name;
};


/**
 * Dichotomic search.
 */
function findLanguageNameFromCode( languageCode ) {
  var a = 0;
  var b = LANGUAGES.length;
  var m = b;
  var item, code, name;

  languageCode = languageCode.toLowerCase();

  while( m > a ) {
    m = Math.floor( (a + b) / 2 );
    item = LANGUAGES[m];
    code = item[0];
    name = item[1];
    if( code == languageCode ) return name;
    if( code < languageCode ) b = m;
    else a = m;
  }
  return null;
}


var LANGUAGES = [
  ["aa", "Afaraf"],
  ["ab", "аҧсуа бызшәа, аҧсшәа"],
  ["ae", "avesta"],
  ["af", "Afrikaans"],
  ["ak", "Akan"],
  ["am", "አማርኛ"],
  ["an", "aragonés"],
  ["ar", "العربية"],
  ["as", "অসমীয়া"],
  ["av", "авар мацӀ, магӀарул мацӀ"],
  ["ay", "aymar aru"],
  ["az", "azərbaycan dili"],
  ["ba", "башҡорт теле"],
  ["be", "беларуская мова"],
  ["bg", "български език"],
  ["bh", "भोजपुरी"],
  ["bi", "Bislama"],
  ["bm", "bamanankan"],
  ["bn", "বাংলা"],
  ["bo", "བོད་ཡིག"],
  ["br", "brezhoneg"],
  ["bs", "bosanski jezik"],
  ["ca", "català"],
  ["ce", "нохчийн мотт"],
  ["ch", "Chamoru"],
  ["co", "corsu, lingua corsa"],
  ["cr", "ᓀᐦᐃᔭᐍᐏᐣ"],
  ["cs", "čeština, český jazyk"],
  ["cu", "ѩзыкъ словѣньскъ"],
  ["cv", "чӑваш чӗлхи"],
  ["cy", "Cymraeg"],
  ["da", "dansk"],
  ["de", "Deutsch"],
  ["dv", "ދިވެހި"],
  ["dz", "རྫོང་ཁ"],
  ["ee", "Eʋegbe"],
  ["el", "ελληνικά"],
  ["en", "English"],
  ["eo", "Esperanto"],
  ["es", "español"],
  ["et", "eesti, eesti keel"],
  ["eu", "euskara, euskera"],
  ["fa", "فارسی"],
  ["ff", "Fulfulde, Pulaar, Pular"],
  ["fi", "suomi, suomen kieli"],
  ["fj", "vosa Vakaviti"],
  ["fo", "føroyskt"],
  ["fr", "français, langue française"],
  ["fy", "Frysk"],
  ["ga", "Gaeilge"],
  ["gd", "Gàidhlig"],
  ["gl", "galego"],
  ["gn", "Avañe'ẽ"],
  ["gu", "ગુજરાતી"],
  ["gv", "Gaelg, Gailck"],
  ["ha", "(Hausa) هَوُسَ"],
  ["he", "עברית"],
  ["hi", "हिन्दी, हिंदी"],
  ["ho", "Hiri Motu"],
  ["hr", "hrvatski jezik"],
  ["ht", "Kreyòl ayisyen"],
  ["hu", "magyar"],
  ["hy", "Հայերեն"],
  ["hz", "Otjiherero"],
  ["ia", "Interlingua"],
  ["id", "Bahasa Indonesia"],
  ["ie", "Interlingue"],
  ["ig", "Asụsụ Igbo"],
  ["ii", "ꆈꌠ꒿ Nuosuhxop"],
  ["ik", "Iñupiaq, Iñupiatun"],
  ["io", "Ido"],
  ["is", "Íslenska"],
  ["it", "italiano"],
  ["iu", "ᐃᓄᒃᑎᑐᑦ"],
  ["ja", "日本語"],
  ["jv", "Basa Jawa"],
  ["ka", "ქართული"],
  ["kg", "Kikongo"],
  ["ki", "Gĩkũyũ"],
  ["kj", "Kuanyama"],
  ["kk", "қазақ тілі"],
  ["kl", "kalaallisut, kalaallit oqaasii"],
  ["km", "ខ្មែរ, ខេមរភាសា, ភាសាខ្មែរ"],
  ["kn", "ಕನ್ನಡ"],
  ["ko", "한국어"],
  ["kr", "Kanuri"],
  ["ks", "कश्मीरी"],
  ["ku", "Kurdî"],
  ["kv", "коми кыв"],
  ["kw", "Kernewek"],
  ["ky", "Кыргызча, Кыргыз тили"],
  ["la", "latine, lingua latina"],
  ["lb", "Lëtzebuergesch"],
  ["lg", "Luganda"],
  ["li", "Limburgs"],
  ["ln", "Lingála"],
  ["lo", "ພາສາລາວ"],
  ["lt", "lietuvių kalba"],
  ["lu", "Tshiluba"],
  ["lv", "latviešu valoda"],
  ["mg", "fiteny malagasy"],
  ["mh", "Kajin M̧ajeļ"],
  ["mi", "te reo Māori"],
  ["mk", "македонски јазик"],
  ["ml", "മലയാളം"],
  ["mn", "Монгол хэл"],
  ["mr", "मराठी"],
  ["ms", "bahasa Melayu"],
  ["mt", "Malti"],
  ["my", "ဗမာစာ"],
  ["na", "Dorerin Naoero"],
  ["nb", "Norsk bokmål"],
  ["nd", "isiNdebele"],
  ["ne", "नेपाली"],
  ["ng", "Owambo"],
  ["nl", "Nederlands, Vlaams"],
  ["nn", "Norsk nynorsk"],
  ["no", "Norsk"],
  ["nr", "isiNdebele"],
  ["nv", "Diné bizaad"],
  ["ny", "chiCheŵa, chinyanja"],
  ["oc", "occitan, lenga d'òc"],
  ["oj", "ᐊᓂᔑᓈᐯᒧᐎᓐ"],
  ["om", "Afaan Oromoo"],
  ["or", "ଓଡ଼ିଆ"],
  ["os", "ирон æвзаг"],
  ["pa", "ਪੰਜਾਬੀ"],
  ["pi", "पाऴि"],
  ["pl", "język polski, polszczyzna"],
  ["ps", "پښتو"],
  ["pt", "Português"],
  ["qu", "Runa Simi, Kichwa"],
  ["rm", "rumantsch grischun"],
  ["rn", "Ikirundi"],
  ["ro", "Română"],
  ["ru", "Русский"],
  ["rw", "Ikinyarwanda"],
  ["sa", "संस्कृतम्"],
  ["sc", "sardu"],
  ["sd", "सिन्धी"],
  ["se", "Davvisámegiella"],
  ["sg", "yângâ tî sängö"],
  ["si", "සිංහල"],
  ["sk", "slovenčina, slovenský jazyk"],
  ["sl", "slovenski jezik, slovenščina"],
  ["sm", "gagana fa'a Samoa"],
  ["sn", "chiShona"],
  ["so", "Soomaaliga, af Soomaali"],
  ["sq", "Shqip"],
  ["sr", "српски језик"],
  ["ss", "SiSwati"],
  ["st", "Sesotho"],
  ["su", "Basa Sunda"],
  ["sv", "svenska"],
  ["sw", "Kiswahili"],
  ["ta", "தமிழ்"],
  ["te", "తెలుగు"],
  ["tg", "тоҷикӣ"],
  ["th", "ไทย"],
  ["ti", "ትግርኛ"],
  ["tk", "Türkmen, Түркмен"],
  ["tl", "Wikang Tagalog"],
  ["tn", "Setswana"],
  ["to", "faka Tonga"],
  ["tr", "Türkçe"],
  ["ts", "Xitsonga"],
  ["tt", "татар теле"],
  ["tw", "Twi"],
  ["ty", "Reo Tahiti"],
  ["ug", "ئۇيغۇرچە"],
  ["uk", "Українська"],
  ["ur", "اردو"],
  ["uz", "Oʻzbek"],
  ["ve", "Tshivenḓa"],
  ["vi", "Tiếng Việt"],
  ["vo", "Volapük"],
  ["wa", "walon"],
  ["wo", "Wollof"],
  ["xh", "isiXhosa"],
  ["yi", "ייִדיש"],
  ["yo", "Yorùbá"],
  ["za", "Saɯ cueŋƅ, Saw cuengh"],
  ["zh", "中文"],
  ["zu", "isiZulu"]
];
