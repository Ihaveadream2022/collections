/* Cookie */
(function () {
    var pluginCookie = function (https) {
        this.https = https;
    };
    pluginCookie.prototype = {
        /* Set a cookie */
        setCookie: function (name, value, millisecond) {
            var expires = "";
            if (millisecond && typeof millisecond === "number" && !isNaN(millisecond)) {
                var date = new Date();
                date.setTime(date.getTime() + millisecond);
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; " + (this.https ? "secure; " : "") + "SameSite=Strict;";
        },
        /* Get a cookie */
        getCookie: function (name) {
            var nameEQ = name + "=",
                ca = document.cookie.split(";");
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == " ") {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) == 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
            return null;
        },
        /* Delete a cookie */
        deleteCookie: function (name) {
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; " + (this.https ? "secure; " : "") + "SameSite=Strict;";
        },
    };
    if (!window.cookiePlugin) {
        window.cookiePlugin = pluginCookie;
    }
})();

/* Local Storage */
(function () {
    var instance = null;
    var pluginLocalStorage = function () {};
    pluginLocalStorage.prototype = {
        /* Set data in Local Storage */
        setItem: function (key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },
        /* Get data from Local Storage */
        getItem: function (key, defaultValue) {
            var item = localStorage.getItem(key);
            if (item) {
                return JSON.parse(item);
            }
            return defaultValue;
        },
        /* Delete data from Local Storage */
        deleteItem: function (key) {
            localStorage.removeItem(key);
        },
    };
    pluginLocalStorage.getInstance = function () {
        if (!instance) {
            instance = new pluginLocalStorage();
        }
        return instance;
    };
    if (!window.localStoragePlugin) {
        window.localStoragePlugin = {
            getInstance: function () {
                return pluginLocalStorage.getInstance();
            },
        };
    }
})();

/*
 *  Tab Plugin
 *  Depends on Jquery
 *
 * <div id="containerRoot">
 * 		<div class="containerTab">
 * 			<ul>
 * 				<li class="news-tab on">amuse</li>
 * 				<li class="news-tab">sports</li>
 * 			</ul>
 * 		</div>
 * 		<div class="containerDisplay">
 * 			<div style="display: block;"></div>
 * 			<div style="display: none;"></div>
 * 		</div>
 * </div>
 *
 *  var newsContainer = $('#module-news');
 *  var newsTab1 = new TabPlugin({
 *    containerRoot: newsContainer,
 *    containerTab: newsContainer.find('.tab-menu'),
 *    containerDisplay: newsContainer.find('.tab-detail'),
 *    callback: function (tab) {
 *     	console.log(tab)
 *    }
 *  });
 *
 *
 **/
(function () {
    var TabPluginJQ = function (settings) {
        var that = this;
        that.runSpeed = 8000;
        that.IDTimeout = 0;
        that.IDInterval = 0;
        that.containerRoot = settings.containerRoot;
        that.containerTab = settings.containerTab;
        that.containerDisplay = settings.containerDisplay;
        that.callback = settings.callback;
        that.displays = that.containerDisplay.children();
        that.tabs = that.containerTab.find("li");
        if (that.tabs.length) {
            that.bindEvents(that.tabs);
        }
    };
    TabPluginJQ.prototype = {
        bindEvents: function () {
            var that = this;
            if (that.tabs.length) {
                that.tabs.unbind("mouseenter mouseleave");
                that.tabs.mouseenter(function (evt) {
                    evt.stopPropagation();
                    clearInterval(that.IDInterval);
                    var tab = $(this);
                    that.IDTimeout = setTimeout(function () {
                        that.onTab(tab.index(), that.callback);
                    }, 200);
                });
                that.tabs.mouseleave(function (evt) {
                    evt.stopPropagation();
                    clearTimeout(that.IDTimeout);
                });
            }
        },
        onTab: function (index, callback) {
            var that = this;
            var tab = that.tabs.eq(index);
            if (tab.length) {
                if (!tab.hasClass("on")) {
                    tab.addClass("on").siblings().removeClass("on");
                    var display = that.displays.eq(index);
                    if (display.length) {
                        display.show().siblings().hide();
                        if (callback && $.isFunction(callback)) {
                            callback.call(null, tab);
                        }
                    }
                }
            }
        },
        runTab: function () {
            var that = this;
            if (!that.IDInterval) {
                that.IDInterval = setInterval(function () {
                    var curTabIndex = that.tabs.filter(".on").index(),
                        nextTabIndex = curTabIndex + 1 > that.tabs.length - 1 ? 0 : curTabIndex + 1;
                    that.onTab(nextTabIndex, that.callback);
                }, that.runSpeed);
            }
        },
    };
    if (!window.TabPluginJQ) {
        window.TabPluginJQ = TabPluginJQ;
    }
})();

