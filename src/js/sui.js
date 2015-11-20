/**
 * 主要测试IE8+，firefox浏览器。
 * 包含一些工具类，数据结构，面向对象，浏览器版本判断，数据类型判断等。不能包含与dom相关的代码。
 */

/**
 * Sui全局对象，涵括常规的公用方法
 * 定义sui的版本号
 * @module Sui
 */
if(! window.Sui){
   // 这里为了避免加载两个sui.js文件,初始化两次Sui
   Sui = {
      version : '1.0'
   };
}


/**
 * 拷贝属性，将对象c中的属性拷贝到对象o中。
 */
Sui.apply = function(dest, source) {
    if (dest && source && typeof source == 'object') {
        for (var p in source) {
            dest[p] = source[p];
        }
    }
    return dest;
};

(function() {

    var idSeed = 0,
        toString = Object.prototype.toString,
        ua = navigator.userAgent.toLowerCase(),
        check = function(r) {
            return r.test(ua);
        },
        DOC = document,
        isStrict = DOC.compatMode == "CSS1Compat",
        isOpera = check(/opera/),
        isChrome = check(/chrome/),
        isWebKit = check(/webkit/),
        isSafari = !isChrome && check(/safari/),
        isSafari2 = isSafari && check(/applewebkit\/4/), // unique to Safari 2
        isSafari3 = isSafari && check(/version\/3/),
        isSafari4 = isSafari && check(/version\/4/),
        isIE = 'CollectGarbage' in window,
        isIE7 = isIE && check(/msie 7/),
        isIE8 = isIE && check(/msie 8/),
        isIE6 = isIE && !isIE7 && !isIE8,
        isGecko = !isWebKit && check(/gecko/),
        isGecko2 = isGecko && check(/rv:1\.8/),
        isGecko3 = isGecko && check(/rv:1\.9/),
        isBorderBox = isIE && !isStrict,
        isWindows = check(/windows|win32/),
        isMac = check(/macintosh|mac os x/),
        isAir = check(/adobeair/),
        isLinux = check(/linux/),
        isSecure = /^https/i.test(window.location.protocol);

    // 解决IE6，不缓存背景图片的问题。
    if (isIE6) {
        try {
            DOC.execCommand("BackgroundImageCache", false, true);
        } catch(e) {
        }
    }

    Sui.apply(Sui, {

        /**
         * 标准模式
         */
        isStrict : isStrict,
        /**
         * 采用SSL
         */
        isSecure : isSecure,

        /**
         * 拷贝属性，如果对象o中不存在某个属性，则从对象c中，将属性拷贝到对象o中。
         * @method applyIf
         * @param {Object} 目标对象
         * @param {Object} 源对象
         * @return {Object} 返回目标对象
         */
        applyIf : function(o, c) {
            if (o) {
                for (var p in c) {
                    if (!Sui.isDefined(o[p])) {
                        o[p] = c[p];
                    }
                }
            }
            return o;
        },

        /**
         * 删除对象中的属性
         * @method extend
         * @param {Object} o
         * @param {Array} props 一组属性名
         */
        removeProperties: function (o, props) {
            if (Sui.isObject(o) && Sui.isNotEmpty(props)) {
                for (var i = 0; i < props.length; i++) {
                    delete o[props[i]];
                }
            }
        },
        
        /**
         * 面向对象继承
         * @method  extend
         * @ {Object} 被继承对象
         * @ {Object} 新对象相关属性
         */
        extend : function() {
            // inline overrides
            var io = function(o) {
                for (var m in o) {
                    this[m] = o[m];
                }
            };
            var oc = Object.prototype.constructor;

            return function(sb, sp, overrides)  {
                if (Sui.isObject(sp)) {
                    overrides = sp;
                    sp = sb;
                    sb = overrides.constructor != oc ? overrides.constructor : function() {
                        sp.apply(this, arguments);
                    };
                }
                var F = function() {
                },
                    sbp,
                    spp = sp.prototype;

                F.prototype = spp;
                sbp = sb.prototype = new F();
                sbp.constructor = sb;
                sb.superclass = spp;
                if (spp.constructor == oc) {
                    spp.constructor = sp;
                }
                sb.override = function(o) {
                    Sui.override(sb, o);
                };
                sbp.superclass = sbp.supr = (function() {
                    return spp;
                });
                sbp.override = io;
                Sui.override(sb, overrides);
                sb.extend = function(o) {
                    return Sui.extend(sb, o);
                };
                return sb;
            };
        }(),

        /**
         * 给类添加属性或方法，或覆盖类的属性或方法。
         * 示例:<pre><code>
         * sui.override(MyClass, {
         * newMethod1: function(){
         * // etc.
         * },
         * newMethod2: function(foo){
         * // etc.
         * }
         * });
         * </code></pre>
         * @method override
         * @param {Object} origclass 要覆盖属性和方法定义的类
         * @param {Object} overrides 定义方法列表,去覆盖origclass类的属性或方法。
         */
        override : function(origclass, overrides) {
            if (overrides) {
                var p = origclass.prototype;
                Sui.apply(p, overrides);
                if (Sui.isIE && overrides.hasOwnProperty('toString')) {
                    p.toString = overrides.toString;
                }
            }
        },

        /**
         * 创建命名空间，示例:
         * <pre><code>
         * sui.namespace('Company', 'Company.data');
         * sui.namespace('Company.data'); // equivalent and preferable to above syntax
         * Company.Widget = function() { ... }
         * Company.data.CustomStore = function(config) { ... }
         * </code></pre>
         * @method namespace
         * @param {String} 命名空间字符串，可传递任意个。
         * @return {Object} 返回命名空间对象。(如果有多个参数，返回最后一个创建的命名空间。)
         */
        namespace : function() {
            var o, d;
            Sui.each(arguments, function(v) {
                d = v.split(".");
                o = window[d[0]] = window[d[0]] || {};
                Sui.each(d.slice(1), function(v2) {
                    o = o[v2] = o[v2] || {};
                });
            });
            return o;
        },

        /**
         * 将一个对象转换成编码的URL。例如： sui.urlEncode({foo: 1, bar: 2}); 将返回 "foo=1&bar=2"。
         * @method urlEncode
         * @param {Object} o 对象
         * @param {String} pre (可选) 添加到转换后的url的前面。
         * @return {String} 编码的URL
         */
        urlEncode : function(o, pre) {
            var empty,
                buf = [],
                e = encodeURIComponent;

            Sui.iterate(o, function(key, item) {
                empty = Sui.isEmpty(item);
                Sui.each(empty ? key : item, function(val) {
                    buf.push('&', e(key), '=', (!Sui.isEmpty(val) && (val != key || !empty)) ? (Sui.isDate(val) ? Sui.encode(val).replace(/"/g, '') : e(val)) : '');
                });
            });
            if (!pre) {
                buf.shift();
                pre = '';
            }
            return pre + buf.join('');
        },

        /**
         * 将一个URL转换成一个对象。例如: <pre><code>
         * sui.urlDecode("foo=1&bar=2"); // returns {foo: "1", bar: "2"}
         * sui.urlDecode("foo=1&bar=2&bar=3&bar=4", false); // returns {foo: "1", bar: ["2", "3", "4"]}
         * </code></pre>
         * @method urlDecode
         * @param {String} string
         * @param {Boolean} overwrite (可选) 如果存在同名的属性，后面的属性将覆盖前面的，而不是创建一个数组。 (默认值为false).
         * @return {Object}
         */
        urlDecode : function(string, overwrite) {
            if (Sui.isEmpty(string)) {
                return {};
            }
            var obj = {},
                pairs = string.split('&'),
                d = decodeURIComponent,
                name,
                value;
            Sui.each(pairs, function(pair) {
                pair = pair.split('=');
                name = d(pair[0]);
                value = d(pair[1]);
                obj[name] = overwrite || !obj[name] ? value :
                    [].concat(obj[name]).concat(value);
            });
            return obj;
        },

        /**
         * 迭代处理数组中的每个元素
         * @method each
         * @param {Array} array 如果不是数组的话，则包装成只有一个元素的数组
         * @param {Function} fn 回调函数
         * @param {Object} scope 作用域
         * @return {Number} 如果存在回调函数处理第i个元素的值返回false，则返回i。不存在的话，则返回undefined。
         */
        each : function(array, fn, scope) {
            if (Sui.isEmpty(array, true)) {
                return ;
            }
            if (Sui.isPrimitive(array)) {
                array = [array];
            }
            for (var i = 0, len = array.length; i < len; i++) {
                if (fn.call(scope || array[i], array[i], i, array) === false) {
                    return i;
                }
            }
        },

        /**
         * 迭代处理对象中的每个属性。
         * @method iterate
         * @param {Object} obj 对象
         * @param {Function} fn 回调函数
         * @param {Object} scope 作用域
         */
        iterate : function(obj, fn, scope) {
            if (Sui.isEmpty(obj)) {
                return;
            }
            if (Sui.isObject(obj)) {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        if (fn.call(scope || obj, prop, obj[prop], obj) === false) {
                            return;
                        }
                    }
                }
            }
        },

        /**
         * <p>返回值是否为空</p>
         * <p>下面的值，将判断为空<div><ul>
         * <li>null</li>
         * <li>undefined</li>
         * <li>空的数组</li>
         * <li>长度为0的字符串(除非<tt>allowBlank</tt>参数的值为<tt>true</tt>)</li>
         * </ul></div>
         * @method isEmpty
         * @param {Mixed} v 判断该值是否为空
         * @param {Boolean} allowBlank (可选) 如果值为true，则允许空字符串。 (默认值为false)
         * @return {Boolean}
         */
        isEmpty : function(v, allowBlank) {
            return v === null || v === undefined || ((Sui.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
        },
        /**
         * 返回值是否不为空，与isEmpty类似
         * @method isNotEmpty
         * @param {Mixed} v 判断该值是否为空
         * @param {Boolean} allowBlank (可选) 如果值为true，则允许空字符串。 (默认值为false)
         * @return {Boolean}
         */
        isNotEmpty : function(v, allowBlank) {
            return ! this.isEmpty.apply(this, arguments);
        },

        /**
         * 如果传递的参数为数组，则返回true，否则返回false。
         * @method isArray
         * @param {Mixed} v 判断该值是否为数组
         * @return {Boolean}
         */
        isArray : function(v) {
            return toString.apply(v) === '[object Array]';
        },

        /**
         * 如果传递的参数为日期对象，则返回true，否则返回false。
         * @method isDate
         * @param {Object} v
         * @return {Boolean}
         */
        isDate : function(v) {
            return toString.apply(v) === '[object Date]';
        },

        /**
         * 如果传递的参数为对象，则返回true，否则返回false。
         * @method isObject
         * @param {Mixed} v 判断该值是否是对象
         * @return {Boolean}
         */
        isObject : function(v) {
            return !!v && Object.prototype.toString.call(v) === '[object Object]';
        },

        /**
         * 如果传递的参数为字符串，数字或布尔值，则返回true，否则返回false。
         * @method isPrimitive
         * @param {Mixed} v
         * @return {Boolean}
         */
        isPrimitive : function(v) {
            return Sui.isString(v) || Sui.isNumber(v) || Sui.isBoolean(v);
        },

        /**
         * 如果传递的参数为函数对象，则返回true，否则返回false。
         * @method isFunction
         * @param {Mixed} v
         * @return {Boolean}
         */
        isFunction : function(v) {
            return toString.apply(v) === '[object Function]';
        },

        /**
         * 如果传递的参数为数字,并且不是无穷数，则返回true，否则返回false。
         * @method isNumber
         * @param {Mixed} v 判断该值是否是数字,并且不是无穷数
         * @return {Boolean}
         */
        isNumber : function(v) {
            return typeof v === 'number' && isFinite(v);
        },

        /**
         * 如果传递的参数为字符串，则返回true，否则返回false。
         * @method isString
         * @param {Mixed} v 判断该值是否是字符串
         * @return {Boolean}
         */
        isString : function(v) {
            return typeof v === 'string';
        },

        /**
         * 如果传递的参数为布尔值，则返回true，否则返回false。
         * @method isBoolean
         * @param {Mixed} v
         * @return {Boolean}
         */
        isBoolean : function(v) {
            return typeof v === 'boolean';
        },

        /**
         * 如果传递的参数为undefined，则返回true，否则返回false。
         * @method isDefined
         * @param {Mixed} v
         * @return {Boolean}
         */
        isDefined : function(v) {
            return typeof v !== 'undefined';
        },

        /**
         * 如果浏览器是Opera，则值为True。
         * @property isOpera
         * @type Boolean
         */
        isOpera : isOpera,
        /**
         * 如果浏览器是WebKit，则值为True。
         * @property  isWebKit
         * @type Boolean
         */
        isWebKit : isWebKit,
        /**
         * 如果浏览器是Chrome，则值为True。
         * @property isChrome
         * @type Boolean
         */
        isChrome : isChrome,
        /**
         * 如果浏览器是 Safari，则值为True。
         * @property isSafari
         * @type Boolean
         */
        isSafari : isSafari,
        /**
         * 如果浏览器是 Safari 3.x，则值为True。
         * @property isSafari3
         * @type Boolean
         */
        isSafari3 : isSafari3,
        /**
         * 如果浏览器是 Safari 4.x，则值为True。
         * @property isSafari4
         * @type Boolean
         */
        isSafari4 : isSafari4,
        /**
         * 如果浏览器是 Safari 2.x，则值为True。
         * @property isSafari2
         * @type Boolean
         */
        isSafari2 : isSafari2,
        /**
         * 如果浏览器是 Internet Explorer，则值为True。
         * @property isIE
         * @type Boolean
         */
        isIE : isIE,
        /**
         * 如果浏览器是 Internet Explorer 6.x，则值为True。
         * @property isIE6
         * @type Boolean
         */
        isIE6 : isIE6,
        /**
         * 如果浏览器是 Internet Explorer 7.x，则值为True。
         * @property isIE7
         * @type Boolean
         */
        isIE7 : isIE7,
        /**
         * 如果浏览器是 Internet Explorer 8.x，则值为True。
         * @property isIE8
         * @type Boolean
         */
        isIE8 : isIE8,
        /**
         * 如果浏览器使用 Gecko(例如 Mozilla, Firefox)，则值为True。
         * @property isGecko
         * @type Boolean
         */
        isGecko : isGecko,
        /**
         * 如果浏览器使用  pre-Gecko 1.9(例如 Firefox 2.x)，则值为True。
         * @property isGecko2
         * @type Boolean
         */
        isGecko2 : isGecko2,
        /**
         * 如果浏览器使用  Gecko 1.9+(例如 Firefox 3.x)，则值为True。
         * @property isGecko3
         * @type Boolean
         */
        isGecko3 : isGecko3,

        /**
         * 如果平台是linux，则值为True。
         * @property isLinux
         * @type Boolean
         */
        isLinux : isLinux,
        /**
         * 如果平台是 Windows，则值为True。
         * @property isWindows
         * @type Boolean
         */
        isWindows : isWindows,
        /**
         * 如果平台是 Mac OS，则值为True。
         * @property isMac
         * @type Boolean
         */
        isMac : isMac,
        /**
         * 获取某个dom的盒模型宽度（连同padding，border值）;
         * @method getDomWidth
         * @type float
         */
        getDomWidth:function(obj){
            var obj = $(obj);
            return   parseFloat(obj.css('paddingLeft')) + parseFloat(obj.css('paddingRight'))
                + (parseFloat(obj[0].style.borderLeftWidth) || 0) + (parseFloat(obj[0].style.borderRightWidth) || 0) + obj.width();
        },
        /**
         * 获取某个dom的盒模型高度（连同padding，border值）;
         * @method getDomHeight
         * @type float
         */
        getDomHeight:function(obj){
            var obj = $(obj);
            return   parseFloat(obj.css('paddingTop')) + parseFloat(obj.css('paddingBottom'))
                + ( parseFloat(obj[0].style.borderTopWidth) || 0 ) + ( parseFloat(obj[0].style.borderBottomWidth) || 0) + obj.height();
        },
        /**
         * 获取DOM元素的垂直padding和边框宽之和
         * @method getDomPaddingV
         * @param {String} id
         */
        getDomPaddingV: function (id) {
            var obj = $('#' + id);
            if (obj.length) {
                return  parseFloat(obj.css('paddingTop')) + parseFloat(obj.css('paddingBottom')) +
                    ( parseFloat(obj.css('borderTopWidth')) || parseFloat(obj[0].style.borderTopWidth) || 0 ) +
                    ( parseFloat(obj.css('borderBottomWidth')) || parseFloat(obj[0].style.borderBottomWidth) || 0 );
            } else {
                return 0;
            }

        }

    });

})();

Sui.namespace("Sui.util");

/**
 * 通过Sui进行增强的数组列表类
 * @class Sui.util.ArrayList
* */
Sui.util.ArrayList = function() {

    var innerArray = [];

    Sui.apply(this, {
        /**
         * 交换两个内部成员的位置
         * @method  exchangeElement
         * @param {Number} upIndex
         * @param {Number} downIndex
         * */
        exchangeElement : function(upIndex, downIndex) {
            Sui.ArrayUtil.exchangeElement(innerArray, upIndex, downIndex);
        },
        /**
         * 获取某对象在数组列表中的索引值
         * @method indexOf
         * @param {Object} obj
         * @return {Number}
         **/
        indexOf : function(obj) {
            return Sui.ArrayUtil.indexOf(innerArray, obj);
        },
        /**
         *增加一个新对象到数组列表的某个索引位置
         * @method add
         * @param {Object} object
         * @param {Number} index
         */
        add : function(object, index) {
            Sui.ArrayUtil.add(innerArray, object, index);
        },
        /**
         * 删除某个对象
         * @param {Object} object
         */
        remove : function(object) {
            Sui.ArrayUtil.remove(innerArray, object);
        },
        /**
         * 融合一个新的数组列表到原有数组列表中
         * @param {Array} array
         */
        addAll : function(array) {
            Sui.ArrayUtil.addAll(innerArray, array);
        },
        /**
         * 获取数组列表的长度
         * @return {Number}
         */
        count : function() {
            return innerArray.length;
        },
        /**
         * 获取数组列表的长度
         * @return {Number}
         */
        size : function() {
            return this.count();
        },
        /**
         * 获取数组列表中的某一项
         * @param {Number} i 该项索引值
         * @return {Object}
         */
        get : function(i) {
            return innerArray[i];
        }
    });
    return this;
};

/**
 * 延迟任务类
 * @class Sui.util.DelayedTask
 * @constructor
 * @param {Function} fn 执行函数
 * @param {Object} scope 作用域
 * @param {Array} args 参数数组
* */
Sui.util.DelayedTask = function(fn, scope, args) {
    var id = null;

    var call = function() {
        id = null;
        fn.apply(scope, args || []);
    };
    /**
     * 设置延迟任务，如果在构造时有初始化过newFn, newScope, newArgs，则可以省略
     * @method delay
     * @param {Number} delay 延迟时间,以毫秒为单位
     * @param {Function} newFn  执行函数
     * @param {} newScope 作用域
     * @param {} newArgs 参数
     */
    this.delay = function(delay, newFn, newScope, newArgs) {
        if (id) {
            this.cancel();
        }
        fn = newFn || fn;
        scope = newScope || scope;
        args = newArgs || args;
        if (!id) {
            id = setTimeout(call, delay);
        }
    };

    /**
     * 取消任务
     * @method cancel
     *
     */
    this.cancel = function() {
        if (id) {
            clearTimeout(id);
            id = null;
        }
    };
};
/**
 * 观察者类，作为多种复杂组件的父类
 * @class Sui.util.Observable
 * @constructor
 * @param config
 * @param {Array} config.listeners 监听器数组
* */
Sui.util.Observable = function(config) {

    this.events = {};

    if (config) {
        if (config.listeners) {
            this.addListeners(config.listeners);
        }
    }

};

Sui.util.Observable.prototype = {

    events : null,
    /**
     * 触发事件
     * @method fireEvent
     * @param {String} eventName 事件名称
     * @param {Object} eventObject 事件对象
     */
    fireEvent : function(eventName, eventObject) {

        eventObject = eventObject || {};

        eventName = eventName.toLowerCase();

        Sui.applyIf(eventObject, {
            target : this
        });

        var listeners = this.getListeners(eventName);
        if (listeners) {
            for (var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];
                var ret = listener.fn.call(listener.scope, eventObject);
                if (ret === false) {
                    return false;
                }
            }
        }
    },
    /**
     * 获取某个事件名称对应的执行对象数组
     * @method getListeners
     * @param {String} eventName
     * @return {Array}
     */
    getListeners : function(eventName) {
        return this.events[eventName];
    },

    addListeners : function(listeners) {
        for (var eventName in listeners) {
            var func = listeners[eventName];
            this.addListener(eventName, func);
        }
    },

    /**
     * 是否已经包含监听器
     * @method containListener
     * @param {String} EventName 事件名称
     * @param {Function} fn 监听器对应的执行函数
     * @param {Object} scope 监听器对应的函数作用域
     */
    containListener : function(eventName, fn, scope){
        var listeners = this.events[eventName];
        if (listeners) {
            for(var i=0; i<listeners.length; i++){
                if(listeners[i].fn == fn && listeners[i].scope == scope){
                    return true;
                }
            }
        }
        return false;
    },
    /**
     * 添加一个监听器，同方法on
     * @method addListener
     * @param {String} eventName 事件名称
     * @param {Function} fn 如果fn是一个字符串，则认为是从后台返回过来的函数名
     * @param {Object} scope
     */
    addListener : function(eventName, fn, scope) {
        eventName = eventName.toLowerCase();
        var listeners = this.events[eventName];
        if (! listeners) {
            listeners = [];
            this.events[eventName] = listeners;
        }

        // 如果fn是一个字符串，则认为是从后台返回过来的函数名
        if (Sui.isString(fn)) {
            fn = eval(fn);
        }

        listeners.push({
            fn : fn,
            scope : scope
        });

    },
    /**
     * 删除某个监听器，同方法un
     * @method removeListener
     * @param {String} evnetName 事件名称
     * @param {Function} fn 执行函数
     * @param {Object} scope 作用域
     */
    removeListener : function(eventName, fn, scope) {
        eventName = eventName.toLowerCase();
        var listeners = this.getListeners(eventName);
        if (listeners) {
            for (var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];
                if (listener.fn == fn && listener.scope == scope) {
                    Sui.ArrayUtil.removeByIndex(listeners, i);
                    break;
                }
            }
        }
    },
    /**
     * 清空所有监听器
     * @method clearListeners
     */
    clearListeners :function(){
    	this.events = {};
    },
    
    /**
     * 广播对象的事件
     * @method broadcastObjectEvent
     * @param {Object} object
     * @param {String} eventName
     */
    broadcastObjectEvent : function(object, eventName){
        var thisObject = this;
        object.addListener(eventName, function(e){
            thisObject.fireEvent(eventName, e);
        });
    }
};

Sui.util.Observable.prototype.on = Sui.util.Observable.prototype.addListener;
Sui.util.Observable.prototype.un = Sui.util.Observable.prototype.removeListener;

/**
 * 事件对象
 * @class Sui.util.Event
 * @constructor
 * @param {DOM} target 触发对象
 * @param {Object} data 数据体
 */

Sui.util.Event = function(target, data) {
    if (arguments.length == 2) {
        this.target = target;
        this.data = data;
    } else if (arguments.length == 1) {
        Sui.apply(this, target);
    }
};

Sui.applyIf(Sui, {
    /**
     * 将字符串转换为浮点数
     * @method parseFloat
     * @param {String} str 字符串
     * @param {Boolean} emptyTo0 是否将空字符串转换为0，默认不转换
     */
    parseFloat : function(str, emptyTo0){
       if(emptyTo0){
           if(Sui.isEmpty(str)){
               return 0;
           }
       }
        return parseFloat(str);
    },
    /**
     * 解析json字符串,依赖$.evalJSON
     * @method evalJSON
     * @param jsonString 字符串
     * @return {*}
     */
    evalJSON : function(jsonString){
       return $.evalJSON(jsonString);
    },
    /**
     * 将一个对象转换为JSON格式
     * @method toJSON
     * @param {Object} object
     * @return {JSON}
     */
    toJSON : function(object){
        return $.toJSON(object);
    },
    /**
     * 将一个JSON格式转换为字符串
     * @method JSONStringify
     * @param {Object} obj
     * @return {String}
     */
    JSONStringify:function(obj){

        if (window.JSON) {
            return JSON.stringify(obj);
        }
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';
            return String(obj);
        } else {
            // recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);

            // fix.
            var self = arguments.callee;

            for (n in obj) {
                v = obj[n];
                t = typeof(v);
                if (obj.hasOwnProperty(n)) {
                    if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null)
                        // v = jQuery.stringify(v);
                        v = self(v);
                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }

    },
    /**
     * 将undefined或null类型的变量转换为0,转换失败时返回该变量
     * @method  nullTo0
     * @param {Mixed} val
     * @return {Mixed}
     */
    nullTo0: function (val) {
        if (Sui.isUndefinedOrNull(val)) {
            return 0;
        }
        return val;
    },

    /**
     * 为某方法规定其作用域并执行该方法
     * @method makeFunction
     * @param {Object} obj 方法methodName的作用域
     * @param {Function} methodName
     */
    makeFunction: function (obj, methodName) {
        return function () {
            if (!Sui.isFunction(methodName)) {
                methodName = obj[methodName];
            }

            if (Sui.isFunction(methodName)) {
                methodName.apply(obj, arguments);
            } else {
                Sui.warnFormat("makeFunction生成函数失败,object为{0},methodName为{1}", obj, methodName);
            }

        }
    },
    emptyFn : function() {
    },
    
    shouldOverridedFn: function () {
        throw new Error("不支持该操作");
    },
    
    /**
     * 判断一个变量是否不空，
     * 如果是undefined、null、''则认为空
     * @method  isNotEmpty
     * @param {Mixed} arg
     * @return {Boolean}
     */
    isNotEmpty : function(arg) {
        return arg !== undefined && arg !== null && arg !== "";
    },
    /**
     * 将不存在的对象转换为空字符串，如果该对象存在，则返回该对象
     * @method nullToEmpty
     * @param {Mixed} obj
     * @return {Mixed}
     */
    nullToEmpty : function(obj) {
        if (! Sui.isDefined(obj) || obj == null) {
            return "";
        } else {
            return obj;
        }
    },
    /**
     * 判断一个变量有定义且不为null
     * @method  isDefinedAndNotNull
     * @param {Mixed} o
     * @return {Boolean}
     */
    isDefinedAndNotNull : function(o) {
        return ! this.isUndefinedOrNull(o);
    },
    /**
     * 判断一个变量没定义或者为null
     * @method isUndefinedOrNull
     * @param {Mixed} o
     * @return {Boolean}
     */
    isUndefinedOrNull : function(o) {
        return this.isUndefined(o) || o == null;
    },
    /**
     * 判断一个变量是否没定义
     * @method  isUndefined
     * @param {Mixed} o
     * @return {Boolean}
     */
    isUndefined : function(o) {
        return ! this.isDefined(o);
    },
    /**
     * 将对象src中除去prop之外的属性融合到原dest对象中
     * @method  applyOtherProps
     * @param {Object} dest 目标对象
     * @param {Object} src 资源对象
     * @param {Array} props 由属性名称组成的数组
     * @return {Object}
     */
    applyOtherProps : function(dest, src, props) {
        if (src) {
            for (var p in src) {
                if (! Sui.ArrayUtil.contains(props, p)) {
                    dest[p] = src[p];
                }
            }
        }
        return dest;
    },
    /**
     * 将对象src中props对应的属性融合到原dest对象中
     * @method  applyProps
     * @param {Object} dest 目标对象
     * @param {Object} src 资源对象
     * @param {Array} props 由属性名称组成的数组
     * @return {Object}
     */
    applyProps : function(dest, src, props) {
        if (src && props) {
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                if (Sui.isDefined(src[prop])) {
                    dest[prop] = src[prop];
                }
            }
        }

        return dest;
    },

    /**
     * 比较两个对象的字符串属性是否都相等
     * @method isStringPropertiesEquals
     * @param {Object} obj
     * @param {Object} obj2
     */
    isStringPropertiesEquals : function(obj, obj2) {

        if (Sui.isUndefinedOrNull(obj) && Sui.isUndefinedOrNull(obj2)) {
            return true;
        }

        for (var p in obj) {
            var pv = obj[p];
            if (Sui.isString(pv)) {
                if (obj2[p] !== pv) {
                    return false;
                }
            }
        }

        for (var p in obj2) {
            var pv = obj2[p];
            if (Sui.isString(pv)) {
                if (obj[p] !== pv) {
                    return false;
                }
            }
        }

        return true;
    },
    
    /**
     * 产生一个递增的id
     * @method nextId
     * @return {number}
     */
    nextId: (function() {
        var c = 0;
        return function() {
            return++c;
        };
    })()

});
/**
 * 对Math的方法进行增强
 * @class Math
 * @static
 */
