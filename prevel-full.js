/* Prevel Framework v1.0.0
 * http://github.com/chernikovalexey/Prevel
 * 
 * Copyright 2011, Alexey Chernikov
 * Dual licensed under the:
 *  - GNU LGPL (http://opensource.org/licenses/lgpl-license.php)
 *  - MIT License (http://opensource.org/licenses/mit-license.php)
 * 
 * =====
 * 
 * Contains YASS v0.3.9
 * http://yass.webo.in
 * 
 * Copyright 2008-2009, Nikolay Matsievsky (sunnybear)
 * Dual licensed under the:
 *  - MIT License (http://opensource.org/licenses/mit-license.php)
 *  - GNU GPL (http://opensource.org/licenses/gpl-license.php)
**/
 
(function(win, doc, proto, ael, ge, cn, nn, u, newRegExp, n, ef, uf) {
/* Module: Core.js
 * Requirements: -
 * Provides: 
 *  - Extending objects (and their prototypes)
 *  - detecting the type of an object,
 *  - checking if object is empty
 *  - checking if value is in the given array
 *  - removing whitespaces from the both sides of a string
 *  - walking along the array
 *  - checking if object is an array
 *  - JSON parsing
 *  - browser detecting
 *  - converting object to string
 * 
 * Dual licensed under the:
 *  - GNU LGPL (http://opensource.org/licenses/lgpl-license.php)
 *  - MIT License (http://opensource.org/licenses/mit-license.php)
**/
 
(function() {
  
  // Short names for almost all the types
  var types = {
    'function':  'fn',
    'object':    'obj',
    'number':    'int',
    'string':    'str',
    'boolean':   'bool',
    'undefined': u
  };
  
  // Cached check if accessors are availiable
  var accessors = 
    !!Object[proto].__lookupGetter__ && 
    !!Object[proto].__lookupSetter__;
 
  // Local copy of `pl`
  var pl = (function() {
    return function(o, context, index) {
      return pl.fn ? new pl.fn.init(o, context, index) : uf;
    };
  })(); 
  
  // User agent
  var ua = win.navigator.userAgent.toLowerCase();
  
  pl.extend = function(Child, Parent) {
    if(!Parent) {
      Parent = Child;
      Child  = pl;
    }
    
    // If accessors are supported, they will be considered in extending
    if(accessors) {
      var getter, setter;
      for(var key in Parent) {
        getter = Parent.__lookupGetter__(key);
        setter = Parent.__lookupSetter__(key);
        
        if(getter || setter) {
          if(getter) Child.__defineGetter__(key, getter);
          if(setter) Child.__defineSetter__(key, setter);
        } else if(!Child[key]) { // Do not reassign (*)
          Child[key] = Parent[key];
        }
      }
    } else {
      for(var key in Parent) {
        if(!Child[key]) { // *
          Child[key] = Parent[key];
        }
      }
    }
    
    return Child;
  };
 
  pl.extend({
    // Extend the Object.prototype
    implement: function(Child, Parent) {
      return pl.extend(Child[proto], Parent);
    },
    
    // Uses native method, if it's availiable
    isArray: Array.isArray || function(o) {
      return Object[proto].toString.call(o) === '[object Array]';
    },
    
    type: function(o, is) {
      var iUf;
      if(pl.isArray(o)) {
        iUf = 'arr';
      } else if(o instanceof RegExp) {
        iUf = 'regexp';
      } else if(o instanceof Date) {
        iUf = 'date';
      } else if(o === n) {
        iUf = nn;
      } else {
        iUf = types[typeof o];
      }
      
      return is ? iUf === is : iUf;
    },
        
    empty: function(o) {
      // Separate check for an object
      if(pl.type(o, 'obj')) {
        for(var key in o) return false; 
        return true;
      }
      return (pl.type(o, nn) || pl.type(o, u)) || !o.length;
    },
    
    trim: function(text) { 
      // Uses native method, if it's availiable
      return String[proto].trim ? 
        text.trim() : 
        text.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },
    
    each: function(arr, func) {
      var key = arr.length;
      while(--key > -1) {
        // `this` ought to contains the current value
        func.call(arr[key], key, arr[key]);
      }
    },
    
    inArray: function(f, arr) {
      // Native check if it's availiable
      if(Array[proto].indexOf) return arr.indexOf(f);
      pl.each(arr, function(k) {
        if(f === this) {
          return k;
        }
      });
      return -1;
    },
    
    // Convert object to a 'param-string'
    toParams: function(o) {
      if(!pl.type(o, 'obj')) return o;
      
      var pieces = [];
      for(var key in o) {
        pieces.push(
          encodeURIComponent(key) + '=' + encodeURIComponent(o[key])
        );
      }
      return pieces.join('&');
    },
    
    JSON: function(data) {
      // Checks if JSON is valid
      return (!(/[^,:{}[]0-9.-+Eaeflnr-u nrt]/.test(
        data.replace(/"(.|[^"])*"/g, ''))) && eval('(' + data + ')')
      );
    },
    
    browser: function(name) {
      var isOpera  = /opera/i.test(ua),
          isChrome = /chrome/i.test(ua);
      var browser = {
        opera: isOpera,
        ie: !isOpera && /msie/i.test(ua),
        ie6: !isOpera && /msie 6/i.test(ua),
        ie7: !isOpera && /msie 7/i.test(ua),
        ie8: !isOpera && /msie 8/i.test(ua),
        firefox: /firefox/i.test(ua),
        chrome: isChrome,
        
        // Old Safari version
        safari_khtml: !isChrome && /khtml/i.test(ua),
        safari: !isChrome && /webkit|safari/i.test(ua)
      };
 
      for(var key in browser) {
        if(browser[key]) {
          return name === key || key;
        }
      }
    }
  });
 
  // Add `pl` to the global scope
  pl.extend(win, {pl: pl, prevel: pl});
})();
/* Module: Ajax.js
 * Requirements: Core.js
 * Provides: Ajax.
 * 
 * Dual licensed under the:
 *  - GNU LGPL (http://opensource.org/licenses/lgpl-license.php)
 *  - MIT License (http://opensource.org/licenses/mit-license.php)
**/
 
(function() {
  pl.extend({
    ajax: function(params) {
      var Request,
          load    = params.load || ef,
          error   = params.error || ef,
          success = params.success || ef;
            
      var requestPrepare = function() {
        if(win.XMLHttpRequest) { // Modern browsers
          Request = new XMLHttpRequest();
          
          if(Request.overrideMimeType) {
            Request.overrideMimeType('text/html');
          }
        } else if(win.ActiveXObject) { // Obsolete IE
          try {
            Request = new ActiveXObject('Msxml2.XMLHTTP');
          } catch(e) {
            try {
              Request = new ActiveXObject('Microsoft.XMLHTTP');
            } catch(er) {}
          }
        }
        
        if(!Request) {
          return alert('Could not create an XMLHttpRequest instance.');
        }
        
        // Fix related with `attachEvent`
        Request.onreadystatechange = function(e) {
          switch(Request.readyState) {
            case 1: load();
              break;
            case 4:
              if(Request.status === 200) {
                success(
                  params.dataType === 'json' ? // Parse JSON if necessary
                    pl.JSON(Request.responseText) : 
                    Request.responseText
                );
              } else {
                error(Request.status);
              }
              break;
          }
        };
      };
      
      // Common headers
      var headers = function(type) {
        // To identify that it's XHR
        Request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        
        if(type) {
          Request.setRequestHeader(
            'Content-type', 
            'application/x-www-form-urlencoded; charset=' + 
            (params.charset || 'utf-8')
          );
        }
      };
      
      params.type  = params.type || 'POST';
      params.data  = pl.toParams(params.data || {});
      params.async = params.async || true;
      
      requestPrepare();
      
      switch(params.type) {
        case 'POST':
          Request.open('POST', params.url, params.async);
          headers(1);
          Request.send(params.data);
          break;
        case 'GET':
          Request.open('GET', params.url + '?' + params.data, params.async);
          headers();
          Request.send(n);
          break;
      }
    }
  });
})();
 
/* Module: Dom.js
 * Requirements: Core.js
 * Provides: Different interactions with the DOM.
 * 
 * Dual licensed under the:
 *  - GNU LGPL (http://opensource.org/licenses/lgpl-license.php)
 *  - MIT License (http://opensource.org/licenses/mit-license.php)
**/
 
(function() {
  
  //Fix attribute names because of .setAttribute
  var fixAttr = {
    'className': 'class',
    'cssFloat':  'float',
    'htmlFor':   'for'
  };
  
  // Add `fn` to `pl`, at first (to reduce nested level)
  pl.extend({
    fn: {}, 
    find: function(selector, root) { // Basic
      return doc.querySelectorAll(root ? root + ' ' + selector : selector);
    }
  });
  
  pl.extend(pl.fn, {
    init: (function() {
      return function(o, params, index) {
        var _int;
        switch(pl.type(o)) {
          case 'str':
            var ne = o.match(newRegExp);
            if(ne) {
              _int = [create(ne[1], params)];
            } else {
              switch(pl.type(params)) {
                case 'str': // Get `o` from the context
                  switch(pl.type(index)) {
                    case 'int':
                      _int = [pl.find(o, params)[index]];
                      break;
                    default:
                    case u:
                      _int = pl.find(o);
                      break;
                  }
                  break;
                case 'int': // Work only with the element №{params}
                  _int = [pl.find(o)[params]];
                  break;
                default:
                case u: // Just find all the `o`
                  _int = pl.find(o);
                  break;
              }
            }
            break;
          case 'fn':
            Events.ready(o);
            break; 
          case 'obj':
            _int = [o];
            break;
        }
 
        this.elements = _int;
        this.selector = arguments;
        __this = this;
        return this;
      };
    })(), 
    
    len: function() {
      return this.elements.length;
    },
    
    last: function() {
      var l = this.elements.length;
      this.elements = [l ? this.elements[l - 1] : n];
      return this;
    },
    
    html: function(ins, to) {
      // Delegate to the common method
      return inner(this, 'innerHTML', ins, to);
    },
    
    text: function(ins, to) {
      // The same as in pl().html()
      return inner(this, innerText, ins, to);
    },
    
    get: function(index) {
      var e = this.elements;
      return e.length === 1 ? e[0] : (!pl.type(index, u) ? e[index] : e);
    },
    
    // Recursion's faster than loop
    parent: function(step) {
      if(!step) var step = 1;
      return rParent(this.elements[0], step);
    },
    
    remove: function() {
      pl.each(this.elements, function() {
        this.parentNode.removeChild(this);
      });
      return this;
    },
    
    addClass: function(c) {
      pl.each(this.elements, function() {
        // If this class already exists
        if(pl.inArray(c, this[cn].split(' ')) !== -1) return;
        this[cn] += (this[cn] ? ' ' : '') + c;
      });
      return this;
    },
    
    hasClass: function(c) {
      return pl.inArray(c, this.elements[0][cn].split(' ')) !== -1;
    },
    
    removeClass: function(c) {
      pl.each(this.elements, function() {
        var cl = this[cn].split(' ');
        var from = pl.inArray(c, cl);
        
        // If this class does not exist
        if(from === -1) return;
        
        cl.splice(from, 1);
 
        if(pl.empty(cl)) {
          this.removeAttribute('class');
        } else {
          this[cn] = cl.join(' ');
        }
      });
      return this;
    },
    
    attr: function(attr, set) {
      attr = fixAttr[attr] || attr;
 
      if(set) {
        pl.each(this.elements, function() {
          this.setAttribute(attr, set);
        }); 
      } else {
        switch(pl.type(attr)) {
          case 'obj':
            for(var key in attr) {
              arguments.callee.call(this, key, attr[key]);
            }
            break;
          case 'str':
            return this.elements[0].getAttribute(attr);
            break;
        }
      }
      return this;
    },
    
    removeAttr: function(attr) {
      attr = fixAttr[attr] || attr;
 
      pl.each(this.elements, function() {
        this.removeAttribute(attr);
      });
      return this;
    },
 
    css: function(style, set) {
      if(set) {
        style = curCSS.fixStyle(style);
        
        if(pl.type(set, 'int') && !curCSS.rmvPostFix[style]) {
          set += 'px';
        } else if(style === 'opacity') { // Cross-browser opacity
          var fixed = curCSS.fixOpacity(set),
              style = fixed[0],
              set   = fixed[1];
        }
        
        pl.each(this.elements, function() {
          this.style[style] = set;
        });
      } else {
        switch(pl.type(style)) {
          case 'obj':
            for(var key in style) {
              arguments.callee.call(this, key, style[key]);
            }
            break;
          case 'str':
            return curCSS.get(this.elements[0], style);
            break;
        }
      }
      return this;
    },
 
    each: function(fn) {
      pl.each(__this.elements, function() {
        fn.call(this);
      });
      return this;
    },
    
    bind: function(evt, fn) {
      // Delegate to the common method
      return Events.routeEvent(evt, fn, 1);
    },
    
    unbind: function(evt, fn) {
      // The same as in pl().bind()
      return Events.routeEvent(evt, fn, 0);
    },
    
    show: function() {
      pl.each(this.elements, function() {
        if(pl(this).css('display') !== 'none') return;           
        pl(this).css('display', this.getAttribute('plrd') || '');
      });
 
      return this;
    },
    
    hide: function() {
      pl.each(this.elements, function() {
        var display = pl(this).css('display');
        
        if(display === 'none') return;
        
        // 'Real-display' vault
        this.setAttribute('plrd', display);
        this.style.display = 'none';
      });
      return this;
    },
    
    // (!) Below there are a few repetitions of code which 
    //     help improving the perfomance
    
    after: function(o) {
      if(pl.type(o, 'obj')) {
        var el = doc.createElement('div');
        el.appendChild(o);
        o = el.innerHTML;
      }
      
      pl.each(this.elements, function() {
        var to = this;
        var el = doc.createElement('div');
        el.innerHTML = o;
        
        try {
          pl.each(el.childNodes, function() {
            to.parentNode.insertBefore(this, to.nextSibling);
          });
        } catch(er) {}
      });
      return this;
    },
    
    before: function(o) {
      if(pl.type(o, 'obj')) {
        var el = doc.createElement('div');
        el.appendChild(o);
        o = el.innerHTML;
      }
      
      pl.each(this.elements, function() {
        var to = this;
        var el = doc.createElement('div');
        el.innerHTML = o;
        
        try {
          pl.each(el.childNodes, function() {
            to.parentNode.insertBefore(this, to);
          });
        } catch(er) {}
      });
      return this;
    },
    
    append: function(o) {
      if(pl.type(o, 'obj')) {
        var el = doc.createElement('div');
        el.appendChild(o);
        o = el.innerHTML;
      }
      
      pl.each(this.elements, function() {
        var to = this;
        var el = doc.createElement('div');
        el.innerHTML = o;
        
        try {
          pl.each(el.childNodes, function() {
            to.appendChild(this);
          });
        } catch(er) {}
      });
      return this;
    },
    
    prepend: function(o) {
      if(pl.type(o, 'obj')) {
        var el = doc.createElement('div');
        el.appendChild(o);
        o = el.innerHTML;
      }
      
      pl.each(this.elements, function() {
        var to = this;
        var el = doc.createElement('div');
        el.innerHTML = o;
        
        try {
          pl.each(el.childNodes, function() {
            to.insertBefore(this, to.firstChild);
          });
        } catch(er) {}
      });
      return this;
    }
  });
  
  pl.implement(pl.fn.init, pl.fn);
 
  //Private methods
  var innerText = pl.browser('ie') ? 'innerText' : 'textContent';
  var Events = {
    // DOMContentLoaded
    ready: (function() {
      this.readyList = []; // Functions to be called
      this.bindReady = function(handler) {
        var called = false;
    
        function ready() {
          if(called) return;
          called = true;
          handler();
        }
    
        if(doc[ael]) {
          Events.attaches.bind(doc, 'DOMContentLoaded', ready);
        } else if(doc.attachEvent) {
          if(doc.documentElement.doScroll && win === win.top) {
            function tryScroll() {
              if(called) return;
              if(!doc.body) return;
              try {
                doc.documentElement.doScroll('left');
                ready();
              } catch(e) {
                setTimeout(tryScroll, 0);
              }
            }
            tryScroll();
          }
    
          Events.attaches.bind(doc, 'readystatechange', function() {
            if(doc.readyState === 'complete') {
              ready();
            }
          });
        }
    
        Events.attaches.bind(win, 'load', ready);
      };
        
      var that = this;
        
      return function(handler) {         
        if(!that.readyList.length) {
          that.bindReady(function() {
            pl.each(that.readyList, function(k) {
              this();
            });
          });
        }
  
        that.readyList.push(handler);
      };
    })(),
    
    // Cross-browser event adding and removing
    // http://javascript.ru/tutorial/events/crossbrowser
    attaches: (function() {
      var turns = 0;
      
      function fixEvt(event) {
        event = event || win.event;
        
        if(event.fixed) {
          return event;
        }
        event.fixed = true;
        
        event.preventDefault = event.preventDefault || function() {
          this.returnValue = false;
        };    
        event.stopPropagation = event.stopPropagation || function() {
          this.cancelBubble = true;
        };
        
        if(!event.target) {
          event.target = event.srcElement;
        }
        
        if(!event.which && event.button) {
          event.which = (event.button & 1 ? 
            1 : 
            (event.button & 2 ? 
              3 : 
              (event.button & 4 ? 2 : 0)
            )
          );
        }
        
        return event;
      }
      
      function handleCommon(e) {
        e = fixEvt(e);
        
        var handlerList = this.evt[e.type];
        
        for(var key in handlerList) {
          var updated = handlerList[key].call(this, e);
          
          if(!updated) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
      
      return {
        bind: function(el, evt, fn) {
          if(pl.browser('ie') && el.setInterval && el !== win) {
            el = win;
          }
          
          if(!fn.turnID) {
            fn.turnID = ++turns;
          }
          
          if(!el.evt) {
            el.evt = {};
            
            el.handleEvt = function(e) {
              if(!pl.type(Events.attaches, u)) {
                return handleCommon.call(el, e);
              }
            };
          }
          
          if(!el.evt[evt]) {
            el.evt[evt] = {};
            
            if(el[ael]) {
              el[ael](evt, el.handleEvt, false);
            } else {
              el.attachEvent('on' + evt, el.handleEvt);
            }
          }
          
          el.evt[evt][fn.turnID] = fn;
        },
        
        unbind: function(el, evt, fn) {
          var handlerList = el.evt && el.evt[evt];
          if(!handlerList) return;
          
          delete handlerList[fn.turnID];
          
          for(var key in handlerList) return;
          
          if(el.removeEventListener) {
            el.removeEventListener(evt, el.handleEvt, false);
          } else {
            el.detachEvent('on' + evt, el.handleEvt);
          }
          
          delete el.evt[evt];
          
          for(var key in el.evt) return;
          
          try {
            delete el.handleEvt;
            delete el.evt;
          } catch(e) {
            el.removeAttribute('handleEvt');
            el.removeAttribute('evt');
          }
        }
      };
    })(),
        
    routeEvent: function(evt, fn, flag) {
      if(fn) {
        if(flag) {
          pl.each(__this.elements, function() {
            Events.attaches.bind(this, evt, fn);
          });
        } else {
          pl.each(__this.elements, function() {
            Events.attaches.unbind(this, evt, fn);
          });
        }          
      } else {
        for(var key in evt) {
          arguments.callee(key, evt[key], flag);
        }
      }
      return __this;
    }
  };
 
  var inner = function(e, method, ins, to) {
    var init = e;
    var e = init.elements[0];
 
    if(!ins) {
      return e[method];
    } else {
      if(!to) {
        e[method] = ins;
      } else {
        switch(to) {
          case 1:
            pl.each(init.elements, function() {
              this[method] += ins;
            });
            break;
          case -1:
            pl.each(init.elements, function() {
              this[method] = ins + this[method];
            });
            break;
        }
      }
      return init;
    }
  };
  
  // Create new element
  var create = function(o, params) {
    var ns = doc.createElement(o);
    return params ? pl.extend(ns, params) : ns;
  };
  
  var curCSS = {
    // E.g. 'font-siz' to 'fontSize'
    fixStyle: function(str) {
      if(!str.match('-')) return str;
      var parts = str.split('-');
      return parts[0] + parts[1].toUpperCase();  
    },
    
    // Cross-browser opacity
    fixOpacity: function(val) {
      var op    = 'opacity', 
          fixed = [op, val];
 
      switch(pl.browser()) {
        case 'ie7':
          fixed[0] = 'filter';
          fixed[1] = 'alpha(' + op + '=' + (val * 100) + ');';
          break;
        case 'ie8':
          fixed[0] = '-ms-filter';
          fixed[1] = 'alpha(' + op + '=' + (val * 100) + ')';
          break;
        case 'safari_khtml':
          fixed[0] = '-khtml-' + op;
          break;
        case 'firefox':
          fixed[0] = '-moz-' + op;
          break;
      }
      
      return fixed;
    },
    
    fixReturnOpacity: function(val) {
      return val ? 
        (val.match('opacity=') ? val.match('=([0-9]+)')[1] / 100 : val) : 
        n;
    },
    
    rmvPostFix: {
      zIndex: true, 
      fontWeight: true, 
      opacity: true, 
      zoom: true, 
      lineHeight: true
    },
    
    // Get computed style
    get: function(o, style) {
      if(style === 'opacity') {
        var fixed = curCSS.fixOpacity(0),
            style = fixed[0];
      }
      return curCSS.fixReturnOpacity(
        o.currentStyle ? o.currentStyle[style] : 
          win.getComputedStyle(o, n).getPropertyValue(style)
      );
    }
  };
  
  // "Deep parent" (pl().parent())
  var rParent = function(elem, step) {
    if(step > 0) {
      return rParent(elem.parentNode, --step);
    }
    return elem;
  };
})();
})(this, document, 'prototype', 'addEventListener', 
   'getElement', 'className', 'null', 'undef', 
   '<([A-z]+)>', null, function() {});