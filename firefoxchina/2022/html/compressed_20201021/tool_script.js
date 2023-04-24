/*
 * @Description 工具类（公用）
 * @Author      bqu@
 * @Time        2015-03-09
 */

/*配置*/
//公共配置
var CHANNEL_ID = "unknown", //频道ID
    // DOMAIN_TOP = document.domain.split(".").slice(-2).join(".");
    DOMAIN_TOP = document.domain,
    NEW_EXTENSION = window.mozCNChannel ? true : false; //是否为新扩展（适用于FF35扩展升级之后）
var CONFIG = {
    TIME_OUT: 10000, //超时
    TIME_OUT_FETCH: 20000, //获取商品信息超时
    OVER_TIME: 300, //tab切换的时间
    //Cookie
    COOKIE: {
        DEFAULT_COOKIE_EXPIRE: new Date("December 31, 2100"), //默认的cookie时效时间
        LOGIN_REDIRECT_COOKIE: "MOZ_H___forward__",
    },
    SCROLL: {
        SIDE_BAR_REFER_SELECTOR: ".fixed-show",
        SIDE_BAR_FIXED_CLS: "side-flip",
        SIDE_BAR_ABSOLUTE_CLS: "side-absolute",
        MENU_FIXED_CLS: "menu-flip",
        MENU_ABSOLUTE_CLS: "menu-absolute",
        SCROLL_LOAD_INIT: "inited",
    },
    //延迟加载
    DELAY: {
        DELAY_MOD_CLS: "delay-mod",
        DELAY_LOADED_NAME: "loaded",
        DELAY_IMG_CLS: "img-load-delay",
        DELAY_IFRAME_CLS: "iframe-load-delay",
        DELAY_ATTR_NAME: "data-url",
    },
    //公共文案
    TEXT: {
        NOT_LOGIN: "您还没有登录，请先登录! ",
        LINK_FORMAT_ERROR: "请输入正确的链接地址",
        SYSTEM_IS_BUSY: "系统繁忙，请稍候再试",
        SYSTEM_IS_BUSY_ELE: "<div class='errmsg'>系统繁忙，请稍候再试</div>",
        OPERATE_TOO_OFTEN: "操作太频繁了，休息~~休息一下~~",
        OPERATE_FAILED: "操作失败",
        NO_DATA_TEXT: "暂无数据！",
        NO_DATA_ELE: "<div class='errmsg'>暂无数据！</div>",
        NO_SEARCH_KEYWORDS: "   请输入搜索内容~~    ",
        CHECK_ATTR_DISABLED: "data-disabled",
        ATTR_DISABLED_TEXT: "disabled",
        IMAGE_SUFFIX_ERROR: "图片仅支持JPG、JPEG、PNG、GIF格式",
        AVATAR_SUFFIX_ERROR: "头像仅支持JPG、JPEG、PNG格式",
        IMAGE_TOO_LARGE_ERROR: "图片过大，仅支持<=500K的图片",
        IMAGE_TOO_LARGE_CHECK: "413 Request Entity Too Large",
        ALLOW_IMAGE_SUFFIX: ["JPG", "JPEG", "PNG", "GIF"], //图片支持的格式
        ALLOW_AVATAR_SUFFIX: ["JPG", "JPEG", "PNG", "GIF"], //图片支持的格式
    },
    LINK: {
        TRACE_IMG_URL: "https://home.firefoxchina.cn/2019/img/trace_2014.gif",
    },
    //用户名片相关配置
    USER_CARD: {
        SELECTOR: ".pop-user",
        TIME_OUT_DELAY: 300,
        TIME_OVER_DELAY: 500,
        WIDTH: 264,
        HEIGHT: 176,
        FETCH_USER_LINK: "User/UserCenter/getProfile",
    },
    //MozillaBehavior相关配置
    BEHAVIOR: {
        UNFOLLOW_LINK: "User/follow/unfollow",
        FOLLOW_LINK: "User/follow/follow",
        FOLLOWED_TEXT: "取消关注",
        FOLLOW_TEXT: "+关 注",
        FOLLOWED_CLS: "followed",
        FOLLOW_CLS: "follow",
        ALREADY_FOLLOWED: "已关注",
        NO_FOLLOWING_ELE: "<div class='errmsg'>您还没有关注任何人哦！</div>",
        SUPPORTED_CLS: "supported",
        SUPPORT_ARTICLE_LINK: "Article/ArticleSupport/support",
        SUPPORT_COMMENT_LINK: "Article/ArticleReplySupport/support",
        ALREADY_SUPPORTED: "您已经赞过，不能再赞了。",
        FAVE_LINK: "Article/ArticleBookmark/addbookmark",
        FAVE_CANCEL_LINK: "Article/ArticleBookmark/delbookmark",
        FAVED_CLS: "faved",
        FAVE_CLS: "fave",
        FAVED_TEXT: "取消收藏",
        FAVE_TEXT: "收藏",
        FAVE_SUCCESS: "收藏成功！",
        FAVE_DEL_SUCCESS: "已取消收藏！",
        REPORT_ARTICLE_LINK: "article/article_accuse/doAccuse",
        REPORT_COMMENT_LINK: "article/article_reply_accuse/doReplyAccuse",
        ALREADY_REPORTED: "您已经举报过了！",
        USER_MARK_LINK: "User/Signin/signin",
        //MESSAGE_CHECK_LINK: "User/Ihome/getUserAllMessageNoRemind",
        MESSAGE_CHECK_LINK: "User/Ihome/isHaveMessageNoRemind",
        MESSAGE_REMIND_CLS: "newmsg",
        MESSAGE_INTERVAL: 2 * 60 * 1000, //消息监听间隔
    },
    EMOTION: {
        FETCH_EMOTION_LINK: "Home/Index/getEmotion", // 获取表情图片列表
        MSG_FETCH_EMOTION_FAILE: "获取表情失败",
    },
    VERIFY: {
        EMAIL: /^([a-zA-Z0-9_\-\.])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/,
        FLOAT: /[^0-9.]/,
        LINK: /^(http[s]{0,1}|ftp):\/\//i,
        MOBILE: /^1[0-9]{10}$/,
        PHONE: /^((0\d{2,3})-)(\d{7,8})(-(\d{3,4}))?$/,
        ZIPCODE: /^[1-9][0-9]{5}$/,
    },
};
/*
 * Cookie存储 - 适用于存储具有时限的暂时数据
 */