/**
 * 整除
 * @method div
 * @param {Number} dividend
 * @param {Number} divisor
 * @return {Number}
 */
Math.div = function(dividend, divisor) {
    return Math.floor(dividend / divisor);
};

/**
 * 取余
 * @method mod
 * @param {Number} dividend
 * @param {Number} divisor
 * @return {Number}
 */
Math.mod = function(dividend, divisor) {
    return dividend - Math.floor(dividend / divisor) * divisor;
};
/**
 * 模拟栈类型
 * @class Sui.StackUtil
 * @constructor
 *
 */
Sui.StackUtil = {
    /**
     * 出栈
     * @method pop
     * @param {Array} array
     */
    pop: function (array) {
        var item = array[array.length - 1];
        Sui.ArrayUtil.removeByIndex(array, array.length - 1);
        return item;
    },
    /**
     * 获取栈中最新一项
     * @method peek
     * @param {Mixed}
     */
    peek : function(array) {
        return array[array.length - 1];
    },

    /**
     * 入栈
     * @method push
     * @param {Array} array
     * @param {Mixed} item
     */
    push: function (array, item) {
        array.push(item);
    }
};

/**
 * 增强版数组类型
 * @class Sui.ArrayUtil
 * @constructor
 */
Sui.ArrayUtil = {

    /**
     * 查找一个数组内第一组相同的对象。如果存在的话，则返回一个数组索引。
     * @method findFirstSameObject
     * @param {Array} objectArray 被查找的数组
     * @param {Array} keyPropNames 两个对象之间需要对比的属性集
     * @return {Boolean} 返回一个数组索引
     */
    findFirstSameObject : function(objectArray, keyPropNames){

        for(var i=0; i<objectArray.length; i++){
            var dataObject = objectArray[i];

            for(var j=i + 1; j<objectArray.length; j++ ){
                var dataObject2 = objectArray[j];

                if(isObjectSame(dataObject, dataObject2)){
                    return [i, j];
                }
            }
        }

        function isObjectSame(dataObject, dataObject2){
            for(var i = 0; i<keyPropNames.length; i++){
                var propName = keyPropNames[i];
                if(dataObject[propName] != dataObject2[propName]){
                    return false;
                }
            }

            return true;
        }

    },
    /**
     * 在对象数组中,根据属性名和属性值,查找对应的Object对象.
     * @method findObjectInArray
     * @param {Array} array
     * @param {String} attrName
     * @param {Mixed} atrrValue
     * @return {Object}
     */
    findObjectInArray: function (array, attrName, attrValue) {
        var ret = null;
        Sui.each(array, function (obj) {
            if (obj[attrName] == attrValue) {
                ret = obj;
                return false;
            }
        });
        return ret;
    },
    /**
     * 统计一组字符串的值.内容为空的话,表示0
     * 如果所有值为空,则返回空. 否则返回所有值的和.
     * @method sumInt
     * @param {Array} vals
     * @return {Number} 以整数形式返回统计结果
     */
    sumInt : function(vals){
        var ret = "";
        Sui.each(vals, function(val){
            if(! Sui.isEmpty(val)){
                if(ret == ""){
                    ret = 0;
                }
                ret += parseInt(val);
            }
        });
        return ret;
    },

    /**
     * 统计一组字符串的值.内容为空的话,表示0
     * 如果所有值为空,则返回空. 否则返回所有值的和.
     * 默认会进行格式化，最多返回两位小数。
     * @method sumFloat
     * @param vals
     * @return {Float} 最多返回两位小数
     */
    sumFloat : function(vals){
        var ret = "";
        Sui.each(vals, function(val){
            if(! Sui.isEmpty(val)){
                if(ret == ""){
                    ret = 0;
                }
                ret += parseFloat(val);
            }
        });

        // FIXME 如果数值太大,会有问题
        return Sui.isNumber(ret) ? Math.round(ret * 100) / 100 : "";
    },

    /**
     * 将一个数组融合到目标数组中
     * 不使用concat方法，concat方法不会修改原数组。
     * @method  addAll
     * @param {Array} target 目标数组
     * @param {Array} array 数组
     * @return {Array}
     */
    addAll : function(target, array) {
        Sui.each(array, function(item) {
            Sui.ArrayUtil.add(target, item);
        });
    },
    /**
     * 将目标数组中的某一部分对象移除
     * @method removeAll
     * @param {Array} target 目标数组
     * @param {Array} array 对象组成的数组
     */
    removeAll : function(target, array) {
        Sui.each(array, function(obj) {
            Sui.ArrayUtil.remove(target, obj);
        });
    },
    /**
     * 将一个变量转换成数组
     * @method itemToArray
     * @param {Mixed} item
     * @return {Array}
     */
    itemToArray : function(item) {
        if (! Sui.isArray(item)) {
            return [item];
        }
        return item;
    },
    /**
     * 交换数组中两个索引项的位置
     * @method  exchangeElement
     * @param {Array} array
     * @param {Number} upIndex 索引值1
     * @param {Number} downIndex 索引值2
     */
    exchangeElement : function(array, upIndex, downIndex) {
        var downElement = array[downIndex];
        this.removeByIndex(array, downIndex);
        var upElement = array[upIndex];
        this.removeByIndex(array, upIndex);

        this.add(array, downElement, upIndex);
        this.add(array, upElement, downIndex);

    },
    
    /**
     * 将对象移到数组的后面
     * @method moveToLast
     * @param {Array} array
     * @param {Object} element
     */
    moveToLast: function (array, element) {
        this.remove(array, element);
        array.push(element);
    },
    
    /**
     * 将一个对象放到数组的某个索引中
     * @method add
     * @param {Array} array
     * @param {Object} obj
     * @param {Number} index
     */
    add : function(array, obj, index) {
        if (Sui.isDefined(index)) {
            array.splice(index, 0, obj);
        } else {
            array.push(obj);
        }
    },
    /**
     * 根据索引值移除数组中的某一项
     * @method removeByIndex
     * @param {Array} array
     * @param {Number} i
     */
    removeByIndex : function(array, i) {
        if (0 <= i && i < array.length) {
            array.splice(i, 1);
        }
    },
    /**
     * 移除数组中某个索引值后面的全部项
     * @method removeAfter
     * @param {Array} array
     * @param {Number} index
     */
    removeAfter : function(array, index) {
        for (var i = index + 1; i < array.length; i++) {
            this.removeByIndex(array, i);
        }
    },
    /**
     * 融合一个数组到目标数组中
     * @method  combine
     * @param {Array} thisArray  目标数组
     * @param {Array} array
     * @param {Boolean} excludeSame  是否排除相等的元素,默认为true
     */
    combine: function(thisArray, array, excludeSame) {
        for (var i = 0, l = array.length; i < l; i++) {
            if (excludeSame) {
                thisArray.include(array[i]);
            } else {
                thisArray.push(array[i]);
            }
        }
        return thisArray;
    },
    /**
     * 判断数组是否包含某个项
     * @method contains
     * @param {Array} thisArray
     * @param {Mixed} item
     * @param {Number} from 从数组的某个索引开始判断，默认从第0个开始
     * @return {Boolean}
     */
    contains: function(thisArray, item, from) {
        from = from || 0;
        for (var i = from; i < thisArray.length; i++) {
            if (thisArray[i] == item) {
                return true;
            }
        }
        return false;
    },

    /**
     * 选择排序，默认按从小到大的顺序进行排序
     * @method sort
     * @param {Array} array
     * @param {String} dir  dir的值包括"asc", "desc"
     * @return {Array}
     */
    sort : function(array, dir) {

        var desc = dir == 'desc';

        for (var i = 0; i < array.length - 1; i++) {

            var selectedIndex = i;
            for (var j = i + 1; j < array.length; j++) {
                if (desc) {
                    if (array[j] > array[selectedIndex]) {
                        selectedIndex = j;
                    }
                } else {
                    if (array[j] < array[selectedIndex]) {
                        selectedIndex = j;
                    }
                }
            }

            // 交换两者的值
            if (i != selectedIndex) {
                var temp = array[i];
                array[i] = array[selectedIndex];
                array[selectedIndex] = temp;
            }
        }

        return array;

    },
    
    /**
     * 根据对象的属性进行排序. 默认按从小到大的顺序进行排序
     * @method sortByProperty
     * @param {Array} array
     * @param {String} propertyName  属性名
     * @param {String} dir  dir的值包括"asc", "desc"
     * @return {Array}
     */
    sortByProperty: function (array, propertyName, dir) {

        var desc = dir == 'desc';

        for (var i = 0; i < array.length - 1; i++) {

            var selectedIndex = i;
            for (var j = i + 1; j < array.length; j++) {
                if (desc) {
                    if (array[j][propertyName] > array[selectedIndex][propertyName]) {
                        selectedIndex = j;
                    }
                } else {
                    if (array[j][propertyName] < array[selectedIndex][propertyName]) {
                        selectedIndex = j;
                    }
                }
            }

            // 交换两者的值
            if (i != selectedIndex) {
                var temp = array[i];
                array[i] = array[selectedIndex];
                array[selectedIndex] = temp;
            }
        }

        return array;

    },
    
    /**
     * 获取最好一个元素
     * @method getLast
     * @param {Array} array
     * @return {Mixed}
     */
    getLast: function (array) {
        return (array.length) ? array[array.length - 1] : null;
    },
    
    /**
     * 移除最后一个元素,并返回
     * @method removeLast
     * @param {Array} array
     * @return {Mixed}
     */
    removeLast: function (array) {
        if (array.length > 0) {
            var item = array[array.length - 1];
            array.length = array.length - 1;
            return item;
        } else {
            return null;
        }
    },
    
    /**
     * 获取某对象在数组中的索引
     * @method indexOf
     * @param {Array} thisArray
     * @param {Number} item
     * @return {Number}
     */
    indexOf : function(thisArray, item) {
        var ret = -1;
        Sui.each(thisArray, function(ele, i) {
            if (ele == item) {
                ret = i;
                return false;
            }
        });
        return ret;
    },
    /**
     * 获取数组中每一项的某属性对应的值
     * @method getPropertyValues
     * @param {Array} array
     * @param {String} propertyName
     * @return {Array}
     */
    getPropertyValues : function(array, propertyName) {
        var ret = [];
        if (array) {
            for (var i = 0; i < array.length; i++) {
                var v = array[i][propertyName];
                ret.push(v);
            }
        }
        return ret;
    },
    /**
     * 移除数组中某一项
     * 通过找到该项在数组中的位置，再将其移除
     * @method remove
     * @param {Array} thisArray
     * @param {Mixed} item
     */
    remove : function(thisArray, item) {
        var index = this.indexOf(thisArray, item);
        this.removeByIndex(thisArray, index);
    },
    /**
     * 移入变量，判断数组中是否存在某变量，
     * 如果不存在则将其移入数组中
     * @method include
     * @param {Array} thisArray
     * @param {Mixed} item
     */
    include: function(thisArray, item) {
        if (!thisArray.contains(item)) thisArray.push(item);
        return thisArray;
    },
    
    /**
     * 拷贝数组
     * @method copy
     * @param {Array} array
     * @param {Array} 
     */
    copy: function (array) {
        var ret = [];
        for (var i = 0; i < array.length; i++) {
            ret[i] = array[i];
        }
        return ret;
    },
    
    /**
     * 根据对象的属性,将对象进行分组
     * @method groupByProperty
     * @param {Array} array
     * @param {String} propertyName
     * @param {Object} 
     */
    groupByProperty : function(array, propertyName){
        var ret = {};
        for(var i = 0; i<array.length; i++){
            var item = array[i];
            var groupName = item[propertyName];
            var groupItems = ret[groupName];
            if(! Sui.isArray(groupItems)){
                groupItems = [];
                ret[groupName] = groupItems;
            }
            groupItems.push(item);
        }
        return ret;
    }

};

