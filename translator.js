/**
 *
 * EXHIBIT A. Common Public Attribution License Version 1.0
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the “License”);
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * The License is based on the Mozilla Public License Version 1.1
 * but Sections 14 and 15 have been added to cover use of software over a computer network and provide for
 * limited attribution for the Original Developer. In addition, Exhibit A has been modified to be consistent
 * with Exhibit B. Software distributed under the License is distributed on an “AS IS” basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the specific language
 * governing rights and limitations under the License. The Original Code is LMK Corporation.
 * All portions of the code written by LMK Corporation are Copyright (c) 2017. All Rights Reserved.
 * EXHIBIT B. Attribution Information
 * Attribution Copyright Notice: Copyright 2017 LMK Corporation. All rights reserved.
 * Graphic Image as provided in the Covered Code.
 * Display of Attribution Information is required in Larger Works which are defined in the CPAL as a work
 * which combines Covered Code or portions thereof with code not governed by the terms of the CPAL.
 *
 */

$.fn.languagePicker = function(options){
	// Load the Bing Translator script to the page, then build the tranlsator menu in the specified DOM element
	var selectedControl = this;
	var script = document.createElement("script");
	if(script.readyState) {  //IE
		script.onreadystatechange = function() {
	 		if ( script.readyState === "loaded" || script.readyState === "complete" ) {
		 		script.onreadystatechange = null;
		 		LanguagePicker.loadPicker(selectedControl,options);
			}
		};
	} 
	else {  //Others
		script.onload = function() {
			LanguagePicker.loadPicker(selectedControl,options);
		};
	}

	script.src = "https://ssl.microsofttranslator.com/ajax/v3/WidgetV3.ashx?siteData=ueOIGRSKkd965FeEGM5JtQ**";
	var s0 = document.getElementsByTagName('script')[0];
	s0.parentNode.insertBefore(script, s0);

	
};
var LanguagePicker = {
	defaultLang: 'es', // Language the page/site is in when the page loads
	currentLang: 'es', // current Language the page is translated to
	preferredLangKey: 'BING_TRANSLATE_PREFERRED_LANG', // Key used to get preferred language from local storage (only used when translate set to auto)
	localizedLanguageNames:{}, // Dictionary of Language localized names with the language code being the key
	sortableLanguages:[], // Used to get an alphabetically sorted list of languages into the dropdown
	loadingImageUrl:"img/loader.gif", //URL of the images  used to signify translating of content
	autoTranslateDelay:0, //Delay introduced before auto translate occurs.  Gives browser time to load any async content before translating the page (Only used when translate option set to auto)

	buildLanguageList: function(languages){ // Create the dropdown list that displays language options for translation
		languages = languages.sort(this.languageSort);
		var column;
		for(var i=0;i<languages.length;i++){
			if(i % 17 == 0)
				column = $('<div/>').addClass('column');
				
			column.append($('<li/>').attr('data-lang-code',languages[i].Code).text(languages[i].Name+' ('+this.localizedLanguageNames[languages[i].Code]+')').click(function(e){
					LanguagePicker.translate($(e.target).data('lang-code'));
			}));
			if(i % 17 == 16 || i+1==languages.length)
				$('.language-picker-list').append(column);
		}
		LanguagePicker.footer.appendTo('.language-picker-list');
	},
	buildPrefLangPicker: function(prefLang,list){ // Creates the preferred language selector for when the translate auto is turned on
		var langs = this.sortableLanguages.sort(this.languageSort);
		for(var i in langs){
			$('<li/>').attr('onclick','LanguagePicker.changePreferredLangugage(this);').attr('data-lang',langs[i].Code).text(langs[i].Name).appendTo(list);
		}
	},
	changeLangSelected: function(e){ // Translate language item selected
		translate($(e.target).data('lang-code'));
		e.preventDefault();
		return false;
	},
	changePreferredLangugage:function(e){
		var code =$(e).data('lang');
		$('.pref-lang-picker > span').text(this.localizedLanguageNames[code]);
		this.setPreferredLanguage(code);
		this.translate(code);
	},
	getCurrentLanguageLanguageList: function(){ //Get language list with the names localised into the currently displayed language
		Microsoft.Translator.Widget.GetLanguagesForTranslate(this.currentLang ? this.currentLang : this.defaultLang ,function(languages){
			LanguagePicker.buildLanguageList(languages);
		});
	},
	getLoadingImage: function(){
		return $('<div/>').addClass("loadingImage").append($('<div/>').text('Trduciendo...')).append($('<img/>').attr('src',this.loadingImageUrl));
	},
	getPreferredLanguage: function(){ // Get te epreferred language set or default the prefered language to the default language
		var prefLang = localStorage[this.preferredLangKey];
		if(!prefLang){
			prefLang = (navigator.language ? navigator.language : navigator.browserLanguage).substring(0,2);
			this.setPreferredLanguage(prefLang);
		}
		return prefLang;
	},
	isIE: function(version, comparison) { // Check for IE version
		var cc  		= 'IE',
			b 			= document.createElement('B'),
			docElem 	= document.documentElement,
			isIE;
		    
		if(version){
			cc += ' ' + version;
			if(comparison){ cc = comparison + ' ' + cc; }
		}
		
		b.innerHTML = '<!--[if '+ cc +']><b id="iecctest"></b><![endif]-->';
		docElem.appendChild(b);
		isIE = !!document.getElementById('iecctest');
		docElem.removeChild(b);
		return isIE;
	},
	languageSort: function(first,second){ // Sort languages
		if(first.Name==second.Name) return 0;
		if(first.Name>second.Name) return 1;
		return -1;
	},
	loadPicker:function(ctrl,options){ //Build the picker and insert it into the DOM element specified
		var $this = $(ctrl).addClass('language-picker has-sub');
		var ul = $('<ul/>').addClass('language-picker-list');
		
		//Build the list of languages in their  that can be used
		var localLangs = Microsoft.Translator.Widget.GetLanguagesForTranslateLocalized();
		for(var i = 0;i<localLangs.length;i++){
			LanguagePicker.localizedLanguageNames[localLangs[i].Code] = localLangs[i].Name;
			LanguagePicker.sortableLanguages.push({'Code':localLangs[i].Code,'Name':localLangs[i].Name});
		}
		
		LanguagePicker.footer = $('<div/>').addClass('language-picker-footer');
		//$('<div/>').append($('<a/>').attr('href','#').addClass('orig-lang').text('Idioma Base: '+ LanguagePicker.localizedLanguageNames[LanguagePicker.defaultLang]).attr('onclick','Microsoft.Translator.Widget.RestoreOriginal();')).appendTo(LanguagePicker.footer);
		$('<img/>').attr('src','img/microsoft.png').appendTo(LanguagePicker.footer);

		//Create elements and complete the inital translation if translate is set to auto
		if(options && options["mode"]=='auto'){
			var preferredLanguage = LanguagePicker.getPreferredLanguage();

			//Set delay from options if set
			if(options["delay"]){
				this.autoTranslateDelay = options["delay"];
			}
			
			/** var preferredLanguageElement = $('<div/>').addClass('preferred-language').addClass('no-edit').text('Idioma Preferido: ');
			var preferredLangPicker = $('<div/>').addClass('pref-lang-picker').append($('<span/>').text(LanguagePicker.localizedLanguageNames[preferredLanguage])).append($('<div/>').addClass('caret'));
			var preferredLangList = $('<ul/>').addClass('pref-lang-list').attr('translate','no');
			LanguagePicker.buildPrefLangPicker(preferredLanguage,preferredLangList);
		
			preferredLangList.appendTo(preferredLangPicker);
			preferredLangPicker.appendTo(preferredLanguageElement);
			preferredLanguageElement.appendTo(LanguagePicker.footer);**/
			
			//Set delay to give the browser time complete most ajax calls to load other content
			$(window).load(function(){
				setTimeout(function(){
					LanguagePicker.translate(preferredLanguage);
				},LanguagePicker.autoTranslateDelay);
			});
		}
		LanguagePicker.getCurrentLanguageLanguageList();

		if(this.isIE(8,'lte')){
			$this.css('margin-left','30px');
		}

		$this.text('Idioma: ');
		$this.append($('<span/>').addClass('language-name').attr('translate','no').text(LanguagePicker.localizedLanguageNames[LanguagePicker.currentLang]));
		ul.appendTo($this);
	},
	setPreferredLanguage: function(langCode){ // Set the preferred language for when the page translate is set to auto
		localStorage.setItem(this.preferredLangKey,langCode);
	},
	translate: function(to){ // Translate page content
		LanguagePicker.currentLang = to;
		$('.language-picker-list').append(LanguagePicker.getLoadingImage());
		Microsoft.Translator.Widget.Translate(this.defaultLang,to,this.translateProgress,this.translateError,this.translateComplete,this.translateRestoreOriginal,60000);
	},
	translateComplete: function(){ // Translate complete callback
		$('#languagePicker').mouseleave();
		$('.language-name').text(LanguagePicker.localizedLanguageNames[LanguagePicker.currentLang]);
		$('.language-picker-list').empty();
		LanguagePicker.getCurrentLanguageLanguageList();
		$('.loadingImage').remove('.language-picker-list');
	},
	translateError: function(error){ //Translate error callback
		console.log(error);
	},
	translateProgress: function(progress){}, //Translate progress callback
	translateRestoreOriginal: function(){ // Restore content to initial language
		LanguagePicker.currentLang = LanguagePicker.defaultLang;
		LanguagePicker.translateComplete();
	},
};
