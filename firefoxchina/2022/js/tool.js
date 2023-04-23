/*
 * 火狐主页基础工具类
 * @author bqu
 * @time   2015-06-18
 */

//保存iframe的设置数据-包含皮肤、版本设置
var LOC = window.location,
    SOURCE_SUFFIX = __srcsuffix__,
    //SOURCE_SUFFIX = "",   //测试用文件后缀
    CHANNEL_ID = "unknown", //频道ID
    NEW_EXTENSION = window.mozCNChannel ? true : false, //是否为新扩展（适用于FF35扩展升级之后）
    NEW_EXTENSION_50 = window.mozCNChannel && window.mozCNChannel != "moz_cn_utils" ? true : false, //是否为新扩展（适用于FF50扩展升级之后）
    DOMAIN_TOP = document.domain.split(".").slice(-2).join(".");
(ROOT = LOC.protocol + "//" + LOC.hostname + LOC.pathname.replace(/\/$/, "")), //相对路径地址
    (CLOSE_PMT_SKIN = false),
    (IFRAME_DATA = {}); //存储iframe里的皮肤、版本等测试信息，用于传递给iframe进行动态自适应

var MOZ_INFO = {
    TIME_OUT: 10000, //设置超时时间
    OVER_TIME: 300,
    SYSTEM_IS_BUSY: "系统繁忙，请稍后再试",
    DEFAULT_COOKIE_EXPIRE: new Date("December 31, 2100"), //默认的cookie时效时间
    FETCH_CITY_FAILED: "获取城市列表失败，请稍后再试",
    LOAD_STR: "<div class='loading'><span>正在加载，请耐心等候..</span></div>",
    LOAD_ERROR: "<div class='error'>数据加载失败，请稍候再试</div>",
    //天气加载
    WEATHER_LOAD_STR: "<div class='loading'><span>正在加载天气数据...</span></div>",
    //操作提示
    OPERATE_STR: "<div class='loading'><span>正在操作，请耐心等候...</span></div>",
    SECRET_MODE: "您开启了【秘密浏览】模式，可能导致某些功能无法正常使用",
};
/*
 * Cookie存储 - 适用于存储具有时限的暂时数据
 */
(function () {
    var CookieWidget = {
        __backend__: {
            setItem: function (key, value, expire) {
                var date;
                if (expire) {
                    date = new Date();
                    date.setTime(expire);
                } else {
                    date = MOZ_INFO.DEFAULT_COOKIE_EXPIRE;
                }
                try {
                    document.cookie = key + "=" + escape(value + "") + "; path=/; domain=" + DOMAIN_TOP + "; expires=" + date.toGMTString();
                } catch (e) {}
            },
            getItem: function (key, defaultValue) {
                var resVal = defaultValue != undefined ? defaultValue : undefined;
                try {
                    var seq = document.cookie.split(";"),
                        re = new RegExp("^ ?" + key + "="),
                        i;
                    for (i in seq) {
                        if (re.test(seq[i])) {
                            var str = seq[i];
                            resVal = unescape(str.substr(str.indexOf("=") + 1));
                        }
                    }
                } catch (e) {}
                return resVal;
            },
        },
        getItem: function (k, d) {
            var v = null;
            try {
                v = this.__backend__.getItem(k);
                if (v !== null) {
                    v = JSON.parse(v + "") || d;
                } else {
                    v = d;
                }
            } catch (ex) {
                v = d;
            }
            return v;
        },
        setItem: function (k, v, expire) {
            try {
                this.__backend__.setItem(k, JSON.stringify(v), expire);
            } catch (ex) {}
        },
    };
    if (!window.CookieWidget) window.CookieWidget = CookieWidget;
})();

/*
 * Storage存储 - 适用于存储不具有时限的永久数据
 */
(function () {
    var StorageWidget = {
        __backend__: null,
        storeList: {},
        init: function () {
            var that = this;
            if (window.localStorage) {
                //使用localStorage存储
                try {
                    that.__backend__ = window.localStorage;
                    that.__backend__["__type__"] = "ls";
                } catch (e) {
                    showSystemInfo(MOZ_INFO.SECRET_MODE);
                }
            } else if (window.globalStorage) {
                //globalStorage存储
                try {
                    that.__backend__ = window.globalStorage;
                    that.__backend__["__type__"] = "gs";
                } catch (e) {
                    showSystemInfo(MOZ_INFO.SECRET_MODE);
                }
            } else if (document.cookie) {
                //使用cookie存储
                try {
                    that.__backend__ = CookieWidget.__backend__;
                    that.__backend__["__type__"] = "ck";
                } catch (e) {
                    showSystemInfo(MOZ_INFO.SECRET_MODE);
                }
            } else {
                this.backend = {
                    getItem: function () {
                        return null;
                    },
                    setItem: function () {},
                    __type__: "dummy",
                };
            }
        },
        /*
         * 根据键获取Storage里对应的值
         * param{String} k-键
         * param{String} d-默认值（未获取到或者失败）
         */
        getItem: function (k, d) {
            var v = null;
            try {
                v = this.__backend__.getItem(k);
                if (v !== null) {
                    v = JSON.parse(v + "") || d;
                } else {
                    v = d;
                }
            } catch (ex) {
                v = d;
            }
            return v;
        },
        setItem: function (k, v, expire) {
            var that = this;
            try {
                that.__backend__.setItem(k, JSON.stringify(v));
                that.storeList[k] = 1;
            } catch (ex) {}
        },
        //强制清除本地存储在stroage里的信息（localStorage、globalStorage必须手动清除）
        clear: function () {
            var that = this,
                storeList = that.storeList;
            var lastTime = StorageWidget.getItem("n_2014_s_version"); //区分2013版本
            if (lastTime != __version__) {
                if (__clears__ && __clears__.length) {
                    $.each(__clears__, function (h, k) {
                        that.setItem(k, "");
                    });
                } else {
                    $.each(storeList, function (i, n) {
                        that.setItem(i, "");
                    });
                }
                //CookieWidget.setItem("n_user_data","");
                that.setItem("n_2014_s_version", __version__); //区分2013版本
            }
        },
    };
    var sysInfo = $("#system-error");
    function showSystemInfo(msg) {
        msg && sysInfo.html(msg).show();
    }
    StorageWidget.init();
    if (!window.StorageWidget) window.StorageWidget = StorageWidget;
})();

/*
 * 工具类-基于jQuery1.9
 */
(function () {
    var MozillaTool = (function () {
        var UA = navigator.userAgent;
        var //HOME_URL = "about:cehome",   //2014-09-17 更新
            CE_HOME = "about:cehome",
            // HOME_URL = NEW_EXTENSION  ? "http://i.firefoxchina.cn" :  CE_HOME,
            HOME_URL = "https://home.firefoxchina.cn",
            REPAIR_DEFAULT = "https://doc2.firefoxchina.cn/repair.html",
            REPAIR_URLS = {
                MSIE: "https://doc2.firefoxchina.cn/repair_ie.html",
                Chrome: "https://doc2.firefoxchina.cn/repair_chrome.html",
                Firefox: REPAIR_DEFAULT,
                Opera: "https://doc2.firefoxchina.cn/repair_opera.html",
                Safari: "https://doc2.firefoxchina.cn/repair_safari.html",
                SE: "",
                "360SE": "https://doc2.firefoxchina.cn/repair_360.html",
                "360JS": "https://doc2.firefoxchina.cn/repair_360.html",
                BIDUBrowser: "",
                QQBrowser: "",
                Maxthon: "",
                LBBROWSER: "",
            };

        var Tool = function () {};
        /*================================公共外放函数=============================*/
        /*
         * 转义HTML实体（转义英文括号？？）
         */
        Tool.escapeHtml = function (str) {
            return escapeHtml(str);
        };
        /*
         * 获取浏览器类型(暂时只考虑主流浏览器)
         * param{String} type-含此参数时用于判断是否为此浏览器
         */
        Tool.isBrowser = function (type) {
            return isBrowser(type);
        };

        //获取当前页面的滚动位置
        Tool.getScrollPos = function () {
            return getScrollPos();
        };

        //获取元素的位置信息
        Tool.getEleInfo = function (ele) {
            return getEleInfo(ele);
        };

        //检测是否登录
        Tool.checkLogin = function () {
            var userData = CookieWidget.getItem("n_user_data"),
                flag = false;
            if (userData && userData.uname) flag = true;
            return flag;
        };
        //获取修复主页的url
        Tool.getRepairURL = function () {
            return getPageRepair();
        };
        //设置主页
        Tool.setHomePage = function (btn) {
            setHomePage(btn);
        };
        Tool.initHomePage = function (btn) {
            initHomePage(btn);
        };
        //延迟加载图片
        Tool.loadDelayResource = function (wrap) {
            //2013-12-20 start
            if (wrap && wrap.length) {
                $.each(wrap, function (i, n) {
                    var temp = $(n);
                    loadDelayResource(temp);
                });
            } else {
                loadDelayResource(wrap);
            }
            //2013-12-20 end
        };
        Tool.loadResource = function (wrap) {
            loadResource(wrap);
        };
        //获取location的参数
        Tool.getParam = function (name) {
            var res = null,
                search = window.location.search;
            if (search) {
                var str = search.substr(1),
                    arr = str.split("&"),
                    start = 0,
                    len = arr.length;
                for (; start < len; start++) {
                    var temp = arr[start],
                        tArr = temp.split("=");
                    if (tArr.length) {
                        if (tArr[0] == name) return tArr[1];
                    }
                }
            }
            return res;
        };

        Tool.loadScrollResource = function () {
            loadScrollResource();
        };

        Tool.getRandom = function (seed, num) {
            return getRandom(seed, num);
        };
        //处理侧边栏滚动
        Tool.dealScrollSidebar = function (sideBar, footerEle, mainEle, fixedCls, absoluteCls) {
            return new MozillaScrollBar({
                barType: "relative", //类型  relative   absolute两种
                sideReferEle: sideBar.find(".fixed-show"),
                sideTargetEle: sideBar,
                footerEle: footerEle,
                referEle: mainEle,
                fixed_cls: fixedCls,
                absolute_cls: absoluteCls,
            });
        };

        Tool.loopMeta = function (res, pName) {
            return loopMeta(res, pName);
        };
        Tool.getTimestamp = function () {
            var curTime = new Date();
            var curTimeStr = curTime.getFullYear() + "-" + (curTime.getMonth() + 1) + "-" + curTime.getDate();
            return curTimeStr;
        };
        /*字符串转换成时间的毫秒数 2020-6-17 17:05*/
        Tool.covertMiliTime = function (timeStr) {
            var time = 0;
            if (timeStr) {
                var arr = timeStr.split(/\s+/g);
                if (arr.length > 1) {
                    var str1 = $.trim(arr[0]),
                        str2 = $.trim(arr[1]);
                    if (str1 && str2) {
                        var arr1 = str1.split("-"),
                            arr2 = str2.split(":"),
                            year = parseInt(arr1[0]),
                            month = parseInt(arr1[1]),
                            date = parseInt(arr1[2]),
                            hour = parseInt(arr2[0]),
                            minute = parseInt(arr2[1]),
                            newTime = new Date();
                        newTime.setFullYear(year);
                        newTime.setMonth(month - 1);
                        newTime.setDate(date);
                        newTime.setHours(hour);
                        newTime.setMinutes(minute);
                        newTime.setSeconds(0);
                        newTime.setMilliseconds(0);
                        time = newTime.getTime();
                        return time;
                    }
                }
            }
            return time;
        };
        /*==============================内部函数===============================*/
        function loopMeta(res, pName) {
            var that = this;
            //处理根节点
            var newMeta = dealMeta(res, pName);
            /*if(newMeta){
                   res[pName] = newMeta;
               }*/
            newMeta && (res = newMeta);
            if (res.data) {
                var len = res.data.length;
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        res["data"][i] = loopMeta(res["data"][i], pName);
                    }
                }
            }
            return res;
        }
        function dealMeta(res, pName) {
            var newMeta = "";
            var metaStr = res[pName],
                newMeta = metaStr;
            if (metaStr && typeof metaStr == "string") {
                newMeta = JSON.parse(metaStr);
            }
            res[pName] = newMeta;
            return res;
        }
        /*
         * 获取一系列的不重复的随机数
         */
        function getRandom(seed, num) {
            var str = "",
                arr = [];
            while (str.split(",").length <= num) {
                var rand = Math.floor(Math.random() * seed) + ",";
                if (str.indexOf(rand) == -1) {
                    str = str + rand;
                }
            }
            str && (arr = str.slice(0, -1).split(","));
            return arr;
        }
        /*
         * 获取元素的位置信息
         */
        function getEleInfo(btn) {
            if (!btn || (btn && !btn.length)) return null;
            var width = btn.width(),
                height = btn.height(),
                rect = btn.get(0).getBoundingClientRect(),
                scroll = getScrollPos();
            return {
                width: width,
                height: height,
                scroll: scroll,
                client: rect,
                pos: {
                    //按钮的左上角位置
                    top: rect.top + scroll.top,
                    left: rect.left + scroll.left,
                },
            };
        }

        /*获取滚动条的位置*/
        function getScrollPos() {
            return {
                top: document.documentElement.scrollTop || document.body.scrollTop,
                left: document.documentElement.scrollLeft || document.body.scrollLeft,
            };
        }
        //处理scroll加载图片
        function loadScrollResource() {
            var mods = $(".mod-delay-resource"),
                pageVisHeight = document.documentElement.clientHeight; //页面可见区域高度
            $.each(mods, function (i, n) {
                var mod = $(n),
                    modTop = mod.get(0).getBoundingClientRect().top,
                    modHeight = mod.height(),
                    menus = mod.find(".tab-menu");

                //在可接近显示区域才进行显示(上部、下部)
                if ((modTop > 0 && modTop < pageVisHeight + 50) || (modTop <= 0 && Math.abs(modTop) < modHeight - 50)) {
                    //包含tab切换，加载显示的tab一栏

                    mod.attr("data-show", 1);
                    if (menus.length) {
                        var onMenu = menus.find(".on"),
                            firstMenu = menus.find("li:eq(0)"),
                            showMenu = onMenu.length ? onMenu : firstMenu,
                            showFor = $.trim(showMenu.attr("for"));
                        if (showFor) {
                            var forArr = showFor.split(",");
                            $.each(forArr, function (m, k) {
                                var tab = $("#" + k);
                                if (tab && tab.length) {
                                    //判断是否有滑动区域
                                    var slides = tab.find(".slide-page"),
                                        tarEle = tab;
                                    //有滑动区域，仅加载第一页，其他在切换的时候加载
                                    if (slides.length) {
                                        tarEle = slides.eq(1);
                                    }
                                    MozillaTool.loadDelayResource(tarEle);
                                }
                            });
                        }
                    } else {
                        //不包含tab切换，直接加载
                        mod && mod.length && MozillaTool.loadDelayResource(mod);
                    }
                } else {
                    mod.removeAttr("data-show");
                }
            });
        }
        function loadDelayResource(wrap) {
            //2013-1212 start
            if (wrap && wrap.length && wrap.attr("loaded")) return;

            //2013-1212 end
            var imgClass = "img-load-delay",
                frameClass = "iframe-load-delay",
                backClass = "back-load-delay",
                imgList = wrap ? wrap.find("." + imgClass) : $("." + imgClass),
                iframeList = wrap ? wrap.find("." + frameClass) : $("." + frameClass),
                backList = wrap ? wrap.find("." + backClass) : $("." + backClass);
            //2013-1212 start
            if (wrap && wrap.length && !iframeList.length && !imgList.length) {
                wrap.attr("loaded", "loaded");
            }

            //2013-1212 start
            if (imgList.length) {
                $.each(imgList, function (i, n) {
                    loadResource($(n), imgClass, true);
                });
            }
            if (iframeList.length) {
                $.each(iframeList, function (h, k) {
                    loadResource($(k), frameClass);
                });
            }
            if (backList.length) {
                $.each(backList, function (h, k) {
                    loadResource($(k), backClass);
                });
            }
        }
        function loadResource(res, cls, isImage) {
            if (!res.length) return;
            var resURL = res.attr("data-url");
            //resURL && res.attr("src",resURL);
            if (cls == "back-load-delay") {
                resURL = res.attr("data-style");
            }
            if (resURL) {
                if (cls == "back-load-delay") {
                    var oldStyle = res.attr("style");
                    res.attr("style", (oldStyle ? oldStyle : "") + resURL);
                    res.removeAttr("data-style");
                } else {
                    var success = false,
                        stopped = false;
                    res.attr("src", resURL);
                    res.on("load", function (evt) {
                        if (!stopped) {
                            success = true;
                            res.removeClass(cls);
                            res.removeAttr("data-url");
                        }
                    });

                    //针对新华图片经常出错采取的应急方案，对图片添加超时判断
                    if (isImage) {
                        setTimeout(function () {
                            if (!success) {
                                stopped = true;
                                res.removeAttr("src");
                            }
                        }, 5000);
                    }
                }
            }
        }
        function escapeHtml(str) {
            if (!str) return "";
            return (str + "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\'/g, "&apos;").replace(/\"/g, "&quot;").replace(/\s/g, "&nbsp;").replace(/\(/g, "（").replace(/\)/g, "）");
        }
        function initHomePage(btn) {
            var btn = $(btn);
            if (NEW_EXTENSION) {
                //新扩展 FF35及以后
                var extras = {
                    confirmMsg: "确定设置当前页面为浏览器首页吗？",
                    highlight: "on",
                    url: HOME_URL,
                };

                var evt = new window.CustomEvent("mozCNUtils:Register", {
                    detail: {
                        subType: "startup.maybeHighlightSetHomepage",
                        elements: {
                            anchor: btn.get(0),
                        },
                        extras: extras,
                    },
                });
                window.dispatchEvent(evt);
            } else {
                //兼容FF35之前的版本
                var ceHomePage = window.cehomepage;
                if (ceHomePage) {
                    startup = ceHomePage.startup;
                    if ((startup.homepage() == startup.cehomepage() || startup.homepage() == HOME_URL || startup.homepage() == CE_HOME) && startup.page() == 1) {
                        if (!startup.homepage_changed() || startup.homepage() == startup.cehomepage() || startup.homepage() == HOME_URL || startup.homepage() == CE_HOME) {
                            btn.removeClass("on");
                        } else {
                            btn.addClass("on");
                        }
                    } else {
                        btn.addClass("on");
                    }
                } else {
                    btn.addClass("on");
                }
            }
        }
        function setHomePage(btn) {
            var repairURL = getPageRepair();
            if (document.all) {
                //IE浏览器-注意此处url必须为完整的地址，包含协议，否则不生效
                try {
                    btn.style.behavior = "url(#default#homepage)";
                    btn.setHomePage(HOME_URL);
                } catch (e) {
                    window.open(repairURL);
                }
            } else {
                //其他跳转到相应的提示说明页面
                var htm = "",
                    isFirefox = MozillaTool.isBrowser("Firefox");
                if (isFirefox) {
                    //Firefox浏览器
                    if (NEW_EXTENSION) {
                        //新扩展
                    } else {
                        var ceHomePage = window.cehomepage,
                            pageAddon = window["cehp_xpi"] ? window["cehp_xpi"] : "http://download.firefox.com.cn/chinaedition/addons/cehomepage/cehomepage-latest.xpi";
                        if (ceHomePage) {
                            try {
                                if (confirm("确定设置当前页面为浏览器首页吗？")) {
                                    $(btn).removeClass("on");
                                    window.cehomepage.startup.setHome(HOME_URL);
                                }
                            } catch (e) {
                                window.open(repairURL);
                            }
                        } else {
                            htm = "<p class='home-hint'>要使用此功能，请安装<a href='" + pageAddon + "'>火狐主页扩展</a>插件</p>";
                            new PopWidget({ title: "设置主页", content: htm });
                        }
                    }
                } else {
                    //htm = "<p class='home-hint'>要使用此功能，请安装<a href='http://firefox.com.cn'>火狐浏览器</a></p>";
                    window.open(repairURL);
                }
            }
        }
        //处理主页修复
        function getPageRepair() {
            //主页修复
            var browser = isBrowser();
            var url = REPAIR_URLS[browser] ? REPAIR_URLS[browser] : REPAIR_DEFAULT;
            return url;
        }
        function isBrowser(type) {
            var browser = "",
                fbrowser = isFBrowser();
            if (isWBrowser()) {
                //可能为IE或webkit内核封装浏览器
                var dbrowser = isDBrowser();
                if (dbrowser) {
                    browser = dbrowser;
                } else {
                    //判断其他浏览器
                    browser = is360();
                    browser = browser ? browser : fbrowser;
                }
            } else {
                browser = fbrowser;
            }
            return type ? type.toLowerCase() == browser.toLowerCase() : browser;
        }
        //封装浏览器判断
        function isWBrowser() {
            var wst = 0,
                wBrowser = "MSIE|like Gecko",
                browsers = wBrowser.split("|"),
                wlen = browsers.length,
                flag = false;
            for (; wst < wlen; wst++) {
                var temp = browsers[wst];
                if (UA.indexOf(temp) > -1) {
                    flag = true;
                    break;
                }
            }
            return flag;
        }
        //主流浏览器判定
        function isFBrowser() {
            var fst = 0,
                fBrowser = "Firefox|MSIE|Chrome|Safari|Opera",
                browsers = fBrowser.split("|"),
                flen = browsers.length,
                browser = "";
            for (; fst < flen; fst++) {
                var temp = browsers[fst];
                if (UA.indexOf(temp) > -1) {
                    browser = temp;
                    break;
                }
            }
            return browser;
        }
        //国内浏览器
        function isDBrowser() {
            var mst = 0,
                dBrowser = "QQBrowser|BIDUBrowser|Maxthon|LBBROWSER|360SE|SE",
                browsers = dBrowser.split("|"),
                mlen = browsers.length,
                browser = "";
            for (; mst < mlen; mst++) {
                var temp = browsers[mst];
                if (UA.indexOf(temp) > -1) {
                    browser = temp;
                    break;
                }
            }
            return browser;
        }
        //判断是否是360浏览器
        function is360() {
            var browser = "";
            if (UA.indexOf("360SE") > -1) {
                //360旧版IE内核浏览器
                browser = "360IE";
            } else {
                var browser = ""; //安全浏览器（chrome内核）
                if (is360SE()) {
                    //低版本的360安全浏览器（chrome内核）
                    browser = "360SE";
                } else {
                    var isTrack = "track" in document.createElement("track"),
                        isScope = "scoped" in document.createElement("style"),
                        isV8Locale = "v8Locale" in window;
                    if (isTrack && isScope && isV8Locale) {
                        browser = "360SE";
                    } else if (isTrack && isScope && !isV8Locale) {
                        //极速浏览器（chrome内核）
                        browser = "360JS";
                    }
                }
            }
            return browser;
        }
        function is360SE() {
            //判断为低端版本的360安全浏览器（chrome内核）
            var is360Chrome = UA.indexOf("360chrome") > -1 ? true : false, //判断是否为360Chrome浏览器
                runPath;
            try {
                //判断是否为360安全浏览器
                window.external && window.external.twGetRunPath && (runPath = window.external.twGetRunPath) && UA.indexOf("360se") > -1 && (is360Chrome = true);
            } catch (a) {
                is360Chrome = false;
            }
            return is360Chrome;
        }
        return Tool;
    })();
    if (!window.MozillaTool) window.MozillaTool = MozillaTool;
})();

