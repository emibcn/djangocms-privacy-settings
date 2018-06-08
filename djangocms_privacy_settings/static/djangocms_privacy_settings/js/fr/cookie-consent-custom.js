/*
 * Cookie Consent jQuery plugin v1.2.0
 * http://PrivacyPolicies.com/cookie-consent/
 *
 * Copyright 2012-2015, Quality Nonsense Ltd
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

$.extend({
	cookieconsent: function(options){
		if(typeof(options) == 'undefined'){ options = {}; }

		var current_level = null;
		var notice_timeout = null;
		var our_domain = 'privacypolicies.com';
		var cookieconsent_root_url = '//privacypolicies.com/cookie-consent/';

		// overridable config
		var config = {
			_demo_mode: false,

			cookieconsent_css_filepath: cookieconsent_root_url+'releases/latest/css/cookie-consent.css',
			cookie_name: 'cookie_consent_level',
			cookie_expires: new Date((new Date()).getTime() + 365*24*60*60*1000), // default to 365 days in the future

			autorun: true,

			// the id of one of the supplied levels
			default_level_id: 'functional',

			// popup element
			popup_container: 'body',

			// can either be a string of html or an element containing the intial text explaning what's going on
			cookie_notice: "The cookie settings on this website are set to 'allow all cookies' to give you the very best experience. If you continue without changing these settings, you consent to this - but if you want, you can change your settings at any time <strong>at the bottom of this page</strong>.",

			// can either be a string of html or an element containing the intro text to the change settings dialog
			edit_settings_intro: "<h2>Your cookie settings</h2><p>Cookies are very small text files that are stored on your computer when you visit some websites.</p><p>We use cookies to make our website easier for you to use. You can remove any cookies already stored on your computer, but these may prevent you from using parts of our website.</p>",

			// time in seconds that the notice will be displayed before being automatically hidden
			cookie_notice_autohide_timeout: 10, // 0 for never

			// an element that when clicked will let the user edit their settings. if the element is empty, this plugin will add some call to action text
			edit_settings_element: null,

			// callback for when the level is changed *by the user*
			on_change: function(){},

			// path to the css file for a jQuery UI theme (stock or custom - doesn't matter)
			// set to an empty string in order to use one already specified elsewhere on the site
			jqueryui_theme_css: '//ajax.googleapis.com/ajax/libs/jqueryui/1.8.10/themes/pepper-grinder/jquery-ui.css',

			// url of a page explaning how cookies are to be used on the website
			cookie_policy_url: '',

			// consent levels, starting with basic (legal for all sites) and incrementally getting more cookies set
			// when the run() method is called, callback functions will be invoked from level index 0 through to the current level
			levels: [
				{
					id: 'necessary',
					title: 'Strictly necessary<br />& Performance',
					permissions: ['Remember what is in your shopping basket', 'Remember how far you are through an order'],
					callback: function(){ }
				},
				{
					id: 'functional',
					title: 'Functional',
					permissions: ['Remember your log-in details', 'Make sure you\'re secure when logged in to the website', 'Make sure the website looks consistent'],
					callback: function(){ }
				},
				{
					id: 'tracking',
					title: 'Tracking',
					permissions: ['Monitor how you travel through the website'],
					callback: function(){ }
				},
				{
					id: 'targeting',
					title: 'Targeting',
					permissions: ['Allow you to share pages with social networks like Facebook', 'Send information to other websites so that advertising is more relevant to you'],
					callback: function(){ }
				}
			]
		};

		// if levels have been specified then remove default levels
		if(options.levels && options.levels.length > 0){ config.levels = []; }

		$.extend(true, config, options);

		if(config.jqueryui_theme_css && config.jqueryui_theme_css .length){
			$('head').append('<link id="cookieconsent-theme-link" rel="stylesheet" href="'+config.jqueryui_theme_css+'" type="text/css" />');
		}
		$('head').append('<link rel="stylesheet" href="'+config.cookieconsent_css_filepath+'" type="text/css" />');

		function error(message){
			if(window.console && window.console.error){ console.error(message, this); }
		}

		// sanity checks
		if(config.levels.length == 1){ error('cookieconsent needs at least 2 levels. level 1 is legal without consent, so there\'d be no need for this plugin.'); return; }
		if(config.levels.length > 4){  error('cookieconsent accepts a maximum of 4 levels.'); return; }
		for(var i=0, level; level=config.levels[i]; i++){
			if(level.id.indexOf(' ') > -1){ error('cookieconsent level id properties cannot contain spaces.'); return; }
		}
		config.edit_settings_element = $(config.edit_settings_element);
		if(config.edit_settings_element.length == 0){ error('cookieconsent could not find the element specific in the edit_settings_element property'); return; }

		// level methods
		config.levels.get = function(level_id){
			return get_by_id.call(this, level_id);
		};
		config.levels.select = function(level){
			switch(typeof(level)){
				case 'string':
					level = get_by_id.call(config.levels, level);
					break;
				case 'object':
					level = get_by_id.call(config.levels, level.id);
					break;
				default:
					error('select_level() requires a level id or an actual level object');
					return;
			}
			if(level){
				current_level = level;

				// set cookie
				cookies.set(config.cookie_name, current_level.id);

				// update level changer
				var buttons = level_changer.find('a');
				buttons.removeClass('activated');
				for(var i=0, button; button=buttons[i]; i++){
					$(button).addClass('activated');
					if($(button).data('level').id == level.id){ break; }
				}

				// update the permission lists
				var permission_destination = permission_panels.find('.cookieconsent-permission-panel-allowed ul');
				permission_destination.find('*').remove();
				for(var i=0, level; level=this[i]; i++){
					for(var x=0, permission; permission=level.permissions[x]; x++){
						permission_destination.append('<li>'+permission+'</li>');
					}
					if(level.id == current_level.id){
						permission_destination = permission_panels.find('.cookieconsent-permission-panel-disallowed ul');
						permission_destination.find('*').remove();
					}
				}
				permission_panels.find('ul').hide().fadeIn('normal');
			}else{
				// supplied level not found, so first try and fall back to the default level, if that fails, default to first level
				level = config.levels.get(config.default_level_id);
				if(!level){
					if(config.levels.length > 0){
						level = config.levels[0];
					}else{
						error('cookieconsent level supplied to select_level does not exist, and could not default');
						return;
					}
				}
				return config.levels.select(level);
			}
			return level;
		};
		config.levels.saved = function(){
			return get_by_id.call(config.levels, cookies.get(config.cookie_name));
		};

		// array helpers
		function get_by_id(id){
			for(var i=0, elem; elem=this[i]; i++)
				if(elem.id == id){ return elem;}
			return null;
		};

		// cookie methods
		var cookies = {
			set: function(name, value){
				document.cookie = name + "=" + escape(value) + "; expires=" + config.cookie_expires.toGMTString() + "; path=/;";
			},
			get: function(name){
				var dc = document.cookie;
				var prefix = name + "=";
				var begin = dc.indexOf("; " + prefix);
				if (begin == -1) {
					begin = dc.indexOf(prefix);
					if (begin != 0) return "";
				} else
					begin += 2;
				var end = document.cookie.indexOf(";", begin);
				if (end == -1)
					end = dc.length;
				return unescape(dc.substring(begin + prefix.length, end));
			}
		};

		// edit settings dialog
		var overlay = $('<div class="ui-widget-overlay cookieconsent-overlay" />');
		var settings_dialog = $(
			'<div class="ui-widget ui-corner-all cookieconsent-dialog-content cookieconsent-edit-settings">' +
				(typeof(config.edit_settings_intro) == 'string' ? config.edit_settings_intro : config.edit_settings_intro.html()) +
				'<div class="cookieconsent-magic-button-wrap cookieconsent-magic-button-related">' +
					'<div class="ui-state-highlight ui-corner-all">' +
						'<iframe allowtransparency="true" frameborder="0" scrolling="auto"></iframe>' +
					'</div>' +
				'</div>' +
				'<div class="cookieconsent-level-changer-wrap">' +
					'<p style="text-align:center; clear:both; padding:5px 10px;" class="ui-state-highlight">Utilisez les boutons ci-dessous pour voir les différents types de cookies que vous pouvez choisir.</p>' +
					'<div class="cookieconsent-level-changer" />' +
					'<div class="cookieconsent-permission-panels">' +
						'<div class="ui-corner-all cookieconsent-permission-panel-disallowed"><div class="ui-corner-top ui-widget-header cookieconsent-permission-panel-title red"><i class="fa fa-thumbs-down" aria-hidden="true"></i> Cookies desactivés :</div><ul class="ui-widget ui-widget-content ui-corner-bottom" /></div>' +
						'<div class="ui-corner-all cookieconsent-permission-panel-allowed"><div class="ui-corner-top ui-widget-header cookieconsent-permission-panel-title green"><i class="fa fa-thumbs-up" aria-hidden="true"></i> Cookies activés :</div><ul class="ui-widget ui-widget-content ui-corner-bottom" /></div>' +
					'</div>' +
				'</div>' +
				(config.cookie_policy_url.length > 0?'<a href="'+config.cookie_policy_url+'" class="cookieconsent-cookie-policy-link btn-primary text-center">En savoir plus</a>':'') +
			'</div>'
		);
		var close_settings_dialog = make_button('Close', 'ui-icon-closethick').addClass('cookieconsent-dialog-close');
		settings_dialog.append(close_settings_dialog);
		$('body').append(overlay.hide()).append($('<div class="cookieconsent-dialog" />').append(settings_dialog.hide()));
		close_settings_dialog.click(function(){ close_settings(); });
		settings_dialog.parent().click(function(){ close_settings(); });
		settings_dialog.click(function(e){ e.stopPropagation(); });
		overlay.click(function(){ close_settings(); });

		// level changer
		var level_changer = settings_dialog.find('.cookieconsent-level-changer');
		for(var i=0, level; level=config.levels[i]; i++){
			var width = (96 / config.levels.length);
			var margin = ((4 / config.levels.length) / 2);
			var button = $(
				'<a href="#" class="ui-corner-all" style="width:'+width+'%; margin:'+margin+'%;">' +
					'<span class="cookieconsent-level-button-icon cookieconsent-level-'+level.id+'" />' +
					'<span class="cookieconsent-level-button-title">'+level.title+'</span>' +
				'</a>'
			);
			button.data('level', level);
			button.click(function(){
				config.levels.select($(this).data('level'));
				if(typeof(config.on_change) == 'function'){ config.on_change(); }
				return false;
			});
			level_changer.append(button);

			// set the icon (the bars)
			var icon_wrap = button.find('.cookieconsent-level-button-icon');
			for(var x=0; x<config.levels.length; x++){
				var height = (100-((90/config.levels.length)*((config.levels.length-1)-x)));
				var width = (100/config.levels.length);
				var left = ((width*x)+(margin*x));
				icon_wrap.append('<div style="height:'+height+'%; width:'+width+'%; left:'+left+'%;"'+(x<=i?' class="activated"':'')+' />');
			}
		}

		// permission panels
		var permission_panels = settings_dialog.find('.cookieconsent-permission-panels');

		// edit settings link
		if(config.edit_settings_element != null){
			switch(config.edit_settings_element[0].nodeName.toLowerCase()){
				case 'input':
					if(trim(config.edit_settings_element.val()).length == 0){ config.edit_settings_element.val('Modifier les paramètres de vos cookies'); }
					break;
				default:
					if(trim(config.edit_settings_element.html()).length == 0){ config.edit_settings_element.html('Modifier les paramètres de vos cookies'); }
			}
			config.edit_settings_element.click(function(){ edit_settings(); return false; });
		}

		function edit_settings(){
			overlay.show();
			settings_dialog.css({'top': $(window).scrollTop()+'px'}).fadeIn('fast');
			$('.cookieconsent-popup').hide();
		}
		function close_settings(){
			overlay.hide();
			settings_dialog.fadeOut('fast');
		}

		// ui elements
		function make_button(text, icon_class){
			var button = $('<button class="btn ui-corner-all">'+(icon_class?'<span class="close" />':'')+'</button>');
			if(icon_class){
				button.addClass('ui-button-text-icon-primary');
			}else{
				button.addClass('ui-button-text-only');
			}
			return button;
		}

		// functional helpers
		function trim(text, char){
			if(!char){ char = '\\s'; }
			return text.replace(eval('/^'+char+'+/'), '').replace(eval('/'+char+'+$/'), '');
		};

		function run_callbacks(stop_with_current_level){
			var script_elems = [];
			var loaded_script_count = 0;

			// when all level-applicable scripts have completed loading (if any) execute callbacks
			function check_loaded_and_exec(){
				if(script_elems.length > loaded_script_count){ return; }

				for(var i=0, level; level=config.levels[i]; i++){
					if(typeof(level.callback) == 'function'){ level.callback(); }

					if(stop_with_current_level && level.id == current_level.id){ return; }
				}
			}

			// find the scripts to be converted
			for(var i=0, level; level=config.levels[i]; i++){
				var level_scripts = $('script[cookieconsent-level='+level.id+']');
				level_scripts.each(function(){
					script_elems.push($(this));
				});

				if(stop_with_current_level && level.id == current_level.id){ break; }
			}

			// convert the scripts
			for(var i=0, script; script=script_elems[i]; i++){
				var self = script;
				if(self.attr('src')){
					$.getScript(self.attr('src'), function(){
						loaded_script_count++;
						check_loaded_and_exec();
					});
				}else{
					self.attr('type', 'text/javascript');
					$('head').append(self);
					loaded_script_count++;
					check_loaded_and_exec();
				}
			}

			// check immediately incase there's no scripts needed for callbacks
			check_loaded_and_exec();
		}

		// initialise and run
		function initialise(){
			function non_global_consent_operations(prevent_callback_execution){
				// popup message if they haven't yet seen the cookie notice
				if(config._demo_mode || config.levels.saved() == null){
					var popup = $(
						'<div class="ui-widget ui-corner-top cookieconsent-popup">' +
							(typeof(config.cookie_notice) == 'string' ? config.cookie_notice : config.cookie_notice.html()) +
							'<div class="cookieconsent-button-wrap" />' +
							(config.cookie_policy_url.length > 0?'<a href="'+config.cookie_policy_url+'" class="cookieconsent-cookie-policy-link btn-primary">En savoir plus </a>':'') +
							'<a class="cookieconsent-toggle-magic-button cookieconsent-magic-button-related" href="#"><span class="ui-icon ui-icon-alert"></span></a>' +
						'</div>'
					);
					var change_settings = make_button('Préférences', 'ui-icon-wrench');
					var dismiss = make_button('Refuser', 'ui-icon-close');

					popup.find('.cookieconsent-button-wrap').append(change_settings).append(dismiss);
					popup.hover(function(){ $(this).data('mouseover', true); }, function(){ $(this).data('mouseover', false); });
					popup.find('.cookieconsent-toggle-magic-button').click(function(){
						$('.cookieconsent-magic-button-wrap').show();
						$('.cookieconsent-toggle-magic-button').hide();
						edit_settings();
						return false;
					});

					change_settings.click(function(){
						edit_settings();
					});
					dismiss.click(function(){
						popup.fadeOut('normal');
					});

					$(config.popup_container).append(popup);

					if(config.cookie_notice_autohide_timeout > 0){
						notice_timeout = setTimeout(function(){
							if(!popup.data('mouseover')){ popup.fadeOut('normal'); }
						}, (config.cookie_notice_autohide_timeout * 1000));
					}
				}

				initialise_level_changer();

				if(!prevent_callback_execution){
					// runs through each level's callbacks up to and including the current level
					run_callbacks(true);
				}
			}

			function initialise_level_changer(){
				var saved_level = config.levels.saved()
				if(saved_level == null){
					config.levels.select(config.default_level_id);
				}else{
					// initialise UI with current level
					config.levels.select(saved_level);
				}
			}

			if(typeof(window.postMessage) == 'function'){

				function show_level_change(){
					$('.cookieconsent-level-changer-wrap').show();
					$('.cookieconsent-magic-button-wrap').hide();
					$('.cookieconsent-toggle-magic-button').show();

					initialise_level_changer();
				}
				function hide_level_change(){
					$('.cookieconsent-level-changer-wrap').hide();
					$('.cookieconsent-magic-button-wrap').show();
					$('.cookieconsent-toggle-magic-button').hide();
				}

				window.addEventListener("message", function(event){
					if(event.origin.replace(/^http(s)?:\/\//, '') == our_domain){
						switch(event.data){
							case 'global_enabled':
								hide_level_change();
								break;
							case 'global_disabled':
								show_level_change();
								break;
							default:
								var parts = event.data.split(':');
								if(parts.length == 2 && parts[0] == 'cookie_consent_global_allow'){
									switch(parts[1]){
										case 'true':
											// run all callbacks regardless of set level
											run_callbacks(false);

											hide_level_change();

											if(config._demo_mode){
												non_global_consent_operations(true);
											}
											break;
										case 'false':
											non_global_consent_operations();
											break;
										default:
											error('unrecognised response from Magic Button frame');
											return;
									}
								}
						}
					}
				}, false);
			}else{
				// older browsers which don't support cross domain messaging.
				// show the popup and don't allow Magic Button support

				non_global_consent_operations();

				// hide Magic Button references
				$('.cookieconsent-magic-button-related').hide();
			}

			// now we've set up the event listener (or not), we can safely set the magic button iframe source, and wait for any responses
			settings_dialog.find('iframe').attr('src', cookieconsent_root_url+'magic-button/');
		}
		if(config.autorun){ initialise(); }

		// public
		return {
			get_levels: function(){
				return config.levels;
			},
			get_level: function(level_id){
				return config.levels.get(level_id);
			},
			select_level: function(level){
				return config.levels.select(level);
			},
			saved_level: function(level){
				return config.levels.saved();
			},
			is_granted: function(level_id){
				for(var i=0, level; level=config.levels[i]; i++){
					if(level.id == level_id){ return true; }
					if(level.id == current_level.id){ return false; }
				}
				return false;
			},
			edit_settings: function(){
				edit_settings();
			},
			run: function(){
				initialise();
			}
		};
	}
});
