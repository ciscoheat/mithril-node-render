'use strict';

var VOID_TAGS = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr',
    'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

function isArray(thing) {
  return Object.prototype.toString.call(thing) === '[object Array]';
}

function camelToDash(str) {
  return str.replace(/\W+/g, '-')
            .replace(/([a-z\d])([A-Z])/g, '$1-$2');
}

// shameless stolen from https://github.com/punkave/sanitize-html
function escapeHtml(s) {
  if (s === 'undefined') {
    s = '';
  }
  if (typeof(s) !== 'string') {
    s = s + '';
  }
  return s.replace(/\&/g, '&amp;').replace(/</g, '&lt;').replace(/\>/g, '&gt;').replace(/\"/g, '&quot;');
}

function createAttrString(attrs) {
  if (!attrs || !Object.keys(attrs).length) {
    return '';
  }

  return Object.keys(attrs).map(function(name) {
    if (typeof attrs[name] === 'function') {
      return;
    }
    if (typeof attrs[name] === 'boolean') {
      return attrs[name] ? ' ' + name : '';
    }
    if (name === 'style') {
      var styles = attrs.style;
      if (typeof styles === 'string') {
        return ' style="' + styles + '"';
      }
      return ' style="' + Object.keys(styles).map(function(property) {
        return [camelToDash(property).toLowerCase(), styles[property]].join(':');
      }).join(';') + '"';
    }
    return ' ' + (name === 'className' ? 'class' : name) + '="' + attrs[name] + '"';
  }).join('');
}

function createChildrenContent(view) {
  if(isArray(view.children) && !view.children.length) {
    return '';
  }

  return render(view.children);
}

function render(view) {
  var type = typeof view;

  if (type === 'string') {
    return escapeHtml(view);
  }

  if(type === 'number' || type === 'boolean') {
    return view;
  }

  if (!view) {
    return '';
  }

  if (isArray(view)) {
    return view.map(render).join('');
  }

  if (view.$trusted) {
    return '' + view;
  }
  var children = createChildrenContent(view);
  if (!children && VOID_TAGS.indexOf(view.tag) >= 0) {
    return '<' + view.tag + createAttrString(view.attrs) + '>';
  }
  return [
    '<', view.tag, createAttrString(view.attrs), '>',
    children,
    '</', view.tag, '>',
  ].join('');
}

module.exports = render;