/*
 * Singleton pluginWindow
 *
 * Compatible with IE9 and prior IE9:
 *      document.documentElement.clientHeight || document.body.clientHeight;
 *      document.documentElement.scrollTop || document.body.scrollTop;
 *      document.documentElement.scrollLeft || document.body.scrollLeft;
 *
 * // 截流场景：元素从底部进入县市区时，执行一些动作。
 * window.addEventListener("scroll", function () {
 *     PW.elementCrossWindowBottomListener1(document.querySelector("#b"), "appear", "throttle", function (e) {
 *         console.log("执行完毕");
 *         //执行完毕后清理标记
 *         const idValue = e.getAttribute("id");
 *         const classValue = e.getAttribute("class");
 *         this.clearTime([idValue + classValue]);
 *     });
 * });
 *
 * // 防抖场景：搜索框输入关键字时，只触发最后一次输入动作
 * window.addEventListener("scroll", function () {
 *     PW.elementCrossWindowBottomListener1(document.querySelector("#b"), "appear", function (e) {
 *         console.log("执行完毕");
 *     });
 * });
 **/
(function () {
    "use strict";
    var instance;
    var pluginWindow = function () {
        var that = this;
        that.clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        that.scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        that.scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
        that.timer = {};
        that.bindEvents();
    };
    pluginWindow.prototype = {
        bindEvents: function () {
            var that = this;
            window.addEventListener("resize", function () {
                that.clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            });
            window.addEventListener("scroll", function () {
                that.scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                that.scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
            });
        },
        elementCoordinate: function (elem) {
            if (typeof elem !== "undefined" && elem !== null) {
                var that = this;
                var winTop = elem.getBoundingClientRect().top;
                var winLeft = elem.getBoundingClientRect().left;
                return {
                    top: winTop + that.scrollTop,
                    left: winLeft + that.scrollLeft,
                };
            }
        },
        elementCrossFromWindowTopListener1: function (elem, elemHeight, type, callback) {
            if (typeof elem !== "undefined" && elem !== null) {
                if (typeof elemHeight === "number" && !isNaN(elemHeight)) {
                    var that = this;
                    if (type === "disappear") {
                        if (elem.getBoundingClientRect().top + elemHeight < 0) {
                            if (callback && typeof callback === "function" && typeof callback.nodeType !== "number") {
                                callback.call();
                            }
                        }
                    }
                    if (type === "appear") {
                        if (elem.getBoundingClientRect().top + elemHeight >= 0) {
                            if (callback && typeof callback === "function" && typeof callback.nodeType !== "number") {
                                callback.call();
                            }
                        }
                    }
                }
            }
        },
        // Element cross window top
        elementCrossFromWindowTopListener2: function (elemCoordinateY, elemHeight, type, callback) {
            if (typeof elemCoordinateY === "number" && !isNaN(elemCoordinateY)) {
                if (typeof elemHeight === "number" && !isNaN(elemHeight)) {
                    var that = this;
                    if (type === "disappear") {
                        if (elemCoordinateY + elemHeight < that.scrollTop) {
                            if (callback && typeof callback === "function" && typeof callback.nodeType !== "number") {
                                const idValue = elem.getAttribute("id");
                                const classValue = elem.getAttribute("class").split(" ").join("");
                                let instance = this;
                                if (protectHandler === "debounce") {
                                    this.debounce(
                                        function () {
                                            callback.call(instance, elem);
                                        },
                                        200,
                                        "top-disappear" + idValue + classValue,
                                    )();
                                } else if (protectHandler === "throttle") {
                                    this.throttle(
                                        function () {
                                            callback.call(instance, elem);
                                        },
                                        200,
                                        "top-disappear" + idValue + classValue,
                                    )();
                                } else {
                                    callback.call(instance, elem);
                                }
                            }
                        }
                    }
                    if (type === "appear") {
                        if (elemCoordinateY + elemHeight >= that.scrollTop) {
                            if (callback && typeof callback === "function" && typeof callback.nodeType !== "number") {
                                const idValue = elem.getAttribute("id");
                                const classValue = elem.getAttribute("class").split(" ").join("");
                                let instance = this;
                                if (protectHandler === "debounce") {
                                    this.debounce(
                                        function () {
                                            callback.call(instance, elem);
                                        },
                                        200,
                                        "top-appear" + idValue + classValue,
                                    )();
                                } else if (protectHandler === "throttle") {
                                    this.throttle(
                                        function () {
                                            callback.call(instance, elem);
                                        },
                                        200,
                                        "top-appear" + idValue + classValue,
                                    )();
                                } else {
                                    callback.call(instance, elem);
                                }
                            }
                        }
                    }
                }
            }
        },
        // Element cross window bottom
        elementCrossWindowBottomListener1: function (elem, type, protectHandler, callback) {
            if (typeof elem !== "undefined" && elem !== null) {
                var that = this;
                if (type === "disappear") {
                    if (elem.getBoundingClientRect().top - that.clientHeight > 0) {
                        if (callback && typeof callback === "function" && typeof callback.nodeType !== "number") {
                            const idValue = elem.getAttribute("id");
                            const classValue = elem.getAttribute("class").split(" ").join("");
                            let instance = this;
                            if (protectHandler === "debounce") {
                                this.debounce(
                                    function () {
                                        callback.call(instance, elem);
                                    },
                                    200,
                                    "bottom-disappear" + idValue + classValue,
                                )();
                            } else if (protectHandler === "throttle") {
                                this.throttle(
                                    function () {
                                        callback.call(instance, elem);
                                    },
                                    200,
                                    "bottom-disappear" + idValue + classValue,
                                )();
                            } else {
                                callback.call(instance, elem);
                            }
                        }
                    }
                }
                if (type === "appear") {
                    if (elem.getBoundingClientRect().top - that.clientHeight <= 0) {
                        if (callback && typeof callback === "function" && typeof callback.nodeType !== "number") {
                            const idValue = elem.getAttribute("id");
                            const classValue = elem.getAttribute("class").split(" ").join("");
                            let instance = this;
                            if (protectHandler === "debounce") {
                                this.debounce(
                                    function () {
                                        callback.call(instance, elem);
                                    },
                                    200,
                                    "bottom-appear" + idValue + classValue,
                                )();
                            } else if (protectHandler === "throttle") {
                                this.throttle(
                                    function () {
                                        callback.call(instance, elem);
                                    },
                                    200,
                                    "bottom-appear" + idValue + classValue,
                                )();
                            } else {
                                callback.call(instance, elem);
                            }
                        }
                    }
                }
            }
        },
        // Element cross window bottom
        elementCrossWindowBottomListener2: function (elemCoordinateY, type, callback) {
            if (typeof elemCoordinateY === "number" && !isNaN(elemCoordinateY)) {
                var that = this;
                if (type === "disappear") {
                    if (elemCoordinateY - that.clientHeight > that.scrollTop) {
                        if (callback && typeof callback === "function" && typeof callback.nodeType !== "number") {
                            callback.call();
                        }
                    }
                }
                if (type === "appear") {
                    if (elemCoordinateY - that.clientHeight <= that.scrollTop) {
                        if (callback && typeof callback === "function" && typeof callback.nodeType !== "number") {
                            callback.call();
                        }
                    }
                }
            }
        },
        // Element come into window
        elementComeIntoWindowListener1: function (elem, elemHeight, callback) {
            if (typeof elem !== "undefined" && elem !== null) {
                if (typeof elemHeight === "number" && !isNaN(elemHeight)) {
                    var that = this;
                    if (elem.getBoundingClientRect().top + elemHeight >= 0 && elem.getBoundingClientRect().top - that.clientHeight <= 0) {
                        if (callback && typeof callback === "function" && typeof callback.nodeType !== "number") {
                            this.debounce(function () {
                                callback.call(null, elem);
                            }, 2000)();
                        }
                    }
                }
            }
        },
        // Element come into window
        elementComeIntoWindowListener2: function (elemCoordinateY, elemHeight, callback) {
            if (typeof elemCoordinateY === "number" && !isNaN(elemCoordinateY) && typeof elemHeight === "number" && !isNaN(elemHeight)) {
                var that = this;
                if (elemCoordinateY + elemHeight >= that.scrollTop && elemCoordinateY - that.clientHeight <= that.scrollTop) {
                    if (callback && typeof callback === "function" && typeof callback.nodeType !== "number") {
                        callback.call();
                    }
                }
            }
        },
        debounce: function (func, delay, key) {
            let instance = this;
            return function () {
                clearTimeout(instance.timer[key]);
                instance.timer[key] = setTimeout(func, delay);
            };
        },
        // 截流: 只执行第一次
        throttle: function (func, delay, key) {
            let instance = this;
            return function () {
                if (!instance.timer[key]) {
                    instance.timer[key] = setTimeout(func, delay);
                }
            };
        },
        clearTime: function (key) {
            clearTimeout(this.timer[key]);
            this.timer[key] = null;
        },
    };
    pluginWindow.getInstance = function () {
        if (!instance) {
            instance = new pluginWindow();
        }
        return instance;
    };
    if (!window.windowPlugin) {
        window.windowPlugin = {
            getInstance: function () {
                return pluginWindow.getInstance();
            },
        };
    }
})();