/**
 * Sui操作范围
 * @class Sui.Range
 * @param {Number} startValue
 * @param {Number} endValue
 */
Sui.Range = function(startValue, endValue){
    this.startValue = startValue;
    this.endValue = endValue;
};

Sui.extend(Sui.Range, {
    /**
     * 判断是否超出范围
     * @method containSome
     * @param {Number} startValueArg
     * @param {Number} endValueArg
     * @return {Boolean}
     */
   containSome : function(startValueArg, endValueArg){
     return this.startValue <= startValueArg && startValueArg <= this.endValue ||
         this.endValue <= endValueArg && endValueArg <= this.endValue;
   }

});
/**
 * 增强版日期类
 * @class Sui.DateUtil
 * @constructor
 */
Sui.DateUtil = {
    /**
     * 获得最晚日期，比如参数为2013/09/01,2013/09/09,
     * 则返回2013/09/09
     * @method maxDate
     * @param {Date} date
     * @param {Date} date2
     * @return {Date}
     */
    maxDate : function(date, date2){
		if(! date){
			return date2;
		}
		if(! date2){
			return date;
		}
		if(date.getTime() > date2.getTime()){
			return date;
		}else {
			return date2;
		}
	},

    /**
     * 设置日期的月份值。如果设置之后，月份值不匹配，则重新设置。
     * @method setMonth
     * @param {Date} date
     * @param {Number} month 可能为负数
     */
    setMonth: function (date, month) {
        var day = date.getDate();

        date.setDate(1);
        date.setMonth(month);

        // 每月几号,对月份可能有影响
        var oldMonth = date.getMonth();
        date.setDate(day);
        var newMonth = date.getMonth();

        if (newMonth != oldMonth) {
            date.setDate(1);
            date.setMonth(oldMonth);
        }

    },
    /**
     * 将日期字符串格式化，比如将
     * "2013/09/09"转换为"2013-09-09"
     * @method parseDate
     * @param {String} string
     * @return {String}
     */
    parseDate: function (string) {
	   string = string.replace(/-/g, "/");
	   var date = new Date( string );
	   return date;
    },
    /**
     * 将字符串转化为日期格式,
     * 当不指定foramt参数时功能与parseDate一样
     * @method convertStrToDate
     * @param {String} val
     * @param {String} format
     */
    convertStrToDate:function(val,format){

        if( !Sui.isString(format)){
            return this.parseDate(val);
        }

        var reg = format.replace(/y+/g, '([0-9]+)')
            .replace(/M+/g, '(1[012]|0?[0-9])')
            .replace(/d+/g, '([1-9][0-9]|0?[0-9])')
            .replace(/h+/g, '([0-1]?[0-9]|2[0-3])')
            .replace(/m+/g, '([0-5]?[0-9])')
            .replace(/s+/g, '([0-5]?[0-9])');

        var matchResult = val.match(new RegExp('^'+reg+'$'));
        if (matchResult && matchResult.length) {
            //日期格式正确，移除第一个全匹配素，剩下子匹配元素
            matchResult.shift();
            //将format上的时间格式块（如yyyy,MM,dd等从foramt上剥离，与其输入值对应）
            var dateElements = format.match(/y+|M+|d+|h+|m+|s+/g),
                dateObj = {};
            for (var i = 0,len = dateElements.length; i < len; i++) {
                dateObj[dateElements[i]] = matchResult[i];
            }

            var resultDate = new Date();
            var year = dateObj['yyyy'] || ( dateObj['yy'] + 2000) || resultDate.getFullYear(),
                month = (dateObj['MM'] || dateObj['M'] || resultDate.getMonth() + 1) - 1,
                day = dateObj['dd'] || dateObj['d'] || resultDate.getDate(),
                hour = dateObj['hh'] || dateObj['h'] || resultDate.getHours(),
                minute = dateObj['mm'] || dateObj['m'] || resultDate.getMinutes(),
                second = dateObj['ss'] || dateObj['s'] || resultDate.getSeconds();
            resultDate.setFullYear(year, month, day);
            resultDate.setHours(hour, minute, second);

            return resultDate;

        }else if(Sui.isString(val)){
            return this.parseDate(val);
        }
    },
    /* 下面这种写法有bug
   parseDate: function (text) {
        var yMd = text.split("-");
        var year = parseInt(yMd[0], 10);
        var month = parseInt(yMd[1], 10);
        var day = parseInt(yMd[2], 10);
        Sui.log(year + "年" + month + "月" + day + "日");

        // 如果当前是2013-1-30,设置月份的值为2,则有问题.
        var date = new Date();
        date.setDate(day);
        date.setMonth(month - 1);
        date.setYear(year);

        return date;
    }, */

    /**
     * 获取年月. 月份从0开始
     * @method getYM
     * @param {Date} date
     * @return {Array} 由年、月组成的数组
     */
    getYM : function(date){
        return [date.getFullYear(), date.getMonth()];
    },

    /**
     * 获取年月日. 月份从0开始
     * @method getYMD
     * @param {Date} date
     * @return {Array} 由年、月、日组成的数组
     */
    getYMD : function(date){
        return [date.getFullYear(), date.getMonth(), date.getDate()];
    },

    /**
     *  比较两个日期的年月
     *  @method compareYearMonth
     *  @param {Date} date
     *  @param {Date} date2
     *  @return {Number} 前者大则返回1，后者大则返回-1，相等则返回0
     */
    compareYearMonth : function(date, date2){
        return this.compareDate(this.getYM(date), this.getYM(date2));
    },

    /**
     *  比较两个日期的年月日
     *  @method compareYMD
     *  @param {Date} date
     *  @param {Date} date2
     *  @return  {Number} 前者大则返回1，后者大则返回-1，相等则返回0
     */
    compareYMD : function(date, date2){
        return this.compareDate(this.getYMD(date), this.getYMD(date2));
    },

    /**
     * 比较两个日期是否相等。参数为数组，
     * 数组项按年份，月份，日，时，分，秒往后排列。
     * @method compareDate
     * @param {Array} array
     * @param {Array} array2
     * @return {Number} 前者大则返回1，后者大则返回-1，相等则返回0
     */
    compareDate: function(array, array2) {

        for (var i = 0; i < array.length; i++) {
            if (array[i] > array2[i]) {
                return 1;
            } else if (array[i] < array2[i]) {
                return -1;
            }
        }
        return 0;
    },
    /**
     * 格式化时间，
     * 如将[12,4,0]譬如将格式化为[12,04,00]
     * 数组对应的三个项分别为时、分、秒
     * @method formatTime
     * @param time
     * @param {Array} time
     * @param {String} format
     * @param {String}
     */
    formatTime : function(time, format) {
        var o = {
            "h+" : time[0], // hour
            "m+" : time[1], // minute
            "s+" : time[2] // second
        };

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    },
    /**
     * 格式化日期,如
     * <pre><code>
     *   var today = new Date();
     *   Sui.DateUtil.format(today,'yyyy-MM-dd hh:mm:ss');
     *   // 2013-09-09 12:34:05
     * </code></pre>
     * @method  format
     * @param {Date} date
     * @param {String} format
     * @return {String}
     */
    format : function(date, format) {
        var o = {
            "M+" : date.getMonth() + 1, // month
            "d+" : date.getDate(), // day
            "h+" : date.getHours(), // hour
            "m+" : date.getMinutes(), // minute
            "s+" : date.getSeconds(), // second
            "q+" : Math.floor((date.getMonth() + 3) / 3), // quarter
            "S" : date.getMilliseconds()
            // millisecond
        };

        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + "")
                .substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    },
    /**
     * 添加年份
     * @method addYears
     * @param {Date} date
     * @param {Number} years
     * @return {Date}
     */
    addYears : function(date, years) {
        return this.addMonths(date, years * 12);
    },

    /*
     * 添加月份
     * 月份从0开始,保持日期不变
     * @method addMonths
     * @param {Date} date
     * @param {Number} months
     * @return {Date}
     */
    addMonths : function(date, months) {

        var n = date.getDate();
        date.setDate(1);
        date.setMonth(date.getMonth() + months);
        date.setDate(Math.min(n, this.getDaysInMonth(date)));
        return date;

    },

    /**
     * 已知年份和月份，将月份加上monthAdd，计算新的年份和月份。
     * @method calcYearMonth
     * @param {Number} initYear
     * @param {Number} initMonth
     * @param {Number} monthAdd
     * @return {Array} 返回年月组成的数组，如[1987,10]
     */
    calcYearMonth : function(initYear, initMonth, monthAdd) {
        var month = Math.mod(initMonth + monthAdd - 1, 12) + 1;
        var year = initYear + Math.div(initMonth + monthAdd - 1, 12);
        return [year, month];
    },
    /**
     * 判断是否闰年
     * @method isLeapYear
     * @param {Number} year
     * @return {Boolean}
     */
    isLeapYear : function (year) {
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
    },

    /**
     * 获取日期当月的一号
     * @method getFirstDateOfMonth
     * @param {Date} date
     * @return {Date}
     */
    getFirstDateOfMonth : function(date) {
        var ret = new Date(date);
        ret.setDate(1);
        return ret;
    },

    /**
     * 获取某一年中某个月份的天数
     * month从0开始
     * @method getDaysInMonth
     * @param {Date} year
     * @param {Number}  month
     * @return {Number}
     */
    getDaysInMonth : function (year, month) {

        if (! Sui.isNumber(year)) {
            var date = year;
            year = date.getFullYear();
            month = date.getMonth();
        }

        return [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    },
    /**
     * 获取某两个日期之间间隔的时间周期
     * @method  getInterval
     * @param {Date} d1
     * @param {Date} d2
     * @return {Object} 返回格式化后的时间周期，如{ h:12,m:2,s:23,ms:340}
     */
    getInterval : function(d1, d2) {

        var d3 = d1 - d2;
        var h = Math.floor(d3 / 3600000);
        var m = Math.floor((d3 - h * 3600000) / 60000);
        var s = (d3 - h * 3600000 - m * 60000) / 1000;
        var ms = d3 - h * 3600000 - m * 60000 - n * 1000;

        return {
            h :h,
            m :m,
            s :s,
            ms : ms
        }

    },
    /**
     * 复制一个日期对象
     * @method cloneDate
     * @param {Date} date
     */
    cloneDate:function(date){
        return date instanceof Date ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()) : date;
    }
};