/*处理侧边栏滚动*/
(function () {
    var MozillaScrollBar = function (options) {
        var that = this;
        that.settings = {
            barType: "relative", //类型  relative   absolute两种
            sideReferEle: null, //侧边参考元素
            sideTargetEle: null, //侧边变化元素（即添加样式元素）
            footerEle: null, //底部元素
            referEle: null, //参考元素（用于比较侧边栏与主题部分的高度，仅适用于barType:relative元素）
            fixed_cls: "", //添加的fixed 样式
            absolute_cls: "", //添加的absolute 样式
        };
        that.settings = $.extend(that.settings, options);
        that.settings.init && that.settings.init.call(that);
    };
    MozillaScrollBar.prototype = {
        init: false, //初始化标志
        initPos: null, //初始位置
        initFixedPos: null, //fixed class的top值（barType-absolute情况下）
        scroll: function () {
            var that = this,
                settings = that.settings,
                sideReferEle = settings.sideReferEle,
                sideTargetEle = settings.sideTargetEle,
                footerEle = settings.footerEle,
                referEle = settings.referEle;

            if (sideReferEle.length && sideTargetEle.length && footerEle.length) {
                var sTop = MozillaTool.getScrollPos().top;
                pageVisHeight = document.documentElement.clientHeight;
                (barType = settings.barType), (sideReferHeight = sideReferEle.height()), (sideTargetHeight = sideTargetEle.height()), (footerHeight = footerEle.height()), (sideReferTop = sideReferEle.get(0).getBoundingClientRect().top);
                (footerTop = footerEle.get(0).getBoundingClientRect().top), (pageMinus = pageVisHeight - sideReferHeight);
                var sInfo;
                switch (barType) {
                    case "relative":
                        sInfo = {
                            addScrollFlag: referEle.length ? referEle.height() > sideTargetHeight && sideTargetHeight > pageVisHeight : true,
                            addAbsoluteFlag: footerTop > 0 && footerTop < pageVisHeight - footerHeight + 50,
                            sTop: sTop,
                            sideReferTop: sideReferTop,
                            pageMinus: pageMinus,
                        };
                        that.scrollRelative(sInfo);
                        break;
                    case "absolute":
                        sInfo = {
                            sTop: sTop,
                            footerTop: footerTop,
                            sideReferHeight: sideReferHeight,
                        };
                        that.scrollAbsolute(sInfo);
                        break;
                }
            }
        },
        //问题
        scrollRelative: function (sInfo) {
            if (!sInfo.addScrollFlag) return; //如果主题内容区域高度不如侧边栏，则不进行样式变换
            var that = this,
                settings = that.settings,
                fixedCls = settings.fixed_cls,
                absoluteCls = settings.absolute_cls,
                sideReferEle = settings.sideReferEle,
                sideTargetEle = settings.sideTargetEle,
                sideReferTop = sideReferEle.get(0).getBoundingClientRect().top;

            if (!that.initPos) {
                that.initPos = sideReferTop + sInfo.sTop; //初始化fixed 临界位置
            }

            if (!that.init) {
                var addFixedFlag = sideReferTop <= sInfo.pageMinus;
                if (addFixedFlag) {
                    that.init = true;
                    sideTargetEle.addClass(absoluteCls + " " + fixedCls);
                }
            }
            //拖到页面最底部
            if (sInfo.addAbsoluteFlag) {
                sideTargetEle.removeClass(fixedCls);
            } else {
                if (that.init) {
                    //恢复原样
                    var restoreFlag = sInfo.sTop < that.initPos - sInfo.pageMinus;
                    if (restoreFlag) {
                        that.init = false;
                        sideTargetEle.removeClass(absoluteCls + " " + fixedCls);
                    } else {
                        sideTargetEle.addClass(absoluteCls + " " + fixedCls);
                    }
                }
            }
        },
        scrollAbsolute: function (sInfo) {
            var that = this,
                settings = that.settings,
                absoluteCls = settings.absolute_cls,
                fixedCls = settings.fixed_cls,
                sideReferEle = settings.sideReferEle,
                sideTargetEle = settings.sideTargetEle,
                sideReferTop = sideReferEle.get(0).getBoundingClientRect().top;
            if (!that.initPos) that.initPos = sideReferTop + sInfo.sTop;
            var addFixedFlag = sInfo.sTop >= that.initPos; //初始化fixed 临界位置
            if (addFixedFlag) {
                sideTargetEle.addClass(fixedCls);
                if (!that.init) {
                    that.init = true;
                    that.initFixedPos = sideReferEle.position().top; //初始化fixed top
                }
                //处理到底部
                var addAbsoluteFlag = sInfo.footerTop <= that.initFixedPos + sInfo.sideReferHeight + 10;
                if (addAbsoluteFlag) {
                    sideTargetEle.addClass(absoluteCls);
                } else {
                    sideTargetEle.removeClass(absoluteCls);
                }
            } else {
                //恢复原状
                that.init = false;
                sideTargetEle.removeClass(fixedCls + " " + absoluteCls);
            }
        },
    };
    !window.MozillaScrollBar && (window.MozillaScrollBar = MozillaScrollBar);
})();

/*
 * 日志记录(注意新页面打开和当前页面打开的区别处理)
 */
(function () {
    var TraceWidget = (function () {
        //var CHANNEL_ID = "unknown";//频道ID
        var TraceTool = function () {};
        /*
         * 获取channel_id
         */
        TraceTool.loadChannel = function () {
            //CHANNEL_ID = getChannelid();
            getChannelid();
        };
        /*
         * 整体链接添加日志（包含链接和form）-live确保单个元素没有阻止冒泡
         */
        TraceTool.build = function (newFlag) {
            getChannelid();
            $(document).on("click", "a", function (evt) {
                linkTrace($(this));
            });
            $(document).on("submit", "form", function (evt) {
                var form = $(this),
                    //更改search key 值
                    engineKey = form.find(".engine-key"),
                    engineKeyHidden = form.find(".engine-key-hidden"),
                    title = engineKey.val() || "无关键字",
                    url = form.attr("trace-url"),
                    key = form.attr("trace-key") || form.attr("track-key");
                if (engineKey.length && engineKeyHidden.length) {
                    engineKeyHidden.val(engineKey.val());
                    //engineKey.val("");
                    $(".search-engine .engine-key").val("");
                }
                //处理搜索form
                if (form.hasClass("engine-trace-form")) {
                    var action = form.attr("action"),
                        engine = $.trim(form.find(".engine-type").val());
                    url = action + "?q=" + title + "&engine=" + engine;
                }
                form.attr({
                    "trace-title": title,
                    "trace-url": url,
                });
                trace(title, url, key);
            });
        };
        /*
         * 快速添加单个链接日志
         */
        TraceTool.addLinkTrace = function (btn) {
            linkTrace($(btn));
        };
        /*
         * 用于单个添加日志
         */
        TraceTool.addTrace = function (title, href, key, btn, newFlag) {
            trace(title, href, key, btn, newFlag);
        };
        /*
         * 记录皮肤等的展示日志
         */
        var displayData = {};
        TraceTool.addDisplayTrace = function (type, title, href, key) {
            var date = new Date(),
                curTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(), //展示日志的时间戳
                ndpData = StorageWidget.getItem("n_2014_dp_data", displayData), //区分2013版本
                newData = ndpData;
            if (ndpData.time != curTime) {
                newData = {};
                newData.time = curTime;
                newData[type] = 1;
            } else if (!ndpData[type]) {
                newData[type] = 1;
            } else {
                return;
            }
            displayData = newData;
            trace(title, href, key);
            StorageWidget.setItem("n_2014_dp_data", newData); //区分2013版本
        };
        /*=================内部函数=================*/
        function linkTrace(node, newFlag) {
            var title = node.attr("title") || node.text(),
                href = node.attr("href") || "javascript:;",
                traceKey = $.trim(node.attr("trace-key") || node.attr("track-key")),
                key = traceKey ? traceKey : undefined;
            //处理猎豹第三方的数据统计
            if (key == "news_tfeed_tparty") {
                trace(title, href, key, node, newFlag);
                key = "";
            }
            if (!key) {
                var pNode = node.parents("[trace-key],[track-key]").eq(0);
                key = pNode.length ? pNode.attr("trace-key") || pNode.attr("track-key") || "other_unknown" : undefined;
            }
            trace(title, href, key, node, newFlag);
        }
        function trace(title, href, key, btn, newFlag) {
            var href = $.trim(href);
            if (href) {
                var title = $.trim(title) || "无关键字",
                    key = $.trim(key) || "other_unknown",
                    image = new Image(),
                    cid = CHANNEL_ID;
                image.src = "2019/img/trace_2014.gif" + "?r=" + Math.random() + "&d=" + encodeURIComponent(document.location.host) + "&c=" + encodeURIComponent(key) + "&a=" + encodeURIComponent("") + "&u=" + encodeURIComponent(href) + "&cid=" + encodeURIComponent(cid) + "&t=" + encodeURIComponent(title);
            }
        }
        //恢复链接的默认点击行为
        function restoreDefaultAction(btn, href) {
            var btn = $(btn),
                tagName = $(btn).get(0).tagName.toLowerCase();
            switch (tagName) {
                case "form":
                    btn.submit();
                    break;
                default:
                    window.top.href = href;
                    break;
            }
        }
        //获取频道id
        /*function getChannelid(){
            try{
               // var is_gecko = ((window.Components + '') == '[object nsXPCComponents]');
               // if (is_gecko) {
                    if (window.cehomepage) {
                        var startup = window.cehomepage.startup;
                        if ( !startup.channelid ) {
                            return "unknown";
                        } else {
                            return startup.channelid();
                        }
                    }
               // }
            }catch(e){
                return "unknown";
            }
            return "unknown";
        }*/
        function getChannelid() {
            // alert("NEW_EXTENSION="+NEW_EXTENSION+"  NEW_EXTENSION_50="+NEW_EXTENSION_50);
            if (NEW_EXTENSION) {
                //新扩展 35版本之后
                //创建并触发WebChannelMessageToChrome事件
                //获取CHANNEL_ID
                var detail = {
                    id: window.mozCNChannel,
                    message: {
                        id: 5,
                        key: "startup.channelid",
                    },
                };
                var fetchChannelEvt = new window.CustomEvent("WebChannelMessageToChrome", NEW_EXTENSION_50 ? { detail: JSON.stringify(detail) } : { detail: detail });
                window.dispatchEvent(fetchChannelEvt);
            } else if (window.cehomepage || window.mozCNUtils) {
                // 兼容之前的扩展
                try {
                    if (window.cehomepage) {
                        var startup = window.cehomepage.startup;
                        if (!startup.channelid) {
                            //return "unknown";
                            CHANNEL_ID = "unknown";
                        } else {
                            //return startup.channelid();
                            CHANNEL_ID = startup.channelid();
                        }
                    }
                } catch (e) {
                    CHANNEL_ID = "unknown";
                }
            }
        }
        return TraceTool;
    })();
    if (!window.TraceWidget) window.TraceWidget = TraceWidget;
})();

/*
 * 搜索引擎
 * 包含悬浮的搜索引擎
 */