/*
 * Intersection
 * Listen: display: none to block, window.resize, window.scroll
 *
 * Reference ChatGPT, Github-tuupola/lazyload
 *
 **/
(function () {
    "use strict";
    var pluginIntersection = function (observed, observerConfig) {
        var that = this;
        that.observed = observed;
        that.observerConfig = observerConfig;
        that.observer = null;
    };
    pluginIntersection.prototype = {
        bindAsyncImage: function () {
            var that = this;
            if (typeof IntersectionObserver === "undefined") {
                that.observed.forEach((obs) => {
                    if ("img" === obs.tagName.toLowerCase()) {
                        obs.src = obs.dataset.src;
                    } else {
                        obs.style.backgroundImage = "url(" + obs.dataset.src + ")";
                    }
                });
            } else {
                that.observer = new IntersectionObserver(function (entries) {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            that.observer.unobserve(entry.target);
                            if ("img" === entry.target.tagName.toLowerCase()) {
                                entry.target.src = entry.target.dataset.src;
                            } else {
                                entry.target.style.backgroundImage = "url(" + entry.target.dataset.src + ")";
                            }
                        }
                    });
                }, that.observerConfig);
                that.observed.forEach((obs) => {
                    that.observer.observe(obs);
                });
            }
        },
    };
    if (!window.pluginIntersection) {
        window.pluginIntersection = pluginIntersection;
    }
})();