/**
 * 增强版的Number类
 * @class Sui.NumberUtil
 * @constructor
 */
Sui.NumberUtil = {

    /**
     * 约束某个数字小数点后的位数，最小位数为0
     * 四舍五入
     * @method round
     * @param {Number} number
     * @param {Number} precision
     * @return {Number}
     */
    round: function(number, precision) {
        precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
        return Math.round(number * precision) / precision;
    },

    /**
     * 判断数字是否是奇数
     * @method isOdd
     * @param {Number} i
     * @return {Boolean}
     */
    isOdd : function(i) {
        return Math.mod(i, 2) == 1;
    },

    /**
     * 判断数字是否是偶数
     * @method isEven
     * @param {Number} i
     * @return {Boolean}
     */
    isEven : function(i) {
        return Math.mod(i, 2) == 0;
    },

    /**
     * 抽取字符串中的数字，
     * 如抽取"Abc123com456",返回[123,456]
     * @method  extractInts
     * @param {String} str
     * @return {Array}
     */
    extractInts : function(str) {
        var results = str.match(/\d+/g);

        var ret = [];
        for (var i = 0; i < results.length; i++) {
            ret.push(parseInt(results[i]));
        }

        return ret;
    },
    /**
     * 抽取字符串中第一个数字,
     * 如抽取"Abc123com"中的123
     * @method  extractInt
      * @param {String} str
     *  @return {Number}
     */
    extractInt : function(str){
        var ints = this.extractInts(str);
        return ints[0];
    },
    
    /**
     * 获取小数位数
     * @method  getDecimalDigits
     * @param num
     * @return {number}
     */
    getDecimalDigits: function (num) {
        var str = num + "";
        var pointIndex = str.indexOf(".");
        if (pointIndex < 0) {
            return 0;
        } else {
            return str.length - 1 - pointIndex;
        }
    },
    
    /**
     * 取小数点后n位
     * @method  fixedNumberString
     * @param {String} numStr
     * @param {number} count
     * @return {String}
     */
    fixedNumberString: function (numStr, count) {
        var str = numStr + "";
        var index = str.indexOf(".");
        if (index >= 0) {
            str = str.substring(0, index + count + 1);
        }
        return str;
    },
    
    /**
     * 取小数点后n位
     * @method  fixNumber
     * @param {number} num
     * @param {number} count
     * @return {String}
     */
    fixNumber: function (num, count) {
        return parseFloat(this.fixedNumberString(num + "", count));
    },
    
    /**
     * 取最小值
     * @method  min
     * @param {Array} nums
     * @return {number}
     */
    min: function (nums) {
        var min = Number.MAX_VALUE;
        Sui.each(nums, function (num) {
            min = Math.min(min, num);
        });
        return min;
    },
    
    /**
     * 取最大值
     * @method  max
     * @param {Array} nums
     * @return {number}
     */
    max: function (nums) {
        var max = Number.MIN_VALUE;
        Sui.each(nums, function (num) {
            max = Math.max(max, num);
        });
        return max;
    },
    
    /**
     * 将数值约束在一个范围内
     * @method  containment
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @return {number}
     */
    containment: function (value, min, max) {

        if(Sui.isArray(min)){
            max = min[1];
            min = min[0];
        }

        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    }

};
/**
 * 增强版字符串类
 * @class Sui.StringUtil
 * @constructor
 */
