/* ========================================================================
 * Bootstrap: scroller.js v1.0.0
 * ========================================================================
 *
 * Copyright 2013-2014 Josh Street
 * ======================================================================== */

+function ($) {
	'use strict';
	
	var GLOBAL = {
		scrollbarSize: (function () {
			var $viewport = $(
					'<div style="overflow: scroll; width: 100px; height: 100px;">' +
						'<div style="width: 100%; height: 100%"></div>' +
					'</div>')
					.appendTo('body');
			var $content = $('div', $viewport).first();
			var size = $viewport.width() - $content.width();
			$viewport.remove();
			return size;
		}()),
		
		scroller: {
			x: '<div class="scroller-bar-x"><div class="scroller-nub"></div></div>',
			y: '<div class="scroller-bar-y"><div class="scroller-nub"></div></div>'
		},
		
		parameters: function (vertical) {
			return {
				axis: vertical ? 'y' : 'x',
				pos: vertical ? 'top' : 'left',
				size: vertical ? 'height' : 'width',
				page: vertical ? 'pageY' : 'pageX',
				scrollPos: vertical ? 'scrollTop' : 'scrollLeft',
				scrollSize: vertical ? 'scrollHeight' : 'scrollWidth',
			};
		}
	};
	
	// SCROLLER CLASS DEFINITION
	// =========================
	
	var Scroller = function (element, options) {
		this.$element = $(element);
		this.$viewport = $('.scroller-viewport', this.$element).first();
		this.$content = $('.scroller-content', this.$element).first();
		this.$scroller = {};
		this.$nub = {};
	
		this.options = options;
		
		this.initialize();
		
		this.bindEvents();
		
		this.update();
	};
	
	Scroller.DEFAULTS = {
		scrollY: true,
		scrollX: false
	};
	
	Scroller.prototype.initialize = function () {
		this.lastPos = {
				top: -1,
				left: -1
		};
		
		this.delta = {
				x: -1,
				y: -1,
		};
		
		this.moving = {
				x: false,
				y: false
		};
		
		if (this.options.scrollX) {
			this.$scroller.x = $(GLOBAL.scroller.x)
					.insertBefore(this.$viewport);
					
			this.$nub.x = $('.scroller-nub', this.$scroller.x);
			
			this.$viewport.css({
					'padding-bottom': GLOBAL.scrollbarSize + 'px',
					'margin-bottom': (-GLOBAL.scrollbarSize) + 'px'
			});
			this.$content.css({
					'margin-bottom': (-GLOBAL.scrollbarSize) + 'px'
			});
			this.$element.addClass('scroller-x');
		}
		
		if (this.options.scrollY) {
			this.$scroller.y = $(GLOBAL.scroller.y)
					.insertBefore(this.$viewport);
					
			this.$nub.y = $('.scroller-nub', this.$scroller.y);
			
			this.$viewport.css({
					'padding-right': GLOBAL.scrollbarSize + 'px',
					'margin-right': (-GLOBAL.scrollbarSize) + 'px'
			});
			this.$content.css({
					'margin-right': (-GLOBAL.scrollbarSize) + 'px'
			});
			this.$element.addClass('scroller-y');
		}
	};
	
	Scroller.prototype.bindEvents = function () {
		if (this.options.scrollX) {
			this.$scroller.x.on('click', $.proxy(this.click(false), this));
			this.$nub.x.on('mousedown', $.proxy(this.mousedown(false), this));
			$(document).on('mousemove', $.proxy(this.mousemove(false), this));
			$(document).on('mouseup', $.proxy(this.mouseup(false), this));
			
		}
		
		if (this.options.scrollY) {
			this.$scroller.y.on('click', $.proxy(this.click(true), this));
			this.$nub.y.on('mousedown', $.proxy(this.mousedown(true), this));
			$(document).on('mousemove', $.proxy(this.mousemove(true), this));
			$(document).on('mouseup', $.proxy(this.mouseup(true), this));
		}
		
		this.$viewport.on('scroll', $.proxy(this.scroll, this));
		
		this.$element
				.on('mouseover', $.proxy(this.mouseover, this))
				.on('resize', $.proxy(this.update, this));
				
		$(document).on('selectstart', $.proxy(this.selectstart, this));
	};
	
	Scroller.prototype.click = function (vertical) {
		var _this = this;
		
		var p = GLOBAL.parameters(vertical);
		
		var $scroller = this.$scroller[p.axis];
		var $nub = this.$nub[p.axis];
		
		return function (event) {
			var move = 0;
			var nubPos = parseFloat($nub.css(p.pos));
			var nubSize = parseFloat($nub.css(p.size));
			var clickPos = (event[p.page] - $scroller.offset()[p.pos]);
			
			if (clickPos < nubPos)
				move = -this.$viewport[p.size]();
			else if (clickPos > nubPos + nubSize)
				move = this.$viewport[p.size]();
			
			_this.$viewport[p.scrollPos](_this.$viewport[p.scrollPos]() + move);
			
			_this.update();
		};
	};
	
	Scroller.prototype.mousedown = function (vertical) {
		var _this = this;
		
		var p = GLOBAL.parameters(vertical);
		
		var $scroller = this.$scroller[p.axis];
		var $nub = this.$nub[p.axis];
		
		return function (event) {
			_this.delta[p.axis] = event[p.page];
			$scroller.addClass('active');
			_this.moving[p.axis] = true;
			
			event.preventDefault();
			event.stopPropagation();
		};
	};
	
	Scroller.prototype.mousemove = function (vertical) {
		var _this = this;
		
		var p = GLOBAL.parameters(vertical);
		
		var $scroller = this.$scroller[p.axis];
		
		return function (event) {
			if (_this.moving[p.axis]) {
				var size = _this.$element[p.size]();
				var scrollSize = _this.$content[0][p.scrollSize];
				var ratio = size / scrollSize;
				var move = (event[p.page] - _this.delta[p.axis]) / ratio;
				
				_this.$viewport[p.scrollPos](_this.$viewport[p.scrollPos]() + move);
				
				_this.delta[p.axis] = event[p.page];
				
				_this.update();
				
				event.preventDefault();
				event.stopPropagation();
			}
		};
	};
	
	Scroller.prototype.mouseup = function (vertical) {
		var _this = this;
		
		var p = GLOBAL.parameters(vertical);
		
		var $scroller = this.$scroller[p.axis];
		
		return function (event) {
			$scroller.removeClass('active');
			_this.moving[p.axis] = false;
		};
	};
	
	Scroller.prototype.scroll = function (event) {
		this.update();
	};
	
	Scroller.prototype.mouseover = function (event) {
		this.update();
	};
	
	Scroller.prototype.selectstart = function (event) {
		if (this.moving.x || this.moving.y)
			event.preventDefault();
	};
	
	Scroller.prototype.update = function () {
		this.options.scrollX && this._update(false);
		this.options.scrollY && this._update(true);
	};
	
	Scroller.prototype._update = function(vertical) {
		var p = GLOBAL.parameters(vertical);
		
		var $scroller = this.$scroller[p.axis];
		
		var $nub = this.$nub[p.axis];
		
		var scrollSize = this.$content[0][p.scrollSize];
		var viewportSize = this.$viewport[p.size]();
		if (scrollSize <= viewportSize) {
			$scroller.addClass('disabled');
			return;
		}
		else {
			$scroller.removeClass('disabled');
		}
		
		var scrollPos = this.$viewport[p.scrollPos]();
		
		if (scrollPos !== this.lastPos[p.pos]) {
			this.lastPos[p.pos] = scroll;
			
			var size = this.$element[p.size]();
			var maxScrollSize = scrollSize - size;
			var ratio = size / scrollSize;
			
			var scrollRelative = scrollPos / maxScrollSize;
			
			var nubSize = ((ratio > 1) ? 1 : ratio) * size;
			
			var scrollerSize = $scroller[p.size]();
			
			var css = {};
			css[p.size] = nubSize + 'px';
			css[p.pos] = (scrollRelative * (scrollerSize - nubSize)) + 'px';
			
			$nub.css(css);
		}
	};
	
	Scroller.prototype.reset = function () {
		this.options.scrollX && this._reset(false);
		this.options.scrollY && this._reset(true);
	};
	
	Scroller.prototype._reset = function (vertical) {
		if (vertical)
			this.$viewport.scrollTop(0);
		else
			this.$viewport.scrollLeft(0);
	};
	
	// SCROLLER PLUGIN DEFINITION
	// ==========================
	
	var old = $.fn.scroller;
	
	$.fn.scroller = function (option) {
		var arg = arguments;
		return this.each(function () {
			var $this = $(this);
			var data = $this.data('bs.scroller');
			var options = $.extend({}, Scroller.DEFAULTS, $this.data(), typeof option == 'object' && option);
			if (!data)
				$this.data('bs.scroller', (data = new Scroller(this, options)));
			if (typeof option == 'string')
				if (arg.length > 1) 
					data[option].apply(data, Array.prototype.slice.call(arg, 1));
				else
					data[option]();
		});
	};
	
	$.fn.scroller.Constructor = Scroller;
	
	// SCROLLER NO CONFLICT
	// ====================
	
	$.fn.scroller.noConflict = function () {
		$.fn.scroller = old;
		return this;
	};
	
	// SCROLLER DATA-API
	// =================
	
	$(window).on('load', function () {
		$('[data-enhance="scroller"]').each(function () {
			var $scroller = $(this);
			$scroller.scroller($scroller.data());
		});
	});
}(jQuery);