/* Slider */
/* Demo
 <!-- Row -->
 <div class="wrapper">
 <div class="slider">
 <div class="items"><img src="images/bg.png"></div>
 <div class="items"> <img src="images/logo.jpg"></div>
 <div class="items"> <img src="images/tab_sign.png"></div>
 <div class="items"><img src="images/icon24_login.png"></div>
 </div>
 <button class="prev">&#10094;</button>
 <button class="next">&#10095;</button>
 <div class="nav">
 <i class="navs" >1</i>
 <i class="navs" >2</i>
 <i class="navs" >3</i>
 <i class="navs" >4</i>
 </div>
 <p>Slider Demo</p>
 </div>

 <!-- Column -->
 <div class="wrapper2">
 <div class="slider2">
 <div class="items2"><img src="images/bg.png"></div>
 <div class="items2"> <img src="images/logo.jpg"></div>
 <div class="items2"> <img src="images/tab_sign.png"></div>
 <div class="items2"><img src="images/icon24_login.png"></div>
 </div>
 <a class="btn up">^</a>
 <a class="btn down">v</a>
 <div class="nav2">
 <i class="navs2" >1</i>
 <i class="navs2" >2</i>
 <i class="navs2" >3</i>
 <i class="navs2" >4</i>
 </div>
 </div>

 /!* Row *!/
 .wrapper {
 position: relative;
 overflow: hidden;
 width: 800px;
 height: 500px;
 border: 1px solid;
 margin: 0 auto;
 }
 .slider {
 display: flex;
 flex-wrap: nowrap;
 flex-direction: row;
 justify-content: flex-start;
 align-items: flex-start;
 width: 800px;
 height: 400px;
 overflow: hidden;
 border: 1px solid red;
 }
 .items {
 width: 800px;
 height: 400px;
 overflow: hidden;
 display: none;
 }
 .items.active {
 display: block;
 }
 .items img {
 width: 800px;
 display: block;
 }
 button {
 position: absolute;
 top: 50%;
 transform: translateY(-50%);
 background: none;
 border: none;
 color: #000;
 font-size: 3rem;
 cursor: pointer;
 transition: opacity 0.2s;
 }
 button:hover {
 opacity: 0.7;
 }
 .prev {
 left: 0;
 }
 .next {
 right: 0;
 }
 .nav {
 position: absolute;
 bottom: 10%;
 transform: translateY(-50%);
 background: none;
 border: none;
 color: #000;
 font-size: 3rem;
 cursor: pointer;
 transition: opacity 0.2s;
 }
 p {
 text-align: center;
 font-size: 30px;
 font-weight: bold;
 color: #00a4ac;
 }

 /!* Column *!/
 .wrapper2 {
 position: relative;
 overflow: hidden;
 width: 800px;
 height: 500px;
 border: 1px solid;
 margin: 100px auto;
 }
 .slider2 {
 display: flex;
 flex-wrap: nowrap;
 flex-direction: column;
 justify-content: flex-start;
 align-items: flex-start;
 width: 700px;
 height: 500px;
 overflow: hidden;
 border: 1px solid red;
 }
 .items2 {
 width: 800px;
 height: 500px;
 overflow: hidden;
 display: none;
 border: 1px solid green;
 }
 .items2.active {
 display: block;
 }
 .items2 img {
 width: 800px;
 display: block;

 }
 .btn {
 position: absolute;
 right: 5%;
 background: none;
 border: none;
 color: #000;
 font-size: 3rem;
 cursor: pointer;
 transition: opacity 0.2s;
 }
 .up {
 top: 0;
 }
 .down {
 bottom: 0;
 }
 .nav2 {
 display: flex;
 position: absolute;
 right: 1%;
 background: none;
 border: none;
 color: #000;
 font-size: 3rem;
 cursor: pointer;
 transition: opacity 0.2s;
 flex-direction: column;
 top: 0;
 }

 /!* Row *!/
 var sl = new pluginSlider(
 {
 items: document.querySelectorAll('.items'),
 prevBtn: document.querySelector('.prev'),
 nextBtn: document.querySelector('.next'),
 navs: document.querySelectorAll('.navs'),
 }
 );
 sl.autoSlides(2000);

 /!* Column *!/
 var sl2 = new pluginSlider(
 {
 items: document.querySelectorAll('.items2'),
 prevBtn: document.querySelector('.up'),
 nextBtn: document.querySelector('.down'),
 navs: document.querySelectorAll('.navs2'),
 }
 );
 sl2.autoSlides(1000);

*/