(function () {
    var EngineWidget = (function () {
        var S_E_ENGINES = [
            {
                name: "web",
                label: "网页",
                lists: [
                    {
                        name: "baidu_web",
                        traceKey: "search_web_baidu",
                        label: "百度",
                        url: "//i.g-fox.cn/search",
                        classname: "baidu-logo",
                        href: "https://www.baidu.com/index.php?tn=monline_3_dg", //2015-08-03
                        charset: "utf-8",
                    },
                    {
                        name: "google_web",
                        traceKey: "search_web_google",
                        label: "谷歌",
                        url: "//i.g-fox.cn/search",
                        classname: "google-logo",
                        href: "https://www.google.com/",
                        charset: "utf-8",
                        /* "title":"谷歌",
                            "cls":"google-logo",
                            "url": "https://www.google.com/",
                            "action": "https://i.g-fox.cn/search",
                            "engine":"google_web",
                            "traceKey":"search_web_google"*/
                    },
                ],
            },
            /*{
                    name: "news",
                    label: "新闻",
                    lists: [{
                          name: 'baidu_news',
                          traceKey: 'search_news_baidu',
                          label: '百度',
                          url: '//i.g-fox.cn/search',
                          classname: 'baidu-logo',
                          href: 'http://news.baidu.com/',
                          charset: 'utf-8'
                        }, 
                        {
                          name: 'google_news',
                          traceKey: 'search_news_google',
                          label: '谷歌',
                          url: '//i.g-fox.cn/search',
                          classname: 'google-logo',
                          href: 'http://news.google.com.hk/nwshp?hl=zh-CN&tab=in&client=aff-priustest&channel=hotlink',
                          charset: 'utf-8'
                        }]
                  },
                  {
                    name: "map",
                    label: "地图",
                    lists: [
                              {
                                  name: 'baidu_map',
                                  traceKey: 'search_map_baidu',
                                  label: '百度',
                                  url: '//i.g-fox.cn/search',
                                  classname: 'baidu-logo',
                                  href: 'http://map.baidu.com/',
                                  charset: 'utf-8'
                              },
                              {
                                  name: 'google_map',
                                  traceKey: 'search_map_google',
                                  label: '谷歌',
                                  url: '//i.g-fox.cn/search',
                                  classname: 'google-logo',
                                  href: 'http://ditu.google.cn/maps?hl=zh-CN&tab=il&client=aff-priustest&channel=hotlink',
                                  charset: 'utf-8'
                              },
                              {
                                 name: 'gaode_map',
                                 traceKey: 'search_map_gaode',
                                 label: '高德',
                                 url: '//i.g-fox.cn/search',
                                 classname: 'gaode-logo',
                                 href: 'http://www.amap.com/?src=firefox',
                                 charset: 'utf-8'
                              }
                          ]
                  },
                  {
                    name: "video",
                    label: "视频",
                    lists: [ 
                        {
                          name: 'baidu_video',
                          traceKey: 'search_video_baidu',
                          label: '百度',
                          url: '//i.g-fox.cn/search',
                          classname: 'baidu-logo',
                          href: 'http://video.baidu.com/',
                          charset: 'utf-8'
                        },
                        {
                          name: 'google_video',
                          traceKey: 'search_video_google',
                          label: '谷歌',
                          url: '//i.g-fox.cn/search',
                          classname: 'google-logo',
                          href: 'http://www.google.com.hk/videohp?hl=zh-CN&ned=cn&tab=nv&client=aff-priustest&channel=hotlink',
                          charset: 'utf-8'
                        }
                        ]
                  },
                  {
                    name: "image",
                    label: "图片",
                    lists: [{
                          name: 'baidu_image',
                          traceKey: 'search_image_baidu',
                          label: '百度',
                          url: '//i.g-fox.cn/search',
                          classname: 'baidu-logo',
                          href: 'http://image.baidu.com/',
                          charset: 'utf-8'
                        }, 
                        {
                          name: 'google_image',
                          traceKey: 'search_image_google',
                          label: '谷歌',
                          url: '//i.g-fox.cn/search',
                          classname: 'google-logo',
                          href: 'http://www.google.com.hk/imghp?hl=zh-CN&tab=wi&client=aff-priustest&channel=hotlink',
                          charset: 'utf-8'
                        }]
                  },
                  {
                    name: "music",
                    label: "音乐",
                    lists: [{
                          name: 'baidu_music',
                          traceKey: 'search_music_baidu',
                          label: '百度',
                          url: '//i.g-fox.cn/search',
                          classname: 'baidu-logo',
                          href: 'http://music.baidu.com/',
                          charset: 'utf-8'
                        }]
                  },
                  {
                    name: "shopping",
                    label: "购物",
                    lists: [{
                          name: 'taobao_shopping',
                          traceKey:"search_shopping_taobao",
                          label: '淘宝',
                          url: '//i.g-fox.cn/search',
                          classname: 'taobao-logo',
                          href: 'http://ai.taobao.com?pid=mm_28347190_2425761_13466329',
                          charset: 'utf-8'
                        },
                        {
                          name: 'amazon_shopping',
                          traceKey:"search_shopping_amazon",
                          label: '亚马逊',
                          url: '//i.g-fox.cn/search',
                          classname: 'amazon-logo',
                          href: 'http://www.amazon.cn/?source=Mozilla'
                        }, 
                        {
                          name: 'jingdong_shopping',
                          traceKey:'search_shopping_jd',
                          label: '京东',
                          url: '//i.g-fox.cn/search',
                          classname: 'jingdong-logo',
                          href: 'http://union.click.jd.com/jdc?e=&p=AyICZRprEAIQA1MaWBYyVlgNRQQlW1dCFBBFC0RUQUpADgpQTFtLKwRLR1NaBVMDQDITN1YYWhEBEwVcHmslY2A3HnVeFQAWAVQYWA%3D%3D&t=W1dCFBBFC0RUQUpADgpQTFtL',
                          charset: 'gbk'
                        }]
                  },
                  {
                    name: "zhidao",
                    label: "知道",
                    lists: [{
                          name: 'baidu_zhidao',
                          traceKey: 'search_know_baidu',
                          label: '知道',
                          url: '//i.g-fox.cn/search',
                          classname: 'baidu-logo',
                          href: 'http://zhidao.baidu.com/',
                          charset: 'utf-8'
                        }]
                  }*/
        ];
        var SearchEngine = function (options) {
            var that = this;
            that.settings = {
                wrapper: "", //外层容器元素
                navEle: "", //tab导航菜单
                radioEle: "", //底部radio
                logoListEle: "", //搜索下拉列表
                formEle: "", //搜索form
                keyEle: "", //搜索输入框
                logoShowEle: "", //搜索logo
                logoMoreEle: "", //搜索logo更多按钮
                linkEle: "", //搜索logo对应链接
                curEle: "", //保存当前搜索引擎名称的hidden元素
                tipEle: "", //搜索提示
                tipKeySelector: "",
                tipShowSelector: "",
                hotBtnEle: "", //热门搜索推荐下拉框
                bubbleEle: "", //热门搜索推荐气泡
                hotListEle: "", //热门搜索推荐列表
                tipSelectClass: "selected", //tip选中样式
                navSelectClass: "on", //nav选中样式
                lastNavClass: "last", //最后一个nav的样式
            };
            for (var p in options) {
                if (that.settings[p] != undefined) that.settings[p] = options[p];
            }
            that.init();
        };
        SearchEngine.prototype = {
            //2013-12-31 start
            initiated: false, //用于保存初始化focus输入框的状态（避免热门内容跳出）
            //2013-12-31 end
            showHotBtn: true, //hot按钮显示（不同的搜索模块显隐不同）
            showBubble: true, //保存bubble是否显示
            showAuto: false, //是否自动显示搜索热门推荐词
            navIndex: 0, //保存顶部菜单index
            radioIndex: 0, //底部radio的index
            lastword: "", //保存用户最后一次输入的内容
            engineTabs: S_E_ENGINES, //tab默认配置
            bindEvents: function () {
                var that = this,
                    settings = that.settings,
                    wrapper = settings.wrapper,
                    formEle = settings.formEle,
                    keyEle = settings.keyEle,
                    logoShowEle = settings.logoShowEle,
                    logoMoreEle = settings.logoMoreEle,
                    tipEle = settings.tipEle,
                    tipKeySelector = settings.tipKeySelector,
                    tipShowSelector = settings.tipShowSelector,
                    hotBtnEle = settings.hotBtnEle,
                    bubbleEle = settings.bubbleEle,
                    hotListEle = settings.hotListEle,
                    logoListEle = settings.logoListEle,
                    searchKeys = $(tipKeySelector),
                    searchTips = $(tipShowSelector),
                    tipSelectClass = settings.tipSelectClass;
                //热门搜索按钮点击
                hotBtnEle.on("click", function (evt) {
                    evt.stopPropagation();
                    that.dealHotRecommend();
                    evt.preventDefault();
                });
                //气泡点击
                bubbleEle.on("click", function (evt) {
                    evt.stopPropagation();
                    that.dealHotRecommend();
                    evt.preventDefault();
                });
                //热门推荐搜索设置
                hotListEle.find(".engine-hot-set input,.engine-hot-set label").on("click", function (evt) {
                    evt.stopPropagation();
                    if (!this.checked) {
                        that.showAuto = false;
                        StorageWidget.setItem("n_2014_hot_auto", -1);
                    } else {
                        that.showAuto = true;
                        StorageWidget.setItem("n_2014_hot_auto", 1);
                    }
                });
                //搜索提示、热门推荐搜索推荐
                $(document).on("click", ".engine-hint-list li", function (evt) {
                    var btn = $(this),
                        key = $.trim(btn.find("span").text());
                    //keyEle.val(key);
                    searchKeys.val(key);
                    that.lastword = key;
                    //修改热门搜索trace-key值,便于单独统计此区域
                    var oldKey = $.trim(formEle.attr("trace-key")),
                        hotRankEle = btn.parents("#engine-hot-show");
                    if (hotRankEle.length) {
                        newKey = hotRankEle.eq(0).attr("trace-key");
                        formEle.attr("trace-key", newKey);
                        wrapper.removeClass("expand");
                    }
                    formEle.submit();
                    formEle.attr("trace-key", oldKey);
                    wrapper.find(".engine-hint-list").hide();
                    //keyEle.val("");
                    searchKeys.val("");
                    that.lastword = "";
                    evt.preventDefault();
                });
                //搜索添加提示

                keyEle.click(function (evt) {
                    evt.stopPropagation();
                    var val = $.trim($(this).val());
                    if (!val && that.showAuto && that.showHotBtn) {
                        //在文本为空，且设置为自动显示，且为可显示热门推荐搜索的区块下
                        //2013-12-31 start
                        that.initiated = true;
                        //2013-12-31 end
                        that.showHotRecommend();
                    }
                });
                //键盘上下键控制tip的选中
                $(tipKeySelector).keyup(function (evt) {
                    evt.stopPropagation();
                    var btn = $(this),
                        keyCode = evt.keyCode,
                        btnParent = btn.parent(),
                        tipEle = btnParent.find(tipShowSelector),
                        hotEle = btnParent.find(".engine-hot-list"),
                        tips = tipEle.find("li"),
                        tlen = tips.length,
                        selectTip = tipEle.find("." + tipSelectClass),
                        selVal = "",
                        selectIndex = -1,
                        changeIndex = 0;

                    selectTip.length && (selectIndex = selectTip.eq(0).index());
                    //Up
                    if (keyCode == 38) {
                        changeIndex = selectIndex > 0 ? selectIndex - 1 : tlen - 1;
                        //tips.eq(changeIndex).addClass(tipSelectClass).siblings().removeClass(tipSelectClass);
                        searchTips
                            .find("li:eq(" + changeIndex + ")")
                            .addClass(tipSelectClass)
                            .siblings()
                            .removeClass(tipSelectClass);
                        //selVal = $.trim(tipEle.find("li."+tipSelectClass+" span").html());
                        selVal = tipEle.find("li." + tipSelectClass + " span").html();
                        //btn.val(selVal);
                        //同步显示两个engine-key里的input内容
                        searchKeys.val(selVal);
                        that.lastword = selVal;
                        //Down
                    } else if (keyCode == 40) {
                        changeIndex = selectIndex < tlen - 1 ? selectIndex + 1 : 0;
                        //tips.eq(changeIndex).addClass(tipSelectClass).siblings().removeClass(tipSelectClass);
                        searchTips
                            .find("li:eq(" + changeIndex + ")")
                            .addClass(tipSelectClass)
                            .siblings()
                            .removeClass(tipSelectClass);
                        //selVal = $.trim(tipEle.find("li."+tipSelectClass+" span").html());
                        selVal = tipEle.find("li." + tipSelectClass + " span").html();
                        //btn.val(selVal);
                        //同步显示两个engine-key里的input内容
                        searchKeys.val(selVal);
                        that.lastword = selVal;
                    } else if (keyCode == 13) {
                        //回车
                        //tipEle.hide();
                        searchTips.hide();
                    } else {
                        var val = $.trim(btn.val());
                        if (!val && that.showAuto && that.showHotBtn && that.initiated) {
                            //显示热门推荐搜索
                            hotEle.length && that.showHotRecommend();
                        } else {
                            hotEle.length && that.hideHotRecommend();
                            searchTips.hide();
                            that.showSearchTips($(this), tipEle);
                        }
                    }
                });
                logoMoreEle.on("click", function (evt) {
                    evt.stopPropagation();
                    var btn = $(this);
                    if (btn.is(":visible")) {
                        if (btn.hasClass("expand")) {
                            btn.removeClass("expand");
                            logoListEle.hide();
                        } else {
                            btn.addClass("expand");
                            logoListEle.show();
                        }
                    }
                    evt.preventDefault();
                });

                //搜索logo切换
                $(document).on("click", ".engine-logo-list span", function (evt) {
                    evt.stopPropagation();
                    var btn = $(this),
                        btnParent = btn.parents(".engine-logos").eq(0),
                        nIndex = btn.attr("nindex"),
                        rIndex = btn.attr("rindex");
                    logoListEle.hide();
                    logoMoreEle.removeClass("expand");
                    logoShowEle.attr("class", btn.attr("class"));
                    that.showSearchInput(nIndex, rIndex);
                    //保存本地的搜索配置
                    StorageWidget.setItem("n_2014_engine_index", rIndex);
                    //2013-12-31 start
                    keyEle.focus();
                    that.initiated = false;
                    //2013-12-31 end
                    evt.preventDefault();
                });
            },
            init: function () {
                var that = this,
                    settings = that.settings,
                    bubbleEle = settings.bubbleEle,
                    hotListEle = settings.hotListEle,
                    keyEle = settings.keyEle,
                    //bubbleExpire = document.documentElement.getAttribute("expire"),
                    //sBubble = CookieWidget.getItem("n_2014_s_bubble"),       //区分于2013
                    nowTime = new Date(),
                    timeVersion = nowTime.getFullYear() + "-" + (nowTime.getMonth() + 1) + "-" + nowTime.getDate();
                (sBubble = StorageWidget.getItem("n_2014_s_bubble", 0)), //区分于2013
                    (hotAuto = StorageWidget.getItem("n_2014_hot_auto", -1)), //区分于2013
                    (engineIndex = StorageWidget.getItem("n_2014_engine_index", 0)); //保存本地的搜索配置
                //that.bubbleExpire = bubbleExpire*1000; //保存bubble有效时间
                //初始化热门搜索气泡的显示和存储
                /*if(sBubble!=undefined){//初始存储 
                   if(bubbleEle.length){
                      switch(sBubble){
                          case 1:  bubbleEle.show(); break;
                          default: that.showBubble = false;bubbleEle.remove(); break;
                      }
                   }
                }else{
                    bubbleEle.length && bubbleEle.show();
                }*/
                if (!sBubble) {
                    bubbleEle.length && bubbleEle.show();
                    StorageWidget.setItem("n_2014_s_bubble", "");
                } else {
                    //判断是否已经过期
                    if (sBubble != timeVersion) {
                        bubbleEle.length && bubbleEle.show();
                        StorageWidget.setItem("n_2014_s_bubble", "");
                    }
                }
                //初始化自动热词自动显示
                switch (hotAuto) {
                    case 1:
                        that.showAuto = true;
                        hotListEle.find(".engine-hot-set input").get(0).checked = true;
                        break;
                }
                that.bindEvents();
                that.showSearchFrame(engineIndex);
                //2013-12-31 start
                keyEle.focus();
                //2013-12-31 end
            },
            //控制热门搜索推荐的显隐(直接点击控制)
            dealHotRecommend: function () {
                var that = this,
                    settings = that.settings,
                    wrapper = settings.wrapper;
                if (wrapper.hasClass("expand")) {
                    that.hideHotRecommend();
                } else {
                    that.showHotRecommend();
                }
            },
            //显示热门搜索推荐列表
            showHotRecommend: function () {
                var that = this,
                    settings = that.settings,
                    wrapper = settings.wrapper,
                    hotListEle = settings.hotListEle,
                    bubbleEle = settings.bubbleEle;
                wrapper.find(".engine-hint-list").hide();
                wrapper.addClass("expand");
                hotListEle.show();
                //设置bubble存储（第一次点击则去除bubble）
                if (that.showBubble && bubbleEle.length) {
                    bubbleEle.remove();
                    that.showBubble = false;
                    var nowTime = new Date(),
                        timeVersion = nowTime.getFullYear() + "-" + (1 + nowTime.getMonth()) + "-" + nowTime.getDate();
                    // CookieWidget.setItem("n_2014_s_bubble",-1,that.bubbleExpire);
                    StorageWidget.setItem("n_2014_s_bubble", timeVersion);
                }
            },
            //隐藏热门搜索推荐列表
            hideHotRecommend: function (hideBtnFlag) {
                var that = this,
                    settings = that.settings,
                    wrapper = settings.wrapper;
                wrapper.removeClass("expand");
                wrapper.find(".engine-hint-list").hide();
            },
            //显示搜索提示
            showSearchTips: function (btn, tipShowEle) {
                var that = this,
                    settings = that.settings,
                    tipKeySelector = settings.tipKeySelector,
                    tipShowSelector = settings.tipShowSelector,
                    searchTips = $(tipShowSelector),
                    searchKeys = $(tipKeySelector),
                    btnVal = btn.val(),
                    word = $.trim(btnVal);
                if (word && word != that.lastWord) {
                    that.lastword = word;
                    //同步显示两个engine-key里的input内容
                    searchKeys.val(btnVal);

                    showInputTips(tipShowEle, word, function (sug) {
                        if (tipShowEle.length && sug && sug.s) {
                            var tipHtm = "",
                                tlen = sug.s.length,
                                tindex = 0;
                            tipShowEle.empty();
                            if (tlen) {
                                tipHtm += "<ul>";
                                for (; tindex < tlen; tindex++) {
                                    tipHtm += "<li><span>" + sug.s[tindex] + "</span></li>";
                                }
                                tipHtm += "</ul>";
                                searchTips.html(tipHtm);
                                tipShowEle.show();
                            } else {
                                tipShowEle.hide();
                            }
                        }
                    });
                }
            },
            // 显示主框架
            showSearchFrame: function (rIndex) {
                var that = this;
                //hat.showSearchNav();
                that.showSearchInput(0, rIndex);
                that.showSearchLogo(0, rIndex);
            },
            // 显示搜索tab菜单
            showSearchNav: function () {
                var that = this,
                    settings = that.settings,
                    wrapper = settings.wrapper,
                    hotBtnEle = settings.hotBtnEle,
                    navSelectClass = settings.navSelectClass,
                    lastNavClass = settings.lastNavClass,
                    navEle = settings.navEle,
                    keyEle = settings.keyEle,
                    tabs = that.engineTabs,
                    tlen = tabs.length,
                    index = 0,
                    htm = "",
                    firstTab = false,
                    showHotBtn = false;

                $.each(tabs, function (i, n) {
                    if (n.name == "web" && !firstTab) {
                        showHotBtn = true;
                    }
                    htm += "<span  data-name='" + n.name + "' " + (i == index ? " class='" + navSelectClass + "'" : i == tlen - 1 ? " class='" + lastNavClass + "'" : "") + ">" + n.label + "</span>";
                });
                navEle.html(htm);
                showHotBtn && that.dealHotBtn(true);
                //添加事件绑定
                var navList = navEle.find("span");
                navList.click(function (evt) {
                    // evt.stopPropagation();
                    var btn = $(this),
                        bIndex = btn.index(),
                        btnName = btn.attr("data-name");
                    navList.removeClass(navSelectClass);
                    btn.addClass(navSelectClass);
                    //控制热词的显隐-目前仅网页搜索显示
                    if (btnName == "web") {
                        that.dealHotBtn(true);
                    } else {
                        that.dealHotBtn();
                    }
                    that.showSearchInput(bIndex, 0);
                    that.showSearchLogo(bIndex, 0);
                    //2013-12-31 start
                    keyEle.focus();
                    that.initiated = false;
                    //2013-12-31 end
                    evt.preventDefault();
                });
            },
            /*
             * 处理热门推荐按钮的显示和隐藏
             * @param{Boolean} show-true为显示 其他为隐藏
             */
            dealHotBtn: function (show) {
                var that = this,
                    settings = that.settings,
                    wrapper = settings.wrapper,
                    hotBtnEle = settings.hotBtnEle,
                    bubbleEle = settings.bubbleEle;
                if (show) {
                    //显示
                    that.showHotBtn = true;
                    hotBtnEle.show();
                    that.showBubble && bubbleEle.length && bubbleEle.show();
                } else {
                    //隐藏
                    that.showHotBtn = false;
                    hotBtnEle.hide();
                    bubbleEle.length && bubbleEle.hide();
                    that.hideHotRecommend();
                }
            },
            // 显示搜索主体部分(包含logo、输入框及其设置参数)
            showSearchInput: function (navIndex, radioIndex) {
                var that = this,
                    settings = that.settings,
                    curEle = settings.curEle,
                    tabs = that.engineTabs,
                    tab = tabs[navIndex],
                    engineList = tab.lists;
                engine = engineList[radioIndex];
                curEle.val(engine.name);
                that.dealSearchParam(navIndex, radioIndex);
            },
            //显示搜索logo下拉列表
            showSearchLogo: function (navIndex, radioIndex) {
                var that = this,
                    settings = that.settings,
                    tabs = that.engineTabs,
                    formEle = settings.formEle,
                    curEle = settings.curEle,
                    logoShowEle = settings.logoShowEle,
                    linkEle = settings.linkEle,
                    radioEle = settings.radioEle,
                    logoMoreEle = settings.logoMoreEle,
                    logoListEle = settings.logoListEle,
                    tab = tabs[navIndex],
                    engineList = tab.lists;
                (elen = engineList.length), (htm = "");
                logoMoreEle.removeClass("expand");
                radioEle.empty();
                if (elen > 1) {
                    $.each(engineList, function (i, n) {
                        var engine = engineList[i],
                            pClass = i == 0 ? "class='first'" : "";
                        htm += "<p " + pClass + ">" + "<span nindex='" + navIndex + "' rindex='" + i + "' class='engine-logo " + engine.classname + "' title='" + engine.label + "'>" + engine.label + "</span></p>";
                    });
                    logoMoreEle.css({ display: "block" });
                    logoListEle.html(htm);
                } else {
                    logoMoreEle.hide();
                    logoListEle.hide();
                }
            },
            // 处理form提交参数
            dealSearchParam: function (navIndex, radioIndex) {
                var that = this,
                    settings = that.settings,
                    curEle = settings.curEle,
                    formEle = settings.formEle,
                    logoShowEle = settings.logoShowEle,
                    tabs = that.engineTabs,
                    tab = tabs[navIndex],
                    engineList = tab.lists;
                engine = engineList[radioIndex];
                formEle.attr({
                    action: engine.url,
                    "accept-charset": engine.charset,
                    "trace-title": engine.label,
                    "trace-url": engine.url,
                    "trace-key": engine.traceKey,
                });
                logoShowEle.attr({
                    class: "engine-logo " + engine.classname,
                    // "trace-key":        engine.traceKey,
                    href: engine.href,
                    title: engine.label,
                });
                curEle.val(engine.name);
                that.navIndex = navIndex;
                that.radioIndex = radioIndex;
            },
        };
        SearchEngine.build = function (options) {
            var mozillaEngine = new SearchEngine(options);
        };
        SearchEngine.showInputTips = function (tipEle, word) {
            showInputTips(tipEle, word);
        };

        function showInputTips(tipEle, word, callback) {
            // 百度搜索提示
            window.baidu = {
                sug: function (sug) {
                    callback && callback.call(null, sug);
                },
            };

            if (word) {
                var sugSrc = "//www.baidu.com/su?ie=utf-8&wd=" + encodeURIComponent(word);
                $.ajax({
                    url: sugSrc,
                    type: "get",
                    dataType: "script",
                    scriptCharset: "gbk",
                    timeout: MOZ_INFO.TIME_OUT,
                    error: function (xhr, status, error) {
                        console.log(error);
                    },
                });
            }
        }
        return SearchEngine;
    })();
    if (!window.EngineWidget) window.EngineWidget = EngineWidget;
})();

/*
 * 更换皮肤
 */
