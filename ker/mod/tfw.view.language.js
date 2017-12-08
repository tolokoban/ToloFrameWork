"use strict";

var $ = require("dom");
var PM = require("tfw.binding.property-manager");
var Tfw = require("$");
var Modal = require("wdg.modal");
var Button = require("tfw.view.button");


var CODE_BEHIND = {
  onTap: onTap,
  onLanguageChanged: onLanguageChanged
};


function onTap() {
  var content = $.div();
  var btnClose = new Button({ content: Button._("close"), flat: true });
  var modal = new Modal({
    header: _("title"),
    content: content,
    footer: btnClose
  });
  var detach =  modal.detach.bind( modal );
  PM( btnClose ).on( "action", detach );

  fillContentWithAllLanguages.call( this, content, detach );
  modal.attach();
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
 * @param {DIV} content - Where to add the language buttons.
 * @param {function} detach - Function to call to close the dialog.
 */
function fillContentWithAllLanguages( content, detach ) {
  var value = this.value;
  
  $.clear( content );
  var currentlyUsedLanguageCodes = Object.keys( value )
      .filter(function( code ) { return !isEmpty( value[code] ); });
  fillContentWithUsedLanguages.call( this, content, detach, currentlyUsedLanguageCodes );
  
  var currentlyUnusedLanguages = LANGUAGES.filter(function( language ) {
    var code = language[0];
    return currentlyUsedLanguageCodes.indexOf( code ) === -1;
  });
  fillContentWithUnusedLanguages.call( this, content, detach, currentlyUnusedLanguages );
}

function fillContentWithUsedLanguages( content, detach, currentlyUsedLanguageCodes ) {
  var that = this;

  currentlyUsedLanguageCodes.forEach(function (code) {
    var languageName = findLanguageNameFromCode( code );
    var button = new Button({
      content: languageName,
      icon: "flag-" + code,
      flat: true,
      type: "primary"
    });
    if( button.icon === '' ) button.icon = "tri-right";
    $.add( content, button );
    PM( button ).on( "action", function() {
      that.language = code;
      detach();
    });
  });
}

function fillContentWithUnusedLanguages( content, detach, currentlyUnusedLanguages ) {
  var that = this;

  currentlyUnusedLanguages.forEach(function (language) {
    var code = language[0];
    var languageName = language[1];
    var button = new Button({
      content: languageName,
      icon: "flag-" + code,
      flat: true,
      type: "default"
    });
    if( button.icon === '' ) button.icon = "tri-right";
    $.add( content, button );
    PM( button ).on( "action", function() {
      that.language = code;
      detach();
    });
  });
}


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


function isEmpty( text ) {
  if( typeof text !== 'string' ) return true;
  return text.trim().length === 0;
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
