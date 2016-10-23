/*! jQuery toggleWidget - v0.1.0
 * https://github.com/floriancapelle/jquery-toggle-widget
 * Licensed MIT
 */
(function( $ ) {
    'use strict';

    if ( $ === undefined ) return;

    /**
     * Plugin Namespace
     * Use to register api and events.
     */
    var NAMESPACE = 'toggleWidget';

    /**
     * Default configuration
     * Required configuration to ensure minimal functionality.
     *
     * BE AWARE: When changing classes, style them with the least required styles as well (see the css file).
     *
     * @property {bool} enabled - whether the plugin will be enabled (on startup), use enable/disable functions to manipulate this state
     * @property {string|bool} toggleBtnSelector - will be used as DOM filter in the event handler. Set to false to disable event handling (and do it manually).
     * @property {string|bool} toggleBtnTpl - toggle btn template, the btn will be appended to the root element if it doesn't exist on startup.
     *                                        Set to false to disable. Make sure to use at least the toggleBtnSelector as a class.
     * @property {string|function} toggleContent - root element find() filter string or function to return the target toggle content element.
     *                                             Function context is api, first argument root element.
     * @property {string} openClass - open state class
     * @property {number} offsetTopShift - shift the offset top value by this number before returning. Set to 0 to disable
     * @property {number} scrollDuration - scrollToOffsetTop animation duration
     */
    var defaults = {
        enabled: true,
        toggleBtnSelector: 'toggle-widget__toggle-btn',
        toggleBtnTpl: '<button type="button" class="toggle-widget__toggle-btn"></button>',
        toggleContent: '.toggle-widget__content',
        openClass: 'toggle-widget--open',
        offsetTopShift: -20,
        scrollDuration: 300
    };

    /**
     * Private variables/state
     * Variables not to be exposed, nor inherited or modified.
     */
    var $htmlBody;

    // DOM ready
    $(function() {
        $htmlBody = $('html, body');

        // append to jQuery prototype
        $.fn[NAMESPACE] = function( options ) {
            // return prototype to enable modification
            if ( options === 'getPrototype' ) {
                return api.prototypes.default;
            }

            return this.each(function() {
                api.Factory(this, options);
            });
        };
    });

    var api = {
        /**
         * Factory
         * Return new instances of an object with any arbitrary prototype you want.
         * Depending on options supplied you may choose which object/functionality to return.
         */
        Factory: function( targetElem, options ) {
            var $el = $(targetElem);
            if ( !$el.length ) return;

            var dataApi = $el.data(NAMESPACE);
            if ( dataApi ) {
                if ( options === 'destroy' && dataApi.isPrototypeOf(this.prototypes.default) ) {
                    dataApi.destroy();
                    return;
                } else {
                    throw NAMESPACE + ' api already attached';
                }
            }

            var instance = Object.create(this.prototypes.default);

            // apply custom config if present
            instance.conf = $.extend({}, defaults, options, {
                targetElem: $el
            });

            instance.init();

            return instance;
        },

        prototypes: {}
    };

    api.prototypes.default = {
        init: function() {
            var self = this;

            this._$el = this.conf.targetElem;
            if ( $.isFunction(this.conf.toggleContent) ) {
                this._$toggleContent = this.conf.toggleContent.call(this, this._$el);
            } else {
                this._$toggleContent = this._$el.find(this.conf.toggleContent);
            }
            this._$toggleContentInner = this._$toggleContent.children();
            this._isOpen = this._$el.hasClass(this.conf.openClass);
            this._isEnabled = this.conf.enabled;

            // append the toggle btn to the root element if configured and if it doesn't exist yet
            if ( this.conf.toggleBtnTpl !== false && !this._$el.find(this.conf.toggleBtnSelector).length ) {
                this._$el.append($(this.conf.toggleBtnTpl));
            }

            this._$el.addClass('toggle-widget');
            this._$toggleContent.addClass('toggle-widget__content');

            if ( this.conf.toggleBtnSelector !== false ) {
                // attach the toggle btn event handler
                this._$el.on('click.' + NAMESPACE, this.conf.toggleBtnSelector, function() {
                    self.toggle();
                });
            }

            // prepare open state on pageload
            if ( this._isOpen ) {
                self.open();
            }

            // disable initializing multiple times
            this.init = function() {};

            // expose api to data attribute
            this._$el.data(NAMESPACE, this);

            this._$el.trigger('afterInit.' + NAMESPACE, this);

            return this;
        },

        open: function() {
            var self = this;

            if ( this._isEnabled === false ) return this;

            this._$el.trigger('beforeOpen.' + NAMESPACE, this);

            var contentInnerHeight = this.getContentInnerHeight();

            // BEWARE: multiple events for multiple properties fired. Cannot use ".one" as it is fired per event type.
            this._$toggleContent.on('transitionend.' + NAMESPACE + ' webkitTransitionEnd.' + NAMESPACE, function( event ) {
                if ( !self._$toggleContent.is(event.target) ) return;

                self._$toggleContent.css('height', 'auto');
                // remove attached events again after firing at least one
                self._$toggleContent.off('transitionend.' + NAMESPACE + ' webkitTransitionEnd.' + NAMESPACE);

                self._$el.trigger('afterOpen.' + NAMESPACE, this);
            });

            this._$el.addClass(this.conf.openClass);
            this._$toggleContent.css('height', contentInnerHeight);
            this._isOpen = true;

            return this;
        },

        close: function() {
            var self = this;

            if ( this._isEnabled === false ) return this;

            this._$el.trigger('beforeClose.' + NAMESPACE, this);

            var contentInnerHeight = this.getContentInnerHeight();

            // BEWARE: multiple events for multiple properties fired. Cannot use ".one" as it is fired per event type.
            this._$toggleContent.on('transitionend.' + NAMESPACE + ' webkitTransitionEnd.' + NAMESPACE, function( event ) {
                if ( !self._$toggleContent.is(event.target) ) return;

                // remove attached events again after firing at least one
                self._$toggleContent.off('transitionend.' + NAMESPACE + ' webkitTransitionEnd.' + NAMESPACE);

                self._$el.trigger('afterClose.' + NAMESPACE, this);
            });

            this._$el.removeClass(this.conf.openClass);
            this._$toggleContent.css('height', contentInnerHeight);
            // force layout
            this._$toggleContent.css('height');
            this._$toggleContent.css('height', '');
            this._isOpen = false;

            return this;
        },

        toggle: function() {
            if ( this._isOpen === true ) {
                return this.close();
            } else {
                return this.open();
            }
        },

        enable: function() {
            this._isEnabled = true;
            return this;
        },
        disable: function() {
            this._isEnabled = false;
            return this;
        },

        getOffsetTop: function() {
            var offsetTop = this._$el.offset().top;

            // visual improvement
            offsetTop += this.conf.offsetTopShift;

            return offsetTop;
        },

        getContentInnerHeight: function() {
            return this._$toggleContentInner.outerHeight();
        },

        scrollToOffsetTop: function() {
            var self = this;

            $htmlBody.animate({
                scrollTop: this.getOffsetTop()
            }, this.conf.scrollDuration, function() {
                self._$el.trigger('afterScrollToOffsetTop.' + NAMESPACE, this);
            });

            return this;
        },

        destroy: function() {
            // restore default state of DOM element
            this._$el.removeClass(this.conf.openClass);
            this._$toggleContent.css('height', '');

            // remove attached event handlers
            this._$el.off('.' + NAMESPACE);

            // remove api from root element
            this._$el.data(NAMESPACE, null);
        }
    };

}(jQuery));