(function () {
    //皮肤列表
    var SKIN = [
        {
            img: "img/thumbs/default.jpg",
            name: "默认皮肤",
            title: "蓝色海洋",
            type: "blue",
            classname: "skin-default",
        },
        {
            img: "img/thumbs/firefox.jpg",
            name: "火狐萌萌哒",
            type: "firefox",
        },
        {
            img: "img/thumbs/s-autumn.jpg",
            name: "春花秋色",
            type: "s-autumn",
        },
        {
            img: "img/thumbs/cloud.jpg",
            name: "漫游云端",
            type: "cloud",
        },
        {
            img: "img/thumbs/firefox.jpg",
            name: "火狐萌萌哒",
            type: "firefox",
        },
        {
            img: "img/thumbs/firefox.jpg",
            name: "火狐萌萌哒",
            type: "firefox",
        },
        {
            img: "img/thumbs/firefox.jpg",
            name: "火狐萌萌哒",
            type: "firefox",
        },
        {
            img: "img/thumbs/firefox.jpg",
            name: "火狐萌萌哒",
            type: "firefox",
        },
        {
            img: "img/thumbs/firefox.jpg",
            name: "火狐萌萌哒",
            type: "firefox",
        },
        {
            img: "img/thumbs/firefox.jpg",
            name: "火狐萌萌哒",
            type: "firefox",
        },
        {
            img: "img/thumbs/firefox.jpg",
            name: "火狐萌萌哒",
            type: "firefox",
        },
        {
            img: "img/thumbs/firefox.jpg",
            name: "火狐萌萌哒",
            type: "firefox",
        },
    ];
    //modified by winter end
    var SkinWidget = function (options) {
        var that = this;
        that.settings = {
            displayWrapper: "", //用于保存皮肤的元素
            panel: "", //最外层模块元素
            panelMenuEle: "", //涉及的面板菜单元素（header上 换肤、设置、访问记录）
            wrapper: "", //皮肤容器元素
            container: "", //滑动区域元素
            scroller: "", //滑动内容元素
            coupletEle: "", //对联广告（低于主题推广的优先级）
            themePriorityEle: "", //主题推广（可关闭，仅在默认皮肤下显示，优先级最高）
            skinEle: "", //皮肤显示的CSS元素
            cPageEle: "", //显示当前页的元素
            tPageEle: "", //显示总页数的元素
        };
        that.settings = $.extend(that.settings, options);
        that.init();
        that.bindEvents();
    };
    SkinWidget.prototype = {
        skinData: null, //保存Skin存储信息
        tempSkin: null, //用于操作之前的皮肤
        pageSize: 6, //每页显示的皮肤个数
        skinSlide: null, //皮肤滑动对象存储
        bindEvents: function () {
            var that = this,
                settings = that.settings,
                wrapper = settings.wrapper,
                container = settings.container,
                scroller = settings.scroller,
                coupletEle = settings.coupletEle,
                themePriorityEle = settings.themePriorityEle,
                prevEle = settings.prevEle,
                nextEle = settings.nextEle,
                wrapId = wrapper.attr("id"),
                cPageEle = settings.cPageEle,
                tPageEle = settings.tPageEle;
            //间接换肤（更换皮肤，但必须确认才进行保存）
            scroller.find(".btn-color").on("click", function (evt) {
                evt.stopPropagation();
                var btn = $(this),
                    skin = btn.attr("data-type");
                that.changeSkin(btn, skin);
                evt.preventDefault();
            });
            //构建皮肤滑动区域
            SlideWidget.build({
                container: container,
                scroller: scroller,
                nextEle: nextEle,
                prevEle: prevEle,
                success: function (cPage, tPage) {
                    //滑动完毕后回调函数设置当前页和总的页数
                    cPageEle.html(cPage + 1);
                    tPageEle.html(tPage);
                },
            });
            //保存皮肤
            wrapper.find(".btn-confirm").on("click", function (evt) {
                evt.stopPropagation();
                that.hidePanel();
                that.saveSkin();
            });
            //取消
            wrapper.find(".btn-cancel").on("click", function (evt) {
                evt.stopPropagation();
                //恢复之前的皮肤
                that.initSkinStyle(that.skinData);
                that.hidePanel();
            });

            //两侧对联推广关闭
            if (coupletEle.length) {
                coupletEle.find(".mod span").on("click", function (evt) {
                    evt.stopPropagation();
                    coupletEle.remove();
                    var nowTime = new Date(),
                        timeVersion = nowTime.getFullYear() + "-" + nowTime.getMonth() + "-" + nowTime.getDate();
                    StorageWidget.setItem("n_2014_couplet", timeVersion);
                });
            }
            //主题推广关闭
            if (themePriorityEle.length) {
                themePriorityEle.find(".close").on("click", function (evt) {
                    evt.stopPropagation();
                    if (confirm("嘤嘤嘤~~ 你真的要关闭此皮肤吗？")) {
                        StorageWidget.setItem("n_2014_theme_priority", -1);
                        themePriorityEle.hide();
                        CLOSE_PMT_SKIN = true;
                        //关闭皮肤，如果有被隐藏的异形，则打开异形
                        $(".skin-close-refer").show();
                    }
                });
            }
        },

        //从Storage里加载皮肤
        init: function () {
            var that = this;
            //modified by winter start
            var defaultData = StorageWidget.getItem("n_2014_skin", {
                img: "img/thumbs/default.jpg",
                name: "默认皮肤",
                title: "蓝色海洋",
                type: "blue",
                classname: "skin-default",
            });
            //加载皮肤列表
            that.initSkinStyle(defaultData, true);
            //modified by winter end
            that.loadSkinList();
        },
        //初始化皮肤样式
        initSkinStyle: function (skinData, loadFlag) {
            var that = this,
                settings = that.settings,
                displayWrapper = settings.displayWrapper,
                skinEle = $("#moz-skin"),
                skinData = skinData ? skinData : StorageWidget.getItem("n_2014_skin");
            //添加日志(页面加载时进行)
            loadFlag && TraceWidget.addDisplayTrace("skin", skinData.title, skinData.url, "display_skin");

            that.skinData = skinData;
            //if(!loadFlag){
            that.changeSkin(that.settings.scroller.find(".btn-color[data-type='" + skinData.type + "']").eq(0), skinData.type);
            //}
            //modified by winter end
        },
        loadSkinList: function () {
            var that = this,
                skin = that.skinData.type || "blue",
                settings = that.settings,
                cPageEle = settings.cPageEle,
                tPageEle = settings.tPageEle,
                wrapper = settings.wrapper,
                listEle = wrapper.find(".skin-scroller"),
                initialLen = listEle.find("li").length,
                htm = "",
                pageSize = that.pageSize,
                start = 0,
                len = SKIN.length;
            cPageEle.html(1);
            tPageEle.html(Math.ceil(len / pageSize));
            for (; start < len; start++) {
                var temp = SKIN[start],
                    cls = temp.classname,
                    optList = temp.optionList,
                    optHtm = "",
                    liSelected = false,
                    isLiFirst = false;
                //设置分页
                if ((start + 1) % pageSize == 1) {
                    htm += "<div class='slide-page'> <ul>";
                    isLiFirst = true;
                } else {
                    isLiFirst = false;
                }
                if (optList && optList.length) {
                    optHtm += "<div class='skin-color-option'>";
                    $.each(optList, function (i, n) {
                        var optionSelected = false;
                        if (skin == n.type) {
                            optionSelected = true;
                            liSelected = true;
                        }
                        optHtm += "<a href='javascript:;' data-title='" + (n.title ? n.title : n.name) + "' class='btn-color" + (n.classname ? " " + n.classname : "") + (optionSelected ? " selected" : "") + "' data-type='" + n.type + "'></a>";
                    });
                    optHtm += "</div>";
                }
                if (skin == temp.type) liSelected = true;
                var authorStr = temp.author ? "<span>" + temp.author + "</span>" : "";
                htm +=
                    "<li data-title='" +
                    (temp.title ? temp.title : temp.name) +
                    "' class='btn-color" +
                    (isLiFirst ? " first " : "") +
                    (cls ? " " + cls : "") +
                    (liSelected ? " selected" : "") +
                    "' data-type='" +
                    temp.type +
                    "'>" +
                    "   <div class='skin-img'>" +
                    "<img class='img-load-delay' src='' data-url='" +
                    temp.img +
                    "'/>" +
                    optHtm +
                    authorStr +
                    "</div>" +
                    "      <div class='skin-name'>" +
                    "       <span class='moz-radio'>" +
                    temp.name +
                    (temp.recommend ? "<sup>新</sup>" : "") +
                    "</span></div>" +
                    "</li>";
                if ((start + 1) % 6 == 0 || start == len - 1) {
                    htm += "</ul></div>";
                }
            }
            listEle.append(htm);
        },
        //切换皮肤显示
        changeSkin: function (btn, skin) {
            var that = this,
                settings = that.settings,
                wrapper = settings.wrapper,
                displayWrapper = settings.displayWrapper,
                skinEle = settings.skinEle,
                skin = skin != undefined ? skin : "blue",
                url = skin ? (skin == "blue" ? "" : (__tflag__ ? "srcode/2019/" : "2019/") + "css/skin/" + skin + (__tflag__ ? "" : SOURCE_SUFFIX) + ".css?" + __skversion__) : "";
            skinEle.attr("href", url);
            that.tempSkin = { title: btn.attr("data-title") || "无关键字", type: skin, url: skin };

            wrapper.find(".btn-color").removeClass("selected");
            displayWrapper.attr("class", skin);

            //处理默认主题推广
            //that.dealThemePriority(skin);

            //modified by holloween start
            var panelMenuEle = settings.panelMenuEle,
                adSideBar = $("#theme-side-bar-recs");
            //节日添加标注

            panelMenuEle.removeClass("holiday").find("em").html("");

            //广告处理
            if (adSideBar.length) {
                var targetAd = adSideBar.find("#theme-side-bar-" + skin);
                if (targetAd.length) {
                    targetAd.show().siblings().hide();
                    adSideBar.show();
                } else {
                    adSideBar.hide();
                }
            }
            //modified by holloween end

            switch (skin) {
                case "blue":
                    wrapper.find(".skin-default").addClass("selected");
                    break;
                case "orange":
                case "yellow":
                case "green":
                case "dblue":
                case "yellow":
                case "purple":
                    var colorList = wrapper.find(".skin-color"),
                        curColor = colorList.find(".color-" + skin);
                    colorList.addClass("selected");
                    curColor.addClass("selected");
                    break;
                default:
                    btn.addClass("selected");
                    break;
            }
        },

        //处理对联广告，主要针对含有默认主题推广的情况
        dealCouplet: function (show) {
            var that = this,
                settings = that.settings,
                coupletEle = settings.coupletEle,
                coupletTime = new Date(),
                coupletVersion = coupletTime.getFullYear() + "-" + coupletTime.getMonth() + "-" + coupletTime.getDate(),
                coupletTimeVersion = StorageWidget.getItem("n_2014_couplet", null);
            //处理对联广告
            if (coupletEle.length) {
                if (coupletTimeVersion != coupletVersion) {
                    var coupletImgs = coupletEle.find("img"),
                        coupletTime = "201w1023";
                    if (coupletImgs.length) {
                        $.each(coupletImgs, function (i, n) {
                            var temp = $(n),
                                tempURL = temp.attr("data-url");
                            if (tempURL) {
                                temp.attr("src", tempURL + "?v=" + coupletTime);
                                temp.removeAttr("data-url");
                            }
                            temp.on("load", function () {
                                coupletEle.find("span").show();
                            });
                        });
                        if (show == 1) {
                            coupletEle.show();
                        } else {
                            coupletEle.hide();
                        }
                    }
                }
            }
        },

        //保存skin至cookie
        saveSkin: function () {
            var that = this;
            that.skinData = that.tempSkin;
            StorageWidget.setItem("n_2014_skin", that.skinData);
        },
        //隐藏版块
        hidePanel: function () {
            var that = this,
                settings = that.settings,
                panel = settings.panel,
                panelMenuEle = settings.panelMenuEle;
            panel.slideUp(500);
            panelMenuEle.removeClass("on");
        },
    };
    SkinWidget.build = function (options) {
        var skinWidget = new SkinWidget(options);
    };
    if (!window.SkinWidget) window.SkinWidget = SkinWidget;
})();

/*
 * Tab页切换、可自动切换
 */
(function () {
    var TabWidget = function (selector) {};
    TabWidget.build = function (selector, fetchDataCallback) {
        var wrap = $(selector);
        $.each(selector, function (i, n) {
            var temp = n,
                tabMenu = $(temp),
                tabDetail = tabMenu.next(),
                menuEles = tabMenu.find("li"),
                switchType = tabMenu.attr("switch-type"), //控制切换事件（默认为mouseover 可以设置其他事件）
                eName = switchType ? switchType.toLowerCase() : "mouseover";

            //添加鼠标停留的时间判断，避免用户误操作
            if (eName == "mouseover") {
                //mouseenter时添加interval标记
                menuEles.mouseenter(function (evt) {
                    evt.stopPropagation();
                    var btn = $(this),
                        mInterval = tabMenu.attr("minterval");
                    if (btn.attr("oit") != undefined) return; //存储interval
                    mInterval != null && clearInterval(parseInt(mInterval));
                    btn.attr("overTime", new Date().getTime()).siblings().removeAttr("overTime"); //存储时间戳
                    var overInterval = setInterval(function () {
                        if (btn.attr("oit") == undefined) {
                            //clearTabInterval("menu");
                            return;
                        }
                        var overTime = new Date().getTime(),
                            menuTime = parseInt(btn.attr("overTime")) || overTime,
                            minus = Math.abs(overTime - menuTime);

                        //超过停留时间则视为有效
                        if (minus >= MOZ_INFO.OVER_TIME) {
                            //清除自动Tab切换
                            var minterval = tabMenu.attr("minterval");
                            if (minterval != null) {
                                // clearInterval(parseInt(minterval));
                                clearInterval(parseInt(minterval));
                                tabMenu.removeAttr("minterval");
                            }
                            //清除overInterval
                            //clearTabInterval("menu");
                            clearInterval(overInterval);
                            //显示Tab内容
                            showTab(btn, fetchDataCallback);
                        }
                    }, 10);
                    btn.attr("oit", overInterval).siblings().removeAttr("oit");
                    //TAB_MENU_ARR.push(overInterval);
                });

                //mouseleave时去除interval标记
                menuEles.mouseleave(function (evt) {
                    evt.stopPropagation();
                    var btn = $(this);
                    btn.removeAttr("oit");
                });
            } else {
                //其他事件（预设为click事件）
                menuEles.on(eName, function (evt) {
                    evt.stopPropagation();
                    var btn = $(this),
                        mInterval = tabMenu.attr("minterval");
                    mInterval != null && clearInterval(parseInt(mInterval));
                    showTab(btn, fetchDataCallback);
                });
            }
        });
    };
    /* 随机显示  */
    TabWidget.randSwitch = function (selector) {
        var wrap = $(selector);
        $.each(wrap, function (i, n) {
            var temp = n,
                tabMenu = $(temp),
                randomFlag = tabMenu.attr("data-random"); //仅对设置了data-random的元素有效（cms中对应field1 auto对应field2）
            if (randomFlag) {
                var menuEles = tabMenu.find("li[no-random='']"), // 包含所有没有设置no-random属性的li
                    menuLen = menuEles.length,
                    randIndex = Math.random(),
                    refer = 10,
                    showIndex = randIndex * refer;
                if (menuLen > 1) {
                    //处理显示百分比
                    var perArr = [],
                        perTotal = 0,
                        extraIndex = 0; //去除正常含有rand-per百分比的剩余个数 即 per= 0
                    for (var i = 0; i < menuLen; i++) {
                        var menuLi = menuEles.eq(i),
                            perAttr = $.trim(menuLi.attr("rand-per")),
                            perVal = 0;
                        if (perAttr) {
                            (perVal = parseFloat(perAttr)), (temp = perTotal + perVal);
                            if (temp > 1) {
                                perVal = 1 - perTotal > 0 ? 1 - perTotal : 0;
                                perTotal = 1;
                            } else {
                                perTotal = temp;
                            }
                        } else {
                            perVal = 0;
                        }
                        if (perVal == 0) extraIndex++;
                        perArr.push(perVal);
                    }

                    //控制实际的显示
                    var perExtra = perTotal < 1 ? (1 - perTotal > 0 ? (1 - perTotal) / extraIndex : 0) : 0,
                        showPers = [],
                        breakPoint = 0, //临界点
                        perIndex = 0;
                    for (var start = 0; start < menuLen; start++) {
                        var temp = perArr[start],
                            menuLi = menuEles.eq(start),
                            menuPer = temp > 0 ? temp : perExtra,
                            breakPoint = breakPoint + menuPer * refer;
                        showPers.push(breakPoint);
                    }
                    while (showIndex > showPers[perIndex] && perIndex < menuLen) {
                        perIndex++;
                    }
                    showTab(menuEles.eq(perIndex));
                } else {
                    menuEles = tabMenu.find("li");
                    menuEles.length && showTab(menuEles.eq(Math.floor(randIndex * menuEles.length)));
                }
            }
        });
    };
    //Tab自动切换
    TabWidget.autoSwitch = function (selector) {
        var wrap = $(selector);
        $.each(wrap, function (i, n) {
            var temp = n,
                tabMenu = $(n),
                tabDetail = tabMenu.next(),
                autoFlag = tabMenu.attr("data-auto");

            if (autoFlag) {
                tabMenu.removeAttr("data-auto");
                var menuEles = tabMenu.find("li[auto-enabled]"),
                    mLen = menuEles.length;

                //自动切换
                var menuInterval = setInterval(function () {
                    var curMenu = menuEles.filter(".on"),
                        curIndex = menuEles.index(curMenu),
                        newIndex = curIndex + 1 > mLen - 1 ? 0 : curIndex + 1;
                    showTab(menuEles.eq(newIndex));
                }, 10000);
                tabMenu.attr("minterval", menuInterval);

                //对于设置了自动切换（即data-auto不为空）的元素，鼠标提留在内容区时间超过MOZ_INFO.OVER_TIME时间则去除自动切换
                if (tabDetail.length && autoFlag) {
                    //mouseenter、over添加自动切换时间戳
                    tabDetail.on("mouseenter mouseover", function (evt) {
                        evt.stopPropagation();
                        evt.stopPropagation();
                        var btn = $(this);
                        !btn.attr("otime") && btn.attr("otime", new Date().getTime());
                    });

                    //mouseleave去除自动切换时间戳
                    tabDetail.mouseleave(function (evt) {
                        evt.stopPropagation();
                        var btn = $(this);
                        btn.removeAttr("otime");
                        if (tabMenu.attr("minterval") == undefined) {
                            btn.off("mouseleave mouseover mouseenter");
                            return;
                        }
                    });

                    //setInterval检测鼠标的停留时间
                    var overInterval = setInterval(function () {
                        var mInterval = tabMenu.attr("minterval"); //tab自动切换
                        if (mInterval != undefined) {
                            var curTime = new Date().getTime(),
                                beforeTime = tabDetail.attr("otime");
                            if (beforeTime) {
                                var minTime = curTime - beforeTime;
                                if (minTime > MOZ_INFO.OVER_TIME) {
                                    //超过时间则取消自动切换
                                    tabDetail.off("mouseover mouseleave mouseenter");
                                    clearInterval(mInterval);
                                    clearInterval(overInterval);
                                }
                            }
                        }
                    }, 500);
                }
            }
        });
    };
    TabWidget.showTab = function (btn, fetchDataCallback) {
        showTab(btn, fetchDataCallback);
    };
    //显示某个tab页的内容
    function showTab(btn, fetchDataCallback) {
        if (!btn || (btn.length && btn.hasClass("on"))) return;
        var forVal = btn.attr("for");
        if (!forVal) return;
        btn.addClass("on").siblings().removeClass("on");
        var forArr = forVal.split(",");
        $.each(forArr, function (i, m) {
            var idVal = $.trim(m);
            if (idVal) {
                var tab = $("#" + idVal),
                    tabParent = tab.hasClass("mod-delay-resource") ? tab : tab.parents(".mod-delay-resource:eq(0)"),
                    isAllowed = true;
                if (tabParent.length && !tabParent.attr("data-show")) {
                    isAllowed = false;
                }
                if (tab.length) {
                    tab.show().siblings().hide();
                    if (isAllowed) {
                        //判断是否包含滑动成分
                        var slides = tab.find(".slide-page"),
                            tarEle = tab;
                        if (slides.length) {
                            var loadedEle = tab.find("[loaded=loaded]");
                            tarEle = loadedEle.length ? null : slides.eq(1);
                        }
                        tarEle && tarEle.length && MozillaTool.loadDelayResource(tarEle);
                    }
                    if (btn.attr("data-loaded")) return; //data-loaded属性保存是否已经load成功
                    if (fetchDataCallback && $.isFunction(fetchDataCallback)) {
                        fetchDataCallback.call(null, btn);
                    }
                }
            }
        });
    }
    if (!window.TabWidget) window.TabWidget = TabWidget;
})();

/*
 * 设置
 */
