/*! jQuery toggleWidget - v1.0.4
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
     * Use to register module and events.
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
     * e.g. shortcuts to dependencies or variables to spare memory.
     */
    var $htmlBody;

    // DOM ready
    $(function() {
        $htmlBody = $('html, body');

        // append to jQuery prototype
        $.fn[NAMESPACE] = function( options ) {
            return this.each(function() {
                var dataApi = $(this).data(NAMESPACE);
                if ( dataApi ) {
                    if ( options === 'destroy' && proto.isPrototypeOf(dataApi) ) {
                        dataApi.destroy();
                        return;
                    } else {
                        throw NAMESPACE + ' api already attached';
                    }
                }

                ToggleWidget(_.extend({}, defaults, options, {
                    targetElem: this
                }));
            });
        };
    });

    // provide prototype as helper for checks
    var proto = {};

    var ToggleWidget = function( options ) {
        var api;
        var $el = $(options.targetElem);
        if ( !$el.length ) return;
        var isOpen = $el.hasClass(options.openClass);
        var isEnabled = options.enabled;
        var $toggleContent;
        var $toggleContentInner;

        // ensure backwards compatibility
        // @todo deprecated - remove in next major version
        if ( options.toggleContent && !options.toggleContentSelector ) {
            options.toggleContentSelector = options.toggleContent;
        }
        if ( $.isFunction(options.toggleContentSelector) ) {
            $toggleContent = options.toggleContentSelector.call(this, $el);
        } else {
            $toggleContent = $el.find(options.toggleContentSelector);
        }
        $toggleContentInner = $toggleContent.children();

        $el.addClass('toggle-widget');
        $toggleContent.addClass('toggle-widget__content');

        if ( options.toggleBtnSelector !== false ) {
            // attach the toggle btn event handler
            $el.on('click.' + NAMESPACE, options.toggleBtnSelector, function() {
                api.toggle();
            });
        }

        api = _.extend(Object.create(proto), {
            open: function() {
                var self = this;

                if ( isEnabled === false ) return this;

                $el.trigger('beforeOpen.' + NAMESPACE, this);

                var contentInnerHeight = this.getContentInnerHeight();


                // remove attached events from close function if called during animation
                $toggleContent.off('.close.' + NAMESPACE);
                // BEWARE: multiple events for multiple properties fired. Cannot use ".one" as it is fired per event type.
                $toggleContent.on('transitionend.open.' + NAMESPACE + ' webkitTransitionEnd.open.' + NAMESPACE, function( event ) {
                    if ( !$toggleContent.is(event.target) ) return;

                    $toggleContent.css('height', 'auto');
                    // remove attached events again after firing at least one
                    $toggleContent.off('.open.' + NAMESPACE);

                    $el.trigger('afterOpen.' + NAMESPACE, self);
                });

                $el.addClass(options.openClass);
                $toggleContent.css('height', contentInnerHeight);
                isOpen = true;

                return this;
            },

            close: function() {
                var self = this;

                if ( isEnabled === false ) return this;

                $el.trigger('beforeClose.' + NAMESPACE, this);

                var contentInnerHeight = this.getContentInnerHeight();

                // remove attached events from open function if called during animation
                $toggleContent.off('.open.' + NAMESPACE);
                // BEWARE: multiple events for multiple properties fired. Cannot use ".one" as it is fired per event type.
                $toggleContent.on('transitionend.close.' + NAMESPACE + ' webkitTransitionEnd.close.' + NAMESPACE, function( event ) {
                    if ( !$toggleContent.is(event.target) ) return;

                    // remove attached events again after firing at least one
                    $toggleContent.off('.close.' + NAMESPACE);

                    $el.trigger('afterClose.' + NAMESPACE, self);
                });

                $el.removeClass(options.openClass);
                $toggleContent.css('height', contentInnerHeight);
                // force layout
                $toggleContent.css('height');
                $toggleContent.css('height', '');
                isOpen = false;

                return this;
            },

            toggle: function() {
                if ( isOpen === true ) {
                    return this.close();
                } else {
                    return this.open();
                }
            },

            enable: function() {
                isEnabled = true;
                return this;
            },
            disable: function() {
                isEnabled = false;
                return this;
            },

            getOffsetTop: function() {
                var offsetTop = $el.offset().top;

                // visual improvement
                offsetTop += options.offsetTopShift;

                return offsetTop;
            },

            getContentInnerHeight: function() {
                return $toggleContentInner.outerHeight();
            },

            scrollToOffsetTop: function() {
                var self = this;

                $htmlBody.animate({
                    scrollTop: this.getOffsetTop()
                }, options.scrollDuration, function() {
                    $el.trigger('afterScrollToOffsetTop.' + NAMESPACE, self);
                });

                return this;
            },

            isOpen: function() {
                return isOpen;
            },

            destroy: function() {
                // restore default state of DOM element
                $el.removeClass(options.openClass);
                $toggleContent.css('height', '');

                // remove attached event handlers
                $el.off('.' + NAMESPACE);

                // remove api from root element
                $el.data(NAMESPACE, null);
            }
        });

        // prepare open state on pageload
        if ( isOpen ) {
            api.open();
        }

        // expose api to data attribute
        $el.data(NAMESPACE, api);

        $el.trigger('afterInit.' + NAMESPACE, api);

        return api;
    };

}));