(function () {
    var CookieWidget = {
        __backend__: {
            //expire为毫秒
            setItem: function (key, value, expire, noEscape) {
                var date;
                if (expire) {
                    date = new Date();
                    date.setTime(expire);
                } else {
                    date = CONFIG.COOKIE.DEFAULT_COOKIE_EXPIRE;
                }
                try {
                    //document.cookie = key + '=' + escape(value+"") + '; path=/; domain=' + DOMAIN_TOP + '; expires=' + date.toGMTString();
                    //document.cookie = key + '=' + escape(value+"") + '; path=/; expires=' + date.toGMTString();
                    var val = noEscape ? value : escape(value + "");
                    //document.cookie = key + '=' + val + '; path='+CONFIG_GLOBAL.COOKIE.PATH+'; domain='+CONFIG_GLOBAL.COOKIE.DOMAIN+'; expires=' + date.toGMTString();
                    document.cookie = key + "=" + val + "; path=" + CONFIG_GLOBAL.COOKIE.PATH + "; domain=" + CONFIG_GLOBAL.COOKIE.DOMAIN + "; expires=" + date.toGMTString();
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
        setItem: function (k, v, expire, noEscape) {
            try {
                this.__backend__.setItem(k, noEscape ? v : JSON.stringify(v), expire, noEscape);
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
        var Tool = function () {};
        /*================================公共外放函数=============================*/

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

        //获取字符串的字节数- 中文、全角字符占两个字节
        Tool.getByteLength = function (str) {
            var len = 0;
            if (str) {
                var newStr = str.replace(/[^\x00-\xff]/g, "**");
                len = newStr.length;
            }
            return len;
        };
        Tool.getByteString = function (str, bSize) {
            var newStr = $.trim(str);
            if (newStr) {
                var index = 0,
                    tempChar,
                    len = 0,
                    tempStr = "",
                    endFlag = false;
                while ((tempChar = newStr.charAt(index)) && len < bSize && !endFlag) {
                    index++;
                    //中文和全角字符
                    if (/[^\x00-\xff]/.test(tempChar)) {
                        if (len <= bSize - 2) {
                            len = len + 2;
                            tempStr = tempStr + tempChar;
                        } else {
                            endFlag = true;
                        }
                    } else {
                        tempStr = tempStr + tempChar;
                        len = len + 1;
                    }
                }
                newStr = tempStr;
            }
            return newStr;
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

        //获取拼装路径(可能随时变化)
        Tool.getPath = function (url, params, rewrite) {
            return U(url, params, rewrite);
        };

        //获取当前页面的滚动位置
        Tool.getScrollPos = function () {
            return getScrollPos();
        };

        //获取元素的位置信息
        Tool.getEleInfo = function (ele) {
            return getEleInfo(ele);
        };

        //页面滚动加载资源
        Tool.loadScrollResource = function (selfFlag) {
            loadScrollResource(selfFlag);
        };

        //获取元素的disabled状态  检测data-disabled是否有值
        Tool.checkEleDisabled = function (ele) {
            var flag = false;
            ele && ele.length && (flag = $.trim(ele.attr(CONFIG.TEXT.CHECK_ATTR_DISABLED)) ? true : false);
            return flag;
        };

        //设置元素的data-disabled 属性
        Tool.setEleDisabled = function (ele, status, btnEle, btnText) {
            if (ele && ele.length && status) {
                switch (status) {
                    case 1:
                        ele.attr(CONFIG.TEXT.CHECK_ATTR_DISABLED, CONFIG.TEXT.ATTR_DISABLED_TEXT);
                        if (btnEle && btnEle.length) {
                            btnEle.attr(CONFIG.TEXT.CHECK_ATTR_DISABLED, CONFIG.TEXT.ATTR_DISABLED_TEXT);
                            btnEle.attr("tx-ori", btnEle.val());
                            btnText && btnEle.val(btnText);
                        }
                        //btnEle && btnEle.length && btnEle.attr(CONFIG.TEXT.CHECK_ATTR_DISABLED,CONFIG.TEXT.ATTR_DISABLED_TEXT);
                        break;
                    case -1:
                        ele.removeAttr(CONFIG.TEXT.CHECK_ATTR_DISABLED);
                        if (btnEle && btnEle.length) {
                            btnEle.removeAttr(CONFIG.TEXT.CHECK_ATTR_DISABLED);
                            var txOri = btnEle.attr("tx-ori");
                            txOri && btnEle.val(txOri);
                        }
                        break;
                }
            }
        };

        //scroll请求加载资源
        Tool.loadScrollList = function (targetEle, callback) {
            if (targetEle && targetEle.length) {
                if (targetEle.attr(CONFIG.SCROLL.SCROLL_LOAD_INIT)) return;
                var sTop = MozillaTool.getScrollPos().top,
                    pageVisHeight = document.documentElement.clientHeight,
                    targetTop = targetEle.get(0).getBoundingClientRect().top;
                if (targetTop <= pageVisHeight + 50) {
                    callback && callback.call(null, targetEle);
                }
            }
        };

        /*==============================内部函数===============================*/

        //处理scroll加载图片  selfFlag 是否包含其本身（即本身为图片）
        function loadScrollResource(selfFlag) {
            var pageVisHeight = document.documentElement.clientHeight,
                mods; //页面可见区域高度
            if (selfFlag) {
                mods = $("." + CONFIG.DELAY.DELAY_IMG_CLS);
            } else {
                mods = $("." + CONFIG.DELAY.DELAY_MOD_CLS);
            }
            $.each(mods, function (i, n) {
                var mod = $(n),
                    modTop = mod.get(0).getBoundingClientRect().top,
                    modHeight = mod.height();
                //在可接近显示区域才进行显示(上部、下部)
                if ((modTop > 0 && modTop < pageVisHeight + 50) || (modTop <= 0 && Math.abs(modTop) < modHeight - 50)) {
                    //包含tab切换，加载显示的tab一栏
                    //mod.attr("data-show",1);
                    //mod && mod.length &&  MozillaTool.loadDelayResource(mod);
                    mod && mod.length && loadDelayResource(mod, selfFlag);
                }
            });
        }

        function loadDelayResource(wrap, selfFlag) {
            if (wrap && wrap.length && wrap.attr(CONFIG.DELAY.DELAY_LOADED_NAME)) return;

            var imgClass = CONFIG.DELAY.DELAY_IMG_CLS,
                frameClass = CONFIG.DELAY.DELAY_IFRAME_CLS,
                imgList = wrap ? (selfFlag ? wrap : wrap.find("." + imgClass)) : $("." + imgClass),
                iframeList = wrap ? wrap.find("." + frameClass) : $("." + frameClass);
            if (wrap && wrap.length && !iframeList.length && !imgList.length) {
                wrap.attr(CONFIG.DELAY.DELAY_LOADED_NAME, CONFIG.DELAY.DELAY_LOADED_NAME);
                wrap.removeClass(CONFIG.DELAY.DELAY_MOD_CLS);
            }
            if (imgList.length) {
                $.each(imgList, function (i, n) {
                    loadResource($(n), imgClass, true, selfFlag);
                });
            }
            if (iframeList.length) {
                $.each(iframeList, function (h, k) {
                    loadResource($(k), frameClass);
                });
            }
        }

        function loadResource(res, cls, isImage) {
            if (!res.length) return;
            var resURL = res.attr(CONFIG.DELAY.DELAY_ATTR_NAME);
            if (resURL) {
                var success = false,
                    stopped = false;
                res.attr("src", resURL);
                res.on("load", function (evt) {
                    if (!stopped) {
                        success = true;
                        res.removeClass(cls);
                        res.removeAttr(CONFIG.DELAY.DELAY_ATTR_NAME);
                    }
                });

                //针对新华图片经常出错采取的应急方案，对图片添加超时判断
                /*if(isImage){
                  setTimeout(function(){
                     if(!success){    
                          stopped = true;  
                          res.removeAttr("src");  
                     }
                  },5000);
               }*/
            }
        }

        //判断是否登录
        function isLogin() {
            return parseInt(CONFIG_GLOBAL.MID);
        }

        //获取光标位置
        function getCursorPosition(ctrl) {
            if (ctrl instanceof jQuery) {
                ctrl = ctrl.get(0);
            }

            var CaretPos = 0; // IE Support
            if (document.selection) {
                ctrl.focus();
                var Sel = document.selection.createRange();
                Sel.moveStart("character", -ctrl.value.length);
                CaretPos = Sel.text.length;
                // Firefox support
            } else if (ctrl.selectionStart || ctrl.selectionStart == "0") {
                CaretPos = ctrl.selectionStart;
            }
            return CaretPos;
        }

        //设置光标位置
        function setCursorPosition(ctrl, pos) {
            if (ctrl instanceof jQuery) {
                ctrl = ctrl.get(0);
            }
            if (ctrl.setSelectionRange) {
                ctrl.focus();
                ctrl.setSelectionRange(pos, pos);
            } else if (ctrl.createTextRange) {
                var range = ctrl.createTextRange();
                range.collapse(true);
                range.moveEnd("character", pos);
                range.moveStart("character", pos);
                range.select();
            }
        }

        //往文本框里插入内容
        function insertText(ctrl, pos, text) {
            var tx = ctrl.val(),
                len = tx.length,
                start = tx.substring(0, pos),
                end = tx.substring(pos),
                newText = start + text + end;
            ctrl.val(newText);
            setCursorPosition(ctrl, pos + text.length);
        }
        /*
         * 显示弹出消息
         */
        function showPopMsg(msg, btn, callback) {
            if (!msg) return;
            var msgEle = $("#pop-msg-info");
            msgEle.length && msgEle.remove();
            var mCSS = "",
                mCls = "pop-msg-fixed";
            if (btn && btn.length) {
                //有btn则在btn位置弹出，否则位于页面中间位置
                var eleInfo = getEleInfo(btn),
                    msgW = 200,
                    msgH = 40,
                    cw = document.body.clientWidth,
                    ch = document.body.clientHeight,
                    cvh = document.documentElement.clientHeight,
                    csh = document.body.scrollTop || document.documentElement.scrollTop;
                mCls = "pop-msg";
                mCSS = "style='top:" + ((cvh - msgH) / 2 + csh) + "px; left:" + (cw - msgW) / 2 + "px;'";
            }
            var htm = "<div id='pop-msg-info' class='" + mCls + "' " + mCSS + "><p>" + msg + "</p></div>";
            $(document.body).append(htm);
            msgEle = $("#pop-msg-info");
            msgEle.show().animate(
                {
                    opacity: 1,
                    "margin-top": "0px",
                },
                500,
                function () {
                    var popTimeout = setTimeout(function () {
                        msgEle.animate(
                            {
                                opacity: 0,
                            },
                            500,
                            function () {
                                msgEle.hide();
                                callback && callback.call(null);
                            },
                        );
                    }, 2000);
                },
            );
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

        /**
         * 模拟U函数
         * @param url
         * @param params
         * @returns {string}
         * @constructor
         */
        function U(url, params, rewrite) {
            var website = "";
            if (CONFIG_GLOBAL.SERVER.MODEL[0] == 2) {
                var website = CONFIG_GLOBAL.SERVER.ROOT + "/";
                url = url.split("/");

                if (url[0] == "" || url[0] == "@") url[0] = "";
                if (!url[1]) url[1] = "Index";
                if (!url[2]) url[2] = "index";
                website = website + "" + url[0] + "/" + url[1] + "/" + url[2];

                if (params) {
                    params = params.join("/");
                    website = website + "/" + params;
                }
                if (!rewrite) {
                    website = website + ".html";
                }
            } else {
                var website = CONFIG_GLOBAL.SERVER.ROOT + "/index.php";
                url = url.split("/");
                if (url[0] == "" || url[0] == "@") url[0] = "";
                if (!url[1]) url[1] = "Index";
                if (!url[2]) url[2] = "index";
                website = website + "?s=/" + url[0] + "/" + url[1] + "/" + url[2];
                if (params) {
                    params = params.join("/");
                    website = website + "/" + params;
                }

                if (!rewrite) {
                    website = website + ".html";
                }
            }
            return website;
        }
        return Tool;
    })();
    if (!window.MozillaTool) window.MozillaTool = MozillaTool;
})();

/*
 * 日志记录(注意新页面打开和当前页面打开的区别处理) 暂未使用
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
        TraceTool.build = function () {
            //return;//暂不添加点击统计
            getChannelid();
            $(document).on("click", "a", function (evt) {
                var btn = $(this),
                    tarVal = btn.attr("target"),
                    nFlag = tarVal == "_blank" ? true : false;
                !nFlag && evt.preventDefault();
                linkTrace(btn, nFlag);
            });
            /*$(document).on("submit","form",function(evt){
                  var form = $(this),
                      restoreVal = $.trim(form.attr("restore")),
                  //更改search key 值
                      engineKey = form.find(".search-key"),
                      title = engineKey.val() || "无关键字",
                      url= form.attr("action"),
                      key = form.attr("trace-key"),
                      tarVal = form.attr("target"),
                      nFlag = restoreVal ? true : (tarVal=="_blank" ? true : false);
                  !restoreVal && trace(title,url,key,form,nFlag);
                  if(!nFlag){
                      return false;
                  }else{
                      form.removeAttr("restore");
                      return true;
                  }

            });*/
        };
        /*
         * 快速添加单个链接日志
         */
        TraceTool.addLinkTrace = function (btn, callback) {
            if (btn && btn.length) {
                var tarVal = btn.attr("target"),
                    nFlag = tarVal == "_blank" ? true : false;
                linkTrace($(btn), nFlag, callback);
            }
        };
        /*
         * 快速添加单个form日志
         */
        TraceTool.addFormTrace = function (form, callback) {
            if (form && form.length) {
                var traceTitle = $.trim(form.attr("trace-title")),
                    title = traceTitle,
                    tarVal = form.attr("target"),
                    restoreVal = $.trim(form.attr("restore")),
                    nFlag = restoreVal ? true : tarVal == "_blank" ? true : false;
                (href = $.trim(form.attr("action"))), (key = $.trim(form.attr("trace-key")));
                if (!title) {
                    var engineKey = form.find(".search-key");
                    title = engineKey.val() || "无关键字";
                }
                !restoreVal && trace(title, href, key, form, nFlag);
                if (!nFlag) {
                    return false;
                } else {
                    form.removeAttr("restore");
                    return true;
                }
            }
        };
        /*
         * 用于单个添加日志
         */
        TraceTool.addTrace = function (title, href, key, btn, newFlag, callback) {
            trace(title, href, key, btn, newFlag, callback);
        };
        /*
         * 记录皮肤等的展示日志
         */
        /*var displayData = {};
        TraceTool.addDisplayTrace = function(type,title,href,key){
            var date = new Date(),
                curTime = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(), //展示日志的时间戳
                ndpData= StorageWidget.getItem("n_2014_dp_data",displayData),   //区分2013版本
                newData = ndpData;
            if(ndpData.time != curTime){
                newData = {};
                newData.time = curTime;
                newData[type] = 1;
            }else if(!ndpData[type]){
                newData[type] = 1;
            }else{
                return;
            }
            displayData = newData;
            trace(title,href,key);
            StorageWidget.setItem("n_2014_dp_data",newData);  //区分2013版本
        };*/
        /*=================内部函数=================*/
        function linkTrace(node, nFlag, callback) {
            var title = node.attr("title") || node.text(),
                href = node.attr("href") || "javascript:;",
                traceKey = $.trim(node.attr("trace-key")),
                key = traceKey ? traceKey : undefined;

            if (!key) {
                var pNode = node.parents("[trace-key]").eq(0);
                key = pNode.length ? pNode.attr("trace-key") || "other_unknown" : undefined;
            }
            trace(title, href, key, node, nFlag, callback);
        }
        function trace(title, href, key, btn, newFlag, callback) {
            var href = $.trim(href);
            if (href) {
                var title = $.trim(title) || "无关键字",
                    key = $.trim(key) || "other_unknown",
                    image = new Image(),
                    cid = CHANNEL_ID;
                //newFlag 表示新开窗口，否则为其他方式
                //新开窗口无需等待日志添加完毕
                image.src = CONFIG.LINK.TRACE_IMG_URL + "?r=" + Math.random() + "&d=" + encodeURIComponent(document.location.host) + "&c=" + encodeURIComponent(key) + "&a=" + encodeURIComponent("") + "&u=" + encodeURIComponent(href) + "&cid=" + encodeURIComponent(cid) + "&t=" + encodeURIComponent(title);
                //非新开窗口，等待日志添加完毕后进行跳转
                if (!newFlag) {
                    image.onload = function () {
                        if (callback) {
                            callback.call(null);
                        } else {
                            restoreDefaultAction(btn, href);
                        }
                    };
                    image.onerror = function () {
                        if (callback) {
                            callback.call(null);
                        } else {
                            restoreDefaultAction(btn, href);
                        }
                    };
                }
            }
            return newFlag;
        }
        //恢复链接的默认点击行为
        function restoreDefaultAction(btn, href) {
            var btn = $(btn),
                tagName = $(btn).get(0).tagName.toLowerCase();
            switch (tagName) {
                case "form":
                    btn.attr("restore", "1");
                    btn.submit();
                    break;
                default:
                    href && href != "javascript:;" && (window.top.location.href = href);
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
            if (NEW_EXTENSION) {
                //新扩展 35版本之后
                //创建并触发WebChannelMessageToChrome事件
                //获取CHANNEL_ID
                var fetchChannelEvt = new window.CustomEvent("WebChannelMessageToChrome", {
                    detail: {
                        id: window.mozCNChannel,
                        message: {
                            id: 5,
                            key: "startup.channelid",
                        },
                    },
                });
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
 * Tab页切换、可自动切换
 */
(function () {
    var TAB_MENU_ARR = [], //menuInterval
        TAB_CONT_ARR = []; //contInterval
    var TabWidget = function () {};
    TabWidget.build = function (selector, callback) {
        var wrap = $(selector);
        $.each(wrap, function (i, n) {
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
                        if (minus >= CONFIG.OVER_TIME) {
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
                            showTab(btn, callback);
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
                    showTab(btn, callback);
                });
            }
        });
    };
    /*
     *  随机显示
     */
    TabWidget.randSwitch = function (selector, callback) {
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
                    showTab(menuEles.eq(perIndex), callback);
                } else {
                    menuEles = tabMenu.find("li");
                    menuEles.length && showTab(menuEles.eq(Math.floor(randIndex * menuEles.length)), callback);
                }
            }
        });
    };
    //Tab自动切换
    TabWidget.autoSwitch = function (selector, callback) {
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
                    showTab(menuEles.eq(newIndex), callback);
                }, 10000);
                tabMenu.attr("minterval", menuInterval);

                //对于设置了自动切换（即data-auto不为空）的元素，鼠标提留在内容区时间超过CONFIG.TEXT.OVER_TIME时间则去除自动切换
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
                                if (minTime > CONFIG.OVER_TIME) {
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

    TabWidget.showTab = function (btn, callback) {
        showTab(btn, callback);
    };

    //显示某个tab页的内容
    /* function showTab(btn,callback){
            if(!btn || (btn.size() && btn.hasClass("on"))) return;
            var forVal = btn.attr("for");
            if(!forVal) return;
            btn.addClass("on").siblings().removeClass("on");
            var forArr = forVal.split(",");
            callback && callback.call(null,forArr[0],btn);
            $.each(forArr,function(i,m){
                  var idVal = $.trim(m);
                  if(idVal){
                      var tab = $("#"+idVal);
                      if(tab.length){
                         tab.show().siblings().hide();
                         MozillaTool.loadDelayResource(tab);
                         if(btn.attr("data-loaded")) return; //data-loaded属性保存是否已经load成功
                      }
                  }
                  
            });
        }*/
    //显示某个tab页的内容
    function showTab(btn, callback) {
        if (!btn || (btn.size() && btn.hasClass("on"))) return;
        var forVal = btn.attr("for"),
            loadUrl = $.trim(btn.attr("load-url"));

        if (!forVal) return;
        btn.addClass("on").siblings().removeClass("on");
        var forArr = forVal.split(",");
        callback && callback.call(null, forArr[0], btn);
        $.each(forArr, function (i, m) {
            var idVal = $.trim(m);
            if (idVal) {
                var tab = $("#" + idVal);
                if (tab.length) {
                    tab.show().siblings().hide();
                    //ajax请求加载数据
                    if (loadUrl) {
                        var htm = "<div class='loading'>正在加载，请稍候~~</div>",
                            errHtm = "<div class='error'>系统繁忙，请稍候再试</div>";
                        tab.html(htm);
                        $.ajax({
                            url: loadUrl + "&ts=" + new Date().getTime(),
                            type: "get",
                            dataType: "html",
                            timeout: CONFIG.TIME_OUT,
                            error: function (error) {
                                tab.html(errHtm);
                            },
                            success: function (data) {
                                if (data) btn.removeAttr("load-url");
                                tab.html(data ? data : errHtm);
                            },
                        });
                    } else {
                        MozillaTool.loadDelayResource(tab);
                        if (btn.attr("data-loaded")) return; //data-loaded属性保存是否已经load成功
                    }
                }
            }
        });
    }
    function clearTabInterval(type) {
        var itArr = [];
        switch (type) {
            case "menu":
                itArr = TAB_MENU_ARR;
                TAB_MENU_ARR = [];
                break;
            case "cont":
                itArr = TAB_CONT_ARR;
                TAB_CONT_ARR = [];
                break;
        }
        if (itArr.length) {
            var start = 0,
                len = itArr.length;
            for (; start <= len; start++) {
                clearInterval(itArr[start]);
            }
        }
    }
    if (!window.TabWidget) window.TabWidget = TabWidget;
})();

/*
 *焦点图
 */
(function () {
    var autoTimer;
    var MozillaFPic = function (options) {
        var that = this;
        that.settings = {
            container: "",
            dotEle: "",
            prevEle: "",
            nextEle: "",
            auto: false, //是否自动轮播
            timeInterval: 5000, //自动轮播的时间间隔
        };
        that.settings = $.extend(that.settings, options);
        that.init();
        that.bindEvents();
    };
    MozillaFPic.prototype = {
        tPage: 0,
        cPage: 0,
        bindEvents: function () {
            var that = this,
                settings = that.settings,
                prevEle = settings.prevEle,
                nextEle = settings.nextEle,
                dotEle = settings.dotEle;

            if (prevEle.length) {
                prevEle.on("click", function (evt) {
                    evt.stopPropagation();
                    var nPage = that.cPage - 1 < 0 ? that.tPage : that.cPage - 1;
                    that.showPage(nPage, true);
                });
            }

            if (nextEle.length) {
                nextEle.on("click", function (evt) {
                    evt.stopPropagation();
                    var nPage = that.cPage + 1 >= that.tPage ? 0 : that.cPage + 1;
                    that.showPage(nPage, true);
                });
            }

            if (dotEle.length) {
                var dots = settings.dotEle.children();
                if (dots.length) {
                    dots.on("mouseover", function (evt) {
                        evt.stopPropagation();
                        var btn = $(this),
                            page = btn.index();
                        that.showPage(page);
                    });
                }
            }
        },
        init: function () {
            var that = this,
                settings = that.settings,
                container = settings.container;
            that.tPage = container.children().length;
            //自动播放
            if (settings.auto) {
                if (that.tPage > 1) {
                    autoTimer = setInterval(function () {
                        var nPage = that.cPage + 1 >= that.tPage ? 0 : that.cPage + 1;
                        that.showPage(nPage);
                    }, settings.timeInterval);
                }
            }
        },

        //显示第几页
        showPage: function (pg, flag) {
            var that = this,
                settings = that.settings,
                container = settings.container,
                beforePageEle = container.children().eq(that.cPage),
                eleList = container.children(),
                curPageEle = eleList.eq(pg);

            if (curPageEle.length) {
                eleList.removeAttr("style");
                that.cPage = pg;
                if (flag) {
                    that.showPageDot(pg);
                    beforePageEle.animate({ opacity: 0 }, 1000);
                    curPageEle.show().animate(
                        {
                            opacity: 1,
                        },
                        1200,
                        function () {
                            curPageEle.addClass("on").siblings().hide().removeClass("on");
                        },
                    );
                } else {
                    curPageEle.show().addClass("on").siblings().hide().removeClass("on");
                    that.showPageDot(pg);
                }
            }
        },

        //显示分页的点
        showPageDot: function (pg) {
            var that = this,
                settings = that.settings,
                dotEle = settings.dotEle;
            if (dotEle.length) {
                var curDotEle = dotEle.children().eq(pg);
                if (curDotEle.length) curDotEle.addClass("on").siblings().removeClass("on");
            }
        },
    };
    MozillaFPic.build = function (options) {
        return new MozillaFPic(options);
    };
    !window.MozillaFPic && (window.MozillaFPic = MozillaFPic);
})();

var SliderLib = (function () {
    var SliderLib = {
        each: function (object, callback) {
            if (!callback || !object) return;
            var that = this;
            if (that.likeArray(object)) {
                for (var i = 0; i < object.length; i++) {
                    if (callback.call(null, i, object[i]) == false) break;
                }
            } else if (object.nodeType) {
                callback.call(object, object, object);
            } else {
                for (var prop in object) {
                    if (callback.call(null, prop, object[prop]) == false) break;
                }
            }
        },
        css: function (object, styles) {
            if (!styles || !object) return;
            var that = this;
            that.each(object, function (index, obj) {
                for (var prop in styles) {
                    obj.style[prop] = styles[prop];
                }
            });
        },
        addClass: function (object, targetClass) {
            if (!object || !targetClass) return;
            var that = this;
            that.each(object, function (i, n) {
                that.classOpt(n, targetClass, "add");
            });
        },
        removeClass: function (object, targetClass) {
            if (!object || !targetClass) return;
            var that = this;
            that.each(object, function (i, n) {
                that.classOpt(n, targetClass, "remove");
            });
        },
        trim: function (str) {
            return str.replace(/^\s+/).replace(/\s+$/);
        },
        likeArray: function (obj) {
            return typeof obj.length == "number";
        },
        //class操作
        classOpt: function (obj, cls, type) {
            if (!obj) return;
            var that = this;
            var cls = that.trim(cls),
                oldCls = obj.className,
                newCls = oldCls.replace(/\s+/, " "),
                clsArr = newCls.split(" "),
                newArr = [];
            for (var i = 0; i < clsArr.length; i++) {
                var temp = clsArr[i];
                if (temp != cls) newArr.push(temp);
            }
            if (type == "add") newArr.push(cls);
            obj.className = newArr.join(" ");
        },
    };
    return SliderLib;
})();
window.SliderLib = SliderLib;
/*
 * Slider 专用于移动平台上的滑动效果 例如新闻、图片轮播（不适用于页数过多的情况）
 * 如果页数过多建议采用SwipeView 三栏切换内容的方式
 * @author zhouhuiling
 * @time   2012-10-18
 * @version 1.0
 */
(function (frameLib) {
    var Slider = (function () {
        var createDiv = document.createElement("div"),
            divStyle = createDiv.style,
            elementDisplay = {},
            vendor = (function () {
                //检测样式属性前缀
                var vendors = "t,webkitT,OT,MozT,msT".split(","),
                    i = 0,
                    t,
                    len = vendors.length;
                for (; i < len; i++) {
                    t = vendors[i] + "ransform";
                    if (t in divStyle) return vendors[i].substring(0, vendors[i].length - 1);
                }
                return false;
            })(),
            hasTouch = "ontouchstart" in window,
            has3d = prefixStyle("perspective") in divStyle,
            startEvent = hasTouch ? "touchstart" : "mousedown",
            moveEvent = hasTouch ? "touchmove" : "mousemove",
            endEvent = hasTouch ? "touchend" : "mouseup",
            transformStyle = prefixStyle("transform"),
            transitionStyle = prefixStyle("transition"),
            translateOpen = has3d ? "3d(" : "(",
            translateClose = has3d ? ",0px)" : ")",
            cssVendor = vendor ? "-" + vendor + "-" : "";
        var Slider = function (container, options) {
            if (!container) return;
            var that = this,
                slideInterval,
                detectInterval; //自动轮播;
            if (options) {
                //覆盖默认设置
                for (var p in that) {
                    var option = options[p];
                    if (option != undefined || option != null) {
                        that[p] = option;
                    }
                }
            }
            that.container = container;
            that.scroller = container.querySelector("div");
            if (!that.scroller) return;
            that.__refreshDimension();
            that.__layout();
            if (that.autoSlide) {
                //自动轮播
                that.__autoSwitch(that.autoInterval || 10000);
            }
            if (that.initialPage) {
                that.onMoveIndex(that.initialPage, null, 0);
            } //初始化显示页数
            that.__bindEvents();
            return that;
        };
        Slider.prototype = {
            startX: 0,
            startY: 0,
            minusX: 0,
            minusY: 0,
            endX: 0,
            endY: 0,
            stepX: 0,
            stepY: 0,
            minX: 0 /*最小距离--仅在loopFlag为false使用*/,
            maxX: 0 /*最大距离--仅在loopFlag为false使用*/,
            sliderIndex: 0 /*滑动叠加index*/,
            currentPage: 0 /*当前显示的页数*/,
            pageCount: 0 /*总页数*/,
            childCount: 0 /*布局后真实子元素个数（>=pageCount）*/,
            containerWidth: 0 /*容器宽度*/,
            containerHeight: 0 /*容器高度*/,
            scroller: null /*滑动元素*/,
            container: null /*容器元素*/,
            /*==========================自定义区域 START========================*/
            initialPage: 0 /*初始化的页数 0开始*/,
            navEle: null /*导航元素*/,
            navSelector: "a" /*导航菜单选择器*/,
            navSelClass: null /*导航选中样式*/,
            pageEle: null /*页数显示元素*/,
            pageClass: "" /*页数默认样式，可为空*/,
            pageSelClass: "" /*页数选中样式*/,
            prevEle: null /*上一页*/,
            nextEle: null /*下一页*/,
            hidePageBtnClass: "" /*隐藏上下按钮的样式，默认为隐藏，可以自定义class*/,
            loopFlag: true /*循环切换*/,
            touchFlag: true /*滑动切换 关闭开启手势滑动*/,
            autoSlide: false /*自动切换*/,
            autoInterval: 10000 /*自动切换时间间隔-ms*/,
            pagingFunction: function () {} /*个性化自定义分页切换后的操作*/,
            /*============================自定义区域 END==============================*/
            /*
             * 翻页-上一页
             */
            prevPage: function (time) {
                this.__pageSwitch("prev", time);
            },
            /*
             * 翻页-下一页
             */
            nextPage: function (time) {
                this.__pageSwitch("next", time);
            },
            /*
             * 移动到指定的页数
             * @param{Number,Number} pIndex--页数(真实页数) sIndex-滑动下标（可选）
             */
            onMoveIndex: function (pIndex, sIndex, time) {
                var that = this;
                /*==================多次移动=====================*/
                if (sIndex == undefined || sIndex == null) {
                    var cPage = that.currentPage,
                        minusP = pIndex - cPage,
                        direction = minusP > 0 ? 1 : 0,
                        k = 0;
                    if (minusP == 0) return;
                    for (; k < Math.abs(minusP); k++) {
                        if (direction) {
                            that.nextPage(time);
                        } else {
                            that.prevPage(time);
                        }
                    }
                    return;
                }
                /*==================单次移动======================*/
                var scroller = that.scroller,
                    pwidth = that.pageWidth,
                    pageObj = that.pageEle,
                    navObj = that.navEle,
                    navMenus,
                    pageDots,
                    navSelector = that.navSelector,
                    navSelClass = that.navSelClass,
                    pageSelClass = that.pageSelClass;
                that.sliderIndex = sIndex;
                that.currentPage = pIndex;
                that.moveCSS3({ x: -pwidth * sIndex, y: 0 }, time != undefined ? time : 200);
                that.endX = -sIndex * pwidth;
                var realPage = pIndex % that.pageCount;
                that.__togglePageBtn(realPage);
                if (navObj && navSelector && navSelClass) {
                    navMenus = navObj.querySelectorAll(navSelector);
                    frameLib.removeClass(navMenus, navSelClass);
                    frameLib.addClass(navMenus[realPage], navSelClass);
                }
                if (pageObj) {
                    pageDots = pageObj.querySelectorAll("span");
                    if (pageDots[realPage]) {
                        frameLib.removeClass(pageDots, pageSelClass);
                        frameLib.addClass(pageDots[realPage], pageSelClass);
                    }
                }
                that.pagingFunction && that.pagingFunction.call(that);
            },
            /*
             *  CSS 移动
             *  @param{Object} pos--移动距离
             *  @param{Boolean} intervalFlag--是否添加动画
             */
            moveCSS3: function (pos, time) {
                var that = this;
                var scroller = that.scroller;
                if (!scroller) return;
                var scrollStyle = scroller.style;
                scrollStyle[transformStyle] = "translate" + translateOpen + pos.x + "px," + pos.y + "px" + translateClose;
                time && (scrollStyle[transitionStyle] = time + "ms");
            },
            /*
             *  此方法可用于在addEventListener中第二个参数已以自定义了handleEvent的对象方式传入
             *  便于集中管理对象的事件
             *  @param{Event}  e--event对象
             */
            handleEvent: function (e) {
                var that = this;

                switch (e.type) {
                    case "touchstart":
                    case "mousedown":
                        that.__start(e);
                        break;
                    case "touchmove":
                    case "mousemove":
                        that.__move(e);
                        break;
                    case "touchend":
                    case "mouseup":
                        that.__end(e);
                        break;
                }
            },
            /*=======================内部使用函数=============================*/
            /*
             * 刷新容器尺寸
             */
            __refreshDimension: function () {
                this.containerWidth = this.container.clientWidth;
                this.containerHeight = this.container.clientHeight;
                this.pageWidth = this.containerWidth;
            },
            /*
             * 初始化Slider元素布局
             */
            __layout: function () {
                this.pageCount = this.scroller.children.length;
                this.childCount = this.pageCount;
                var that = this,
                    loopFlag = that.loopFlag,
                    container = that.container,
                    scroller = that.scroller,
                    pageCount = that.pageCount,
                    initialChildren = scroller.children,
                    lastChild = initialChildren[pageCount - 1],
                    firstChild = initialChildren[0],
                    newLastChild = lastChild.cloneNode(true),
                    newFirstChild = firstChild.cloneNode(true),
                    pageObj = that.pageEle,
                    prevObj = that.prevEle,
                    nextObj = that.nextEle,
                    navObj = that.navEle,
                    navSelector = that.navSelector,
                    navMenus = navObj && navObj.querySelectorAll(navSelector);
                (pageHtm = ""), (childIndex = 0);
                container.style.overflow = "hidden";
                scroller.style.cssText = "width:100%;height:100%;" + cssVendor + "transform:translate" + translateOpen + "0px,0px" + translateClose + ";position:relative;";
                if (loopFlag && pageCount < 3) {
                    /*生成布局 不足三个添加克隆副本*/
                    that.childCount += 2;
                    scroller.appendChild(newFirstChild);
                    scroller.appendChild(newLastChild);
                }
                that.maxX = (that.childCount - 1) * that.pageWidth;
                frameLib.each(scroller.children, function (i, n) {
                    if (n.nodeType) {
                        n.pg = i;
                        var left = i == that.childCount - 1 ? (loopFlag ? -1 * 100 : childIndex * 100) : childIndex * 100; //最后一个位置放到最前
                        frameLib.css(n, { left: left + "%", width: "100%", height: "100%", position: "absolute", top: "0px", display: "block" });
                        childIndex++;
                    }
                });
                if (pageObj) {
                    //生成页数dot
                    if (pageCount > 1) {
                        for (var i = 0; i < pageCount; i++) {
                            var pageDot = document.createElement("span");
                            pageDot.setAttribute("num", i);
                            pageDot.className = i == that.currentPage ? that.pageClass + " " + that.pageSelClass : that.pageClass;
                            pageDot.addEventListener(
                                "click",
                                function () {
                                    var index = this.getAttribute("num");
                                    that.onMoveIndex(parseInt(index));
                                },
                                false,
                            );
                            pageObj.appendChild(pageDot);
                        }
                    } else {
                        pageObj.style.display = "none";
                    }
                }
                if (navObj) {
                    //导航菜单
                    SliderLib.addClass(navMenus[that.currentPage], that.navSelClass ? that.navSelClass : "");
                    frameLib.each(navMenus, function (i, n) {
                        n.addEventListener("click", function (evt) {
                            that.onMoveIndex(i);
                        });
                    });
                }
                if (prevObj) {
                    //上一页
                    prevObj.addEventListener("click", function (evt) {
                        that.prevPage();
                    });
                }
                if (nextObj) {
                    //下一页
                    nextObj.addEventListener("click", function (evt) {
                        that.nextPage();
                    });
                }
            },
            /*
             * 自动切换
             * @param{Number} autoInterval 切换时间 ms
             */
            __autoSwitch: function (autoInterval) {
                var that = this,
                    loopFlag = that.loopFlag,
                    pageCount = that.pageCount,
                    nextFlag = true;
                if (pageCount <= 1) return;
                slideInterval = setInterval(function () {
                    if (loopFlag) {
                        that.nextPage(200);
                    } else {
                        var pIndex = that.currentPage;
                        if (pIndex == 0) {
                            nextFlag = true;
                            that.nextPage(200);
                        } else if (pIndex == pageCount - 1) {
                            nextFlag = false;
                            that.prevPage(200);
                        } else {
                            if (nextFlag) {
                                that.nextPage(200);
                            } else {
                                that.prevPage(200);
                            }
                        }
                    }
                }, autoInterval || 10000);
            },
            /*
             * 绑定事件
             */
            __bindEvents: function () {
                var that = this;
                if (that.touchFlag) {
                    var wrapper = that.container;
                    wrapper.addEventListener(startEvent, that, false);
                    wrapper.addEventListener(moveEvent, that, false);
                    wrapper.addEventListener(endEvent, that, false);
                }
                window.addEventListener(
                    "orientationchange",
                    function () {
                        setTimeout(function () {
                            that.__refreshDimension();
                            that.onMoveIndex(that.currentPage, that.sliderIndex, 0);
                        }, 500);
                    },
                    false,
                );
                window.addEventListener(
                    "resize",
                    function () {
                        that.__refreshDimension();
                        that.onMoveIndex(that.currentPage, that.sliderIndex, 0);
                    },
                    false,
                );
            },

            /*
             * 滑动开始操作
             * @param{Event}
             */
            __start: function (e) {
                if (this.initiated || !e) return;
                var that = this;
                that.initiated = true;
                that.moved = false;
                that.directionLocked = false;
                that.thresholdExceeded = false;
                var touch = hasTouch ? e.touches[0] : e,
                    scroller = that.scroller;
                scroller.style.webkitTransition = "0s";
                that.startX = touch.pageX;
                that.startY = touch.pageY;
                that.stepX = 0;
                that.stepY = 0;
            },
            /*
             * 滑动操作
             * @param{Event}
             */
            __move: function (e) {
                if (!this.initiated || !e) return;
                var that = this,
                    touch = hasTouch ? e.changedTouches[0] : e,
                    pIndex = that.currentPage,
                    moveX = 0,
                    pwidth = that.pageWidth;
                that.minusX = touch.pageX - that.startX;
                that.minusY = touch.pageY - that.startY;
                that.stepX += Math.abs(that.minusX); //这里记录的同一次手势操作里的结果 isHorizontal不完全
                that.stepY += Math.abs(that.minusY);
                moveX = that.minusX + that.endX;

                if (that.stepX < 10 && that.stepY < 10) return;
                if (!that.directionLocked && that.stepX > that.stepX) {
                    //竖直方向滑动
                    that.initiated = false;
                    return;
                }
                this.moved = true;
                e.preventDefault();
                that.directionLocked = true;
                if (!that.loopFlag) {
                    if (moveX > that.minX) {
                        that.minusX = 0.2 * pwidth;
                    }
                    if (moveX < -that.maxX) {
                        that.minusX = -0.2 * pwidth;
                    }
                }
                that.curX = that.minusX + that.endX;
                that.moveCSS3({ x: that.curX, y: 0 });
            },
            /*
             * 滑动结束操作
             * @param{Event}
             */
            __end: function (e) {
                var that = this;
                if (!that.initiated || !e) return;
                that.initiated = false;
                if (!that.moved) return;
                var pIndex = that.currentPage,
                    sIndex = that.sliderIndex,
                    nPIndex = pIndex,
                    nSIndex = sIndex,
                    loopFlag = that.loopFlag;

                if (that.minusX > 0) {
                    //往左
                    nSIndex = loopFlag ? sIndex - 1 : sIndex - 1 < 0 ? 0 : sIndex - 1;
                    that.prevPage();
                } else if (that.minusX < 0) {
                    //往右
                    nSIndex = loopFlag ? sIndex + 1 : sIndex + 1 > that.childCount - 1 ? that.childCount - 1 : sIndex + 1;
                    that.nextPage();
                } else {
                    that.onMoveIndex(pIndex, sIndex);
                }
                that.endX = -nSIndex * that.pageWidth;
            },
            /*
             * 分页切换
             * @param{String} switchType 切换类型 prev-往前 next-往后
             * @param{Number} time 时间间隔 ms
             */
            __pageSwitch: function (switchType, time) {
                var that = this,
                    scroller = that.scroller,
                    sIndex = that.sliderIndex,
                    pIndex = that.currentPage,
                    childCount = that.childCount,
                    pageCount = that.pageCount,
                    nPage = 0,
                    prevFlag = switchType == "prev";
                if (that.loopFlag) {
                    nPage = prevFlag ? (pIndex - 1 < 0 ? childCount - 1 : pIndex - 1) : pIndex + 1 > childCount - 1 ? 0 : pIndex + 1;
                    var referIndex = nPage,
                        changeIndex = prevFlag ? (referIndex - 1 < 0 ? childCount - 1 : referIndex - 1) : referIndex + 1 > childCount - 1 ? 0 : referIndex + 1;
                    (referChild = scroller.children[referIndex]), (changeChild = scroller.children[changeIndex]), (referLeft = parseInt(referChild.style.left) / 100);
                    changeChild.style.left = (prevFlag ? referLeft - 1 : referLeft + 1) * 100 + "%";
                    that.onMoveIndex(nPage, prevFlag ? sIndex - 1 : sIndex + 1, time);
                } else {
                    nPage = prevFlag ? (pIndex - 1 < 0 ? 0 : pIndex - 1) : pIndex + 1 > childCount - 1 ? childCount - 1 : pIndex + 1;
                    that.onMoveIndex(nPage, nPage, time);
                }
            },
            /*
             *  控制上下翻页元素的显示
             *  @param{Number}  index-页数
             */
            __togglePageBtn: function (index) {
                if (this.loopFlag) return;
                var that = this,
                    prevObj = that.prevEle,
                    nextObj = that.nextEle;
                if (prevObj) {
                    var prevDisplay = defaultDisplay(prevObj.nodeName);
                    if (index <= 0) {
                        if (that.hidePageBtnClass) {
                            frameLib.addClass(prevObj, that.hidePageBtnClass);
                        } else {
                            prevObj.style.display = "none";
                        }
                    } else {
                        if (that.hidePageBtnClass) {
                            frameLib.removeClass(prevObj, that.hidePageBtnClass);
                        } else {
                            prevObj.style.display = prevDisplay;
                        }
                    }
                }
                if (nextObj) {
                    var nextDisplay = defaultDisplay(nextObj.nodeName);
                    if (index >= that.pageCount - 1) {
                        if (that.hidePageBtnClass) {
                            frameLib.addClass(nextObj, that.hidePageBtnClass);
                        } else {
                            nextObj.style.display = "none";
                        }
                    } else {
                        if (that.hidePageBtnClass) {
                            frameLib.removeClass(nextObj, that.hidePageBtnClass);
                        } else {
                            nextObj.style.display = nextDisplay;
                        }
                    }
                }
            },
        };
        /*
         * 获得JavaScript中css对应属性
         * @param{String} style-css属性名(这里不要带浏览器前缀)
         */
        function prefixStyle(style) {
            if (vendor === "") return style;
            style = style.charAt(0).toUpperCase() + style.substr(1);
            return vendor + style;
        }
        /*
         * 获得元素的display属性
         * @param{String} nodeName--Node元素名称
         */
        function defaultDisplay(nodeName) {
            var element, display;
            if (!elementDisplay[nodeName]) {
                element = document.createElement(nodeName);
                document.body.appendChild(element);
                display = getComputedStyle(element, "").getPropertyValue("display");
                element.parentNode.removeChild(element);
                display == "none" && (display = "block");
                elementDisplay[nodeName] = display;
            }
            return elementDisplay[nodeName];
        }
        return Slider;
    })();
    if (!window.Slider) {
        window.Slider = Slider;
    }
})(SliderLib);
