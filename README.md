# toggleWidget
[![license](https://img.shields.io/github/license/floriancapelle/jquery-toggle-widget.svg?style=flat-square&maxAge=3600)](https://github.com/floriancapelle/jquery-toggle-widget/blob/master/LICENSE)
[![GitHub release](https://img.shields.io/github/release/floriancapelle/jquery-toggle-widget.svg?style=flat-square&maxAge=3600)](https://github.com/floriancapelle/jquery-toggle-widget/releases)
[![Code Climate](https://codeclimate.com/github/floriancapelle/jquery-toggle-widget/badges/gpa.svg)](https://codeclimate.com/github/floriancapelle/jquery-toggle-widget)

toggleWidget is a lightweight jQuery plugin for showing and hiding content accordion-like.
Animations work with CSS transitions. State changes will be published as usual jQuery events.
Can't be simpler.

- CSS & HTML is fully customizable
- Easy configuration
- Minimal HTML & CSS, may be fully replaced with your code if more comfortable for you
- Requires jQuery 2+
- Browser Support: Evergreen browsers & IE9+

# TODO: CSS File

## Demo

![jQuery ToggleWidget Demo](https://raw.githubusercontent.com/floriancapelle/jquery-toggle-widget/master/demo.gif)

## Install

Download latest release and place the following css and js files in the proper directories.

Add a link to the css file in your `<head>`:
```html
<link rel="stylesheet" href="css/jquery.toggle-widget.css"/>
```

Then, before your closing ```<body>``` tag add:
```html
<script src="js/jquery.toggle-widget.js"></script>
```

*Make sure to check and maybe edit the paths to fit your file structure.*

## Usage

See the index.html for examples.

### API

The api is accessable via data attribute 'toggleWidget'.
Like ```$('.your-toggle').data('toggleWidget')```.

Method | Arguments | Description
------ | -------- | -----------
open | - | open the 'accordion'
close | - | close the 'accordion'
toggle | - | toggle the 'accordion'
enable | - | enable open/close functionality
disable | - | disable open/close functionality
getOffsetTop | - | get offset top value shifted by 'offsetTopShift'
getContentInnerHeight | - | get the height of the content-inner element (using jQuery.outerHeight)
scrollToOffsetTop | - | scroll the viewport to the offset top position
destroy | - | remove all functionality, events and api from the toggle element

### Configuration

**BE AWARE:** When changing classes, style them with the least required styles as well (see the css file).
See the demo for examples.

Key | Type | Default | Description
------ | ---- | ------- | -----------
enabled | boolean | true | whether the plugin will be enabled (on startup), use enable/disable functions to manipulate this state.
toggleBtnSelector | string|boolean | ```toggle-widget__toggle-btn``` | will be used as DOM filter in the event handler. Set to false to disable event handling (and do it manually).
toggleBtnTpl | string|boolean | see js file | toggle btn template, will be appended to the root element if no element is matching 'toggleBtnSelector'. Set to false to disable.
toggleContentSelector | string|function | ```.toggle-widget__content``` | root element find() filter string or function to return the target toggle content element. Function context is api, first argument root element. 'toggleContent' may be used, but is deprecated and will be removed.
openClass | string | ```toggle-widget--open``` | open state class
offsetTopShift | number | -20 | shift the offset top value by this before returning. Set to 0 to disable.
scrollDuration | number | 300 | scrollToOffsetTop() animation duration

## License

[MIT License](https://github.com/floriancapelle/jquery-toggle-widget/blob/master/LICENSE)

------------------

## Questions & Contribution
Please feel free to reach out to me if you have any questions, suggestions or contributions.