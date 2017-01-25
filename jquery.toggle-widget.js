/*! jQuery toggleWidget - v1.0.2
 * https://github.com/floriancapelle/jquery-toggle-widget
 * Licensed MIT
 */
(function ( root, factory ) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(this, function ( $ ) {
    'use strict';

    /**
     * Plugin Namespace
     * Use to register api and events.
     */
    var NAMESPACE = 'toggleWidget';

    /**
     * Configuration
     * @see https://github.com/floriancapelle/jquery-toggle-widget/blob/master/README.md for configuration details
     */
    var defaults = {
        enabled: true,
        toggleBtnSelector: '.toggle-widget__toggle-btn',
        toggleContentSelector: '.toggle-widget__content',
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
            // ensure backwards compatibility
            // @todo deprecated - remove in next major version
            if ( this.conf.toggleContent && !this.conf.toggleContentSelector ) {
                this.conf.toggleContentSelector = this.conf.toggleContent;
            }
            if ( $.isFunction(this.conf.toggleContentSelector) ) {
                this._$toggleContent = this.conf.toggleContentSelector.call(this, this._$el);
            } else {
                this._$toggleContent = this._$el.find(this.conf.toggleContentSelector);
            }
            this._$toggleContentInner = this._$toggleContent.children();
            this._isOpen = this._$el.hasClass(this.conf.openClass);
            this._isEnabled = this.conf.enabled;

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


            // remove attached events from close function if called during animation
            this._$toggleContent.off('.close.' + NAMESPACE);
            // BEWARE: multiple events for multiple properties fired. Cannot use ".one" as it is fired per event type.
            this._$toggleContent.on('transitionend.open.' + NAMESPACE + ' webkitTransitionEnd.open.' + NAMESPACE, function( event ) {
                if ( !self._$toggleContent.is(event.target) ) return;

                self._$toggleContent.css('height', 'auto');
                // remove attached events again after firing at least one
                self._$toggleContent.off('.open.' + NAMESPACE);

                self._$el.trigger('afterOpen.' + NAMESPACE, self);
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

            // remove attached events from open function if called during animation
            this._$toggleContent.off('.open.' + NAMESPACE);
            // BEWARE: multiple events for multiple properties fired. Cannot use ".one" as it is fired per event type.
            this._$toggleContent.on('transitionend.close.' + NAMESPACE + ' webkitTransitionEnd.close.' + NAMESPACE, function( event ) {
                if ( !self._$toggleContent.is(event.target) ) return;

                // remove attached events again after firing at least one
                self._$toggleContent.off('.close.' + NAMESPACE);

                self._$el.trigger('afterClose.' + NAMESPACE, self);
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
                self._$el.trigger('afterScrollToOffsetTop.' + NAMESPACE, self);
            });

            return this;
        },

        isOpen: function() {
            return this._isOpen;
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

}));