(function () {
    "use strict";
    var pluginSlider = function (settings) {
        this.currentIndex = 0;
        this.IDInterval = 0;
        this.IDTimeout = 0;
        this.items = settings.items;
        this.prevBtn = settings.prevBtn;
        this.nextBtn = settings.nextBtn;
        this.navs = settings.navs;
        this.bindEvents();
        this.init();
    };
    pluginSlider.prototype = {
        init: function () {
            this.slidesTo(this.currentIndex);
        },
        bindEvents: function () {
            if (typeof this.items !== "undefined" && this.items !== null && this.items.length) {
                var instance = this;
                if (typeof this.prevBtn !== "undefined" && this.prevBtn !== null) {
                    this.prevBtn.addEventListener("click", () => {
                        clearInterval(this.IDInterval);
                        this.slidesTo(this.currentIndex - 1);
                    });
                }
                if (typeof this.nextBtn !== "undefined" && this.nextBtn !== null) {
                    this.nextBtn.addEventListener("click", () => {
                        clearInterval(this.IDInterval);
                        this.slidesTo(this.currentIndex + 1);
                    });
                }
                if (typeof this.navs !== "undefined" && this.navs !== null && this.navs.length) {
                    this.navs.forEach(function (element, k) {
                        element.addEventListener("mouseover", function () {
                            instance.IDTimeout = setTimeout(() => {
                                clearInterval(instance.IDTimeout);
                                clearInterval(instance.IDInterval);
                                const index = Array.from(instance.navs).indexOf(element);
                                instance.slidesTo(index);
                            }, 200);
                        });
                        element.addEventListener("mouseleave", function () {
                            clearTimeout(instance.IDTimeout);
                        });
                    });
                }
            }
        },
        slidesTo: function (n) {
            this.items[this.currentIndex].classList.remove("active");
            this.currentIndex = (n + this.items.length) % this.items.length;
            this.items[this.currentIndex].classList.add("active");
        },
        autoSlides: function (speed) {
            if (typeof this.items !== "undefined" && this.items !== null && this.items.length) {
                clearInterval(this.IDInterval);
                this.IDInterval = setInterval(() => {
                    this.slidesTo(this.currentIndex + 1);
                }, speed);
            }
        },
    };
    if (!window.pluginSlider) {
        window.pluginSlider = pluginSlider;
    }
})();