(function () {
    //相关设置list
    var DEFAULT_SET_LIST = { pver: "s", sdir: "r", rshow: "s", sflip: "s" }, //宽屏版信息  侧边栏位置  访问记录显示与否  跟随搜索框
        WIDE_STYLE_LIST = {
            w: { type: "w", title: "宽屏版", traceurl: "w", cssurl: (__tflag__ ? "srcode/" : "") + "css/mozWideStyle" + SOURCE_SUFFIX + ".css?" + __wdversion__, classname: "ver-wide" },
            s: { type: "s", title: "标准版", traceurl: "s", cssurl: "", classname: "" },
        },
        DIR_STYLE_LIST = {
            l: { type: "l", title: "左侧边栏", traceurl: "l", cssurl: (__tflag__ ? "srcode/" : "") + "css/mozLeftStyle" + SOURCE_SUFFIX + ".css?" + __lsversion__, classname: "side-dir-l" },
            r: { type: "r", title: "右侧边栏", traceurl: "r", cssurl: "", classname: "side-dir-r" },
        };

    var SetWidget = function (options) {
        var that = this;
        that.settings = {
            panel: "", //面板区块
            panelMenuEle: "", //涉及的panelMenu
            wrapper: "", //设置容器
            versionEle: "", //版本设置元素
            dirEle: "", //方向设置元素
            recEle: "", //访问记录设置元素
            flipEle: "", //搜索Flip跟随层

            verDisplayWrapper: "", //版本记录元素
            verRelatedCSS: "", //版本相关CSS元素
            dirRelatedCSS: "", //侧边栏相关CSS元素
            recRelatedEle: "", //访问记录相关元素
            flipRelatedEle: "", //搜索flip相关元素
        };
        that.settings = $.extend(that.settings, options);
        that.bindEvents();
        that.init();
    };
    SetWidget.prototype = {
        verData: null, //存储版本信息
        dirData: null, //存储侧边栏方向信息
        recData: null, //存储访问记录显示和隐藏
        flipData: null, //存储搜索flip的显示和隐藏
        defaultSettings: DEFAULT_SET_LIST, //默认设置信息
        bindEvents: function () {
            var that = this,
                settings = that.settings,
                wrapper = settings.wrapper,
                verEle = settings.verEle,
                dirEle = settings.dirEle,
                recEle = settings.recEle,
                flipEle = settings.flipEle,
                verRelatedCSS = settings.verRelatedCSS,
                dirRelatedCSS = settings.dirRelatedCSS;
            //设置版本 宽屏版、标准版切换
            verEle.find(".opt-radio").on("click", function (evt) {
                evt.stopPropagation();
                var btn = $(this),
                    btnType = btn.attr("data-type");
                if (radioDeal(btn)) that.verSwitch(btnType);
            });
            //访问记录设置
            recEle.find(".opt-radio").on("click", function (evt) {
                evt.stopPropagation();
                var btn = $(this),
                    btnType = btn.attr("data-type");
                if (radioDeal(btn)) that.recSwitch(btnType);
            });

            //搜索flip设置
            flipEle.find(".opt-radio").on("click", function (evt) {
                evt.stopPropagation();
                var btn = $(this),
                    btnType = btn.attr("data-type");
                if (radioDeal(btn)) that.flipSwitch(btnType);
            });

            //设置-确认
            wrapper.find(".btn-confirm").on("click", function (evt) {
                evt.stopPropagation();
                that.saveSet();
                that.hidePanel();
            });
            //设置-取消
            wrapper.find(".btn-cancel").on("click", function (evt) {
                evt.stopPropagation();
                that.restoreSet();
                that.saveSet();
                that.hidePanel();
            });
        },
        init: function () {
            var that = this,
                verData = StorageWidget.getItem("n_2014_ver"), //区分2013版
                dirData = StorageWidget.getItem("n_2014_dir"), //区分2013版
                recData = StorageWidget.getItem("n_2014_record"), //区分2013版
                flipData = StorageWidget.getItem("n_2014_flip");
            //!verData && (verData = {type:"s",title:"标准版",url:"s"});
            //!dirData && (dirData = {type:"r",title:"右侧边栏",url:"r"});

            //!verData && (verData = WIDE_STYLE_LIST["s"]); //默认为普通版
            //modified by hzhou 20180920====start
            /*
            if(!verData){
                 verData = WIDE_STYLE_LIST["s"];
                var winWidth = $(window).width();
                //宽屏时，若没设置过则默认为宽屏
                if(winWidth >= 1600){
                   verData = WIDE_STYLE_LIST["w"];
                }
            }
             
            */

            //modified by hzhou 20180920====end

            !dirData && (dirData = DIR_STYLE_LIST["r"]); //默认为右侧
            !recData && (recData = that.defaultSettings.rshow);
            !flipData && (recData = that.defaultSettings.sflip);
            //modified by hzhou 20180920====start
            verData = WIDE_STYLE_LIST["w"];
            that.verData = verData;
            that.verSwitch(verData.type, true);
            //modified by hzhou 20180920====end
            that.dirData = dirData;
            that.recData = recData;
            that.flipData = flipData;

            that.recSwitch(recData, true);
            that.flipSwitch(flipData, true);
            //添加设置的日志
            TraceWidget.addDisplayTrace("ver", verData.title, verData.traceurl, "display_width");
            TraceWidget.addDisplayTrace("dir", dirData.title, dirData.traceurl, "display_side");
        },
        //保存设置
        saveSet: function () {
            var that = this;
            StorageWidget.setItem("n_2014_ver", that.verData); //区分2013版
            StorageWidget.setItem("n_2014_dir", that.dirData); //区分2013版
            StorageWidget.setItem("n_2014_record", that.recData); //区分2013版
            StorageWidget.setItem("n_2014_flip", that.flipData);
        },
        //恢复默认设置
        restoreSet: function () {
            var that = this,
                defaultSettings = that.defaultSettings;
            that.verSwitch(defaultSettings.pver, true);
            that.recSwitch(defaultSettings.rshow, true);
            that.flipSwitch(defaultSettings.sflip, true);
        },
        //版本切换
        verSwitch: function (ver, initFlag) {
            var that = this,
                defaultSettings = that.defaultSettings,
                settings = that.settings,
                verDisplayWrapper = settings.verDisplayWrapper,
                verRelatedCSS = settings.verRelatedCSS,
                verEle = settings.verEle,
                ver = ver ? ver : defaultSettings.pver,
                // verCSS = "",
                //verTitle = "标准版",
                verData = WIDE_STYLE_LIST["s"];
            switch (ver) {
                case "w": //verCSS = "ver-wide";verTitle="宽屏版";
                    verData = WIDE_STYLE_LIST["w"];
                    break;
            }
            //IFRAME_DATA["ver"] = verCSS;??
            //that.verData = {title:verTitle,type:ver,url:ver};
            that.verData = verData;
            //verRelatedCSS.attr("href", verCSS ? ("css/"+verCSS+".css") : "");

            //设置宽屏版的css和样式
            // verRelatedCSS.attr("href", verData["cssurl"] );
            //verDisplayWrapper.attr("class",verData["classname"]);

            // SlideWidget.resetSlides(); //重新设置slide为第一页（以防止出现宽屏切换时的问题）
            verRelatedCSS.on("load", function (evt) {
                // SlideWidget.resetSlides();
            });
            //处理设置里的宽屏的radio显示
            initFlag &&
                verEle
                    .find(".opt-radio[data-type='" + ver + "']")
                    .addClass("selected")
                    .siblings()
                    .removeClass("selected");
        },

        //控制访问记录的显示
        recSwitch: function (rec, initFlag) {
            var that = this,
                defaultSettings = that.defaultSettings,
                rec = rec ? rec : defaultSettings.rshow,
                settings = that.settings,
                recEle = settings.recEle,
                recRelatedEle = settings.recRelatedEle;
            that.recData = rec;
            switch (rec) {
                case "h":
                    recRelatedEle.hide();
                    break;
                default:
                    recRelatedEle.show();
            }
            initFlag &&
                recEle
                    .find(".opt-radio[data-type='" + rec + "']")
                    .addClass("selected")
                    .siblings()
                    .removeClass("selected");
        },

        flipSwitch: function (flip, initFlag) {
            var that = this,
                defaultSettings = that.defaultSettings,
                flip = flip ? flip : defaultSettings.sflip,
                settings = that.settings,
                flipEle = settings.flipEle,
                flipRelatedEle = settings.flipRelatedEle;
            that.flipData = flip;
            switch (flip) {
                case "h":
                    flipRelatedEle.hide();
                    flipRelatedEle.removeAttr("flip");
                    break;
                default: //flipRelatedEle.show();
                    flipRelatedEle.attr("flip", "flip");
            }
            initFlag &&
                flipEle
                    .find(".opt-radio[data-type='" + flip + "']")
                    .addClass("selected")
                    .siblings()
                    .removeClass("selected");
        },

        hidePanel: function () {
            var that = this,
                settings = that.settings,
                panel = settings.panel,
                panelMenuEle = settings.panelMenuEle;
            panel.slideUp(500);
            panelMenuEle.removeClass("on");
        },
    };
    SetWidget.build = function (options) {
        var setWidget = new SetWidget(options);
    };
    function radioDeal(btn) {
        if (!btn.length) return false;
        var parEle = btn.parent();
        if (btn.hasClass("selected")) return false;
        parEle.find(".moz-radio").removeClass("selected");
        btn.addClass("selected");
        return true;
    }
    if (!window.SetWidget) window.SetWidget = SetWidget;
})();

/*广告 2017-03-29*/
(function () {
    var AdWidget = function () {};
    AdWidget.build = function (options) {
        var hiddenEle = options.hiddenEle;
        if (!hiddenEle.length) return;
        var wrapper = options.wrapper,
            adList = hiddenEle.find("li"),
            adLen = adList.length;
        //遍历广告类型  找到是否有固定位置的广告   ===start  20170329
        var adNewArr = [],
            adNewLeftArr = [],
            adNewRightArr = [],
            adNoFixArr = [],
            hasFix = false,
            rand1,
            rand2;
        $.each(adList, function (i, n) {
            var temp = $(n),
                obj = {};
            obj.title = $.trim(temp.attr("data-title"));
            obj.frameURL = $.trim(temp.attr("data-iframe"));
            obj.linkURL = $.trim(temp.attr("data-url"));
            obj.imgURL = $.trim(temp.attr("data-img"));
            obj.cStyle = $.trim(temp.attr("data-style"));
            obj.isFixed = $.trim(temp.attr("data-fixed")) ? true : false;
            obj.fixPos = $.trim(temp.attr("data-fpos"));
            //固定位置  有固定位置则为二元数组，没有则为一元数组  只能选择一个固定
            obj.isFixed && (hasFix = true);
            if (hasFix) {
                if (obj.isFixed) {
                    if (obj.fixPos > 0) {
                        //added by hzhou 2018-01-26 https下替换为淘宝代码（暂时）
                        var winProtocol = window.location.protocol;
                        /*if(winProtocol == "https:" && obj.title == "Google"){
                            var newObj = {};
                            newObj.title= "淘宝";
                            newObj.frameURL = "//fragment.firefoxchina.cn/html/main_page_tb_sbom.html";
                            newObj.linkURL = "";
                            newObj.imgURL = "";
                            newObj.cStyle = "";
                            newObj.isFixed = true;
                            newObj.fixPos = 1;
                            adNewRightArr.push(newObj);
                       }else{*/
                        adNewRightArr.push(obj);
                        /*}*/
                    } else {
                        adNewLeftArr.push(obj);
                    }
                } else {
                    adNoFixArr.push(obj);
                }
            } else {
                adNoFixArr.push(obj);
            }
        });

        //处理包含fix情况下的非fix项目
        if (hasFix) {
            if (adNewLeftArr.length) {
                adNewRightArr = adNewRightArr.concat(adNoFixArr);
            } else {
                adNewLeftArr = adNewLeftArr.concat(adNoFixArr);
            }
        } else {
            adNewRightArr = adNewRightArr.concat(adNoFixArr);
            adNewLeftArr = adNewLeftArr.concat(adNoFixArr);
        }

        //输出
        var seed1 = adNewLeftArr.length,
            seed2 = adNewRightArr.length,
            randEle1 = seed1 > 1 ? getRandomEle(seed1, null, adNewLeftArr) : adNewLeftArr[0],
            randEle2 = seed2 > 1 ? getRandomEle(seed2, randEle1, adNewRightArr) : adNewRightArr[0];
        var randHtm1 = "",
            randHtm2 = "";
        if (randEle1.frameURL) {
            randHtm1 = "<iframe class='iframe-load-delay' scrolling='no' frameborder='0'  src='' data-url='" + randEle1.frameURL + "'></iframe>";
        } else {
            randHtm1 = "<a href='" + randEle1.linkURL + "' title='" + randEle1.title + "'><img class='img-load-delay' src='' data-url='" + randEle1.imgURL + "'/></a>";
        }
        if (randEle2.frameURL) {
            randHtm2 = "<iframe class='iframe-load-delay' scrolling='no' frameborder='0' src='' data-url='" + randEle2.frameURL + "'></iframe>";
        } else {
            randHtm2 = "<a href='" + randEle2.linkURL + "' title='" + randEle2.title + "'><img class='img-load-delay' src='' data-url='" + randEle2.imgURL + "'/></a>";
        }

        wrapper.find(".left .promote-bg").html(randHtm1);
        wrapper.find(".right .promote-bg").html(randHtm2);
        //个性化样式设置
        randEle1.cStyle && wrapper.find(".left").attr("style", randEle1.cStyle);
        randEle2.cStyle && wrapper.find(".right").attr("style", randEle2.cStyle);
        wrapper.show();
        hiddenEle.remove();
    };

    /*
     *  seed 种子
     *  except 排除项目 可为index 或者元素
     *  el  选择的列表
     */
    function getRandomEle(seed, except, list) {
        var index = Math.floor(Math.random() * seed),
            randEle;

        if (except) {
            while ((except.imgURL && list[index] && except.imgURL == list[index]["imgURL"]) || (except.frameURL && list[index] && except.frameURL == list[index]["frameURL"])) {
                index = Math.floor(Math.random() * seed);
            }
        }
        randEle = list[index];
        return randEle;
    }
    function random(seed, except, el) {
        var rand = Math.floor(Math.random() * seed);
        if (except != undefined && el != undefined) {
            var iSrc1 = $.trim(el.find("li:eq(" + except + ")").attr("data-iframe"));
            var iSrc2 = $.trim(el.find("li:eq(" + rand + ")").attr("data-iframe"));
            //排除两种情况：1、取得的是同一元素；2、取得的是 iframe 地址相同的两个元素（两个iframe地址相同是为了提升展现概率，但不能左、右位置同时出现）；
            while (except == rand || (iSrc1 != "" && iSrc1 == iSrc2)) {
                rand = Math.floor(Math.random() * seed);
                iSrc2 = $.trim(el.find("li:eq(" + rand + ")").attr("data-iframe"));
            }
        }
        return rand;
    }
    if (!window.AdWidget) window.AdWidget = AdWidget;
})();

/*
 * 弹出层（登录、注册、通用）
 */
(function () {
    var PopWidget = (function () {
        var PopWindow = function (options) {
            var that = this;
            that.settings = {
                target: "",
                type: "",
                title: "火狐主页",
                popClass: "",
                popId: "",
                content: "",
                init: "", //初始回调函数
                success: "", //确认按钮回调函数
                successCallback: "", //确认函数内部回调函数（主要针对ajax请求）
                cancel: "", //取消按钮回调函数
                close: "", //关闭按钮回调函数
            };
            that.settings = $.extend(that.settings, options);
            if (!that.settings.content) return;
            that.init();
            that.bindEvents();
        };
        PopWindow.prototype = {
            bindEvents: function () {
                var that = this,
                    opts = that.settings;
                //绑定事件
                $(".pop-win-close,.pop-win-bg").on("click", function (evt) {
                    evt.stopPropagation();
                    if (opts.close && $.isFunction(opts.close)) {
                        opts.close.call(that);
                    } else {
                        clearPopWin();
                    }
                    evt.preventDefault();
                });
                $(".btn-confirm").on("click", function (evt) {
                    evt.stopPropagation();
                    if (opts.success && $.isFunction(opts.success)) {
                        opts.success.call(that, this, opts.target, opts.successCallback);
                    } else {
                        clearPopWin();
                    }
                });
                $(".btn-cancel").on("click", function (evt) {
                    evt.stopPropagation();
                    if (opts.cancel && $.isFunction(opts.cancel)) {
                        opts.cancel.call(that);
                    } else {
                        clearPopWin();
                    }
                });
            },
            init: function () {
                var that = this,
                    opts = that.settings;
                if (!opts.content) return;
                clearPopWin();
                var winHtm = "",
                    winCont = "",
                    bgHtm = "";
                winCont = "  <div id='pop-title' class='pop-win-title'>" + "      <span>" + opts.title + "</span><a id='pop-close' href='javascript:;' class='pop-win-close'>×</a>" + "  </div>" + "  <div class='pop-win-cont'>" + opts.content + "<div id='msg' class='pop-msg'></div><div class='pop-tip'></div></div>";
                winHtm = "<div isolate='' " + (opts.popId ? "id=" + opts.popId : "") + " class='pop-win" + (opts.popClass ? " " + opts.popClass : "") + "'>" + winCont + "</div>";
                $(document.body).append(winHtm + bgHtm);
                opts.init && $.isFunction(opts.init) && opts.init.call(null);
                locatePopWin();
            },
        };
        PopWindow.clearPopWin = function (options) {
            clearPopWin();
        };
        /*
         * 普通弹出层
         */
        PopWindow.showPopWin = function (options) {
            new PopWindow(options);
        };
        PopWindow.showPopMask = function (guide, callback) {
            showPopMask(guide, callback);
        };
        PopWindow.hidePopMask = function () {
            $(".pop-mask").hide();
        };
        /*
         * 显示弹出层
         */
        PopWindow.showLogin = function (callback) {
            //登录回调函数
            if (!window.user_login) {
                window.user_login = function (data) {
                    var userArea = $("#user-area-info");
                    if (data && data.nickname) {
                        userArea.html("<p class='user-login-status'><span>" + data.nickname + "</span><a  trace-key='head_logout' href='javascript:;' class='btn-pop-win' data-type='logout'>退出</a></p>");
                        clearPopWin();
                        if (data.expire) {
                            CookieWidget.setItem("n_user_data", { uname: data.nickname }, data.expire * 1000);
                        } else {
                            CookieWidget.setItem("n_user_data", "");
                        }

                        // raffle start抽奖积分测试====================
                        $(document).trigger("login");
                        // raffle start抽奖积分测试====================

                        callback && $.isFunction(callback) && callback.call(null);
                    } else {
                        alert(data ? (data.error ? data.error : MOZ_INFO.SYSTEM_IS_BUSY) : MOZ_INFO.SYSTEM_IS_BUSY);
                    }
                };
            }
            var url = "https://account.firefoxchina.cn?returnUrl=" + encodeURI(window.location.protocol + "//" + window.location.host + "/do?login"),
                winWidth = $(window).width(),
                winHeight = $(window).height(),
                diaWidth = 550,
                diaHeight = 620,
                diaLeft = (winWidth - diaWidth) / 2 > 0 ? (winWidth - diaWidth) / 2 : 0,
                diaTop = (winHeight - diaHeight) / 2 > 0 ? (winHeight - diaHeight) / 2 : 0,
                winFs = "dialogWidth=" + diaWidth + "px;dialogHeight=" + diaHeight + "px;dialogLeft=" + diaLeft + "px;dialogTop=" + diaTop + "px";
            var winPs = "width=" + diaWidth + ",height=" + diaHeight + ",left=" + diaLeft + "px,top=" + diaTop + ",toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no";
            // window.showModalDialog(url,null,winFs);
            window.open(url, "Firefox Login", winPs);
        };
        /*
         * 登出
         */
        PopWindow.logout = function () {
            if (confirm("你真的要退出登录吗？")) {
                $.ajax({
                    url: "/do",
                    type: "POST",
                    data: { logout: "logout" },
                    timeout: MOZ_INFO.TIME_OUT,
                    error: function () {
                        alert(MOZ_INFO.SYSTEM_IS_BUSY);
                    },
                    success: function () {
                        var userArea = $("#user-area-info");
                        userArea.html("<p><a href='javascript:;' class='btn-pop-win' trace-key='head_login' data-type='login'>登录</a></p>");
                        CookieWidget.setItem("n_user_data", "");

                        //==========raffle start隐藏签到按钮
                        $(document).trigger("logout");
                        //==========raffle end隐藏签到按钮
                    },
                });
            }
        };
        /*
         * 设置弹出层的显示位置
         */
        function locatePopWin() {
            //==========raffle start
            var contEle = $(".pop-win[isolate='']").eq(0),
                //==========raffle end

                posType = contEle.css("position"),
                contH = contEle.height(),
                contW = contEle.width(),
                dEle = document.documentElement,
                bEle = document.body,
                winH = $(window).height(),
                sTop = dEle.scrollTop || bEle.scrollTop,
                marginTop = posType == "fixed" ? -contH / 2 : sTop + (winH - contH) / 2;
            showPopMask();
            contEle.css({
                "margin-top": marginTop + "px",
                "margin-left": -contW / 2 + "px",
            });
        }
        function locatePopMask() {
            var popMask = $(".pop-mask"),
                posType = popMask.css("position");
            if (posType != "fixed") {
                var winH = $(window).height(),
                    dH = Math.max(dEle.clientHeight, dEle.scrollHeight),
                    maxH = Math.max(winH, dH);
                popMask.css({ height: maxH });
            }
        }
        function showPopMask(guide, callback) {
            if ($(".pop-mask").length) {
                $(".pop-mask").show();
            } else {
                var htm = "<div class='pop-mask" + (guide ? " pop-mask-guide" : "") + "'></div>";
                $(document.body).append(htm);
            }
            locatePopMask();
            if (guide) {
                $(".pop-mask").animate({ opacity: 0.7 }, 2000, function () {
                    callback && $.isFunction(callback) && callback.call(null);
                });
            }
        }
        /*
         * 清除弹出层
         */
        function clearPopWin() {
            //==============raffle start
            var siteManage = $("#site-custom-manage"),
                removePops = $(".pop-mask,.pop-win");
            if (removePops.length) {
                $.each(removePops, function (i, n) {
                    var pop = $(n),
                        isolate = pop.attr("isolate");
                    !isolate && pop.remove();
                });
            }
            //==============raffle end

            if (siteManage.is(":visible")) siteManage.hide();
        }
        return PopWindow;
    })();
    if (!window.PopWidget) window.PopWidget = PopWidget;
})();

/*
 * 访问记录(load完成之后)
 */
