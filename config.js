const date = new Date();
const availableLanguages = [
    "en",
    "vi"
];

const languageMappings = {
    "en": "English",
    "ar_SA": "العربية (السعودية)",
    "be": "беларускі",
    "bs": "Bosnian",
    "zh_CN": "中文 (中国)",
    "zh_TW": "中文 (台灣)",
    "cs": "čeština",
    "da": "Dansk",
    "nl": "Nederlands",
    "et": "Eesti",
    "fi": "suomi",
    "fr": "français",
    "gl": "Gallegan",
    "ka": "Georgian",
    "de": "Deutsch",
    "el": "Ελληνικά",
    "hu": "magyar",
    "in": "Bahasa Indonesia",
    "it": "italiano",
    "ja": "日本語",
    "ko": "한국어",
    "ku": "Kurdish",
    "ku_TR": "Kurdish (Turkey)",
    "mk": "македонски",
    "mr": "Marathi",
    "nb": "Norwegian Bokmål",
    "nn": "Norwegian Nynorsk",
    "fa": "Persian",
    "pt": "português",
    "pt_BR": "português (Brasil)",
    "ro": "română",
    "sr": "Српски",
    "si": "Sinhalese",
    "sk": "Slovenčina",
    "es": "español",
    "es_PE": "español (Perú)",
    "th": "ไทย",
    "tr": "Türkçe",
    "uk": "українська",
    "vi": "Tiếng Việt"
};

module.exports = {
    "verbose": true,
    "workers": 10,
    "imageResolution": 600,
    "languageMappings": languageMappings,
    "languagesToGet": availableLanguages,
    "buildCombinations": availableLanguages.map(lang => {
        return {
            output: `phet_${lang.toLowerCase().replace("_", "-")}_${date.getUTCFullYear()}-${('0' + ( date.getMonth() + 1 ) ).slice( -2 )}`,
            languages: [lang]
        }
    }).concat({
        "output": `phet_mul_${date.getUTCFullYear()}-${('0' + ( date.getMonth() + 1 ) ).slice( -2 )}`,
        "languages": availableLanguages
    })
}