Sui.StringUtil = {
    /**
     * 将值为null的变量转换为空字符串
     * @method nullToEmpty
     * @param {Mixed} obj
     * @return {Mixed} 如果值为null，返回"",否则返回原参数
     */
    nullToEmpty : function(obj) {
        if (! Sui.isDefined(obj) || obj == null) {
            return "";
        } else {
            return obj;
        }
    },

    /**
     * 移除字符串中的字符char，最多只能保留leaveCount个
     * @method removeChar
     * @param {String} str
     * @param {String} leaveCount
     * @param {Number} leaveCount
     * @return {String}
     */
    removeChar : function(str, char, leaveCount) {

        var ret = "";
        var count = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charAt(i);
            if (c === char) {
                count++;

                if (count <= leaveCount) {
                    ret += c;
                }
            } else {
                ret += c;
            }
        }
        return ret;
    },
    /**
     * 字符串局部替换功能
     * 比如，将"abc{0}d{1}"中的{0}和{1}替换成G,F， 代码如下
     * <pre><code>
     *    Sui.StringUtil.formatByNumber('abc{0}d{1}','G','F');
     * </code></pre>
     * @method formatByNumber
     * @param {String} src
     * @param {Mixed} str 第二个参数开始，可以是字符串、数字或其他类型
     */
    formatByNumber : function(src) {
        if (arguments.length == 0) return "";
        var args = Array.prototype.slice.call(arguments, 1);
        return src.replace(/\{(\d+)\}/g, function(m, i) {
            var val = args[i];
            if(Sui.isUndefinedOrNull(val)){
                val = "";
            }
            return val;
        });
    },
    /**
     * 字符串局部替换功能
     * 将"abc{abc}d{name}"中的{abc}和{name}替换成一个对象中的属性的值.代码如下
     * <pre><code>
     *    Sui.StringUtil.format('abc{abc}d{name}',{ abc:123, name: 456});
     * </code></pre>
     * @method format
     * @param string
     * @param obj
     */
    format : function(string, obj) {
        return string.replace(/\{([A-Za-z_]+)\}/g, function(m, i) {
            //m：{abc}{name} ; i: abc name
            return obj[i];
        });
    },
    /**
     * 判断字符传中是否包含指定的子字符串
     * @method contains
     * @param {String} str
     * @param {String} substr
     * @return {Boolean}
     */
    contains : function(str, substr) {
        return str.indexOf(substr) != -1;
    },
    /**
     * 将字符串中首尾两端的空格去除
     * @method trim
     * @param {String} string
     * @param {Boolean} nullToEmpty  是否将值为null的变量转换为“”
     * @return {String}
     */
    trim : function(string, nullToEmpty) {
        if(Sui.isUndefinedOrNull(string)){
            if(nullToEmpty){
                return "";
            }else {
                return string;
            }
        }
        return String(string).replace(/^\s+|\s+$/g, '');
    },
    /**
     * 判断某字符串是否以某子字符串做结尾
     * @method endsWith
     * @param {String} string
     * @param {String} pattern
     * @return {Boolean}
     */
    endsWith: function(string, pattern) {
        if(Sui.isUndefinedOrNull(string)){
            return false;
        }
        var d = string.length - pattern.length;
        return d >= 0 && string.lastIndexOf(pattern) === d;
    },
    /**
     * 判断某字符串是否以某子字符串做开头
     * @method startWith
     * @param {String} string
     * @param {String} subString
     * @return {Boolean}
     */
    startWith : function(string, subString) {
        if(Sui.isUndefinedOrNull(string)){
            return false;
        }
        return string.indexOf(subString) == 0;
    },
    /**
     * 获取末尾几个字符组成的字符串
     * @method getLastChars
     * @param {String} string
     * @param {Number} count 指定字符的个数
     * @return {String}
     */
    getLastChars : function(string, count) {
        return string.substring(string.length - count);
    },
    
    /**
     * 计算不相同的字符串的个数
     * @method  countNotSame
     * @param {Array} array
     * @return {number}
     */
    countNotSame : function(array){
        var map = {};
        var count = 0;
        for(var i = 0; i<array.length; i++){
            var value = array[i];
            if(! map[value]){
                count +=1;
                map[value] = true;
            }
        }
        return count;
    },
    
    /**
     * 移除相同的字符串
     * @method  removeSame
     * @param {Array} array
     * @return {Array}
     */
    removeSame : function(array){
        var map = {};
        var ret = [];
        for(var i = 0; i<array.length; i++){
            var value = array[i];
            if(! map[value]){
                ret.push(value);
                map[value] = true;
            }
        }
        return ret;
    },
    
    /**
     * 将值为undefined或null的变量转换为空字符串
     * @method  nullToEmpty
     * @param {String} val
     * @return {String}
     */
    nullToEmpty : function(val){
       if(Sui.isUndefinedOrNull(val)){
           return "";
       }else {
           return "" + val;
       }
    },
    /**
     * 如果一个字符串是以某字符串开头，则将其删除
     * @method removeStart
     * @param {String} str
     * @param {String} substring
     * @param {Boolean} iterator 是否迭代删除
     * @return {String}
     */
    removeStart : function(str, substring, iterator) {

        if (this.startWith(str, substring)) {
            str = str.substring(substring.length);

            if (iterator) {
                return this.removeStart(str, substring, iterator);
            } else {
                return str;
            }

        } else {
            return str;
        }
    },
    /**
     * 如果一个字符串是以某字符串结尾，则将其删除
     * @method removeEnd
     * @param {String} str
     * @param {String} substring
     * @return {String}
     */
    removeEnd : function(str, substring) {
        if (this.endsWith(str, substring)) {
            return str.substring(0, str.length - substring.length);
        } else {
            return str;
        }
    },
    
    /**
     * 将第一个字符大写
     * @method upperFirstChar
     * @param {String} str
     * @return {String}
     */
    upperFirstChar : function(str){
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
};