(function () {
    var RecordWidget = function (options) {
        var that = this;
        that.settings = {
            wrapper: "",
            mostWrap: "",
            lastWrap: "",
            hideEle: "", //隐藏按钮
        };
        for (var p in options) {
            if (that.settings[p] != undefined) that.settings[p] = options[p];
        }
        that.init();
    };
    RecordWidget.prototype = {
        mostLinks: [],
        lastLinks: [],
        bindEvents: function () {
            var that = this,
                settings = that.settings,
                hideEle = settings.hideEle;
            //删除网址
            $(document).on("click", ".record-mod li b", function (evt) {
                evt.stopPropagation();
                var btn = $(this),
                    btnParent = btn.parents(".mod-cont").eq(0),
                    btnType = btnParent.attr("id") == "list-record-most" ? "most" : "last";
                that.deleteRecord(btn, btnType);
            });
        },
        init: function () {
            var that = this,
                settings = that.settings,
                mostWrap = settings.mostWrap,
                lastWrap = settings.lastWrap,
                wrapper = settings.wrapper,
                ceHome = window.cehomepage,
                isFirefox = MozillaTool.isBrowser("Firefox"),
                addonURL = window["cehp_xpi"] ? window["cehp_xpi"] : "http://download.firefox.com.cn/chinaedition/addons/cehomepage/cehomepage-latest.xpi",
                hintHtm = "<p class='record-firefox-hint'>要使用此功能，请安装<a href='" + (isFirefox ? addonURL : "http://firefox.com.cn") + "'>" + (isFirefox ? "火狐主页扩展" : "火狐浏览器") + "</a>";
            if (NEW_EXTENSION || ceHome) {
                //兼容FF35之后的主页扩展
                mostWrap.length && that.showMVisitLogs(mostWrap);
                lastWrap.length && that.showLVisitLogs(lastWrap);
            } else {
                wrapper.html(hintHtm);
            }
            that.bindEvents();
        },
        /*
         * param{String} type-most 最多 last-最近（暂不支持）
         */
        /*deleteRecord: function(btn,type){
            var that       =  this,
                type       =  type ? type : "most",
                ceHome     =  window.cehomepage,
                btnParent  =  btn.parent();
            //if(confirm("确定要删除吗？")){
                var link = btnParent.find("a"),
                    url  = link.attr("href"),
                    title = link.attr("title") || link.text(),
                    traceKey = "";
                switch(type){
                   case "most": 
                      traceKey = "head_history_most_del";
                      ceHome.frequent.remove(url);
                      btnParent.remove();
                      break;
                   case "last":
                      traceKey = "head_histroy_latest_del";
                      //ceHome.last.remove(that.lastLinks[btn.attr("data-index")]); 
                      ceHome.last.remove(url);
                      btnParent.remove();
                      break;
                }
                traceKey && TraceWidget.addTrace(title,url,traceKey);
            //}
        },*/
        deleteRecord: function (btn, type) {
            var that = this;
            //删除最多访问记录
            var deleteId = "";
            (deleteKey = ""), (type = type ? type : "most"), (ceHome = window.cehomepage), (btnParent = btn.parent()), (link = btnParent.find("a")), (url = link.attr("href")), (title = link.attr("title") || link.text()), (traceKey = "");
            if (type == "most" || type == "last") {
                switch (type) {
                    case "most":
                        traceKey = "head_history_most_del";
                        if (NEW_EXTENSION) {
                            //新扩展
                            deleteId = 2;
                            deleteKey = "frequent.remove";
                        } else {
                            ceHome.frequent.remove(url);
                            btnParent.remove();
                        }

                        break;
                    case "last":
                        traceKey = "head_histroy_latest_del";
                        if (NEW_EXTENSION) {
                            //新扩展
                            deleteId = 4;
                            deleteKey = "last.remove";
                        } else {
                            ceHome.last.remove(url);
                            btnParent.remove();
                        }

                        break;
                }
                btnParent.remove();
                if (NEW_EXTENSION) {
                    var detail = {
                        id: window.mozCNChannel,
                        message: {
                            id: deleteId,
                            key: deleteKey,
                            parameters: {
                                url: url,
                            },
                        },
                    };
                    var deleteEvt = new window.CustomEvent("WebChannelMessageToChrome", NEW_EXTENSION_50 ? { detail: JSON.stringify(detail) } : { detail: detail });
                    window.dispatchEvent(deleteEvt);
                }
                traceKey && TraceWidget.addTrace(title, url, traceKey);
            }
        },
        /*
         * 获取访问最频繁的记录
         */
        showMVisitLogs: function (wrap) {
            var that = this,
                ceHome = window.cehomepage,
                htm = "",
                titName = "title",
                uriName = "uri",
                mosts = [];
            if (NEW_EXTENSION) {
                //新扩展
                //查询最多访问记录
                var detail = {
                    id: window.mozCNChannel,
                    message: {
                        id: 1,
                        key: "frequent.query",
                        parameters: {
                            limit: 10,
                        },
                    },
                };
                var queryFrequentEvt = new window.CustomEvent("WebChannelMessageToChrome", NEW_EXTENSION_50 ? { detail: JSON.stringify(detail) } : { detail: detail });
                window.dispatchEvent(queryFrequentEvt);
            } else {
                if (ceHome) {
                    var frequent = ceHome.frequent;
                    if (frequent && frequent.queryAsync) {
                        //异步请求
                        frequent.queryAsync(8, function (results) {
                            mosts = results;
                            //htm = recordLinkTemp(mosts);
                            //wrap.html(htm);
                            //that.mostLinks = mosts;
                            RecordWidget.showRecord(wrap, mosts);
                        });
                    } else {
                        mosts = frequent.query(8);
                        /*htm = recordLinkTemp(mosts);
                        wrap.html(htm);*/
                        RecordWidget.showRecord(wrap, mosts);
                        // that.mostLinks = mosts;
                    }
                }
            }
        },
        /*
         * 获取最近访问的记录
         */
        showLVisitLogs: function (wrap) {
            var that = this,
                ceHome = window.cehomepage,
                htm = "",
                lasts = [];
            if (NEW_EXTENSION) {
                //查询最近访问记录
                var detail = {
                    id: window.mozCNChannel,
                    message: {
                        id: 3,
                        key: "last.query",
                        parameters: {
                            limit: 10,
                        },
                    },
                };
                var queryLastEvt = new window.CustomEvent("WebChannelMessageToChrome", NEW_EXTENSION_50 ? { detail: JSON.stringify(detail) } : { detail: detail });
                window.dispatchEvent(queryLastEvt);
            } else {
                if (ceHome) {
                    var last = ceHome.last;
                    if (last && last.queryAsync) {
                        //异步请求
                        last.queryAsync(8, function (results) {
                            lasts = results;
                            //htm = recordLinkTemp(lasts,"last",false,"title","url","data-idx");
                            //wrap.html(htm);
                            RecordWidget.showRecord(wrap, lasts, "last", false, "title", "url", "data-idx");
                            //that.lastLinks = lasts;
                        });
                    } else {
                        lasts = ceHome.last.query();
                        //htm = recordLinkTemp(lasts,"last",false,"title","url","data-idx");
                        //wrap.html(htm);
                        RecordWidget.showRecord(wrap, lasts, "last", false, "title", "url", "data-idx");
                        // that.lastLinks = lasts;
                    }
                }
            }
        },
    };
    RecordWidget.build = function (options) {
        return new RecordWidget(options);
    };
    RecordWidget.showRecord = function (wrap, results, type, filter, titName, uriName, spanAttr) {
        if (wrap.length) {
            var htm = recordLinkTemp(results, type, filter, titName, uriName, spanAttr);
            wrap.html(htm);
        }
    };
    /*
     * 处理记录内容
     * param{Collection} results
     * param{String} type 记录类型 most-访问最频繁 last-最近访问
     * param{Boolean} filter 是否过滤重复的内容
     */
    function recordLinkTemp(results, type, filter, titName, uriName, spanAttr) {
        var htm = "",
            type = type ? type : "most",
            titName = titName ? titName : "title",
            uriName = uriName ? uriName : "uri",
            spanAttr = spanAttr ? spanAttr : "",
            whl = window.location.href,
            recordMax = 6;
        if (results) {
            htm += "<ul>";
            var index = 0;
            for (var r in results) {
                if (index >= recordMax) {
                    break;
                }
                var result = results[r],
                    rURI = result[uriName],
                    rTit = result[titName],
                    rURIStr = MozillaTool.escapeHtml(rURI),
                    rTitStr = MozillaTool.escapeHtml(rTit),
                    rLinkText = rTitStr ? rTitStr : rURIStr,
                    rLinkTit = rURIStr ? rURIStr : rTitStr;
                if (type == "last" && (rURI == whl || rURI.match(/^about:/) || rTit == null)) continue;
                htm += "<li><b data-index='" + r + "'>×</b>" + "<a href='" + rURIStr + "' title='" + rLinkText + "'>" + rLinkText + "</a></li>";
                index++;
            }
            htm += "</ul>";
        }
        return htm;
    }
    if (!window.RecordWidget) window.RecordWidget = RecordWidget;
})();

/*
 * 我的网址管理
 */
(function () {
    var SITE_INNER_SPLITER = "##_MSITE_##",
        SITE_SPLITER = "##_MOZ_##";
    var SiteWidget = function (options) {
        var that = this;
        that.settings = {
            wrapper: "", // 我的网址wrapper
            manageEle: "", //管理界面
            manageBtn: "", //按钮
            manageList: "", //管理List
            customForm: "",
        };
        that.settings = $.extend(that.settings, options);
        that.init();
        that.bindEvent();
    };
    SiteWidget.prototype = {
        max: 42, //自定义网址的最大个数
        isModified: false, //记录网址是否进行过修改
        defaultSites: [], //存储默认推荐网址
        customSites: [], //存储用户自定网址
        bindEvent: function () {
            var that = this,
                settings = that.settings,
                wrapper = settings.wrapper,
                manageEle = settings.manageEle,
                customForm = settings.customForm,
                msTop; //保存点击管理按钮之前的scrollTop
            //管理按钮
            $(document).on("click", ".site-manage-opt", function (evt) {
                //evt.stopPropagation();
                msTop = document.body.scrollTop || document.documentElement.scrollTop;
                that.showCustomManage();
                evt.preventDefault();
            });
            //关闭管理界面
            $("#site-manage-close").click(function (evt) {
                evt.stopPropagation();
                that.closeCustomManage();
                window.scrollTo(0, msTop);
                evt.preventDefault();
            });

            //重置默认
            $("#site-manage-reset").click(function (evt) {
                evt.stopPropagation();
                var btn = $(this);
                if (!btn.hasClass("disabled")) {
                    that.getDefaultLinksNew(btn);
                }
                evt.preventDefault();
            });
            //保存我的网址
            $("#site-manage-save").click(function (evt) {
                evt.stopPropagation();
                var btn = $(this);
                if (!btn.hasClass("disabled")) {
                    that.syncLinksToServer(btn);
                }
                evt.preventDefault();
            });
            //从旧版同步
            var syncOldEle = $("#site-sync-old");
            if (syncOldEle.length) {
                $("#site-sync-old").click(function (evt) {
                    evt.stopPropagation();
                    var btn = $(this);
                    if (!btn.hasClass("disabled")) {
                        that.syncLinksFromOld(btn);
                    }
                    evt.preventDefault();
                });
            }
            //同步网址
            $("#site-manage-sync").click(function (evt) {
                evt.stopPropagation();
                var btn = $(this);
                if (!btn.hasClass("disabled")) {
                    that.syncLinksFromServer(btn);
                }
                evt.preventDefault();
            });
            //自定义添加网址
            customForm.submit(function (evt) {
                evt.stopPropagation();
                var url = $.trim(customForm.find(".ipt-site").val()),
                    name = $.trim(customForm.find(".ipt-name").val());
                var flag = that.addLink(url, name);
                flag && customForm.find(".ipt").val("");
                return false;
            });
            //删除我的网站
            $(document).on("click", ".sm-current p .delete", function (evt) {
                evt.stopPropagation();
                var btn = $(this),
                    url = btn.parent().attr("data-url");
                that.deleteLink(btn, url);
                evt.preventDefault();
            });
            //添加系统推荐的网址
            $(document).on("click", ".sm-recommend p", function (evt) {
                evt.stopPropagation();
                var btn = $(this),
                    url = $.trim(btn.attr("data-url")),
                    name = $.trim(btn.text());
                if (btn.hasClass("item-added")) {
                    $(".link-cancel-hint").hide();
                    that.deleteLink(btn, url);
                } else {
                    that.addLink(url, name, btn);
                }
                evt.preventDefault();
            });
            $(".sm-recommend p").hover(
                function (evt) {
                    evt.stopPropagation();
                    var btn = $(this);
                    if (btn.hasClass("item-added")) {
                        $(".link-cancel-hint").hide();
                    }
                    evt.preventDefault();
                },
                function (evt) {
                    evt.stopPropagation();
                    $(".link-cancel-hint").hide();
                    evt.preventDefault();
                },
            );
        },
        init: function () {
            var that = this,
                settings = that.settings,
                wrapper = settings.wrapper,
                manageBtn = settings.manageBtn,
                syncOldEle = $("#site-sync-old"),
                defaultList = [];
            //是否显示从旧版同步
            if (syncOldEle.length) {
                var oldCustom = StorageWidget.getItem("mylinks");
                if (oldCustom == undefined) {
                    syncOldEle.remove();
                } else {
                    syncOldEle.show();
                }
            }
            //保存默认网址数据
            var arrFinalSite = wrapper.find("li");
            $.each(arrFinalSite, function (i, n) {
                var temp = $(n),
                    link = temp.find("a"),
                    tempObj = { title: "", url: "" };
                if (link.length) {
                    //含有子节点的情况

                    $.each(link, function (m, k) {
                        var lk = $(k),
                            lkURL = $.trim(lk.attr("href")),
                            lkTitle = $.trim(lk.attr("title")),
                            lkStyle = $.trim(lk.attr("style")),
                            lkClass = $.trim(lk.attr("class")),
                            lkZImg = $.trim(lk.attr("zm-img")),
                            lkZFrom = $.trim(lk.attr("zm-from"));
                        if (m > 0) {
                            //含有子节点的情况
                            !tempObj.sub && (tempObj["sub"] = []);
                            var subObj = {};
                            subObj["title"] = lkTitle;
                            subObj["url"] = lkURL;
                            lkStyle && (subObj["style"] = lkStyle);
                            subObj["cName"] = lkClass;
                            subObj["zimg"] = lkZImg;
                            subObj["zfrom"] = lkZFrom;
                            tempObj.sub.push(subObj);
                        } else {
                            tempObj.url = $.trim(lk.attr("href"));
                            tempObj.title = $.trim(lk.attr("title"));
                            lkStyle && (tempObj["style"] = lkStyle);
                        }
                    });
                }
                defaultList.push(tempObj);
            });
            //替换用户网址数据

            var customList = StorageWidget.getItem("n_c_sites");
            if (customList == undefined) {
                //没有自定义过网址
                // customList = [];
                // StorageWidget.setItem("n_c_sites",customList);
            } else {
                //自定义过网址
                that.showMySiteList(customList);
            }
            manageBtn.show();
            that.defaultSites = defaultList;
            that.customSites = customList;
        },
        //恢复默认网址
        getDefaultLinks: function (btn) {
            if (confirm("恢复默认操作将会覆盖你当前的网址，确定要执行此操作吗？")) {
                var that = this;
                showSiteInfo(MOZ_INFO.OPERATE_STR, true);
                btn.addClass("disabled");
                $.ajax({
                    url: "/do",
                    data: { getdefaultdata2019: "getdefaultdata2019" },
                    type: "post",
                    dataType: "json",
                    timeout: MOZ_INFO.TIME_OUT,
                    error: function () {
                        btn.removeClass("disabled");
                        showSiteInfo(MOZ_INFO.SYSTEM_IS_BUSY);
                    },
                    success: function (data) {
                        btn.removeClass("disabled");
                        if (data && data.children) {
                            TraceWidget.addLinkTrace(btn);
                            that.showManageList(data.children);
                            that.customSites = data.children;

                            //清空缓存
                            //StorageWidget.setItem("n_c_sites",that.customSites);
                            StorageWidget.setItem("n_c_sites", "");
                            that.dealRecommendSites(data.children);
                            showSiteInfo("恢复成功！");
                        } else {
                            showSiteInfo(data ? (data.msg ? data.msg : MOZ_INFO.SYSTEM_IS_BUSY) : MOZ_INFO.SYSTEM_IS_BUSY);
                        }
                    },
                });
            }
        },
        getDefaultLinksNew: function (btn) {
            if (confirm("恢复默认操作将会覆盖你当前的网址，确定要执行此操作吗？")) {
                var that = this;
                showSiteInfo(MOZ_INFO.OPERATE_STR, true);
                btn.addClass("disabled");
                var url = "https://api2.firefoxchina.cn/home/chome_default_sites.json";
                $.ajax({
                    url: url,
                    //data: {getdefaultdata2019:"getdefaultdata2019"},
                    type: "get",
                    dataType: "json",
                    timeout: MOZ_INFO.TIME_OUT,
                    error: function () {
                        btn.removeClass("disabled");
                        showSiteInfo(MOZ_INFO.SYSTEM_IS_BUSY);
                    },
                    success: function (data) {
                        btn.removeClass("disabled");
                        if (data && data.data && data.data.data) {
                            TraceWidget.addLinkTrace(btn);
                            that.showManageList(data.data.data, true);
                            that.customSites = data.data.data;
                            //清空缓存
                            //StorageWidget.setItem("n_c_sites",that.customSites);
                            StorageWidget.setItem("n_c_sites", "");

                            that.dealRecommendSites(data.data.data);
                            showSiteInfo("恢复成功！");
                        } else {
                            showSiteInfo(data ? (data.msg ? data.msg : MOZ_INFO.SYSTEM_IS_BUSY) : MOZ_INFO.SYSTEM_IS_BUSY);
                        }
                    },
                });
            }
        },
        //从旧版同步数据
        syncLinksFromOld: function (btn) {
            var that = this;
            if (confirm("从旧版同步将会覆盖你当前的网址，确定要执行此操作吗？")) {
                var oldCustom = StorageWidget.getItem("mylinks");
                if (oldCustom) {
                    var links = $.parseJSON(oldCustom);
                    that.customSites = links;
                    StorageWidget.setItem("n_c_sites", that.customSites);
                    that.showManageList(that.customSites);
                    TraceWidget.addLinkTrace(btn);
                    showSiteInfo("从旧版同步成功！");
                }
            }
        },
        //从服务器同步
        syncLinksFromServer: function (btn) {
            var that = this,
                isLogin = MozillaTool.checkLogin();
            if (isLogin) {
                if (confirm("从服务器同步将会覆盖您当前的网址，确定要执行此操作吗？")) {
                    btn.addClass("disabled");
                    showSiteInfo(MOZ_INFO.OPERATE_STR, true);
                    $.ajax({
                        url: "/do",
                        type: "post",
                        dataType: "json",
                        data: { getuserdata: "getuserdata" },
                        timeout: MOZ_INFO.TIME_OUT,
                        error: function () {
                            btn.removeClass("disabled");
                            showSiteInfo(MOZ_INFO.SYSTEM_IS_BUSY);
                        },
                        success: function (data) {
                            btn.removeClass("disabled");
                            var status = data ? data.status : 0;
                            switch (status) {
                                case 1:
                                    var res = data.data,
                                        list = res.children ? res.children : res;
                                    that.customSites = list;
                                    StorageWidget.setItem("n_c_sites", that.customSites);
                                    that.showManageList(list);
                                    TraceWidget.addLinkTrace(btn);
                                    //showSiteInfo(data ? (data.msg? data.msg : MOZ_INFO.SYSTEM_IS_BUSY) :MOZ_INFO.SYSTEM_IS_BUSY);
                                    showSiteInfo("操作成功！");
                                    break;
                                case -1:
                                    if (confirm("您还没有登录，请先登录")) {
                                        PopWidget.showLogin(function () {
                                            that.showCustomManage();
                                        });
                                    }
                                    break;
                                default:
                                    TraceWidget.addLinkTrace(btn);
                                    //alert(data ? (data.msg? data.msg : MOZ_INFO.SYSTEM_IS_BUSY) :MOZ_INFO.SYSTEM_IS_BUSY);
                                    showSiteInfo(data ? (data.msg ? data.msg : MOZ_INFO.SYSTEM_IS_BUSY) : MOZ_INFO.SYSTEM_IS_BUSY);
                                    break;
                            }
                        },
                    });
                }
            } else {
                if (confirm("您还没有登录，请先登录")) {
                    PopWidget.showLogin(function () {
                        that.showCustomManage();
                    });
                }
            }
        },
        //同步到服务器
        syncLinksToServer: function (btn) {
            var that = this,
                isLogin = MozillaTool.checkLogin();
            if (isLogin) {
                if (confirm("同步到服务器将会覆盖之前保存的网址，确定要执行此操作吗？")) {
                    btn.addClass("disabled");
                    showSiteInfo(MOZ_INFO.OPERATE_STR, true);
                    var links = that.getCurrentManageSites();
                    $.ajax({
                        url: "/do",
                        type: "post",
                        dataType: "json",
                        data: { saveuserdata: "saveuserdata", data: JSON.stringify(links) },
                        timeout: MOZ_INFO.TIME_OUT,
                        error: function () {
                            //alert(MOZ_INFO.SYSTEM_IS_BUSY);
                            btn.removeClass("disabled");
                            showSiteInfo(MOZ_INFO.SYSTEM_IS_BUSY);
                        },
                        success: function (data) {
                            btn.removeClass("disabled");
                            var status = data ? data.status : 0;
                            switch (status) {
                                case -1:
                                    if (confirm("您还没有登录，请先登录")) {
                                        PopWidget.showLogin(function () {
                                            that.showCustomManage();
                                        });
                                    }
                                    break;
                                default:
                                    TraceWidget.addLinkTrace(btn);
                                    //alert(data ? (data.msg ? data.msg: MOZ_INFO.SYSTEM_IS_BUSY) : MOZ_INFO.SYSTEM_IS_BUSY);
                                    showSiteInfo(data ? (data.msg ? data.msg : MOZ_INFO.SYSTEM_IS_BUSY) : MOZ_INFO.SYSTEM_IS_BUSY);
                            }
                        },
                    });
                }
            } else {
                if (confirm("您还没有登录，请先登录")) {
                    PopWidget.showLogin(function () {
                        that.showCustomManage();
                    });
                }
            }
        },
        //添加网址
        addLink: function (url, name, btn) {
            if (!url) {
                showSiteInfo("缺少网站地址！");
                return false;
            }
            var that = this,
                settings = that.settings,
                urlRegex = /^(\S+:\/\/)/,
                url = urlRegex.test(url) ? url : "http://" + url,
                name = name ? name : url,
                manageList = settings.manageList,
                traceTitle = name,
                traceURL = url,
                traceKey = "site_add_custom";
            if (manageList.find("p[data-url='" + url + "']").length) {
                showSiteInfo("该网址已存在！");
                btn && btn.length && btn.addClass("item-added");
                return false;
            }
            if (manageList.find("p").length >= that.max) {
                showSiteInfo("达到添加的上限！");
                return false;
            }
            var that = this,
                name = name != undefined ? name : url,
                settings = that.settings,
                manageList = settings.manageList;
            if (!manageList.find("p").length) manageList.empty();

            //子节点
            var subHtm = "",
                btnStyle = "";
            if (btn && btn.length) {
                var subAttr = $.trim(btn.attr("sub"));
                btnStyle = $.trim(btn.attr("data-style"));
                subAttr && (subHtm = subAttr);
            }
            manageList.append("<p " + (btnStyle ? "data-style='" + btnStyle + "'" : "") + " data-url='" + url + "'" + (subHtm ? "sub='" + subHtm + "'" : "") + "><span>" + name + "</span><i class='delete'></i></p>");
            //更改缓存
            that.resetCustomSites();
            if (btn && btn.length) {
                traceKey = "site_add_system";
                btn.addClass("item-added");
            }
            //添加日志
            TraceWidget.addTrace(traceTitle, traceURL, traceKey);
            return true;
        },
        //删除网址
        deleteLink: function (target, url) {
            var that = this,
                btn = $(target),
                settings = that.settings,
                manageList = settings.manageList;
            if (url) {
                //系统推荐删除
                var recList = $(".sm-recommend .rec-cont");
                recList.find("p[data-url='" + url + "']").removeClass("item-added");
                manageList.find("p[data-url='" + url + "']").remove();
                //btn.removeClass("item-added");
            } else {
                //自定义删除
                btn.parent().remove();
            }
            if (!manageList.find("p").length) {
                manageList.html("<div class='no-sites'>没有常用网址，请您在下面添加</div>");
            }
            that.resetCustomSites();
            that.dealRecommendSites();
        },

        //获取管理的网址
        getCurrentManageSites: function () {
            var that = this,
                settings = that.settings,
                wrapper = settings.wrapper,
                manageEle = settings.manageEle,
                manageList = settings.manageList,
                arrFinalSite = manageList.find("p"),
                htm = "",
                newCustomList = [];
            if (arrFinalSite.length) {
                $.each(arrFinalSite, function (i, n) {
                    var temp = $(n),
                        url = temp.attr("data-url"),
                        dStyle = temp.attr("data-style"),
                        name = temp.find("span").text(),
                        tempSub = $.trim(temp.attr("sub")),
                        tempObj = { index: "", url: "", title: "" };
                    tempObj.url = url;
                    tempObj.title = name;
                    dStyle && (tempObj["style"] = dStyle);
                    // tempObj.index = i;
                    if (tempSub) {
                        var subArr = tempSub.split(SITE_SPLITER); //sub子节点的个数
                        $.each(subArr, function (m, k) {
                            var sub = k,
                                sArr = sub.split(SITE_INNER_SPLITER); //sub内部 title url划分
                            //if(subArr.length>1){
                            !tempObj.sub && (tempObj["sub"] = []);
                            var subObj = {};
                            subObj["title"] = sArr[0];
                            subObj["url"] = sArr[1];
                            subObj["style"] = sArr[2];
                            subObj["cName"] = sArr[3];
                            subObj["zimg"] = sArr[4];
                            subObj["zfrom"] = sArr[5];

                            tempObj.sub.push(subObj);
                        });
                    }
                    newCustomList.push(tempObj);
                });
            }
            return newCustomList;
        },
        //打开管理界面
        showCustomManage: function () {
            var that = this,
                settings = that.settings,
                wrapper = settings.wrapper,
                manageEle = settings.manageEle,
                customForm = settings.customForm;
            PopWidget.showPopMask();
            customForm.find(".ipt").val("");
            that.showManageList(that.customSites || that.defaultSites);
            manageEle.show();
            var wTop = wrapper.get(0).getBoundingClientRect().top,
                sTop = document.documentElement.scrollTop || document.body.scrollTop,
                winH = $(window).height(),
                wrapH = manageEle.height(),
                minusH = winH - wrapH > 0 ? (winH - wrapH) / 2 : 20;
            window.scrollTo(0, Math.abs(wTop + sTop) - minusH);
        },
        //关闭管理界面
        closeCustomManage: function () {
            var that = this,
                settings = that.settings,
                wrapper = settings.wrapper,
                manageEle = settings.manageEle,
                manageList = settings.manageList,
                arrFinalSite = manageList.find("p"),
                htm = "";
            //that.resetCustomSites();
            that.showMySiteList(that.customSites || that.defaultSites);
            manageEle.hide();
            PopWidget.hidePopMask();
        },
        showManageList: function (list) {
            var that = this,
                settings = that.settings,
                manageList = settings.manageList;
            showSiteList(manageList, "siteManageTemp", list);
            //勾选系统推荐的网站
            that.dealRecommendSites(list);
            //我的网址-拖动管理
            manageList.sortable({
                items: "p",
                placeholder: "sm-site-placeholder",
                stop: function () {
                    that.resetCustomSites();
                },
            });
            manageList.disableSelection();
        },
        /*重置自定义网址的存储*/
        resetCustomSites: function () {
            var that = this,
                settings = that.settings,
                manageList = settings.manageList;
            var newCustomList = that.getCurrentManageSites();
            that.customSites = newCustomList;
            StorageWidget.setItem("n_c_sites", that.customSites);
        },
        dealRecommendSites: function (list) {
            var that = this,
                recList = $(".sm-recommend .rec-cont"),
                customSites = list && list.length ? list : that.customSites || that.defaultSites;
            recList.find(".item-added").removeClass("item-added");

            $.each(customSites, function (i, n) {
                var cURL = $.trim(n.url),
                    existSite = recList.find("p[data-url='" + cURL + "']");
                if (existSite && existSite.length) {
                    existSite.addClass("item-added");
                }
            });
        },
        showMySiteList: function (list) {
            var that = this,
                settings = that.settings,
                wrapper = settings.wrapper;
            showSiteList(wrapper, "siteTemp", list);
        },
    };
    SiteWidget.build = function (options) {
        var siteWidget = new SiteWidget(options);
    };

    function showSiteInfo(msg, showFlag) {
        if (!msg) return;
        var infoEle = $("#sm-hint-show");
        infoEle.html(msg);
        infoEle.fadeIn(500, function () {
            if (!showFlag) {
                setTimeout(function () {
                    infoEle.fadeOut(500);
                }, 2000);
            }
        });
    }
    function showSiteList(wrapper, temp, list) {
        if (!wrapper.length || !temp) return;
        //var loadStr = '<div class="loading"><span>正在加载...</span></div>';
        //wrapper.html(loadStr);
        var htm = eval(temp).call(null, list);
        wrapper.html(htm);
    }
    function siteTemp(links) {
        var htm = "";
        if (links && links.length) {
            var htm = "<ul>";

            $.each(links, function (i, n) {
                var tempSub = n.sub || n.children || n.data,
                    tempStyle = n.style || n.field1 || n.style_css;
                //htm += "<li sid='"+n.sid+"'";
                htm += "<li ";
                if (tempSub) {
                    htm += "class='site-multiple";
                    if (tempSub.length > 1) {
                        htm += " site-dropdown";
                    }
                    htm += "'";
                }
                htm += "><a href='" + n.url + "' title='" + n.title + "' ";
                if (tempStyle) {
                    var newStyle = tempStyle;
                    if (n.imgurl) {
                        newStyle = "position:absolute;z-index:1;background-image:url(" + n.imgurl + ");background-repeat:no-repeat;background-position:center center;text-indent:-9999em;" + newStyle;
                    }
                    htm += "style='" + newStyle + "'";
                }
                if (tempSub && tempSub.length > 1) {
                    htm += "class='dropdown-menu'";
                }
                htm += ">" + n.title + "</a>";
                var subHtm = "";
                if (tempSub) {
                    var dropDownBefore = "<div class='site-dropmenu'>",
                        dropDownAfter = "</div>";

                    $.each(tempSub, function (m, k) {
                        var slink = k,
                            sURL = slink.url,
                            sTitle = slink.title,
                            sStyle = slink.style || slink.style_css,
                            sClass = slink.cName,
                            sZImg = slink.zimg,
                            sZFrom = slink.zfrom,
                            nStyle = $.trim(sStyle);
                        if (slink.imgurl) {
                            nStyle = "position:absolute;z-index:1;background-image:url(" + slink.imgurl + ");background-repeat:no-repeat;background-position:center center;text-indent:-9999em;" + nStyle;
                        }
                        // subHtm += "<a class='site-sub"+(m==0 ? " first" : "")+"' href='"+sURL+"' title='"+sTitle+"' "+(nStyle ? "style='"+nStyle+"'" : "")+">"+sTitle+"</a>";
                        subHtm += "<a class='" + sClass + "' href='" + sURL + "' title='" + sTitle + "' " + (nStyle ? "style='" + nStyle + "'" : "") + (sZImg ? "zm-img='" + sZImg + "'" : "") + (sZFrom ? "zm-from='" + sZFrom + "'" : "") + "  >" + sTitle + "</a>";
                    });
                    if (tempSub.length > 1) {
                        subHtm = dropDownBefore + subHtm + dropDownAfter;
                    }
                }

                htm += subHtm + "</li>";
            });
            htm += "</ul>";
        } else {
            htm += "<div class='no-sites'>没有常用网址，请您<a href='javascript:;' class='site-manage-opt'>添加</a></div>";
        }
        return htm;
    }
    function siteManageTemp(links, fromServer) {
        var htm = "";
        if (links && links.length) {
            $.each(links, function (i, n) {
                var tempSub = n.sub || n.children || n.data;
                tempStyle = n.style || n.field1 || n.style_css;

                htm += "<p data-url='" + n.url + "'";
                if (tempStyle) {
                    htm += "data-style='" + tempStyle + "'";
                }
                if (tempSub && tempSub.length) {
                    var subHtm = "";
                    $.each(tempSub, function (m, k) {
                        var slink = k,
                            sURL = slink.url,
                            sTitle = slink.title,
                            sStyle = slink.style || slink.style_css,
                            sClass = slink.cName,
                            sZFrom = slink.zfrom,
                            sZImg = slink.zimg,
                            nStyle = $.trim(sStyle);

                        if (slink.imgurl) {
                            nStyle = "position:absolute;z-index:1;background-image:url(" + slink.imgurl + ");background-repeat:no-repeat;background-position:center center;text-indent:-9999em;" + nStyle;
                        }
                        subHtm += sTitle + SITE_INNER_SPLITER + sURL + (SITE_INNER_SPLITER + nStyle) + (SITE_INNER_SPLITER + sClass) + (SITE_INNER_SPLITER + sZImg) + (SITE_INNER_SPLITER + sZFrom) + SITE_SPLITER;
                    });
                    subHtm = subHtm.slice(0, -SITE_SPLITER.length);
                    htm += "sub='" + subHtm + "'";
                }
                htm += "><span>" + n.title + "</span><i class='delete'></i></p>";
            });
        } else {
            htm = "<div class='no-sites'>没有常用网址，请您在下面添加</div>";
        }
        return htm;
    }

    if (!window.SiteWidget) window.SiteWidget = SiteWidget;
})();

