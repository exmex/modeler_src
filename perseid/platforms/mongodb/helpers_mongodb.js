import Helpers from "../../helpers/helpers";
import React from "react";
import _ from "lodash";
import json5 from "json5";
import { v4 as uuidv4 } from "uuid";

const MongoDbHelpers = {
  getMongoDBDefaultEmbeddableType() {
    return "string";
  },

  getMongoDBDefaultType() {
    return "string";
  },

  getMongoDBKeyType() {
    return "objectId";
  },

  getMongoDBDataTypes() {
    var d = [
      "double",
      "string",
      "object",
      "array",
      "binData",
      "undefined",
      "objectId",
      "bool",
      "date",
      "enum",
      "null",
      "regex",
      "dbPointer",
      "javascript",
      "symbol",
      "javascriptWithScope",
      "int",
      "timestamp",
      "long",
      "decimal",
      "minKey",
      "maxKey",
      "any"
    ];
    return d;
  },

  getIndexInitState() {
    return {
      newFieldName: "",
      newFieldType: "1",
      useIndexName: true,
      fields: [],
      options: {
        sparse: false,
        unique: false,
        hidden: false,
        expireAfterSeconds: null,
        partialFilterExpression: null,
        storageEngine: null,
        weights: null,
        default_language: "na",
        language_override: null,
        textIndexVersion: "na",
        "2dsphereIndexVersion": "na",
        bits: null,
        min: null,
        max: null,
        wildcardProjection: null
      },
      collation: {
        locale: "na",
        caseLevel: "na",
        caseFirst: "na",
        strength: "na",
        numericOrdering: "na",
        alternate: "na",
        maxVariable: "na",
        backwards: "na",
        normalization: "na"
      }
    };
  },

  getIndexParsedState(fields, options) {
    var parsedFields;
    var parsedOptions;
    var newFields = [];
    var newOptions = {};
    var newCollation = {};
    var useIndexName = false;
    const initState = this.getIndexInitState();

    parsedFields = json5.parse(fields);

    _.map(parsedFields, (value, key, item) => {
      newFields = [
        ...newFields,
        {
          id: uuidv4(),
          name: key,
          type: value
        }
      ];
    });

    if (options !== undefined && options !== null && options !== "") {
      parsedOptions = json5.parse(options);
      var parsedOptionsWithoutCollation = Object.keys(parsedOptions).reduce(
        (accumulator, key) => {
          if (key !== "collation" && key !== "name") {
            accumulator[key] = parsedOptions[key];
          }
          return accumulator;
        },
        {}
      );

      var parsedCollation = parsedOptions.collation;

      newOptions = { ...initState.options, ...parsedOptionsWithoutCollation };
      newCollation = { ...initState.collation, ...parsedCollation };

      if (parsedOptions.name !== undefined && parsedOptions.name !== "") {
        useIndexName = true;
      }
    } else {
      newOptions = initState.options;
      newCollation = initState.collation;
    }

    const toReturn = {
      ...initState,
      fields: newFields,
      options: newOptions,
      collation: newCollation,
      useIndexName: useIndexName
    };
    return toReturn;
  },

  convertToId(currentId, customDataTypes) {
    var datatypes = this.getMongoDBDataTypes();
    var toReturn;

    if (datatypes.includes(currentId)) {
      toReturn = currentId;
    } else if (customDataTypes.includes(currentId)) {
      toReturn = currentId;
    } else {
      toReturn = "objectId";
    }
    return toReturn;
  },

  makeDatatypesMongoDb() {
    var datatypes = this.getMongoDBDataTypes();
    datatypes = datatypes.sort();

    return _.map(datatypes, (obj) => {
      return (
        <option key={obj} value={obj}>
          {obj}
        </option>
      );
    });
  },

  getIndexTypes() {
    const indexTypesForField = [
      ["ascending (1)", "1"],
      ["descending (-1)", "-1"],
      ["hashed", "hashed"],
      ["text", "text"],
      ["2dsphere", "2dspehere"],
      ["2d", "2d"]
    ];
    return _.map(indexTypesForField, (obj) => {
      return (
        <option key={obj[1]} value={obj[1]}>
          {_.upperFirst(obj[0])}
        </option>
      );
    });
  },

  getDefaultLanguages() {
    let languages = [
      ["danish", "da"],
      ["dutch", "nl"],
      ["english", "en"],
      ["finnish", "fi"],
      ["french", "fr"],
      ["german", "de"],
      ["hungarian", "hu"],
      ["italian", "it"],
      ["norwegian", "nb"],
      ["portuguese", "pt"],
      ["romanian", "ro"],
      ["russian", "ru"],
      ["spanish", "es"],
      ["swedish", "sv"],
      ["turkish", "tr"]
    ];
    return _.map(languages, (obj) => {
      return (
        <option key={obj[1]} value={obj[0]}>
          {_.upperFirst(obj[0])}
        </option>
      );
    });
  },

  getCollations() {
    var collations = [
      ["Afrikaans", "af"],
      ["Albanian", "sq"],
      ["Amharic", "am"],
      ["Arabic", "ar"],
      ["Arabic", "ar@collation=compat"],
      ["Armenian", "hy"],
      ["Assamese", "as"],
      ["Azeri", "az"],
      ["Azeri", "az@collation=search"],
      ["Belarusian", "be"],
      ["Bengali", "bn"],
      ["Bengali", "bn@collation=traditional"],
      ["Bosnian", "bs"],
      ["Bosnian", "bs@collation=search"],
      ["Bosnian (Cyrillic)", "bs_Cyrl"],
      ["Bulgarian", "bg"],
      ["Burmese", "my"],
      ["Catalan", "ca"],
      ["Catalan", "ca@collation=search"],
      ["Cherokee", "chr"],
      ["Chinese", "zh"],
      ["Chinese", "zh@collation=big5han"],
      ["Chinese", "zh@collation=gb2312han"],
      ["Chinese", "zh@collation=unihan"],
      ["Chinese", "zh@collation=zhuyin"],
      ["Chinese (Traditional)", "zh_Hant"],
      ["Croatian", "hr"],
      ["Croatian", "hr@collation=search"],
      ["Czech", "cs"],
      ["Czech", "cs@collation=search"],
      ["Danish", "da"],
      ["Danish", "da@collation=search"],
      ["Dutch", "nl"],
      ["Dzongkha", "dz"],
      ["English", "en"],
      ["English (United States)", "en_US"],
      ["English (United States, Computer)", "en_US_POSIX"],
      ["Esperanto", "eo"],
      ["Estonian", "et"],
      ["Ewe", "ee"],
      ["Faroese", "fo"],
      ["Filipino", "fil"],
      ["Finnish", "fi"],
      ["Finnish", "fi@collation=search"],
      ["Finnish", "fi@collation=traditional"],
      ["French", "fr"],
      ["French (Canada)", "fr_CA"],
      ["Galician", "gl"],
      ["Galician", "gl@collation=search"],
      ["Georgian", "ka"],
      ["German", "de"],
      ["German", "de@collation=search"],
      ["German", "de@collation=eor"],
      ["German", "de@collation=phonebook"],
      ["German (Austria)", "de_AT"],
      ["German (Austria)", "de_AT@collation=phonebook"],
      ["Greek", "el"],
      ["Gujarati", "gu"],
      ["Hausa", "ha"],
      ["Hawaiian", "haw"],
      ["Hebrew", "he"],
      ["Hebrew", "he@collation=search"],
      ["Hindi", "hi"],
      ["Hungarian", "hu"],
      ["Icelandic", "is"],
      ["Icelandic", "is@collation=search"],
      ["Igbo", "ig"],
      ["Inari Sami", "smn"],
      ["Inari Sami", "smn@collation=search"],
      ["Indonesian", "id"],
      ["Irish", "ga"],
      ["Italian", "it"],
      ["Japanese", "ja"],
      ["Japanese", "ja@collation=unihan"],
      ["Kalaallisut", "kl"],
      ["Kalaallisut", "kl@collation=search"],
      ["Kannada", "kn"],
      ["Kannada", "kn@collation=traditional"],
      ["Kazakh", "kk"],
      ["Khmer", "km"],
      ["Konkani", "kok"],
      ["Korean", "ko"],
      ["Korean", "ko@collation=search"],
      ["Korean", "ko@collation=searchjl"],
      ["Korean", "ko@collation=unihan"],
      ["Kyrgyz", "ky"],
      ["Lakota", "lkt"],
      ["Lao", "lo"],
      ["Latvian", "lv"],
      ["Lingala", "ln"],
      ["Lingala", "ln@collation=search"],
      ["Lithuanian", "lt"],
      ["Lower Sorbian", "dsb"],
      ["Luxembourgish", "lb"],
      ["Macedonian", "mk"],
      ["Malay", "ms"],
      ["Malayalam", "ml"],
      ["Maltese", "mt"],
      ["Marathi", "mr"],
      ["Mongolian", "mn"],
      ["Nepali", "ne"],
      ["Northern Sami", "se"],
      ["Northern Sami", "se@collation=search"],
      ["Norwegian Bokm?l", "nb"],
      ["Norwegian Bokm?l", "nb@collation=search"],
      ["Norwegian Nynorsk", "nn"],
      ["Norwegian Nynorsk", "nn@collation=search"],
      ["Oriya", "or"],
      ["Oromo", "om"],
      ["Pashto", "ps"],
      ["Persian", "fa"],
      ["Persian (Afghanistan)", "fa_AF"],
      ["Polish", "pl"],
      ["Portuguese", "pt"],
      ["Punjabi", "pa"],
      ["Romanian", "ro"],
      ["Russian", "ru"],
      ["Serbian", "sr"],
      ["Serbian (Latin)", "sr_Latn"],
      ["Serbian (Latin)", "sr_Latn@collation=search"],
      ["Sinhala", "si"],
      ["Sinhala", "si@collation=dictionary"],
      ["Slovak", "sk"],
      ["Slovak", "sk@collation=search"],
      ["Slovenian", "sl"],
      ["Spanish", "es"],
      ["Spanish", "es@collation=search"],
      ["Spanish", "es@collation=traditional"],
      ["Swahili", "sw"],
      ["Swedish", "sv"],
      ["Swedish", "sv@collation=search"],
      ["Tamil", "ta"],
      ["Telugu", "te"],
      ["Thai", "th"],
      ["Tibetan", "bo"],
      ["Tongan", "to"],
      ["Turkish", "tr"],
      ["Turkish", "tr@collation=search"],
      ["Ukrainian", "uk"],
      ["Upper Sorbian", "hsb"],
      ["Urdu", "ur"],
      ["Uyghur", "ug"],
      ["Vietnamese", "vi"],
      ["Vietnamese", "vi@collation=traditional"],
      ["Walser", "wae"],
      ["Welsh", "cy"],
      ["Yiddish", "yi"],
      ["Yiddish", "yi@collation=search"],
      ["Yoruba", "yo"],
      ["Zulu", "zu"]
    ].sort();
    return _.map(collations, (obj) => {
      return (
        <option key={obj[1]} value={obj[1]}>
          {`${obj[0]} - ${obj[1]}`}
        </option>
      );
    });
  },

  makeDatatypesMongoDbDetailed() {
    var datatypes = [
      ["Double", "double"],
      ["String", "string"],
      ["Object", "object"],
      ["Array", "array"],
      ["Binary data", "binData"],
      ["Undefined", "undefined"],
      ["ObjectId", "objectId"],
      ["Boolean", "bool"],
      ["Date", "date"],
      ["Enum", "enum"],
      ["Null", "null"],
      ["Regular expression", "regex"],
      ["DBPointer", "dbPointer"],
      ["JavaScript", "javascript"],
      ["Symbol", "symbol"],
      ["JavaScript with scope", "javascriptWithScope"],
      ["32-bit integer", "int"],
      ["Timestamp", "timestamp"],
      ["64-bit integer", "long"],
      ["Decimal 128", "decimal"],
      ["Min key", "minKey"],
      ["Max key", "maxKey"],
      ["Any", "any"]
    ].sort();

    return _.map(datatypes, (obj) => {
      return (
        <option key={obj[0]} value={obj[1]}>
          {obj[0]}
        </option>
      );
    });
  }
};
export default MongoDbHelpers;