/**
 * 哈希集合类,用于存储一些系统配置
 * 暂时只支持字符串
 * @class Sui.util.HashSet
 * @constructor
 */
Sui.util.HashSet = function() {
    this.data = {};
};

Sui.util.HashSet.prototype = {

    data : null,
    /**
     * 判断是否包含某成员
     * @method contains
     * @param {String} item
     * @return {Boolean}
     */
    contains : function(item) {
        return this.data[item] == true;
    },
    /**
     * 添加成员
     * @method add
     * @param {String} item
     */
    add : function(item) {
        this.data[item] = true;
    } ,
    /**
     * 删除成员
     * @method remove
     * @param {String} item
     */
    remove : function(item) {
        delete data[item];
    }

};
/**
 * 数据类
 * @class Sui.data
 * @constructor
 */
Sui.namespace("Sui.data");
/**
 *
 */
Sui.data.TreeNodeMoveType = {

    BEFORE : "before",
    ADD_CHILD : "addChildNode",
    AFTER : "after"
};

/**
 * 树节点类
 * @extends Object
 * @class Sui.data.TreeNode
 * @Constructor 树节点
 * @param {Object} config 配置的属性
 * @param {TreeNode} config.parentNode 可指定父节点
 * @param {Mixed} config.data 节点包含的数据
 */