/*

===网址导航与新闻之间夹缝推广需求===

主页夹缝网址推广的基本需求：
1、以 alexa 排名为依据，筛选国内访问量最高的一批网站，并从中排除掉网址导航区域现有的网址，形成一个120（可调）个左右的网址白名单
2、通过火狐主页扩展返回一段时间（比如一个月）内，白名单中浏览器访问次数最多的20（建议可通过传参决定返回个数）个网站，称作有效白名单
3、按浏览器访问次数从多到少排列这些网址（来自于白名单），每次凑足10（夹缝内差不多能摆下10到12个网址）个，不足10个则在白名单中随机抽取补全，显示在夹缝内
4、可以刷新每次显示的网址，当有效白名单中的网址个数超过10个时，第二次还是优先显示剩余的有效白名单中的网址，不足再从白名单中随机抽取补齐，显示在夹缝内
5、之后的刷新则会从白名单中随机取10个网址显示
6、最重要的一点：每次显示都会在10个网址中随机抽取前8个内的位置插入推广链接，推广链接可以是多个，但不要超过8个。
7、以上8、10、20、120等数字根据实际情况而定，可微调。

by kluo@mozilla.com

*/

(function () {
    var CONFIG_NARROW = {
        FETCH_WEBSITES_URL: "/res/top_website.json?v=20160809v1",
    };
    var NarrowWidget = function () {
        var that = this;
        that.init();
    };
    //huiling 20160720
    NarrowWidget.prototype = {
        inited: false,
        showSize: 9, //展示的有效白名单个数
        insertIndex: 7,
        insertFixedIndex: 2, //固定推荐位
        dataAll: null,
        dataAvail: null,
        dataIndexAvail: {}, //存储有效白名单的位置
        arrAll: [], //存储所有的白名单
        arrFixed: [], //存储固定的白名单
        arrOdd: [], //存储剩余的白名单（出去已显示的白名单）
        arrAvail: [], //存储所有有效的白名单
        arrRec: [], //存储推荐的网址

        init: function () {
            var that = this;
            if (window.mozCNChannel) {
                $.getJSON(CONFIG_NARROW.FETCH_WEBSITES_URL, function (json) {
                    if (json && json.title != undefined && json.domain != undefined) {
                        that.dataAll = json; //保存所有的返回数据
                        var i = 0,
                            j = 0,
                            dataAllTitle = that.dataAll.title || [],
                            dataAllDomain = that.dataAll.domain || [],
                            dataAllRec = that.dataAll.recommend || [];
                        that.arrFixed = that.dataAll.fixed || [];
                        that.insertIndex = that.insertIndex - that.arrFixed.length; //重新赋值

                        dataAllRec && dataAllRec.length && (that.arrRec = toStandardArray(dataAllRec)); //存储推荐数据

                        //存储所有的白名单数据

                        if (dataAllTitle.length && dataAllDomain.length) {
                            for (; i < dataAllTitle.length; i++) {
                                var dataKey = dataAllTitle[i],
                                    dataValue = dataAllDomain[i],
                                    dataObj = {},
                                    flag = false;
                                //dataObj[dataKey] = {"title":dataKey,"url":"http://www."+dataValue+"?from=i.firefoxchina.cn"};
                                dataObj[dataKey] = { title: dataKey, url: "http://www." + dataValue + "?from=home.firefoxchina.cn" };
                                //所有白名单里需要排除推荐的网址 以title作比较
                                if (dataAllRec.length) {
                                    for (; j < dataAllRec.length; j++) {
                                        var dataRec = dataAllRec[j];
                                        if (dataRec.title == dataKey) {
                                            flag = true;
                                            break;
                                        }
                                    }
                                }

                                !flag && that.arrAll.push(dataObj);
                            }

                            //获取浏览器访问最多的域名
                            var detail = {
                                id: window.mozCNChannel,
                                message: {
                                    id: 6,
                                    key: "frequent.tophosts",
                                    parameters: {
                                        hosts: dataAllDomain,
                                    },
                                },
                            };
                            var evt = new window.CustomEvent("WebChannelMessageToChrome", NEW_EXTENSION_50 ? { detail: JSON.stringify(detail) } : { detail: detail });
                            window.dispatchEvent(evt);
                            window.addEventListener("WebChannelMessageToContent", function (aEvt) {
                                var msg = aEvt.detail.message;
                                if (msg) {
                                    var key = msg.key,
                                        data = msg.data;
                                    switch (key) {
                                        case "frequent.tophosts": //查询最近次数最多的网址（从白名单中找到相应的网址信息）
                                            that.dataAvail = data || []; //@ 数组形式

                                            //that.dataAvail = [0,9];
                                            that.show();
                                            that.inited = true;

                                            $(document).on("click", "#cainixihuan", function (evt) {
                                                //给"猜你喜欢"绑定事件
                                                //if(that.operated) return;
                                                //that.operated = true;
                                                that.show();
                                                //that.operated = false;
                                            });
                                            break;
                                    }
                                }
                            });
                        }
                    } else {
                        console.log("top_site 数据缺失");
                    }
                });
            }
        },
        show: function () {
            var that = this;

            //判断是否初始化
            if (that.inited) {
                that.arrAvail.splice(0, that.showSize);

                //未初始化
            } else {
                //获取访问最多的网址信息
                that.arrOdd = $.extend([], that.arrAll);

                //初始化arrAvail
                if (that.dataAvail.length) {
                    var i = 0,
                        j = 0;
                    for (; i < that.dataAvail.length; i++) {
                        var ind = that.dataAvail[i],
                            dataInfo = that.arrAll[ind];
                        that.arrAvail.push(dataInfo);
                        that.arrOdd.splice(ind, 1);
                    }
                }

                //测试数据
                /*that.arrAvail = [    {"site1":{title:"haha1",url:"haha1"}},
                                     {"site2":{title:"haha1",url:"haha1"}},
                                     {"site3":{title:"haha1",url:"haha1"}},
                                     {"site4":{title:"haha1",url:"haha1"}},
                                     {"site5":{title:"haha1",url:"haha1"}},
                                     {"site6":{title:"haha1",url:"haha1"}},
                                     {"site7":{title:"haha1",url:"haha1"}},
                                     {"site8":{title:"haha1",url:"haha1"}},
                                     {"site9":{title:"haha1",url:"haha1"}},
                                     {"site10":{title:"haha1",url:"haha1"}},
                                     {"site11":{title:"haha1",url:"haha1"}},
                                     {"site12":{title:"haha1",url:"haha1"}},
                                     {"site13":{title:"haha1",url:"haha1"}},
                                     {"site14":{title:"haha1",url:"haha1"}},
                                     {"site15":{title:"haha1",url:"haha1"}},
                                     {"site16":{title:"haha1",url:"haha1"}},
                                     {"site17":{title:"haha1",url:"haha1"}},
                                     {"site18":{title:"haha1",url:"haha1"}},
                                     {"site19":{title:"haha1",url:"haha1"}},
                                     {"site20":{title:"haha1",url:"haha1"}},
                                     {"site21":{title:"haha1",url:"haha1"}},
                                     {"site22":{title:"haha1",url:"haha1"}}
                                ];
                that.arrRec =   [
                                     {"京东商城1":{title:"haha",url:"haha1"}},
                                     {"京东商城2":{title:"haha1",url:"haha1"}},
                                ];*/
            }

            var coArr = [];

            //有效白名单少于showSize个
            if (that.arrAvail.length < that.showSize) {
                coArr = that.dealPage(that.arrAvail);
            } else {
                coArr = that.arrAvail.slice(0, that.showSize);
            }

            if (coArr && coArr.length) {
                var insertArr = that.insertSites(coArr),
                    fixedArr = [],
                    fixedInsertList = {};
                //遍历arrFixed 如果有特殊的index需求
                $.each(that.arrFixed, function (am, an) {
                    var fixedIndex = null;
                    for (var k in an) {
                        var temp = an[k];
                        if (temp.insert_index) {
                            fixedIndex = temp.insert_index;
                        }
                    }
                    if (fixedIndex) {
                        fixedInsertList[fixedIndex] = an;
                    } else {
                        fixedArr.push(an);
                    }
                });
                var finalArr = fixedArr.concat(insertArr);
                for (var p in fixedInsertList) {
                    var fIndex = parseInt(p),
                        fTemp = fixedInsertList[p];
                    try {
                        fTemp && finalArr.splice(fIndex, 0, fTemp);
                    } catch (e) {}
                }
                //最后输出网址
                var showHtm = that.toHtml(finalArr);
                if (showHtm) {
                    $("#module-slinks").find("#topsitebar").remove();
                    $("#module-slinks")
                        .css("marginBottom", "36px")
                        .append('<div id="topsitebar" class="top-site" trace-key="site_promote"><span title="点击换一换" id="cainixihuan">猜你喜欢</span>' + showHtm + "</div>");
                    //$('.side-promote-taobao').addClass('mt36');
                    $(".side-recshare").addClass("async-site");
                }
            }
        },
        /*
          处理页   
          arrReady已存在的网址 即剩余的有效白名单
        */
        dealPage: function (arrReady) {
            var that = this,
                pageArr = $.extend([], arrReady),
                total = 0,
                ridArr = [];
            while (pageArr.length < that.showSize) {
                var randIndex = Math.floor(Math.random() * that.arrOdd.length),
                    randTemp = that.arrOdd[randIndex];
                if (that.arrOdd.length) {
                    if (randTemp && !contains(ridArr, randTemp)) {
                        if (that.arrOdd.length < that.showSize) {
                            ridArr.push(randTemp);
                        } //最后一页时进行存储，以排除上一次循环最后一页剩余的网址，但不进行删除

                        pageArr.push(randTemp);
                        that.arrOdd.splice(randIndex, 1);
                    }
                } else {
                    that.arrOdd = $.extend([], that.arrAll);
                }
            }
            return pageArr;
        },
        //插入推广网址
        insertSites: function (arr) {
            var that = this,
                newArr = $.extend([], arr),
                i = 0;
            if (newArr && newArr.length) {
                for (; i < that.arrRec.length; i++) {
                    var randIndex = Math.floor(Math.random() * that.insertIndex);
                    newArr[randIndex] && newArr.splice(randIndex, 0, that.arrRec[i]);
                }

                //在前几位中插入占位对象
                /*for( ;ind<arr.length;ind++){
                   if(ind < that.insertIndex){
                      var obj = {};
                      obj["@moz@"] = ind;
                      newArr.push(obj);
                   }
                   newArr.push(arr[ind]);
                }

                //随机选择占位对象进行替换
                if(that.arrRec && that.arrRec.length){
                    var randArr = MozillaTool.getRandom(that.insertIndex,that.arrRec.length);
                    
                    //插入网址
                    for(var i=0;i<randArr.length;i++){
                        for(var j=0; j<newArr.length; j++){
                             var temp = newArr[j];
                            if(temp && temp.hasOwnProperty("@moz@") && temp["@moz@"] == randArr[i]){
                                newArr.splice(j,1,that.arrRec[i]);break;
                            }
                        }
                    }
                }*/
            }

            return newArr;
        },
        toHtml: function (arr) {
            var that = this,
                htm = "",
                i = 0,
                showArr = $.extend([], arr);
            if (showArr && showArr.length) {
                for (; i < showArr.length; i++) {
                    var temp = showArr[i];
                    if (temp) {
                        if (!temp.hasOwnProperty("@moz@")) {
                            for (var k in temp) {
                                htm = htm + "<a href='" + temp[k]["url"] + "' title='" + k + "' " + (temp[k]["cus_style"] ? "style='" + temp[k]["cus_style"] + "'" : "") + ">" + k + "</a>";
                            }
                        }
                    } else {
                        temp == undefined && arr.splice(j, 1);
                    }
                }
            }

            return htm;
        },
    };

    //判断是否包含在某数组内  key相同
    function contains(targetArr, targetObj) {
        var flag = false,
            i = 0;

        if (targetObj && targetArr && targetArr.length) {
            for (; i < targetArr.length; i++) {
                var temp = targetArr[i];
                for (var k in temp) {
                    for (var m in targetObj) {
                        if (m == k) {
                            flag = true;
                            break;
                        }
                    }
                }
            }
        }
        return flag;
    }

    //转化成统一样式的数组   title: url
    function toStandardArray(arr) {
        var newArr = null;
        if (arr && arr.length) {
            var i = 0;
            newArr = [];
            for (; i < arr.length; i++) {
                var temp = arr[i],
                    obj = {};
                obj[temp.title] = { title: temp.title, url: temp.url };
                newArr.push(obj);
            }
        }
        return newArr;
    }
    NarrowWidget.build = function () {
        new NarrowWidget();
    };

    if (!window.NarrowWidget) window.NarrowWidget = NarrowWidget;
})();

