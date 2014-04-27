/*
 * jQuery Litelighter
 * By: Trent Richardson [http://trentrichardson.com]
 *
 * Copyright 2013 Trent Richardson
 * Dual licensed under the MIT or GPL licenses.
 * http://trentrichardson.com/Impromptu/GPL-LICENSE.txt
 * http://trentrichardson.com/Impromptu/MIT-LICENSE.txt
 */
(function($){
	$.litelighter = function($this, options){
		this.settings = $.extend({},{ clone: false, style: 'light', language: 'generic', tab: '    ' },options);
		this.code = $this;
		this.enable();
	};

	$.extend($.litelighter.prototype, {
		enable: function(){
				this.codelite = this.code.data('llcode', this.code.text());
				if(this.settings.clone == true)
					this.codelite = $('<pre />').text(this.code.text()).addClass('litelighter').insertAfter(this.code.css('display','none'));

				if(this.code.data('lllanguage'))
					this.settings.language = this.code.data('lllanguage');
				if(this.code.data('llstyle'))
					this.settings.style = this.code.data('llstyle');

				var style = $.litelighter.styles[this.settings.style],
					lang = $.litelighter.languages[this.settings.language],
					txt = $.litelighter.highlight(this.codelite.html(), style, lang).replace(/\t/g, this.settings.tab);

				this.codelite.attr('style', style.code).html(txt);
				return this.code;
			},
		disable: function(){
				if(this.settings.clone){
					this.codelite.remove();
					return this.code.css('display','block');
				}
				return this.code.html('').text(this.code.data('llcode'));
			},
		destroy: function(){
				this.disable();
				return this.code.removeData('litelighter');
			},
		option: function(key, val){
				if(val !== undefined){
					this.code.data('ll'+key, val);
					this.settings[key] = val;
					this.disable();
					return this.enable();
				}
				return this[key];
			}
	});

	$.litelighter.lookup = {
		i: 0
	};

	$.fn.litelighter = function(o) {
		o = o || {};
		var tmp_args = Array.prototype.slice.call(arguments);

		if (typeof(o) == 'string') return this.each(function() {
				var inst = $.litelighter.lookup[$(this).data('litelighter')];
				inst[o].apply(inst, tmp_args.slice(1));
			});
		else return this.each(function() {
				var $t = $(this);
				$.litelighter.lookup[++$.litelighter.lookup.i] = new $.litelighter($t, o);
				$t.data('litelighter', $.litelighter.lookup.i );
			});
	};

	$.litelighter.highlight = function(txt, style, lang){
		// recursively do any sub templating...
		var sublangsi = 0,
			sublangs = [];
		for(var i in lang){
			if(lang.hasOwnProperty(i) && lang[i].language !== undefined && $.litelighter.languages[lang[i].language] !== undefined){
				txt = txt.replace(lang[i].re, function($1, $2, $3){
								sublangs[sublangsi++] = $.litelighter.highlight($2, style, $.litelighter.languages[lang[i].language]);
								return $1.replace($2, '___subtmpl'+ (sublangsi-1) +'___');
							});
			}
		}

		// do current level templating
		for(var i in lang){
			if(lang.hasOwnProperty(i) && lang[i].language === undefined){
				txt = txt.replace(lang[i].re, "___"+ i +"___$1___end"+ i +"___");
			}
		}

		var lvls = [];
		txt = txt.replace(/___(?!subtmpl)\w+?___/g, function($0){
			var end = ($0.substr(3,3)=='end')? true:false,
				tag = (!end? $0.substr(3):$0.substr(6)).replace(/_/g,''),
				lastTag = lvls.length>0? lvls[lvls.length-1] : null;

			if(!end && (lastTag == null || tag == lastTag || (lastTag != null && lang[lastTag].embed != undefined && $.inArray(tag,lang[lastTag].embed)>=0 ))){
				lvls.push(tag);
				return $0;
			}
			else if(end && tag == lastTag){
				lvls.pop();
				return $0;
			}
			return "";
		});
		for(var i in lang){
			if(lang.hasOwnProperty(i)){
				txt = txt.replace(new RegExp("___end"+ i +"___","g"), "</span>").replace(new RegExp("___"+ i +"___","g"), "<span class='litelighterstyle' style='"+ style[lang[i].style] +"'>");
			}
		}

		// finally replace those sub templates
		for(var i in lang){
			if(lang.hasOwnProperty(i) && lang[i].language !== undefined && $.litelighter.languages[lang[i].language] !== undefined){
				txt = txt.replace(/___subtmpl\d+___/g, function($tmpl){
								var i = parseInt($tmpl.replace(/___subtmpl(\d+)___/, "$1"), 10);
								return sublangs[i];
							});
			}
		}
		return txt;
	};

	$.litelighter.styles = {
		light: {
			code: 'background-color:#fafafa;color:#555;',
			comment: 'color:#999',
			string: 'color:#8F9657',
			number: 'color:#CF6745;',
			keyword: 'color:#6F87A8;',
			operators: 'color:#9e771e;'
		},
		dark: {
			code: 'background-color:#141414;color:#ffffff;',
			comment: 'color:#999',
			string: 'color:#8F9657',
			number: 'color:#CF6745;',
			keyword: 'color:#6F87A8;',
			operators: 'color:#fee79e;'
		}
	};
	$.litelighter.languages = {
		generic: {
			comment: { re: /(\/\/.*|\/\*([\s\S]*?)\*\/)/g, style: 'comment' },
			string: { re: /((\'.*?\')|(\".*?\"))/g, style: 'string' },
			numbers: { re: /(\-?(\d+|\d+\.\d+|\.\d+))/g, style: 'number' },
			regex: { re: /([^\/]\/[^\/].+\/(g|i|m)*)/g, style: 'number' },
			keywords: { re: /(?:\b)(function|for|foreach|while|if|else|elseif|switch|break|as|return|this|class|self|default|var|false|true|null|undefined)(?:\b)/gi, style: 'keyword' },
			operators: { re: /(\+|\-|\/|\*|\%|\=|\&lt;|\&gt;|\||\?|\.)/g, style: 'operators' }
		}
	};
	$.litelighter.languages.js = $.litelighter.languages.generic;
	$.litelighter.languages.css = {
			comment: $.litelighter.languages.generic.comment,
			string: $.litelighter.languages.generic.string,
			numbers: { re: /((\-?(\d+|\d+\.\d+|\.\d+)(\%|px|em|pt|in)?)|\#[0-9a-fA-F]{3}[0-9a-fA-F]{3})/g, style: 'number' },
			keywords: { re: /(\@\w+|\:?\:\w+|[a-z\-]+\:)/g, style: 'keyword' }
		};
	$.litelighter.languages.html = {
			comment: { re: /(\&lt\;\!\-\-([\s\S]*?)\-\-\&gt\;)/g, style: 'comment' },
			tag: { re: /(\&lt\;\/?\w(.|\n)*?\/?\&gt\;)/g, style: 'keyword', embed: ['string'] },
			string: $.litelighter.languages.generic.string,
			css: { re: /(?:\&lt;style.*?\&gt;)([\s\S]+?)(?:\&lt;\/style\&gt;)/gi, language: 'css'},
			script: { re: /(?:\&lt;script.*?\&gt;)([\s\S]+?)(?:\&lt;\/script\&gt;)/gi, language: 'js'}
		};

})(window.jQuery || window.Zepto || window.$);