Sui.data.TreeNode = Sui.extend(Object, {

    // private
    parentNode: null,
    children: null,
    data: null,
    childrenComparator: null,

    constructor: function (config) {
        Sui.data.TreeNode.superclass.constructor.call(this, config);
        Sui.applyProps(this, config, ["parentNode", "children", "data", "childrenComparator"]);
    },

    /**
     * 设置孩子节点的排序方式
     * @method setChildrenComparator
     * @param  {String} childrenComparator
     */
    setChildrenComparator: function (childrenComparator) {
        Sui.logFormat("设置节点的childrenComparator={0}", childrenComparator == null ? null : "不为null");
        this.childrenComparator = childrenComparator;
    },
    /**
     * 判断自身是否叶子节点
     * @method isLeaf
     * @return {Boolean}
     */
    isLeaf: function () {
        return !this.children || this.children.length == 0;
    },
    /**
     * 获取数据
     * @method getData
     * @return {Mixed}
     */
    getData: function () {
        return this.data;
    },
    /**
     * 设置数据
     * @method setData
     * @param {Data} data
     */
    setData: function (data) {
        this.data = data;
        this.changeNodePositionIfNeed();
    },

    /**
     * @private
     * 变换节点的位置
     * @method changeNodePositionIfNeed
     * @private
     */
    changeNodePositionIfNeed : function(){
        var parentTreeNode = this.getParentNode();
        if(parentTreeNode){
            var oldPosition = parentTreeNode.indexOf(this);
            parentTreeNode.sortChildNodes();
            var newPosition = parentTreeNode.indexOf(this);
            if (newPosition != oldPosition) {
                this.onPositionChanged({
                    oldPosition : oldPosition,
                    newPosition : newPosition
                });
            }
        }
    },
    /**
     * 判断是否是最后一个节点
     * @method isLastPosition
     * @param {Number} position
     * @return {Boolean}
     */
    isLastPosition : function(position){
        return position == this.getParentNode().getChildNodeCount() - 1;
    },

    /**
     * @protected
     */
    onPositionChanged : Sui.emptyFunction,
    /**
     * 判断自身是否根节点
     * @method isRoot
     * @return {Boolean}
     */
    isRoot: function () {
        return Sui.isUndefinedOrNull(this.parentNode);
    },
    /**
     * 移除孩子节点
     * @method removeChildNode
     * @param {TreeNode} childNode
     */
    removeChildNode: function (childNode) {
        if (this.children != null) {
            Sui.ArrayUtil.remove(this.children, childNode)
        }
    },

    /**
     * 对孩子节点进行排序。有孩子节点的节点放在前面。
     * @method sortChildNodes
     */
    sortChildNodes: function () {
        if (this.children) {
            if(Sui.isDefinedAndNotNull(this.childrenComparator)){
                this.children.sort(this.childrenComparator);
            }else {
                this.children.sort(function (node, node2) {
                    var num1 = node.existChild() ? -1 : 0;
                    var num2 = node2.existChild() ? -1 : 0;
                    return num1 - num2;
                });
            }
        }
    },
    /**
     * 添加子节点
     * @method addChildNode
     * @param {TreeNode} childNode
     * @param {Number} i 子节点的位置
     *
     */
    addChildNode: function (childNode, i) {

    	// IE下,可能有bug,所以需要添加“this.children.length == 0”判断
        if (this.children == null || this.children.length == 0) {
            this.children = [];
        }

        if (this.childrenComparator) {
            // 根据顺序去获取位置
            i = this.findInsertIndex(childNode);
            Sui.logFormat("添加孩子节点,根据childrenComparator找到节点位置{0}", i);
        } else {
            Sui.logFormat("该节点的没有childrenComparator" );
            if (Sui.isUndefined(i)) {
                i = this.getChildNodeCount();
            }
        }

        Sui.ArrayUtil.add(this.children, childNode, i);
        childNode.setParentNode(this);

    },

    /**
     * @private
     * 查找比节点大的元素
     * @method  findInsertIndex
     * @param {TreeNode} childNode
     */
    findInsertIndex: function (childNode) {

        for (var i = 0; i < this.getChildNodeCount(); i++) {
            var node = this.getChildNode(i);
            if (this.childrenComparator(node, childNode) >= 0) {
                return i;
            }
        }

        return this.getChildNodeCount();

    },
    /**
     * 添加一个结点到当前结点之前
     * @method before
     * @param {TreeNode} node
     */
    before: function (node) {
        var index = this.getIndexInParent();
        this.getParentNode().addChildNode(node, index);
    },
    /**
     * 添加一个结点到当前结点之后
     * @method after
     * @param {TreeNode} node
     */
    after: function (node) {
        var index = this.getIndexInParent();
        this.getParentNode().addChildNode(node, index + 1);
    },
    /**
     * 移动节点
     * @method moveNode
     * @param {TreeNode} node
     * @param {String} type 操作类型，可以是ADD_CHILD、BEFORE、AFTER
     */
    moveNode: function (node, type) {

        if (type == Sui.data.TreeNodeMoveType.ADD_CHILD) {

            if (node.getParentNode() != this) {

                var oldParent = node.getParentNode();
                oldParent.removeChildNode(node);

                this.addChildNode(node);

            }
        } else if (type == Sui.data.TreeNodeMoveType.BEFORE) {

            if (node.getNextSibling != this) {

                var oldParent = node.getParentNode();
                oldParent.removeChildNode(node);

                this.before(node);
            }
        }
        if (type == Sui.data.TreeNodeMoveType.AFTER) {

            if (node.getPrevSibling() != this) {

                var oldParent = node.getParentNode();
                oldParent.removeChildNode(node);

                this.after(node);
            }
        }

    },
    /**
     * 获取子节点
     * @method getChildNode
     * @param {Number} i
     * @return {TreeNode}
     */
    getChildNode: function (i) {
        return this.children[i];
    },
    /**
     * 判断自己是否最后一个节点
     * @method isLastChild
     */
    isLastChild: function () {
        return !this.getNextSibling();
    },
    /**
     * 获取下一个兄弟节点
     * @method getNextSibling
     * return {TreeNode}
     */
    getNextSibling: function () {
        if (this.isRoot()) {
            return null;
        } else {
            return this.parentNode.getNextChildNode(this);
        }
    },
    /**
     * 获取上一个兄弟节点
     * @method getPrevSibling
     * return {TreeNode}
     */
    getPrevSibling: function () {
        if (this.isRoot()) {
            return null;
        } else {
            return this.parentNode.getPrevChildNode(this);
        }
    },
    /**
     * 获取最后一个子节点
     * @method getLastChild
     * @return {TreeNode}
     */
    getLastChild: function () {
        if (!this.existChild()) {
            return ;
        }
        return this.children[this.children.length - 1];
    },
    /**
     * 获取第一个子节点
     * @method  getFirstChild
     * @return {TreeNode}
     */
    getFirstChild: function () {
        if (!this.existChild()) {
            return ;
        }
        return this.children[0];
    },
    /**
     * 判断是否存在子节点
     * @method  existChild
     * @return {Boolean}
     */
    existChild: function () {
        return this.getChildNodeCount() > 0;
    },
    /**
     * 获取子节点数量
     * @method  getChildNodeCount
     * @return {Number}
     */
    getChildNodeCount: function () {
        if (this.children) {
            return this.children.length;
        }
        return 0;
    },
    /**
     * 判断是否存在指定名称的孩子节点
     * @method existChildNodeNameEquals
     * @param {String} nodeName
     * @return {Boolean}
     */
    existChildNodeNameEquals: function (nodeName) {

        for (var i = 0; i < this.getChildNodeCount(); i++) {
            var sibling = this.getChildNode(i);
            if (sibling.getNodeText() == nodeName) {
                return true;
            }
        }
        return false;

    },

    /**
     * 判断是否存在名称等于nodeName的邻节点
     * @method  existSiblingNameEquals
     * @param {String} nodeName
     * @return {Boolean}
     */
    existSiblingNameEquals: function (nodeName) {
        var parent = this.getParentNode();
        if (parent) {
            for (var i = 0; i < parent.getChildNodeCount(); i++) {
                var sibling = parent.getChildNode(i);
                if (sibling != this && sibling.getNodeText() == nodeName) {
                    return true;
                }
            }
        }
        return false;
    },
    /**
     * 获取某个子节点的下一个邻节点
     * @method getNextChildNode
     * @param {TreeNode} child
     * @return {TreeNode}
     */
    getNextChildNode: function (child) {
        var index = this.indexOf(child);
        if (index == -1) {
            return null;
        } else if (index + 1 == this.getChildNodeCount()) {
            return null;
        } else {
            return this.getChildNode(index + 1);
        }
    },
    /**
     * 获取某个子节点的前一个邻节点
     * @method getPrevChildNode
     * @param {TreeNode} child
     * @return {TreeNode}
     */
    getPrevChildNode: function (child) {
        var index = this.indexOf(child);
        if (index == -1) {
            return null;
        } else if (index - 1 < 0) {
            return null;
        } else {
            return this.getChildNode(index - 1);
        }
    },
    /**
     * 获取当前节点在父节点下属结构的索引位置
     * @method  getIndexInParent
     * @return {Number}
     */
    getIndexInParent: function () {
        return this.getParentNode().indexOf(this);
    },
    /**
     * 获取某个子节点在当前节点下属结构的索引位置
     * @method indexOf
     * @param {TreeNode} child
     * @return {Number}
     */
    indexOf: function (child) {

        for (var i = 0; i < this.getChildNodeCount(); i++) {
            if (this.getChildNode(i) == child) {
                return i;
            }
        }
        return -1;

    },
    /**
     * 设置父节点
     * @method setParentNode
     * @param {TreeNode} parentNode
     */
    setParentNode: function (parentNode) {
        this.parentNode = parentNode;
    },
    /**
     * 获取父节点
     * @method getParentNode
     */
    getParentNode: function () {
        return this.parentNode;
    },

    /**
     * 获取根节点
     * 需要进行遍历，所以一定只能是一棵完整树。
     * @method getRoot
     */
    getRoot: function () {
        if (this.isRoot()) {
            return this;
        } else {
            return this.getParentNode().getRoot();
        }
    },
    /**
     * 根据节点属性查找一个节点
     * @method  findNodeByAttr
     * @param  {String} attrName
     * @param {Mixed} attrValue
     * @return {TreeNode}
     */
    findNodeByAttr: function (attrName, attrValue) {

        var findNode = null;
        if (Sui.isArray(attrName) && attrName.length > 0) {
            this.preorderTraversal(function (node) {

                // 是否所有属性都匹配
                var allMatch = true;
                for (var i = 0; i < attrName.length; i++) {
                    if (node[attrName[i]] != attrValue[i]) {
                        allMatch = false;
                        break;
                    }
                }

                if (allMatch) {
                    findNode = node;
                    return false;
                }
            });
        } else {
            this.preorderTraversal(function (node) {

                if (node[attrName] == attrValue) {
                    findNode = node;
                    return false;
                }
            });
        }
        return findNode;
    },
    /**
     * 根据节点属性查找多个节点
     * @method  findNodesByAttr
     * @param  {String} attrName
     * @param {Mixed} attrValue
     * @return {Array} 有节点组成的数组
     */
    findNodesByAttr: function (attrName, attrValue) {

        var findNodes = [];
        this.preorderTraversal(function (node) {
            if (node[attrName] == attrValue) {
                findNodes.push(node);
            }
        });

        return findNodes;
    },

    /**
     * 先序遍历
     * @method preorderTraversal
     * @param {Function} func  对每个节点执行的函数
     */
    preorderTraversal: function (func) {

        if (func(this) === false) {
            return false;
        }

        var childCount = this.getChildNodeCount();
        if (childCount > 0) {
            for (var i = 0; i < childCount; i++) {
                var childNode = this.getChildNode(i);

                if (childNode.preorderTraversal(func) === false) {
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * 后序遍历
     * @method postorderTraversal
     * @param {Function} func 对每个节点执行的函数
     */
    postorderTraversal: function (func) {
        var childCount = this.getChildNodeCount();
        if (childCount > 0) {
            for (var i = 0; i < childCount; i++) {
                var childNode = this.getChildNode(i);
                childNode.postorderTraversal(func);
            }
        }
        func(this);
    }
});

/**
 * 管理所有的 Sui.data.Store
 * @class Sui.Stores
 * @constructor
 */
Sui.Stores = {
};

/**
 * 记录集合类
 * 可触发的事件包括: addRecord, removeRecord
 * @extends  Sui.util.Observable
 * @class  Sui.data.Store
 * @constructor
 * @param {Object} config 配置
 * @param {Boolean} config.cascadeProperty 是否采用级联属性，默认为false
 * @param {Object} config.sortInfo 排序信息
 * @param {String} config.sortInfo.fieldName 排序域，即按什么排序
 * @param {String} config.sortInfo.sortDesc 排序类型，asc为升序，dec为降序
 */
Sui.data.Store = Sui.extend(Sui.util.Observable, {

    /**
     * 是否采用级联属性
     */
    cascadeProperty : false,

    sortInfo : null,

    items : null,

    constructor : function(config) {

        Sui.data.Store.superclass.constructor.call(this, config);

        Sui.applyProps(this, config, ['cascadeProperty', 'sortInfo']);

        this.items = [];

        config = config || [];


        if (Sui.isArray(config)) {
            this.initDatas(config);
        } else {
            if (Sui.isArray(config.datas)) {
                this.initDatas(config.datas);
            }
        }
    },
    /**
     * 设置排序信息
     * @method setSortInfo
     * @param {Object} sortInfo
     */
    setSortInfo : function(sortInfo){
        this.sortInfo = sortInfo;

        if(sortInfo){
            this.sort();
        }
    },

    /**
     * 对所有的Record进行排序
     * @method sort
     */
    sort : function() {
        Sui.log("对Store进行排序");
        var items = this.items;
        var fieldName = this.sortInfo.fieldName;
        var sortDesc = this.sortInfo.sortDesc == 'asc' ? 1 : -1;
        this.items.sort(function(record, record2) {
            var str = record.getFieldValue(fieldName);
            var str2 = record2.getFieldValue(fieldName);
            return sortDesc * str.localeCompare(str2);
        });
    },
    /**
     * 初始化记录数据
     * @method initDatas
     * @param {Array} dataArray 由Sui.data.Record实例组成的数组
     */
    initDatas : function(dataArray) {
        if(Sui.isEmpty(dataArray)){
            return ;
        }
        
        this.count = dataArray.length;

        var thisStore = this;

        Sui.each(dataArray, function(item) {
            thisStore.addRecord(thisStore.convertDataToRecord(item));
        });
    },
    /**
     * 将数据转化为记录
     * @method convertDataToRecord
     * @param {Mixed} data
     * @return {Sui.data.Record}
     */
    convertDataToRecord : function(data) {
        return new Sui.data.Record({
            store : this,
            data : data
        });
    },
    /**
     * 添加一条记录
     * @method addRecord
     * @param {Sui.data.Record} record
     * @param {Number} index 记录的索引值
     */
    addRecord : function(record, index) {
        if (Sui.isUndefinedOrNull(index)) {
            index = this.getCount();
        }
        Sui.ArrayUtil.add(this.items, record, index);

        this.fireEvent('addRecord', new Sui.util.Event({
            target : this,
            index : index,
            record : record
        }));

        record.on("propertyChange", Sui.makeFunction(this, this.onRecordPropertyChange));
    },
    /**
     * 当属性改变时触发
     * @method  onRecordPropertyChange
     * @param {Event} event
     * @private
     */
    onRecordPropertyChange : function(event) {
        var changedFields = [event];
        this.fireEvent("recordChange", new Sui.util.Event({
            record : event.target,
            changedFields : changedFields,
            index : this.indexOf(event.target)
        }));
    },
    /**
     * 获取某个记录的索引值
     * @method indexOf
     * @param {Sui.data.Record} record
     * @return {Number}
     */
    indexOf : function(record) {
        return Sui.ArrayUtil.indexOf(this.items, record);
    },
    /**
     * 添加一条或以上记录
     * @method addRecordData
     * @param {Mixed} data data格式可以是 Sui.data.Record 或 Array
     * @param {Number} index 被添加记录的索引位置
     */
    addRecordData : function(data, index) {

        if (!Sui.isDefined(index)) {
            index = this.getCount();
        }

        if (Sui.isArray(data)) {
            for (var i = data.length - 1; i >= 0; i--) {
                this.addRecordData(data[i], index);
            }
        } else {
            data = this.convertDataToRecord(data);
            this.addRecord(data, index);
        }
    },
    /**
     * 删除记录
     * @method  removeRecord
     * @param {Mixed} index index格式可以为Record的索引，或Record对象
     */
    removeRecord : function(index) {

        // 判断参数是Record的索引还是Record对象.
        if (Sui.isNumber(index)) {
            var record = this.items[index];
        } else {
            var record = index;
            index = this.indexOf(record);
        }

        Sui.ArrayUtil.removeByIndex(this.items, index);

        this.fireEvent('removeRecord', new Sui.util.Event({
            record : record,
            index : index
        }));

        this.fireEvent('afterRemoveRecord', new Sui.util.Event({
            record : record,
            index : index
        }));
    },
    /**
     * 设置记录数据
     * @method setRecordDatas
     * @param {Array} datas 由Sui.data.Record实例组成的数组
     */
    setRecordDatas : function(datas) {
        this.clear();
        for (var i = 0; i < datas.length; i++) {
            this.addRecordData(datas[i]);
        }

    },
    
    /**
     * 拷贝数据
     * @method copyRecordDatas
     * @return {Array}  
     */
    copyRecordDatas : function(){
        var datas = [];
        for (var i = 0; i < this.getCount(); i++) {
            var record = this.getRecord(i);
            datas.push(record.copyData());
        }
        return datas;
    },
    
    /**
     * 清空所有记录
     * @method clear
     */
    clear : function() {
    	var count = this.getCount();
        for (var i = 0; i < count; i++) {
            this.removeRecord(0);
        }
    },
    /**
     * 删除多条记录
     * @method removeRecords
     * @param {Array} rowIndexs  由记录的索引组成的数组
     */
    removeRecords : function(rowIndexs) {
        var thisStore = this;

        Sui.ArrayUtil.sort(rowIndexs, "desc");

        Sui.each(rowIndexs, function(row) {
            thisStore.removeRecord(row);
        });
    },
    /**
     * 判断该记录集是否为空
     * @method isEmpty
     */
    isEmpty : function(){
        return this.getCount() == 0;
    },
    /**
     * 获取记录集内记录的数量
     * @method getCount
     */
    getCount : function() {
        return this.items.length;
    },
    /**
     * 获取发生过变化的Record
     * @method  getChangedRecords
     * @return {Array} 由Sui.data.Record 组成的数组
     */
    getChangedRecords : function(){
        var ret = [];
        for(var i = 0; i<this.getCount(); i++){
            var record = this.getRecord(i);
            if(record.existFieldChanged()){
                ret.push(record);
            }
        }
        return ret;
    },
    /**
     * 根据索引值获取记录
     * @method getRecord
     * @param {Number} i
     * @return {Sui.data.Record}
     */
    getRecord : function(i) {
        return this.items[i];
    },
    
    /**
     * 根据索引值获取记录
     * @method getRecords
     * @param {Array} rowIndexs
     * @return {Array} 一组Sui.data.Record
     */
    getRecords : function(rowIndexs) {

        // 需要将索引转换成Record对象。如果不转换的话，在删除其他节点时，索引的位置是会变的。
        var records = [];
        for (var i = 0; i < rowIndexs.length; i++) {
            records.push(this.getRecord(rowIndexs[i]));
        }

        return records;
    },
    
    /**
     * 获取最后一个记录
     * @method getLastRecord
     * @return {Sui.data.Record}
     */
    getLastRecord : function(){
        if(this.items.length > 0){
            return this.items[this.items.length - 1];
        }
        return null;
    },
    /**
     * 通过属性和属性值获取记录
     * @method findRecordByNameValue
     * @param {String} name
     * @param {String} value
     * @return  {Sui.data.Record}
     */
    findRecordByNameValue : function(name, value) {
        for (var i = 0; i < this.getCount(); i++) {
            var item = this.getRecord(i);

            if (item.getFieldValue(name) == value) {
                return item;
            }
        }
        return null;
    },
    /**
     * 交换记录的索引值
     * @method exchangeRecord
     * @param {Number} upIndex
     * @param {Number} downIndex
     *
     */
    exchangeRecord : function(upIndex, downIndex) {
        Sui.ArrayUtil.exchangeElement(this.items, upIndex, downIndex);

        this.fireEvent("exchangeRecord", {
            upIndex : upIndex,
            downIndex : downIndex
        })
    }

});

/**
 * 记录类
 * @extends Sui.util.Observable
 * @class Sui.data.Record
 * @constructor
 * @param {Object} config 配置项
 * @param {Mixed} config.data 数据
 * @param {Sui.data.Store} config.store 该记录对应的记录集
 */
Sui.data.Record = Sui.extend(Sui.util.Observable, {

    data : null,
    store : null,
    //记录被修改过的属性
    changedFields : null,

    constructor : function(config) {

        Sui.data.Record.superclass.constructor.apply(this, arguments);
        Sui.applyProps(this, config, ['data', "store"]);

    },
    /**
     * 判断当前记录是否存在某个属性
     * @method  existField
     * @param {String} fieldName
     */
    existField : function(fieldName){
        return this.data && this.data.hasOwnProperty(fieldName);
    },
    /**
     * 获取某个属性的值
     * @method getFieldValue
     * @param {String} field
     * @return {Mixed}
     */
    getFieldValue : function(field) {

        if (this.store.cascadeProperty) {
            field = field.split(".");
            var val = this.data[field[0]];
            for (var i = 1; i < field.length; i++) {
                if (Sui.isDefinedAndNotNull(val) && Sui.isObject(val)) {
                    val = val[field[i]];
                } else {
                    val = "";
                    break;
                }
            }
            return val;
        } else {
            return this.data[field];
        }
    },
    /**
     * 设置某个属性的值
     * @method  setFieldValue
     * @param {String} field
     * @param {Mixed} value
     */
    setFieldValue : function(field, value) {

        var oldValue = this.data[field];
        if (oldValue !== value) {

            this.addChangedField(field);
            this.data[field] = value;
            this.fireEvent("propertyChange", {
                field : field,
                newValue : value,
                oldValue : oldValue
            })
        }
    },
    /**
     * 判断是否存在被修改的属性
     * @method  existFieldChanged
     * @return {Boolean}
     */
    existFieldChanged : function(){
        return Sui.isDefinedAndNotNull(this.changedFields) && this.changedFields.length > 0;
    },

    /**
     * 添加值发生过变化的Field
     * @method addChangedField
     * @param {String} field
     */
    addChangedField : function(field){
        if(Sui.isUndefinedOrNull(this.changedFields)){
            this.changedFields = [];
        }

        if(! Sui.ArrayUtil.contains(this.changedFields, field)){
            this.changedFields.push(field);
        }
    },
    /**
     * 获得某些属性的值
     * @method getFieldValues
     * @param {Array} propNames 由属性值组成的数组
     * @return {Object}  由属性名，属性值组成的对象
     */
    getFieldValues : function(propNames){
        var data = {};
        var thisRecord = this;
        Sui.each(propNames, function(propName){
            data[propName] = thisRecord.getFieldValue(propName);
        });
        return data;
    },
    /**
     * 复制某对象的所有成员到记录中，作为记录的属性
     * @method copyFieldValue
     * @param {Sui.data.Record} record
     * @param {Object} props
     */
    copyFieldValue : function(record, props){
        Sui.each(props, function(p){
            this.setFieldValue(record.getFieldValue(p));
        })
    },
    /**
     * 复制记录中的数据，
     * 即将记录中的data成员复制出来
     * @method copyData
     * @return {Mixed}
     */
    copyData : function(){
    	return Sui.apply({}, this.data);
    }

});

/**
 * 数据工具类
 * @class  Sui.data.Utils
 * @constructor
 */
Sui.namespace("Sui.data.Utils");

/**
 * 获取每个记录的某些属性，返回一个集合，比如
 * [ {name:'Lilei', age:12}, {name:'HanMeimei' ,age: 14} , ... ]
 * @method getRecordsFields
 * @param {Array} records 有Sui.data.Record组成的数组
 * @param {Array} props 由属性名组成的数组
 * @return {Array}
 */
Sui.data.Utils.getRecordsFields = function(records, props){
    var that = this;

    var ret = [];
    Sui.each(records, function(record){
        ret.push(that.getRecordFields(record, props));
    });
    return ret;
};
/**
 * 获取单个记录的某些属性，返回一个对象，比如
 * {name:'Lilei', age:12}
 * @method getRecordFields
 * @param {Sui.data.Record} record
 * @param {Array} props 由属性名组成的数组
 * @return {Object}
 */
Sui.data.Utils.getRecordFields = function(record, props){
    var data = {};
    Sui.each(props, function(p){
        data[p] = record.getFieldValue(p);
    });
    return data;
};

/**
 * 将Store的数据序列化成json字符串
 * @method storeDataToJson
 * @param {Sui.data.Record} store
 * @return {String}
 */
Sui.data.Utils.storeDataToJson = function(store){
    var array = store.copyRecordDatas();
    return Sui.toJSON(array);
}

/**
 * 将json字符串反序列化Store的数据
 * @method storeDataToJson
 * @param {String} jsonArray
 * @return {Array}
 */
Sui.data.Utils.jsonToStoreData = function(jsonArray){
    if(Sui.isEmpty(jsonArray)){
        return [];
    }
    return Sui.evalJSON(jsonArray);
}

/**
 * 断言
 * @class Sui.Assert
 * @constructor
 */
Sui.Assert = {

    /**
     * 检查参数是否是数组
     * @method assertArray
     * @param {Mixed} val
     * @param {String} fieldName
     */
    assertArray : function(val, fieldName){
        if (! Sui.isArray(val)) {
            fieldName = fieldName || "";
            throw new Error(fieldName + "必须是数组");
        }
    },
    
    /**
     * 检查参数是否为空
     * @method assertNotEmpty
     * @param {Mixed} val
     * @param {String} fieldName
     */
    assertNotEmpty: function (val, fieldName) {
        if (Sui.isEmpty(val)) {
            fieldName = fieldName || "";
            throw new Error(fieldName + "不能为空");
        }
    },
    
    /**
     * 检查参数是否为空
     * @method notEmpty
     * @param {Mixed} val
     * @param {String} fieldName
     */
    notEmpty : function(val, fieldName) {
        if (Sui.isEmpty(val)) {
            fieldName = fieldName || "";
            throw new Error(fieldName + "值为空");
        }
    },
    
    /**
     * 检查参数是否为null或undefined
     * @method notEmpty
     * @param {Mixed} val
     * @param {String} fieldName
     */
    assertDefinedAndNotNull : function(val, fieldName){
        if(! Sui.isDefinedAndNotNull(val)){
            fieldName = fieldName || "";
            throw new Error(fieldName + "不能为null或undefined");
        }
    }

};

/**
 * 计时器
 * @extends  Object
 * @class Sui.Timekeeper
 * @constructor
 */
Sui.Timekeeper = Sui.extend(Object, {

    startDate : null,

    constructor : function() {
        this.startDate = new Date();
    },
    /**
     * 重新开始计时
     * @method reStart
     */
    reStart : function() {
        this.startDate = new Date();
    },
    /**
     * 获取已过去的时间,单位为毫秒
     * @method  getMillisecond
     * @return {Number} 返回一个时间段
     */
    getMillisecond : function() {
        var d = new Date();
        return d - this.startDate;
    },

    /**
     * 输出格式化的时间，如'20秒24毫秒'
     * @method  getFormattedTime
     * @return {String}
     */
    getFormattedTime : function() {
        var interval = this.getMillisecond();
        var s = Math.floor(interval / 1000);
        var ms = interval - s * 1000;
        return s + "秒" + ms + "毫秒";
    }

});

Sui.LogLevels = {
    DEBUG : 0,
    LOG : 1,
    WARN : 2,
    ERROR : 3
}

/**
 * 代码运行记录类
 * @extends Object
 * @class Sui.Logger
 * @constructor
 * @param config 配置
 * @param congif.prefix 可指定代码运行记录的业务类型
 */
Sui.Logger = Sui.extend(Object, {

    prefix : "",
    
    logLevel : Sui.LogLevels.LOG,

    constructor: function(config) {
        Sui.Logger.superclass.constructor.apply(this, arguments);
        this.prefix = config.prefix ? config.prefix : "";
    },
    
    /**
     * 设置日志级别
     * @method setLogLevel
     * @param {number} level
     */
    setLogLevel : function(level){
        this.logLevel = level;
    },
    
    /**
     *  调试
     * @method debug
     * @param {String} msg
     */
    debug : function(msg) {
        if(this.logLevel > Sui.LogLevels.DEBUG){
            return ;
        }
        this.consoleOutput(msg, "debug");
    },
    /**
     *  记录
     * @method log
     * @param {String} msg
     */
    log : function(msg) {
        if(this.logLevel > Sui.LogLevels.LOG){
            return ;
        }
        this.consoleOutput(msg, "log");
    },
    /**
     * 警告
     * @method warn
     * @param {String} msg
     */
    warn : function(msg) {
        if(this.logLevel > Sui.LogLevels.WARN){
            return ;
        }
        this.consoleOutput(msg, "warn");
    },
    /**
     * 报错
     * @method error
     * @param {String} msg
     */
    error : function(msg) {
        if(this.logLevel > Sui.LogLevels.ERROR){
            return ;
        }
        this.consoleOutput(msg, "error");
    },
    /**
     * 输出内容
     * @method consoleOutput
     * @param {String} msg
     * @param {String} logLevel 内容级别,分别有debug调试、log记录、warn警告、error报错
     */
    consoleOutput : function(msg, logLevel) {
        if (window.console && window.console.log) {
            window.console.log(this.prefix + " " + msg);
        }
    }

});

var suiLog = new Sui.Logger("Sui");
Sui.applyIf(Sui, {

    /**
     * 设置日志级别
     * @method setLogLevel
     * @param {number} level
     */
    setLogLevel : function(level){
       suiLog.setLogLevel(level);
    },
    
    /**
     * 设定调试格式
     * @class Sui
     * @method debugFormat
     * @param {String} msg
     */
    debugFormat : function(msg) {
        msg = Sui.StringUtil.formatByNumber.apply(Sui.StringUtil, arguments);
        suiLog.debug(msg);
    },
    /**
     * 设定记录格式
     * @method logFormat
     * @param {String} msg
     */
    logFormat : function(msg) {
        msg = Sui.StringUtil.formatByNumber.apply(Sui.StringUtil, arguments);
        suiLog.log(msg);
    },
    /**
     * 设定报错格式
     * @method errorFormat
     * @param {String} msg
     */
    errorFormat : function(msg) {
        msg = Sui.StringUtil.formatByNumber.apply(Sui.StringUtil, arguments);
        suiLog.error(msg);
    },
    /**
     * 设定警告格式
     * @method warnFormat
     * @param {String} msg
     */
    warnFormat : function(msg) {
        msg = Sui.StringUtil.formatByNumber.apply(Sui.StringUtil, arguments);
        suiLog.warn(msg);
    },
    /**
     *  调试
     * @method debug
     * @param {String} msg
     */
    debug : function(msg) {
        suiLog.debug(msg);
    },
     /**
     *  记录
     * @method log
     * @param {String} msg
     */
    log : function(msg) {
        suiLog.log(msg);
    },
    /**
     * 报错
     * @method error
     * @param {String} msg
     */
    error : function(msg) {
        suiLog.error(msg);
    },
   /**
     * 警告
     * @method warn
     * @param {String} msg
     */
    warn : function(msg) {
        suiLog.warn(msg);
    },
    /**
     * 调用方法，并在控制台显示该方法信息
     * @method debugMethodCall
     * @param {String} className
     * @param {String} methodName
     * @param {Array} args
     */
   debugMethodCall : function(className, methodName, args) {
        var str = "调用" + className + "类的" + methodName + "方法.";

        if (args) {
            str += "参数个数:" + args.length + "\n";
            for (var i = 0; i < args.length; i++) {
                str += "第" + i + "个参数的值为" + args[i] + "\n";
            }
        }
        this.debug(str);
   }
});

(function(){
	
	if(! Sui.messageResourceSet){
	    // 注意: 这里为了避免加载两个了文件,初始化两次
		var messages = Sui.messageResourceSet = {};

	    Sui.applyIf(Sui, {
	    
	        /**
	         * 获取资源属性的值
	         * @method getMessage
	         * @param {String} key 属性key
	         * @return {String}
	         */ 
	        getMessage : function(key){
	            var val = messages[key];
	            if(Sui.isDefinedAndNotNull(val)){
	                return val;
	            }
	            return "";
	        },

	        /**
	         * 设置资源属性的值
	         * @method setMessage
	         * @param {String} key 属性key
	         * @param {String} value 属性value
	         */ 
	        setMessage : function(key, value){
	            messages[key] = value;
	        }
	    })
	}
    
})();