/* Tab */
/* Demo
var tab = document.querySelector(".tab");
var lis = tab.querySelectorAll('li');
var ds = document.querySelectorAll('.display-item');
var t = new TabPlugin({tabs: lis, displays: ds});
t.switchTo(Math.floor(Math.random()*3), function (a) {
    console.log(this); // instance
    console.log(a); // tab
});
//t.autoSwitch(2000);

*/
(function () {
    var TabPlugin = function (settings) {
        this.IDTimeout = 0;
        this.IDInterval = 0;
        this.currentIndex = 0;
        this.tabs = settings.tabs;
        this.displays = settings.displays;
        this.callback = settings.callback;
        this.bindEvents();
    };
    TabPlugin.prototype = {
        bindEvents: function () {
            let instance = this;
            if (typeof this.tabs !== "undefined" && this.tabs !== null && this.tabs.length && typeof this.displays !== "undefined" && this.displays !== null && this.displays.length) {
                this.tabs.forEach(function (tab, k) {
                    tab.addEventListener("mouseover", function () {
                        instance.IDTimeout = setTimeout(() => {
                            clearTimeout(instance.IDTimeout);
                            clearInterval(instance.IDInterval);
                            const index = Array.from(instance.tabs).indexOf(tab);
                            instance.switchTo(index);
                        }, 200);
                    });
                    tab.addEventListener("mouseleave", function () {
                        clearTimeout(instance.IDTimeout);
                    });
                });
            }
        },
        switchTo: function (index) {
            this.tabs[this.currentIndex].classList.remove("on");
            this.displays[this.currentIndex].style.display = "none";
            this.currentIndex = (index + this.tabs.length) % this.tabs.length;
            let tab = this.tabs[this.currentIndex];
            let display = this.displays[this.currentIndex];
            if (typeof tab !== "undefined" && tab !== null && typeof display !== "undefined" && display !== null) {
                if (!tab.classList.contains("on")) {
                    tab.classList.add("on");
                    display.style.display = "block";
                    if (this.callback && typeof this.callback === "function") {
                        this.callback.call(this, tab, display);
                    }
                }
            }
        },
        autoSwitch: function (runSpeed, autoSwitchDirectory) {
            if (typeof this.tabs !== "undefined" && this.tabs !== null && this.tabs.length && typeof this.displays !== "undefined" && this.displays !== null && this.displays.length) {
                let instance = this;
                clearTimeout(instance.IDTimeout);
                clearInterval(instance.IDInterval);
                this.IDInterval = setInterval(function () {
                    instance.switchTo(autoSwitchDirectory === "left" ? instance.currentIndex - 1 : instance.currentIndex + 1);
                }, runSpeed);
            }
        },
    };
    if (!window.TabPlugin) {
        window.TabPlugin = TabPlugin;
    }
})();