/*
 * 邮箱登录
 */
(function () {
    var MailWidget = function (options) {
        var that = this;
        that.settings = {
            //2013-1212 start
            relatedEle: "", //相关元素
            wrapper: "", //容器元素
            //2013-1212 end
            targetEle: "",
            formEle: "",
            emailEle: "",
            pwdEle: "",
            hiddenEle: "",
            domainListEle: "",
        };
        that.settings = $.extend(that.settings, options);
        that.bindEvents();
        that.init();
    };
    MailWidget.prototype = {
        mailNormalList: {},
        mailPopList: {
            "@163.com": {
                url: "http://mail.163.com/",
            },
            "@126.com": {
                url: "http://www.126.com/",
            },
            "@sohu.com": {
                url: "http://mail.sohu.com/",
            },
            "@yeah.net": {
                url: "http://www.yeah.net/",
            },
            "@21cn.com": {
                url: "http://mail.21cn.com/",
            },
            "@139.com": {
                url: "http://mail.10086.cn/",
            },
            "@qq.com": {
                url: "http://mail.qq.com",
            },
            "@sina.com.cn": {
                url: "http://mail.sina.com.cn/",
            },
            "@gmail.com": {
                url: "http://www.gmail.com",
            },
            "@hotmail.com": {
                url: "http://www.hotmail.com",
            },
            /*"@tom.com":{
                url:"http://web.mail.tom.com/webmail/login/index.action"
            },*/
            淘宝登录: {
                url: "https://login.taobao.com/member/login.jhtml",
            },
            支付宝登录: {
                url: "https://auth.alipay.com/login/index.htm",
            },
            新浪微博: {
                url: "http://weibo.com/?c=spr_web_sq_firefox_weibo_t001",
                recommend: true,
            },
            /*"开心网":{
                url:"http://www.kaixin001.com/"
            },  
            "人人网":{
                url:"http://www.renren.com/"
            },*/
            百度登录: {
                url: "https://passport.baidu.com/?login",
            },
            /*"51.com":{
                url:"http://www.51.com/"
            },
            "chinaren.com":{
                url:"http://class.chinaren.com/index.jsp"
            },*/
            天涯社区: {
                url: "http://www.tianya.cn/",
            },
        },
        bindEvents: function () {
            var that = this,
                settings = that.settings,
                targetEle = settings.targetEle,
                pwdEle = settings.pwdEle,
                formEle = settings.formEle;
            //form提交
            formEle.on("submit", function (evt) {
                return that.beforeSubmit();
            });
            formEle
                .find(".ipt")
                .focus(function (evt) {
                    var btn = $(this),
                        parEle = btn.parent();
                    parEle.find("label").hide();
                })
                .blur(function (evt) {
                    var btn = $(this),
                        val = btn.val(),
                        parEle = btn.parent();
                    if (val == "") {
                        parEle.find("label").show();
                    }
                });
            //邮箱选择
            targetEle.on("click", function (evt) {
                evt.stopPropagation();
                that.buildMailList();
            });
            $(document).on("click", ".email-domain-options li", function (evt) {
                evt.stopPropagation();
                var btn = $(this),
                    btnParent = btn.parent();
                that.clearInput(pwdEle);
                if (btnParent.hasClass("domain-inner")) {
                    that.chooseEmail(this);
                } else {
                    that.settings.domainListEle && that.settings.domainListEle.hide();
                    that.settings.relatedEle && that.settings.relatedEle.hide();
                }
            });
        },
        init: function () {
            var that = this,
                settings = that.settings,
                //2013-1212 start
                wrapper = settings.wrapper,
                //2013-1212 end
                targetEle = settings.targetEle,
                norMails = that.mailNormalList,
                defaultEmail = "";

            //获取默认的登录邮箱
            //for(var k in norMails){
            //   defaultEmail = k;break;
            // }
            //var userSelEmail = StorageWidget.getItem("n_2014_email",defaultEmail);
            //targetEle.find("span").html(userSelEmail);
            //2013-1212 start
            // wrapper.show();
            //2013-1212 end
            that.buildMailList();
        },
        //初始化
        buildMailList: function () {
            var that = this,
                settings = that.settings,
                domainListEle = settings.domainListEle,
                norMails = that.mailNormalList,
                popMails = that.mailPopList,
                htm = "";
            if (!domainListEle.find("ul").length) {
                /*if(norMails){
                    var htm = "<ul class='domain-inner'>";
                    for(var i in norMails){
                        htm += "<li data-type='normal'>"+i+"</li>";
                    } 
                    htm += "</ul>";
                }*/
                if (popMails) {
                    //htm += "<ul><li class='email-domain-hint'>以下在弹出页登录</li>";
                    htm += "<ul>";
                    for (var j in popMails) {
                        var temp = popMails[j];
                        htm += "<li><a  href='" + temp.url + "'" + (temp.recommend ? "class='recommend'" : "") + ">" + j + "</a></li>";
                    }
                }
                htm += "</ul>";
                domainListEle.html(htm);
                // domainListEle.show();
                domainListEle.css({ top: "0px" });
            } else {
                if (domainListEle.is(":visible")) {
                    domainListEle.hide();
                } else {
                    domainListEle.show();
                }
            }
        },
        chooseEmail: function (liObj) {
            var that = this,
                norMails = that.mailNormalList,
                liEle = $(liObj),
                settings = that.settings,
                targetEle = settings.targetEle,
                liType = liEle.attr("data-type"),
                liText = $.trim(liEle.html());
            settings.domainListEle && settings.domainListEle.hide();
            targetEle.find("span").html(liText);

            //保存当前用户选择的邮箱-以方便下次用户直接登录
            StorageWidget.setItem("n_2014_email", liText);
        },
        //submit之前检测
        beforeSubmit: function () {
            var that = this,
                settings = that.settings,
                emailEle = settings.emailEle,
                pwdEle = settings.pwdEle,
                emailText = $.trim(emailEle.val()),
                pwdText = $.trim(pwdEle.val());

            if (emailText) {
                //国内邮箱注册，之所以很少包含句点，是因为其对句点存在中文和英文的混淆
                var emailReg = /[^a-zA-Z0-9_\-\.]/;
                if (emailReg.test(emailText)) {
                    alert("请填写正确的邮箱");
                    return false;
                }
            } else {
                alert("请填写邮箱地址");
                return false;
            }
            if (!pwdText) {
                alert("请填写密码");
                return false;
            }
            var targetEle = settings.targetEle,
                hiddenEle = settings.hiddenEle,
                formEle = settings.formEle,
                showEle = targetEle.find("span").eq(0),
                mailNorList = that.mailNormalList,
                selMailKey = $.trim(showEle.html()),
                selMail = mailNorList[selMailKey],
                selPwdName = selMail.pwdName,
                selEmailName = selMail.emailName,
                selHiddens = selMail.hiddens,
                flag = true;
            hiddenEle.empty();
            formEle.attr({
                action: selMail.url,
                "trace-url": selMail.url,
                "trace-title": selMailKey,
            });

            //以隐藏域的形式来保存form提交的数据
            that.clearInput(pwdEle);
            //更改email隐藏域的值
            if (selHiddens) {
                var hiddenEmail = selHiddens[selEmailName],
                    hiddenPwd = selHiddens[selPwdName],
                    emailSuffix = selMail.emailSuffix || "";
                if (hiddenEmail != undefined) {
                    selHiddens[selEmailName] = emailText + emailSuffix;
                }
                if (hiddenPwd != undefined) {
                    selHiddens[selPwdName] = pwdText;
                }
                that.addHiddenParam(selHiddens);
            }
            formEle.attr("action") == "" && (flag = false);
            return flag;
        },
        addHiddenParam: function (name, value) {
            var that = this,
                hiddenEle = that.settings.hiddenEle;
            if (value != undefined) {
                hiddenEle.append("<input type='hidden' name='" + name + "' value='" + value + "'>");
            } else if (name instanceof Object) {
                for (var k in name) {
                    hiddenEle.append("<input type='hidden' name='" + k + "' value='" + name[k] + "'>");
                }
            }
        },
        clearInput: function (ele) {
            if (!ele.length) return;
            var eleParent = ele.parent();
            ele.val("");
            eleParent.length && eleParent.find("label").show();
        },
    };
    MailWidget.build = function (options) {
        new MailWidget(options);
    };
    if (!window.MailWidget) window.MailWidget = MailWidget;
})();

/*
 * 滑动区域
 */
(function () {
    var SlideWidget = function (options) {
        var that = this;
        that.settings = {
            container: "",
            scroller: "",
            prevEle: "",
            nextEle: "",
            pageDotEle: "",
            success: "",
            auto: false, //是否自动轮播
            timeInterval: 10000, //自动轮播的时间间隔
            loop: false, //是否循环
        };
        that.settings = $.extend(that.settings, options);
        if (that.settings.scroller.length) {
            that.init();
            that.bindEvents();
        }
    };
    SlideWidget.prototype = {
        visWidth: 0, // 容器的宽度(可见区域)
        contWidth: 0, //内容的宽度
        cPage: 0, //当前页数（加loop后index下标）
        tPage: 0, //总页数
        autoInterval: null,
        autoFlag: false,
        bindEvents: function () {
            var that = this,
                settings = that.settings,
                scroller = settings.scroller,
                prevEle = settings.prevEle,
                nextEle = settings.nextEle,
                pageDotEle = settings.pageDotEle,
                tPage = that.tPage;

            if (prevEle.length) {
                prevEle.on("click", function (evt) {
                    evt.stopPropagation();
                    var btn = $(this),
                        cPage = that.cPage,
                        optFlag = that.switchBtnStatus(btn); //按钮是否可点（避免连续点击产生的问题）

                    if (!optFlag) return;

                    that.switchBtnStatus(btn, -1);

                    //循环
                    if (settings.loop) {
                        nPage = cPage - 1 < 0 ? tPage - 1 : cPage - 1;
                    } else {
                        nPage = cPage - 1 < 0 ? 0 : cPage - 1;
                    }

                    that.moveToPage(nPage, btn);
                    evt.preventDefault();
                });
            }

            //下一页

            if (nextEle.length) {
                nextEle.on("click", function (evt) {
                    evt.stopPropagation();
                    var btn = $(this),
                        cPage = that.cPage,
                        optFlag = that.switchBtnStatus(btn); //按钮是否可点（避免连续点击产生的问题）
                    if (!optFlag) return;
                    that.switchBtnStatus(btn, -1);

                    //循环
                    if (settings.loop) {
                        nPage = cPage + 1 > tPage - 1 ? 0 : cPage + 1;
                    } else {
                        nPage = cPage + 1 > tPage - 1 ? tPage - 1 : cPage + 1;
                    }

                    that.moveToPage(nPage, btn);
                    evt.preventDefault();
                });
            }

            //分页dots
            if (pageDotEle.length) {
                pageDotEle.show();
                var dotBtn = pageDotEle.find("span");
                if (dotBtn.length) {
                    dotBtn.on("click", function (evt) {
                        evt.stopPropagation();
                        var btn = $(this),
                            btnIndex = btn.index(),
                            optFlag = that.switchBtnStatus(btn); //按钮是否可点（避免连续点击产生的问题）

                        if (!optFlag) return;

                        that.switchBtnStatus(btn, -1);

                        if (!btn.hasClass("on")) {
                            that.moveToPage(settings.loop ? btnIndex + 1 : btnIndex);
                        }
                    });
                }
            }
        },
        //切换按钮的可用 type-1可用 -1不可用   无type则获取状态
        switchBtnStatus: function (btn, type) {
            var that = this,
                btn = $(btn);
            if (!btn.length) return;
            if (type) {
                switch (type) {
                    case 1:
                        btn.removeAttr("opt-status");
                        break;
                    case -1:
                        btn.attr("opt-status", "disabled");
                        break;
                }
            } else {
                return btn.attr("opt-status") ? false : true;
            }
        },

        init: function () {
            var that = this,
                settings = that.settings,
                container = settings.container,
                scroller = settings.scroller,
                prevEle = settings.prevEle,
                nextEle = settings.nextEle,
                pageDotEle = settings.pageDotEle;
            that.tPage = scroller.children().length;

            //控制分页的可用显示
            if (settings.loop) {
                //循环
                prevEle.removeClass("disabled");
                nextEle.removeClass("disabled");
            } else {
                //不循环
                prevEle.addClass("disabled");
                if (that.tPage <= 1) nextEle.addClass("disabled");
            }
            container.css({ position: "relative" });
            scroller.css({ position: "absolute" });

            //循环（添加两端临界替换节点）
            if (settings.loop) {
                var firstNode = scroller.children().first().clone(),
                    lastNode = scroller.children().last().clone();
                //firstNode.attr("fakeIndex","first");
                //lastNode.attr("fakeIndex","last");
                scroller.append(firstNode);
                scroller.prepend(lastNode);

                //重新计算容器宽度
                that.tPage = scroller.children().length;

                that.resetDimension();
                //将位置调整到显示真实的第一页

                that.cPage = 1;
                that.translate({ x: -that.visWidth, y: 0, z: 0 }, false);
            } else {
                that.resetDimension();
            }

            //自动轮播
            if (settings.auto) {
                that.autoFlag = true;
                that.autoInterval = setInterval(function () {
                    if (that.autoFlag) {
                        nextEle.trigger("click");
                    } else {
                        clearInterval(that.autoInterval);
                    }
                }, settings.timeInterval);
            }
        },

        //移动到某一页  btn用于设置按钮的状态（避免连续点击）
        moveToPage: function (nPage, btn) {
            var that = this,
                settings = that.settings,
                scroller = settings.scroller,
                pageDotEle = settings.pageDotEle;
            that.cPage = nPage;
            that.dealPageBtn();
            that.dealPageDot();
            that.resetDimension();
            //加载资源
            MozillaTool.loadDelayResource(scroller.children().eq(that.cPage));

            //设置位置切换
            that.translate({ x: -nPage * that.visWidth, y: 0, z: 0 }, true, function () {
                //循环(针对不支持transform的情况)
                if (settings.loop) {
                    that.dealLoopEdge();
                }
                var rPage = that.getRealPage();

                //加载资源
                MozillaTool.loadDelayResource(scroller.children().eq(that.cPage));

                btn && that.switchBtnStatus(btn, 1); //恢复按钮为可操作
                settings.success && $.isFunction(settings.success) && settings.success.call(null, rPage, that.tPage);
            });
        },

        //位置切换 pos为未位移，aniFlag-true表示设置动画效果（默认），false表示不设置动画效果
        translate: function (pos, aniFlag, callback) {
            var that = this,
                settings = that.settings,
                scroller = settings.scroller;
            if (scroller.length) {
                if (aniFlag) {
                    scroller.animate({ left: pos.x + "px" }, 500, function () {
                        callback && $.isFunction(callback) && callback.call(null);
                    });
                } else {
                    scroller.css({ left: pos.x + "px" });
                }
            }
        },

        //处理循环切换的临界位置
        dealLoopEdge: function () {
            var that = this,
                tPage = that.tPage,
                cPage = that.cPage;
            if (cPage <= 0) {
                that.cPage = tPage - 2;
                that.translate({ x: -that.cPage * that.visWidth, y: 0, z: 0 }, false);
            }
            if (cPage >= tPage - 1) {
                that.cPage = 1;
                that.translate({ x: -that.cPage * that.visWidth, y: 0, z: 0 }, false);
            }
        },

        //处理pageDot的显示
        dealPageDot: function () {
            var that = this,
                cPage = that.cPage,
                tPage = that.tPage,
                settings = that.settings,
                pageDotEle = settings.pageDotEle;
            if (pageDotEle.length) {
                //获取真实显示的index下标
                var rPage = that.getRealPage();
                var dots = pageDotEle.find("span");
                dots.eq(rPage).addClass("on").siblings().removeClass("on");
            }
        },

        //获取实际的坐标（不包含loop新增的项目）
        getRealPage: function () {
            var that = this,
                settings = that.settings,
                cPage = that.cPage,
                tPage = that.tPage,
                rPage = cPage;
            if (settings.loop) {
                rPage = cPage == 0 ? tPage - 3 : cPage == tPage - 1 ? 0 : cPage - 1;
            }
            return rPage;
        },

        //处理pageBtn
        dealPageBtn: function () {
            var that = this,
                settings = that.settings;

            //循环切换时不做处理
            if (settings.loop) return;

            var nextEle = settings.nextEle,
                prevEle = settings.prevEle,
                tPage = that.tPage,
                cPage = that.cPage;
            if (tPage > 1) {
                prevEle.removeClass("disabled");
                nextEle.removeClass("disabled");
            } else {
                prevEle.addClass("disabled");
                nextEle.addClass("disabled");
            }
            if (cPage <= 0) {
                prevEle.addClass("disabled");
            } else if (cPage >= tPage - 1) {
                nextEle.addClass("disabled");
            } else {
                nextEle.removeClass("disabled");
                prevEle.removeClass("disabled");
            }
        },
        //重新设置尺寸
        resetDimension: function () {
            var that = this,
                settings = that.settings,
                container = settings.container,
                scroller = settings.scroller;
            that.visWidth = container.width();
            that.contWidth = that.tPage * that.visWidth;
            scroller.css({ width: that.contWidth });
        },
    };
    SlideWidget.build = function (options) {
        var slideWidget = new SlideWidget(options);
    };

    if (!window.SlideWidget) window.SlideWidget = SlideWidget;
})();
