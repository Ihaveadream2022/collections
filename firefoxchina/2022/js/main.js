$(document).ready(function () {
    var GUIDE_STATUS = true; //存储用户引导的状态
    var LBLeftLoaded = false,
        LB_FEED_INITED = false,
        LB_STOP_SCROLL = false;
    var MozillaMain = function () {
        var that = this;
        that.pluginWindow = windowPlugin.getInstance();
        that.pluginLocalStorage = localStoragePlugin.getInstance();
        that.IDTimeout = 0;
        that.IDInterval = 0;
        that.searchEngine = $(".search-engine"); // 搜索区域顶级容器
        that.engineFloat = $("#search-engine-flip"); // 搜索-浮动搜索框
        that.adText = $(".search-engine").find(".slink-list"); // 搜索-右侧文字广告
        that.emailBtn = $(".search-engine").find(".btn-email-show"); // 搜索-邮箱按钮
        that.weatherBtn = $(".btn-weather-pop"); // 天气星座按钮
        that.weatherMenu = $("#weather-show-detail"); // 天气星座显示框
        that.footer = $("#module-footer"); // footer容器
        that.topBtn = topBtn = $("#mr-top"); // 回到顶部
        that.menuSide = $("#menu-side"); // 侧边工具栏容器
        that.moduleHuo = $("#module-huo"); // 侧边工具栏容器
        that.hhydlm = $(".side-huo"); // 火狐移动联盟栏容器
        that.feeds = $("#module-feeds"); // feeds容器
        that.columnSide = $(".column-side"); // 侧边
        that.initBeforeLoad();
        that.bindEvents();
    };
    MozillaMain.prototype = {
        bindEvents: function () {
            var that = this,
                topEngine = $("#engine-top");

            /* Feeds新闻 */
            (function () {
                let data = { abroad: [], society: [], amuse: [], sports: [], home: [], military: [], vehicle: [] };

                /* 事件-绑定滚动事件 */
                let manipulateListener = function () {
                    that.pluginWindow.elementCrossWindowBottomListener1(document.querySelector(".fixed-show-refer"), "appear", debounceClouser);
                };
                let debounceClouser = function debounce() {
                    let tabs = that.feeds.get(0).querySelectorAll("li");
                    let feedLists = that.feeds.get(0).querySelectorAll(".feed-list");
                    let onDisplay;
                    let type;
                    for (let i = 0; i < feedLists.length; i++) {
                        if (feedLists[i].style.display === "block") {
                            onDisplay = feedLists[i].children[0];
                        }
                    }
                    for (let i = 0; i < tabs.length; i++) {
                        if (tabs[i].classList.contains("on")) {
                            type = tabs[i].dataset.type;
                        }
                    }
                    let d = data[type].shift();
                    if (d && d.length) {
                        manipulate(d, onDisplay);
                    }
                };
                window.addEventListener("scroll", manipulateListener);

                /* 事件-Tab切换 */
                var feedsContainer = $("#module-feeds");
                var feedsTab = new TabPlugin({
                    tabs: feedsContainer.get(0).querySelector(".tab-menu").querySelectorAll("li"),
                    displays: feedsContainer.get(0).querySelector(".tab-detail").querySelectorAll(".tab-mod"),
                    callback: loadData,
                });

                /* 初始化-tab */
                feedsTab.switchTo(1);

                function loadData(tab, display) {
                    let type = tab.dataset.type;
                    let dataList = display.querySelector(".data-list");
                    if (!data[type].length) {
                        $.ajax({
                            url: "/2022/api/data/feeds_" + type + ".json?" + Math.random(),
                            // url: "/api?feeds=1&tab=" + type,
                            type: "get",
                            dataType: "json",
                            timeout: 10000,
                            error: function (error, type) {},
                            success: function (r) {
                                for (let i = 0; i < r.data.data.length; i++) {
                                    data[type].push(r.data.data[i]["data"]);
                                }
                                if (data[type][0].length) {
                                    manipulate(data[type].shift(), dataList);
                                }
                            },
                        });
                    }
                }
                function manipulate(data, container) {
                    var html = "";
                    for (let i = 0; i < data.length; i++) {
                        html += '<div class="item">';
                        html += '<a title="' + data[i]["title"] + '" class="cf single" href="' + data[i]["url"] + '">';
                        html += '   <div class="avatar" style="background-image:url(' + data[i]["imgurl"] + ');"></div>';
                        html += '   <div class="detail ">';
                        html += '       <p class="title">' + data[i]["title"] + "</p>";
                        html += '       <p class="extra"><span class="source">' + data[i]["source_from"] + "</span></p>";
                        html += "   </div>";
                        html += "</a>";
                        html += "</div>";
                    }
                    container.insertAdjacentHTML("beforeend", html);
                }
            })();

            /* News Tab */
            var newsContainer = $("#module-news");
            var newsTab1 = new TabPlugin({
                tabs: newsContainer.get(0).querySelector(".tab-menu").querySelectorAll("li"),
                displays: newsContainer.get(0).querySelector(".tab-detail").querySelectorAll(".news-mod"),
            });
            newsTab1.autoSwitch(3000);

            /* TPTH */
            (function () {
                "use strict";
                /* 事件-轮播 */
                var tpthSlider = new pluginSlider({ items: document.querySelector(".img-carousel").querySelectorAll("li") });
                tpthSlider.autoSlides(3000);

                /* 事件-Tab */
                var tpthContainer = $(".side-shping");
                var tabIndex = Math.floor(Math.random() * 2);
                var tpthTab1 = new TabPluginJQ({
                    containerRoot: tpthContainer,
                    containerTab: tpthContainer.find(".tab-menu"),
                    containerDisplay: tpthContainer.find(".tab-detail"),
                });

                /* 初始化 */
                tpthTab1.onTab(tabIndex);
            })();

            /* Novel */
            (function () {
                /* Novel Tab */
                var novelContainer = $(".side-novel");
                var novelTabIndex = Math.floor(Math.random() * 2);
                var novelTab = new TabPluginJQ({
                    containerRoot: novelContainer,
                    containerTab: novelContainer.find(".tab-menu"),
                    containerDisplay: novelContainer.find(".tab-detail"),
                });
                novelTab.onTab(novelTabIndex);
            })();

            /* Game */
            (function () {
                /* Game Tab */
                var gameContainer = $(".side-game");
                var gameTabIndex = Math.floor(Math.random() * 2);
                var gameTab = new TabPluginJQ({
                    containerRoot: gameContainer,
                    containerTab: gameContainer.find(".tab-menu"),
                    containerDisplay: gameContainer.find(".tab-detail"),
                });
                gameTab.onTab(gameTabIndex);
            })();

            //added by hzou 20200615 float-banner 关闭按钮
            var floatBanner = $(".float-banner");
            if (floatBanner.length) {
                var fbClose = floatBanner.find(".close"),
                    fimgEle = floatBanner.find("img");
                $(document).on("click", ".float-banner .close", function (evt) {
                    evt.stopPropagation();
                    var btn = $(this),
                        timestamp = MozillaTool.getTimestamp();
                    if (floatBanner.attr("data-animate")) return;

                    floatBanner.attr("data-animate", "true");
                    if (btn.hasClass("disabled")) return;
                    btn.addClass("disabled");

                    StorageWidget.setItem("n_2020_fbanner_close", timestamp);
                    //update by hzhou 2020-10-19
                    //检测是否有小图
                    var imgSmallSRC = $.trim(fimgEle.attr("data-surl"));

                    if (imgSmallSRC) {
                        floatBanner.animate({ width: "0px", height: "0px" }, 800, function () {
                            var newImg = new Image();
                            newImg.src = imgSmallSRC;
                            floatBanner.css({ overflow: "hidden", background: "transparent" });
                            floatBanner.find(".close").hide();
                            fimgEle.attr("src", imgSmallSRC);
                            var wrapperStyle = "width: auto;height: auto;margin: 0px;position: inherit;top: inherit;left: inherit;",
                                wrapperEle = floatBanner.find(".banner-wrapper");
                            wrapperEle.attr("style", wrapperStyle);
                            newImg.onload = function () {
                                floatBanner.animate({ width: newImg.width + "px", height: newImg.height + "px" }, 800, function () {
                                    //floatBanner.removeAttr("data-animate");
                                });
                            };
                            newImg.onerror = function () {
                                // floatBanner.removeAttr("data-animate");
                                floatBanner.remove();
                            };
                        });
                    } else {
                        //floatBanner.removeAttr("data-animate");
                        floatBanner.remove();
                    }
                    return false;
                });
            }

            //load后加载事件
            $(window).on("load", function (evt) {
                that.initAfterLoad();
            });

            /* 侧边工具栏 */
            (function () {
                /* 点击事件 */
                that.menuSide.find(".mrec").on("click", function (evt) {
                    evt.preventDefault();
                    var forVal = $.trim($(this).attr("for")),
                        topVal = -100,
                        forEle = $("#" + forVal);
                    if (forEle.length) {
                        topVal = forEle.get(0).getBoundingClientRect().top + that.pluginWindow.scrollTop - 50;
                    }
                    window.scrollTo(0, topVal);
                });
            })();

            /* 火狐移动联盟 */
            (function () {
                /* Tab */
                var huoTabIndex = Math.floor(Math.random() * 2);
                var huoTab = new TabPluginJQ({
                    containerRoot: that.hhydlm,
                    containerTab: that.hhydlm.find(".tab-menu"),
                    containerDisplay: that.hhydlm.find(".tab-detail"),
                });
                huoTab.onTab(huoTabIndex);

                /* QR code*/
                var IDTimeout = 0;
                that.moduleHuo.find(".huo-mod").mouseenter(function (evt) {
                    evt.stopPropagation();
                    var that = $(this);
                    IDTimeout = setTimeout(function () {
                        that.find(".qrimg-show").show();
                    }, 200);
                });
                that.moduleHuo.find(".huo-mod").mouseleave(function (evt) {
                    evt.stopPropagation();
                    clearTimeout(IDTimeout);
                    $(this).find(".qrimg-show").hide();
                });
            })();

            /* 搜索右侧推广 */
            (function () {
                if (that.adText.length) {
                    var sLinkList = that.adText.children();
                    if (sLinkList.length > 1) {
                        var randIndex = Math.floor(Math.random() * sLinkList.length);
                        sLinkList.eq(randIndex).show().siblings().remove();
                    }
                }
            })();

            /* 显示邮箱 */
            (function () {
                if (that.emailBtn.length) {
                    that.emailBtn.on("click", function (evt) {
                        evt.stopPropagation();
                        that.emailBtn.parent().find("#email-domain-list").toggle();
                    });
                }
            })();

            /* 天气和星座 */
            (function () {
                var starSign = that.pluginLocalStorage.getItem("star_sign", "白羊座");
                var citySet = that.weatherMenu.find("#weather-info-set");
                var cityChangeBtn = that.weatherMenu.find(".weather-title span");
                var starMain = that.weatherMenu.find(".sign-content");
                var provinceSelect = that.weatherMenu.find(".prov-select select");
                var citySelect = that.weatherMenu.find(".city-select select");
                var areaSelect = that.weatherMenu.find(".area-select select");
                var confirmBtn = that.weatherMenu.find(".btn-confirm");
                var cancelBtn = that.weatherMenu.find(".btn-cancel");
                var location = that.pluginLocalStorage.getItem("location", {
                    provinceCode: "8",
                    provinceName: "辽宁",
                    cityCode: "CHXX0019",
                    cityName: "大连",
                    areaCode: "CHXX0019",
                    areaName: "大连",
                });
                var WEATHER_LOC_INFO = {
                    PROV_LIST: {}, //省列表
                    CITY_LIST: {}, //城市列表
                    AREA_LIST: {}, //区县列表
                };

                /* 事件-换星座 */
                $(".opt-select select").on("change", function (evt) {
                    evt.stopPropagation();
                    var select = $(this),
                        span = select.parent().find("span"),
                        starName = select.find("option:selected").text();
                    span.html(starName);
                    that.pluginLocalStorage.setItem("star_sign", starName);
                    loadStar(starName);
                });

                /* 事件-主显示区折叠与打开 */
                that.weatherBtn.on("click", function (evt) {
                    evt.stopPropagation();
                    if (that.weatherMenu.is(":visible")) {
                        that.weatherMenu.hide();
                    } else {
                        that.weatherMenu.show();
                        loadStar(starSign);
                    }
                });

                /* 事件-切换城市按钮 */
                cityChangeBtn.on("click", function (evt) {
                    evt.stopPropagation();
                    $(this).hide();
                    citySet.show();
                    $.ajax({
                        url: "/2022/js/areas.js?jsonp=W_GetLocaleInfo2",
                        type: "GET",
                        dataType: "jsonp",
                        jsonpCallback: "W_GetLocaleInfo2",
                        timeout: 10000,
                        error: function () {},
                        success: function (data) {
                            $.each(data, function (i, n) {
                                var pid = parseInt(n.parent_id);
                                if (isNaN(n.parent_id) || pid >= 100) {
                                    //区县
                                    if (WEATHER_LOC_INFO.CITY_LIST[n.parent_id]) {
                                        WEATHER_LOC_INFO.CITY_LIST[n.parent_id]["children"].push(n);
                                    }
                                    WEATHER_LOC_INFO.AREA_LIST[n.id] = n;
                                } else {
                                    if (pid == 0) {
                                        //省份
                                        WEATHER_LOC_INFO.PROV_LIST[n.id] = n;
                                    } else {
                                        //城市
                                        WEATHER_LOC_INFO.CITY_LIST[n.id] = n;
                                        //建立城市的children
                                        if (!WEATHER_LOC_INFO.CITY_LIST[n.id]["children"]) {
                                            WEATHER_LOC_INFO.CITY_LIST[n.id]["children"] = [];
                                        }
                                        WEATHER_LOC_INFO.CITY_LIST[n.id]["children"].push(n);
                                        //将城市存入prov_list children中
                                        if (WEATHER_LOC_INFO.PROV_LIST[n.parent_id]) {
                                            if (!WEATHER_LOC_INFO.PROV_LIST[n.parent_id]["children"]) {
                                                WEATHER_LOC_INFO.PROV_LIST[n.parent_id]["children"] = [];
                                            }
                                            WEATHER_LOC_INFO.PROV_LIST[n.parent_id]["children"].push(n);
                                        }
                                    }
                                }
                            });
                            var prov_html = "";
                            var city_html = "";
                            var area_html = "";
                            $.each(WEATHER_LOC_INFO.PROV_LIST, function (k, v) {
                                if (location.provinceCode == k) {
                                    prov_html += "<option value='" + v.id + "' selected>" + v.name + "</option>";
                                    if (v.children) {
                                        $.each(v.children, function (k2, v2) {
                                            if (location.cityCode == v2.id) {
                                                city_html += "<option value='" + v2.id + "' selected>" + v2.name + "</option>";
                                                if (v2.children) {
                                                    $.each(v2.children, function (k3, v3) {
                                                        if (location.areaCode == v3.id) {
                                                            area_html += "<option value='" + v3.id + "' selected>" + v3.name + "</option>";
                                                        } else {
                                                            area_html += "<option value='" + v3.id + "'>" + v3.name + "</option>";
                                                        }
                                                    });
                                                }
                                            } else {
                                                city_html += "<option value='" + v2.id + "'>" + v2.name + "</option>";
                                            }
                                        });
                                    }
                                } else {
                                    prov_html += "<option value='" + v.id + "'>" + v.name + "</option>";
                                }
                            });
                            $(".prov-select select").html(prov_html);
                            $(".city-select select").html(city_html);
                            $(".area-select select").html(area_html);
                        },
                    });
                });

                /* 事件-换省份 */
                $(".prov-select select").on("click", function (evt) {
                    var provIndex = $(this).find("option:selected").val();
                    changeProvince(provIndex);
                });

                /* 事件-换城市 */
                $(".city-select select").on("click", function (evt) {
                    var cityIndex = $(this).find("option:selected").val();
                    changeCity(cityIndex);
                });

                /* 事件-确认按钮 */
                confirmBtn.on("click", function (evt) {
                    var provinceCode = provinceSelect.find("option:selected").val();
                    var provinceName = provinceSelect.find("option:selected").html();
                    var cityCode = citySelect.find("option:selected").val();
                    var cityName = citySelect.find("option:selected").html();
                    var areaCode = areaSelect.find("option:selected").val();
                    var areaName = areaSelect.find("option:selected").html();
                    var cityInfo = {
                        provinceCode: provinceCode,
                        provinceName: provinceName,
                        cityCode: cityCode,
                        cityName: cityName,
                        areaCode: areaCode,
                        areaName: areaName,
                    };
                    that.pluginLocalStorage.setItem("location", cityInfo);
                    citySet.hide();
                    loadWeather(cityInfo);
                });

                /* 事件-取消按钮 */
                cancelBtn.on("click", function (evt) {
                    citySet.hide();
                });

                /* 初始化-天气 */
                loadWeather(location);

                function changeProvince(provinceCode) {
                    var city_html = "",
                        area_html = "";
                    $.each(WEATHER_LOC_INFO.PROV_LIST[provinceCode]["children"], function (k, v) {
                        city_html += "<option value='" + v.id + "'>" + v.name + "</option>";
                        if (v.children) {
                            $.each(v.children, function (k2, v2) {
                                area_html += "<option value='" + v2.id + "'>" + v2.name + "</option>";
                            });
                        }
                    });
                    citySelect.html(city_html);
                    areaSelect.html(area_html);
                }

                function changeCity(cityIndex) {
                    var area_html = "";
                    $.each(WEATHER_LOC_INFO.CITY_LIST[cityIndex]["children"], function (k, v) {
                        area_html += "<option value='" + v.id + "'>" + v.name + "</option>";
                    });
                    areaSelect.html(area_html);
                }

                function loadWeather(cityInfo) {
                    var cityCode = cityInfo.areaCode ? cityInfo.areaCode : cityInfo.cityCode;
                    var cityName = cityInfo.areaName ? cityInfo.areaName : cityInfo.cityName;
                    that.weatherMenu.find(".weather-detail-info .weather-info").html("<div class='loading'><span>正在加载天气数据...</span></div>");
                    that.weatherMenu.find(".weather-detail-info").show().siblings().hide();
                    that.weatherMenu.find(".weather-title b").html(cityName);
                    $.ajax({
                        url: "/2022/api/data/" + cityCode + ".json",
                        //data: { weather: "yes", citycode: cityCode },
                        type: "get",
                        dataType: "json",
                        success: function (data) {
                            var weatherShowMod = that.weatherMenu.find(".weather-detail");
                            if (data && data.forecast) {
                                var list = data.forecast;
                                var weatherHtml = "";
                                if (list.length > 0) {
                                    var infoList = [
                                        { title: "今天", className: "left" },
                                        { title: "明天", className: "middle" },
                                        { title: "后天", className: "right" },
                                    ];
                                    var todayInfo = {};
                                    $.each(list, function (k, v) {
                                        if (k < infoList.length) {
                                            if (k === 0) {
                                                todayInfo = v;
                                            }
                                            var tempInfo = infoList[k],
                                                weatherType = v.text1 ? v.text1 : v.text2,
                                                weatherCode = v.code1 ? v.code1 : v.code2,
                                                weatherDegree = v.high ? v.high + "℃" + (v.low ? "~" + v.low + "℃" : "") : v.low + "℃";
                                            weatherHtml += '<div class="weather-mod ' + tempInfo.className + '">' + "<p>" + tempInfo.title + "</p>";
                                            weatherHtml += '<img src="2022/images/weather/weathericon3/' + weatherCode + '.png">' + "<i>" + weatherType + "</i><span>" + weatherDegree + "</span>";
                                            weatherHtml += "</div>";
                                        }
                                    });
                                    weatherShowMod.find(".weather-detail-info .weather-info").html(weatherHtml);
                                    weatherShowMod.find(".weather-detail-info").show().siblings().hide();
                                    weatherShowMod.show().siblings().hide();

                                    /* 通栏天气简介 */
                                    var briefWeatherType = todayInfo.text1 ? todayInfo.text1 : todayInfo.text2,
                                        briefWeatherDegree = todayInfo.text1 ? todayInfo.high + "℃" + (todayInfo.low ? "~" + todayInfo.low + "℃" : "") : todayInfo.low + "℃";
                                    var briefHtml = '<span><b class="weather-place">' + cityName + "</b>" + briefWeatherType + " " + briefWeatherDegree + "</span>";
                                    that.weatherBtn.find("#weather-show-brief").html(briefHtml).parent().show();
                                } else {
                                    weatherShowMod.find(".error").show().siblings().hide();
                                    weatherShowMod.show().siblings().hide();
                                }
                            } else {
                                weatherShowMod.find(".error").show().siblings().hide();
                                weatherShowMod.show().siblings().hide();
                            }
                        },
                    });
                }

                function loadStar(starName) {
                    starMain.html("<div class='loading'><span>正在加载天气数据...</span></div>");
                    $.ajax({
                        url: "https://tiny.51hl.me/open/changeXinzuo?sharetoken=10002&xinzuo=" + starName + "&jsonp=star",
                        type: "GET",
                        dataType: "jsonp",
                        jsonpCallback: "star",
                        timeout: 10000,
                        error: function () {
                            starMain.html("<div class='error'>数据加载失败，请稍候再试</div>");
                        },
                        success: function (data) {
                            if (data && data.result) {
                                html = '<div class="sign-mod sign-analysis">';
                                html += '<div class="mod-title"><span>今2日运势解析</span></div>' + '<div class="mod-cont">' + data.result.summary + "</div></div>" + '<div class="sign-mod sign-luck">';
                                html += '<div class="mod-title"><span>今日开运</span></div>' + '<div class="mod-cont"><p>幸运数字：' + data.result.number + "</p>" + "<p>幸运颜色：" + data.result.color + "</p>" + "<p>贵人星座：" + data.result.QFriend + "</p>" + "<p>综合指数：" + data.result.all + "分</p>" + "</div>";
                                html += "</div>";
                                starMain.html(html);
                            } else {
                                starMain.html("<div class='error'>数据加载失败，请稍候再试</div>");
                            }
                        },
                    });
                }
            })();

            /* 通栏扫描二维码 */
            (function () {
                var mobilePop = $(".firecode"),
                    mobilePopWindow = mobilePop.find(".pop-up-refwin"),
                    IDTimeout = 0;
                if (mobilePop.length && mobilePopWindow.length) {
                    mobilePop.unbind("mouseenter mouseleave");
                    mobilePop.mouseenter(function (evt) {
                        evt.stopPropagation();
                        IDTimeout = setTimeout(function () {
                            mobilePopWindow.show();
                        }, 200);
                    });
                    mobilePop.mouseleave(function (evt) {
                        evt.stopPropagation();
                        clearTimeout(IDTimeout);
                        mobilePopWindow.hide();
                    });
                }
            })();

            /* 公共 */
            (function () {
                /* 懒惰加载图像 */
                var intersection = new pluginIntersection(document.querySelectorAll("[data-src]"), { rootMargin: "0px", threshold: 0.1 });
                intersection.bindAsyncImage();

                /* 滚动 */
                window.addEventListener("scroll", function () {
                    /* 工具栏浮动 */
                    that.pluginWindow.elementCrossWindowBottomListener1(that.footer.get(0), "appear", "throttle", function (e) {
                        that.menuSide.css({ position: "absolute" });
                        that.columnSide.removeClass("column-side-fixed").addClass("column-side-absolute");
                        //console.log("footer appear 截流执行完毕");
                        const idValue = e.getAttribute("id");
                        const classValue = e.getAttribute("class").split(" ").join("");
                        this.clearTime("bottom-appear" + idValue + classValue);
                    });
                    that.pluginWindow.elementCrossWindowBottomListener1(that.footer.get(0), "disappear", "throttle", function (e) {
                        that.menuSide.css({ position: "fixed" });
                        that.columnSide.removeClass("column-side-absolute");
                        //console.log("footer disappear 截流执行完毕");
                        const idValue = e.getAttribute("id");
                        const classValue = e.getAttribute("class").split(" ").join("");
                        this.clearTime("bottom-disappear" + idValue + classValue);
                    });
                    that.pluginWindow.elementCrossWindowBottomListener1(that.feeds.get(0), "appear", "throttle", function (e) {
                        that.columnSide.addClass("column-side-fixed");
                        //console.log("feeds appear 截流执行完毕");
                        const idValue = e.getAttribute("id");
                        const classValue = e.getAttribute("class").split(" ").join("");
                        this.clearTime("bottom-appear" + idValue + classValue);
                    });
                    that.pluginWindow.elementCrossWindowBottomListener1(that.feeds.get(0), "disappear", "throttle", function (e) {
                        that.columnSide.removeClass("column-side-fixed");
                        //console.log("feeds disappear 截流执行完毕");
                        const idValue = e.getAttribute("id");
                        const classValue = e.getAttribute("class").split(" ").join("");
                        this.clearTime("bottom-disappear" + idValue + classValue);
                    });
                    /* 显示回到顶部 */
                    if (that.pluginWindow.scrollTop > 100) {
                        that.topBtn.show();
                    } else {
                        that.topBtn.hide();
                    }
                    /* 浮动搜索框 */
                    if (that.pluginWindow.scrollTop > 200) {
                        that.engineFloat.show();
                    } else {
                        that.engineFloat.hide();
                    }
                });
            })();

            //登录、注册
            $(document).on("click", ".btn-pop-win", function (evt) {
                evt.stopPropagation();
                var btn = $(this),
                    btnType = btn.attr("data-type");
                switch (btnType) {
                    case "login":
                        PopWidget.showLogin();
                        break;
                    case "logout":
                        PopWidget.logout();
                        break;
                }
                evt.preventDefault();
            });

            //换肤-更多
            var systemEle = $(".header-system");
            $(".btn-mod-system").on("click", function (evt) {
                //evt.stopPropagation();
                var btn = $(this),
                    sysTarget = $("#" + btn.attr("for"));
                if (btn.hasClass("on")) {
                    btn.removeClass("on");
                    systemEle.slideUp(500);
                } else {
                    btn.siblings().removeClass("on");
                    btn.addClass("on");
                    if (systemEle.is(":visible")) {
                        sysTarget.show().siblings().hide();
                    } else {
                        MozillaTool.loadDelayResource(sysTarget);
                        sysTarget.show().siblings().hide();
                        systemEle.slideDown(500);
                    }
                }
                evt.preventDefault();
            });

            //小屏幕关闭侧边图片按钮
            $("#ad-float-banner .btn-close").on("click", function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                var btn = $(this),
                    btnParent = btn.parents("#ad-float-banner:eq(0)");
                btnParent.hide();
            });
        },
        initBeforeLoad: function () {
            var that = this,
                setPanel = $("#panel-system-set"),
                sideMenu = $("#menu-side");
            dealProtocolSites();

            //added by hzhou 2020-06-15
            dealFloatBanner();
            //added by hzhou 2019-10-18

            //处理网址下部通栏显示
            dealSBottomBanner();

            //处理顶部通栏显示
            dealTopBanner();

            //处理底部通栏显示
            dealBottomBanner();

            //处理皮肤的hover显示
            dealSkinHover();

            //added by hzhou 2018-01-26
            //处理异形随机显示

            dealMenuBanner();

            //打乱火狐联盟的加载顺序
            //处理侧边栏底部广告
            dealSideBottomAds();

            //清除缓存
            StorageWidget.clear();
            //添加日志记录
            TraceWidget.build();

            //显示侧边按钮
            sideMenu.show();

            //显示广告
            AdWidget.build({
                wrapper: $("#prtop-list"),
                hiddenEle: $("#prtop-hd"),
            });

            //加载皮肤设置
            SkinWidget.build({
                panel: setPanel,
                panelMenuEle: $("#btn-system-skin"),
                wrapper: $("#sd-skin"),
                displayWrapper: $("#display-wrapper-skin"),
                container: $("#sd-skin .skin-wrapper"),
                scroller: $("#sd-skin .skin-scroller"),
                coupletEle: $(".th-sbar-cplet"), //两侧对联广告
                themePriorityEle: $(".th-side-bar"), //默认推广主题-可关闭
                skinEle: $("#moz-skin"),
                cPageEle: $("#skin-page-current"),
                tPageEle: $("#skin-page-total"),
                prevEle: $("#sd-skin .skin-prev"),
                nextEle: $("#sd-skin .skin-next"),
            });

            //处理默认状态下的显示
            // $(".engine-key-hidden").attr("name", "q");
            // $(".engine-key").removeAttr("name");
            // //2013-12-12 end
            // EngineWidget.build({
            //     wrapper: $("#engine-top"),
            //     formEle: $("#search-form"),
            //     navEle: $("#search-nav"),
            //     logoShowEle: $("#search-logo"),
            //     keyEle: $("#search-key"),

            //     radioEle: $("#search-radio"),
            //     logoMoreEle: $("#engine-logo-expand"),
            //     logoListEle: $("#engine-logos-list"),
            //     tipEle: $("#engine-tip-show"),
            //     tipKeySelector: ".search-engine .engine-key",
            //     tipShowSelector: ".engine-tip-list",
            //     curEle: $("#search-current"),
            //     hotBtnEle: $("#btn-engine-hot"),
            //     bubbleEle: $("#btn-engine-bubble"),
            //     hotListEle: $("#engine-hot-show"),
            // });

            (function () {
                var engineTop = that.searchEngine.find("#engine-top"); // 在网页里的搜索区域容器
                var hotBtn = that.searchEngine.find("#btn-engine-hot"); // 热门搜索下拉按钮
                var engineHotShow = that.searchEngine.find("#engine-hot-show"); // 热词提示列表
                var engineHotTips = that.searchEngine.find("#engine-tip-show"); // 搜索词提示列表
                var searchInput = engineTop.find("#search-key");
                var formElem = that.searchEngine.find("#search-form");

                // 绑定事件-----------------------------------------------------------------------
                // 热门搜索下拉按钮
                hotBtn.click(function (evt) {
                    evt.preventDefault();
                    engineHotTips.hide(); // 隐藏 提示词列表
                    if (engineTop.hasClass("expand")) {
                        engineTop.removeClass("expand");
                    } else {
                        engineTop.addClass("expand");
                    }
                });
                // 关闭所有提示下拉框
                formElem.submit(function () {
                    engineHotTips.hide(); // 隐藏 提示词列表
                    engineTop.removeClass("expand"); // 隐藏 热搜列表
                });
                // 热门搜索下拉按钮 - 点击热词
                engineHotShow.find("li").click(function (evt) {
                    var btn = $(this);
                    var keyword = $.trim(btn.find("span").text());
                    searchInput.val(keyword);
                    formElem.submit();
                    engineTop.removeClass("expand");
                    searchInput.val("");
                    evt.preventDefault();
                });
                // 搜索词提示
                searchInput.keyup(function (evt) {
                    evt.stopPropagation();
                    engineTop.removeClass("expand"); // 隐藏 热搜列表
                    var inputElem = $(this);
                    console.log(inputElem);
                    showInputTips(inputElem.val(), function (sug) {
                        console.log(sug);
                        if (engineHotTips.length && sug && sug.s) {
                            var tipHtm = "",
                                tlen = sug.s.length,
                                tindex = 0;
                            engineHotTips.empty();
                            if (tlen) {
                                tipHtm += "<ul>";
                                for (; tindex < tlen; tindex++) {
                                    tipHtm += "<li><span>" + sug.s[tindex] + "</span></li>";
                                }
                                tipHtm += "</ul>";
                                engineHotTips.html(tipHtm);
                                engineHotTips.show();
                                // 热门搜索下拉按钮 - 点击热词
                                engineHotTips.find("li").click(function (evt) {
                                    var btn = $(this);
                                    var keyword = $.trim(btn.find("span").text());
                                    searchInput.val(keyword);
                                    formElem.submit();
                                    engineHotTips.hide(); // 隐藏 提示词列表
                                    engineTop.removeClass("expand");
                                    searchInput.val("");
                                    evt.preventDefault();
                                });
                            } else {
                                engineHotTips.hide();
                            }
                        }
                    });

                    //         keyCode = evt.keyCode,
                    //         btnParent = btn.parent(),
                    //         tipEle = btnParent.find(tipShowSelector),
                    //         hotEle = btnParent.find(".engine-hot-list"),
                    //         tips = tipEle.find("li"),
                    //         tlen = tips.length,
                    //         selectTip = tipEle.find("." + tipSelectClass),
                    //         selVal = "",
                    //         selectIndex = -1,
                    //         changeIndex = 0;

                    //     selectTip.length && (selectIndex = selectTip.eq(0).index());
                    //     //Up
                    //     if (keyCode == 38) {
                    //         changeIndex = selectIndex > 0 ? selectIndex - 1 : tlen - 1;
                    //         //tips.eq(changeIndex).addClass(tipSelectClass).siblings().removeClass(tipSelectClass);
                    //         searchTips
                    //             .find("li:eq(" + changeIndex + ")")
                    //             .addClass(tipSelectClass)
                    //             .siblings()
                    //             .removeClass(tipSelectClass);
                    //         //selVal = $.trim(tipEle.find("li."+tipSelectClass+" span").html());
                    //         selVal = tipEle.find("li." + tipSelectClass + " span").html();
                    //         //btn.val(selVal);
                    //         //同步显示两个engine-key里的input内容
                    //         searchKeys.val(selVal);
                    //         that.lastword = selVal;
                    //         //Down
                    //     } else if (keyCode == 40) {
                    //         changeIndex = selectIndex < tlen - 1 ? selectIndex + 1 : 0;
                    //         //tips.eq(changeIndex).addClass(tipSelectClass).siblings().removeClass(tipSelectClass);
                    //         searchTips
                    //             .find("li:eq(" + changeIndex + ")")
                    //             .addClass(tipSelectClass)
                    //             .siblings()
                    //             .removeClass(tipSelectClass);
                    //         //selVal = $.trim(tipEle.find("li."+tipSelectClass+" span").html());
                    //         selVal = tipEle.find("li." + tipSelectClass + " span").html();
                    //         //btn.val(selVal);
                    //         //同步显示两个engine-key里的input内容
                    //         searchKeys.val(selVal);
                    //         that.lastword = selVal;
                    //     } else if (keyCode == 13) {
                    //         //回车
                    //         //tipEle.hide();
                    //         searchTips.hide();
                    //     } else {
                    //         var val = $.trim(btn.val());
                    //         if (!val && that.showAuto && that.showHotBtn && that.initiated) {
                    //             //显示热门推荐搜索
                    //             hotEle.length && that.showHotRecommend();
                    //         } else {
                    //             hotEle.length && that.hideHotRecommend();
                    //             searchTips.hide();
                    //             that.showSearchTips($(this), tipEle);
                    //         }
                    //     }
                });
                // 函数
                // function showSearchTips(btn, tipShowEle) {
                //     var that = this,
                //         settings = that.settings,
                //         tipKeySelector = settings.tipKeySelector,
                //         tipShowSelector = settings.tipShowSelector,
                //         searchTips = $(tipShowSelector),
                //         searchKeys = $(tipKeySelector),
                //         btnVal = btn.val(),
                //         word = $.trim(btnVal);
                //     if (word && word != that.lastWord) {
                //         that.lastword = word;
                //         //同步显示两个engine-key里的input内容
                //         searchKeys.val(btnVal);

                //         showInputTips(tipShowEle, word, function (sug) {
                //             if (tipShowEle.length && sug && sug.s) {
                //                 var tipHtm = "",
                //                     tlen = sug.s.length,
                //                     tindex = 0;
                //                 tipShowEle.empty();
                //                 if (tlen) {
                //                     tipHtm += "<ul>";
                //                     for (; tindex < tlen; tindex++) {
                //                         tipHtm += "<li><span>" + sug.s[tindex] + "</span></li>";
                //                     }
                //                     tipHtm += "</ul>";
                //                     searchTips.html(tipHtm);
                //                     tipShowEle.show();
                //                 } else {
                //                     tipShowEle.hide();
                //                 }
                //             }
                //         });
                //     }
                // }
            })();

            function showInputTips(word, callback) {
                // 百度搜索提示
                window.baidu = {
                    sug: function (sug) {
                        callback && callback.call(null, sug);
                    },
                };
                if (word) {
                    $.ajax({
                        url: "//www.baidu.com/su?ie=utf-8&wd=" + encodeURIComponent(word),
                        type: "get",
                        dataType: "script",
                        scriptCharset: "gbk",
                        timeout: 15000,
                        error: function (xhr, status, error) {
                            console.log(error);
                        },
                    });
                }
            }

            //初始化个人定制网站
            SiteWidget.build({
                wrapper: $("#site-my-list"),
                manageBtn: $("#site-my-manage"),
                manageEle: $("#site-custom-manage"),
                manageList: $("#sm-current-list"),
                closeBtn: $("#site-manage-close"),
                customForm: $("#sm-custom-form"),
                resetBtn: $("#site-manage-reset"),
            });

            //初始化邮箱登录
            MailWidget.build({
                //2013-1212 start
                relatedEle: $("#pop-email-show"),
                wrapper: $("#email-wrapper"),
                //2013-1212 end
                targetEle: $("#email-select-wrapper"),
                formEle: $("#email-form"),
                emailEle: $("#ipt-email"),
                pwdEle: $("#ipt-pwd"),
                hiddenEle: $("#email-hiddens"),
                domainListEle: $("#email-domain-list"),
            });

            //初始化设置
            var SetEle = $("#sd-set");
            SetWidget.build({
                panel: setPanel,
                panelMenuEle: $("#btn-system-set"),
                wrapper: SetEle,
                verEle: SetEle.find(".set-ver-info"),
                dirEle: SetEle.find(".set-dir-info"),
                verDisplayWrapper: $("#display-wrapper-ver"),

                recEle: SetEle.find(".set-record-info"),
                flipEle: SetEle.find(".set-flip-info"),
                verRelatedCSS: $("#moz-ver"),
                dirRelatedCSS: $("#moz-dir"),
                recRelatedEle: $("#btn-system-record"),
                flipRelatedEle: $("#search-engine-flip"),
            });

            //图片滑动
            var slideTabs = $(".main-tab-slide .tab-mod");
            if (slideTabs.length) {
                $.each(slideTabs, function (i, n) {
                    var panel = $(n),
                        container = panel.find(".slide-tab-wrapper").eq(0),
                        scroller = container.find(".slide-tab-scroller").eq(0),
                        prevEle = panel.find(".prev"),
                        nextEle = panel.find(".next");
                    SlideWidget.build({
                        container: container,
                        scroller: scroller,
                        prevEle: prevEle,
                        nextEle: nextEle,
                        auto: panel.attr("data-auto") ? true : false,
                        loop: panel.attr("data-loop") ? true : false,
                    });
                });
            }

            //初始化网站夹缝的显示
            var tmallBtn = $(".tmall-btn"),
                tmallStore = $(".main-promote-tmall .slide-tab-mod");
            if (tmallBtn.length && tmallStore.length) {
                var tmallSpan = tmallBtn.find("span"),
                    tmallRelated = $(".main-colla-sites");
                var crackStatus = StorageWidget.getItem("n_2014_crack", null);
                if (crackStatus && crackStatus == -1) {
                    //用户已关闭，则默认不显示
                    tmallBtn.removeClass("collapse").show();
                    tmallSpan.html("展开");
                    tmallStore.hide();
                    tmallRelated.show();
                } else {
                    tmallBtn.addClass("collapse").show();
                    tmallSpan.html("关闭");
                    tmallRelated.hide();
                    tmallStore.show();
                }
            }

            //处理侧边栏菜单图片的切换
            dealFixedMenuImage(sideMenu);
        },
        initAfterLoad: function () {
            var that = this,
                collaSiteEle = $("#module-colla-sites");

            addPromoteTrace();

            !NEW_EXTENSION && TraceWidget.loadChannel();

            //处理主页修复
            var repair_url = MozillaTool.getRepairURL();
            $("#btn-home-repair").attr("href", repair_url);
            $("#btn-home-set").attr("href", repair_url);

            if (collaSiteEle.length) {
                var collaFrame = collaSiteEle.find("iframe");
                if (collaFrame.length) {
                    var showLinkNum = $.trim(collaFrame.attr("hold-num")),
                        collaLinks = collaSiteEle.find("a");
                    if (showLinkNum && showLinkNum > 0) {
                        $.each(collaLinks, function (i, n) {
                            var temp = $(n);
                            if (i > showLinkNum - 1) {
                                temp.hide();
                            }
                        });
                    } else {
                        collaSiteEle.find("a").siblings().hide();
                    }
                    collaFrame.css({ display: "inline" });
                }
            }

            //处理Email的文字提示
            dealEmailHint();
            //设置主页
            MozillaTool.initHomePage($("#btn-home-set"));
            //显示访问记录
            RecordWidget.build({
                wrapper: $("#sd-record"),
                mostWrap: $("#list-record-most"),
                lastWrap: $("#list-record-last"),
            });
        },
        //关闭所有弹出层
        clearPops: function () {
            var that = this,
                topEngine = $("#engine-top"),
                logoMoreEle = $("#engine-logo-expand"),
                logoListEle = $("#engine-logos-list"),
                hotList = topEngine.find(".engine-key-wrapper"),
                emailPop = $(".email-show-pop"),
                emailDoaminEle = $("#email-domain-list"),
                engineHintList = $(".engine-hint-list"),
                weatherPop = $(".weather-show-pop"),
                weatherBtn = $("#weather-show-brief"),
                foxPopBtn = $(".fox-mod-arrow"),
                foxPop = $(".fox-mod-pop");

            if (hotList.hasClass("expand")) hotList.removeClass("expand");
            if (logoMoreEle.is(":visible")) {
                logoListEle.hide();
                logoMoreEle.removeClass("expand");
            }
            if (emailPop.is(":visible")) emailPop.hide();
            if (emailDoaminEle.is(":visible")) emailDoaminEle.hide();
            if (engineHintList.is(":visible")) {
                engineHintList.hide();
                topEngine.removeClass("expand");
            }
            if (weatherPop.is(":visible")) {
                weatherPop.hide();
                weatherBtn.removeClass("on");
            }
            if (foxPop.length && foxPop.is(":visible")) {
                foxPop.hide();
                foxPopBtn.removeClass("expand");
            }
        },
    };
    function dealProtocolSites() {
        var pSites = $(".poco-deal"),
            protocol = window.location.protocol;
        if (protocol == "https:") {
            $.each(pSites, function (i, n) {
                var temp = $(n),
                    tReplaceLink = $.trim(temp.attr("rp-lk"));
                tReplaceLink && temp.attr("href", tReplaceLink);
            });
        }
    }
    function dealSkinHover() {
        var tileList = $(".th-side-bar .tile a");
        if (tileList.length) {
            tileList.hover(
                function (evt) {
                    var btn = $(this),
                        btnHoverImg = $.trim(btn.attr("data-himg"));
                    btnHoverImg && btn.css({ "background-image": "url(" + btnHoverImg + ")" });
                },
                function (evt) {
                    var btn = $(this),
                        btnStyle = $.trim(btn.attr("data-style"));
                    btnStyle && btn.attr("style", btnStyle);
                },
            );
        }
    }
    function dealSBottomBanner() {
        var sBanner = $(".sbottom-banner"),
            contEle = sBanner.find(".layout"),
            minH = sBanner.attr("data-minh"),
            maxH = sBanner.attr("data-maxh"),
            bannerTimeout = sBanner.attr("data-tout"),
            expandFlag = sBanner.attr("data-ex") ? true : false,
            expandTime = sBanner.attr("data-ext") ? parseInt(sBanner.attr("data-ext")) : null;
        if (!sBanner.length) return;
        if (bannerTimeout) return;
        //设置自动展开
        sBanner.find(".close").hide();
        if (expandFlag) {
            contEle.css({ height: maxH + "px" });
            sBanner.find(".close[data-type=close]").show();
            if (expandTime) {
                var bTimeout = setTimeout(function () {
                    sBanner.find(".close").hide();
                    contEle.attr("data-animate", "true");
                    contEle.animate({ height: minH }, 800, function () {
                        clearTimeout(bTimeout);
                        contEle.removeAttr("data-animate");
                        sBanner.find(".close[data-type=open]").show();
                    });
                }, expandTime);
                sBanner.attr("data-tout", bTimeout);
            }
        } else {
            sBanner.find(".close[data-type=open]").show();
            contEle.css({ height: minH + "px" });
        }
        sBanner.show();
        return;
        var timestamp = MozillaTool.getTimestamp(),
            closeVersion = StorageWidget.getItem("n_2019_sbom_banner_close", "");
        if (closeVersion != timestamp) {
            //显示sbottom
            sBanner.show();
        } else {
            sBanner.remove();
        }
    }
    function dealFloatBanner() {
        var floatBanner = $(".float-banner"),
            closeEle = floatBanner.find(".close"),
            noClose = floatBanner.attr("data-nclose"),
            durationStr = $.trim(floatBanner.attr("data-duration")),
            duration = durationStr ? parseInt(durationStr) : 3000,
            forceStartTimeStr = $.trim(floatBanner.attr("data-fstime")),
            forceEndTimeStr = $.trim(floatBanner.attr("data-fetime")),
            wrapper = floatBanner.find(".banner-wrapper"),
            bannerImg = wrapper.find(" img"),
            smallImgSRC = $.trim(bannerImg.attr("data-surl")),
            forceShowFlag = false, //强制弹出 关闭除外
            imgURL = bannerImg.attr("data-url");
        if (!floatBanner.length) return;
        var timestamp = MozillaTool.getTimestamp(),
            closeVersion = StorageWidget.getItem("n_2020_fbanner_close", ""),
            showVersion = StorageWidget.getItem("n_2020_fbanner_show", ""),
            forceShowVersion = StorageWidget.getItem("n_2020_fbanner_fshow", "");
        if (forceStartTimeStr && forceEndTimeStr) {
            var timeStart = MozillaTool.covertMiliTime(forceStartTimeStr),
                timeEnd = MozillaTool.covertMiliTime(forceEndTimeStr),
                nowTime = new Date().getTime();
            if (nowTime >= timeStart && nowTime <= timeEnd) {
                forceShowFlag = true;
            }
        }
        if (showVersion != timestamp || (forceShowFlag && forceShowVersion != timestamp)) {
            var newImage = new Image();
            newImage.src = imgURL;
            bannerImg.attr("src", imgURL);
            newImage.onload = function () {
                StorageWidget.setItem("n_2020_fbanner_show", timestamp);
                StorageWidget.setItem("n_2020_fbanner_fshow", timestamp);
                wrapper.css({
                    width: newImage.width + "px",
                    height: newImage.height + "px",
                    marginLeft: -(newImage.width / 2) + "px",
                    marginTop: -(newImage.height / 2) + "px",
                });
                floatBanner.show();
                if (noClose != "true") {
                    var autoCloseInterval = setTimeout(function () {
                        if (floatBanner.attr("data-animate")) return;
                        if (smallImgSRC) {
                            floatBanner.animate({ width: "0px", height: "0px" }, 300, function () {
                                var newImg = new Image();
                                newImg.src = smallImgSRC;
                                floatBanner.css({ overflow: "hidden", background: "transparent" });
                                floatBanner.find(".close").hide();
                                bannerImg.attr("src", smallImgSRC);
                                var wrapperStyle = "width: auto;height: auto;margin: 0px;position: inherit;top: inherit;left: inherit;";
                                wrapper.attr("style", wrapperStyle);
                                newImg.onload = function () {
                                    floatBanner.animate({ width: newImg.width + "px", height: newImg.height + "px" }, 500, function () {
                                        //floatBanner.removeAttr("data-animate");
                                        closeEle.find(".close[data-type=open]").show();
                                    });
                                };
                                newImg.onerror = function () {
                                    floatBanner.remove();
                                    //floatBanner.removeAttr("data-animate");
                                    closeEle.show();
                                };
                            });
                        } else {
                            floatBanner.removeAttr("data-animate");
                            closeEle.show();
                            floatBanner.remove();
                        }
                    }, duration);
                }
            };
        } else {
            //被关闭过显示小图  如果有小图的话
            if (smallImgSRC) {
                var wrapperStyle = "width: auto;height: auto;margin: 0px;position: inherit;top: inherit;left: inherit;";
                var newImage = new Image();
                newImage.src = smallImgSRC;
                bannerImg.attr("src", smallImgSRC);

                wrapper.attr("style", wrapperStyle);
                floatBanner.css({ overflow: "hidden", background: "transparent", width: "0px", height: "0px" });
                floatBanner.find(".close").hide();

                newImage.onload = function () {
                    // StorageWidget.setItem("n_2020_fbanner_show",timestamp);
                    //StorageWidget.setItem("n_2020_fbanner_fshow",timestamp);
                    floatBanner.css({
                        width: newImage.width + "px",
                        height: newImage.height + "px",
                    });

                    floatBanner.show();
                };
            }
        }
        /* if(!closeVersion){
               
           }else{
               


           }*/
    }
    function dealTopBanner() {
        var pageBanner = $(".page-banner");
        if (!pageBanner.length) return;
        var timestamp = MozillaTool.getTimestamp(),
            closeVersion = StorageWidget.getItem("n_2019_pbanner_close", ""),
            bannerImg = pageBanner.find("img"),
            bannerDuration = $.trim(pageBanner.attr("data-duration")),
            noClose = $.trim(pageBanner.attr("data-nclose")) == "true" ? true : false,
            duration = bannerDuration ? parseInt(bannerDuration) : 5000,
            imgBigSRC = $.trim(bannerImg.attr("data-url")),
            imgSmallSRC = $.trim(bannerImg.attr("data-surl"));
        if (closeVersion != timestamp) {
            //显示顶部广告通栏-大图
            if (imgBigSRC) {
                var imgBig = new Image(),
                    imgSmall = new Image();

                imgBig.src = imgBigSRC;
                imgSmall.src = imgSmallSRC;
                var loadSmallFlag = false,
                    loadBigFlag = false,
                    showFlag = false;
                imgSmall.onload = function () {
                    loadSmallFlag = true;
                    if (loadBigFlag && !showFlag) {
                        showFlag = true;
                        showTopBanner();
                    }
                };
                imgBig.onload = function () {
                    loadBigFlag = true;
                    if (loadSmallFlag && !showFlag) {
                        showFlag = true;
                        showTopBanner();
                    }
                };

                function showTopBanner() {
                    var imgBigHeight = imgBig.height,
                        imgSmallHeight = imgSmall.height,
                        closeTimeout;

                    pageBanner.find("a").on("click", function (evt) {
                        var timeStamp = MozillaTool.getTimestamp();
                        StorageWidget.setItem("n_2019_pbanner_close", timeStamp);
                    });
                    pageBanner.find(".close").on("click", function (evt) {
                        var btn = $(this);
                        // pageBanner.remove();
                        closeTimeout && clearTimeout(closeTimeout);
                        pageBanner.animate(
                            {
                                height: 0,
                            },
                            800,
                            function () {
                                bannerImg.attr("src", imgSmallSRC);
                                pageBanner.find(".close").remove();
                                pageBanner.animate({ height: imgSmallHeight }, 800, function () {
                                    bannerImg.css({ margin: "0px" });
                                });
                            },
                        );
                        var timeStamp = MozillaTool.getTimestamp();
                        StorageWidget.setItem("n_2019_pbanner_close", timeStamp);
                    });

                    bannerImg.attr("src", imgBigSRC);
                    pageBanner.show();
                    pageBanner.animate(
                        {
                            height: imgBigHeight,
                        },
                        800,
                        function () {
                            pageBanner.find(".close").show();
                            if (!noClose) {
                                closeTimeout = setTimeout(function () {
                                    pageBanner.find(".close").remove();
                                    pageBanner.animate(
                                        {
                                            height: 0,
                                        },
                                        800,
                                        function () {
                                            bannerImg.attr("src", imgSmallSRC);
                                            pageBanner.animate({ height: imgSmallHeight }, 8000);
                                        },
                                    );
                                }, duration);
                            }
                        },
                    );
                }
            }
        } else {
            //显示顶通小图
            var imgSmall = new Image();
            imgSmall.src = imgSmallSRC;
            pageBanner.find(".close").remove();
            pageBanner.css({ height: "auto" });
            imgSmall.onload = function () {
                bannerImg.attr("src", imgSmallSRC);
                pageBanner.show();
            };
        }
    }
    function dealBottomBanner() {
        var bomBanner = $(".bottom-banner");
        if (!bomBanner.length) return;
        var timestamp = MozillaTool.getTimestamp(),
            closeVersion = StorageWidget.getItem("n_2019_bombanner_close", ""),
            bannerImg = bomBanner.find("img"),
            bannerDuration = $.trim(bomBanner.attr("data-duration")),
            noClose = $.trim(bomBanner.attr("data-nclose")) == "true" ? true : false,
            duration = bannerDuration ? parseInt(bannerDuration) : 6000,
            imgBigSRC = $.trim(bannerImg.attr("data-url")),
            imgSmallSRC = $.trim(bannerImg.attr("data-surl"));
        if (closeVersion != timestamp) {
            //显示顶部广告通栏

            if (imgBigSRC) {
                var imgBig = new Image(),
                    imgSmall = new Image();

                imgBig.src = imgBigSRC;
                imgSmall.src = imgSmallSRC;
                var loadSmallFlag = false,
                    loadBigFlag = false,
                    showFlag = false;
                imgSmall.onload = function () {
                    loadSmallFlag = true;
                    if (loadBigFlag && !showFlag) {
                        showFlag = true;
                        showBomBanner();
                    }
                };
                imgBig.onload = function () {
                    loadBigFlag = true;
                    if (loadSmallFlag && !showFlag) {
                        showFlag = true;
                        showBomBanner();
                    }
                };

                function showBomBanner() {
                    var imgBigWidth = imgBig.width,
                        imgSmallWidth = imgSmall.width,
                        closeTimeout;

                    bomBanner.find("a").on("click", function (evt) {
                        var timeStamp = MozillaTool.getTimestamp();
                        StorageWidget.setItem("n_2019_bombanner_close", timeStamp);
                    });
                    bomBanner.find(".close").on("click", function (evt) {
                        var btn = $(this);
                        closeTimeout && clearTimeout(closeTimeout);
                        bomBanner.animate(
                            {
                                width: 0,
                            },
                            800,
                            function () {
                                bannerImg.attr("src", imgSmallSRC);
                                bomBanner.css({ background: "none", overflow: "hidden" });
                                bomBanner.find(".close").remove();
                                bomBanner.animate({ width: imgSmallWidth }, 800, function () {
                                    bannerImg.css({ margin: "0px" });
                                });
                            },
                        );
                        var timeStamp = MozillaTool.getTimestamp();
                        StorageWidget.setItem("n_2019_bombanner_close", timeStamp);
                    });

                    bannerImg.attr("src", imgBigSRC);
                    bomBanner.show();

                    bomBanner.animate(
                        {
                            width: "100%",
                        },
                        800,
                        function () {
                            bomBanner.find(".close").show();
                            if (!noClose) {
                                closeTimeout = setTimeout(function () {
                                    bomBanner.animate(
                                        {
                                            width: 0,
                                        },
                                        800,
                                        function () {
                                            bomBanner.find(".close").remove();
                                            bomBanner.css({ background: "none", overflow: "hidden" });
                                            bannerImg.attr("src", imgSmallSRC);
                                            bomBanner.css({ background: "none" });
                                            bomBanner.animate({ width: imgSmallWidth }, 800, function () {
                                                bannerImg.css({ margin: "0px" });
                                            });
                                        },
                                    );
                                }, duration);
                            }
                        },
                    );
                }
            }
        } else {
            //显示底部小图
            var imgSmall = new Image();
            imgSmall.src = imgSmallSRC;
            bomBanner.find(".close").remove();
            bomBanner.css({ background: "none", overflow: "hidden" });
            bannerImg.css({ margin: "0px" });
            imgSmall.onload = function () {
                bannerImg.attr("src", imgSmallSRC);
                bomBanner.css({ width: imgSmall.width });
                bomBanner.show();
            };
        }
    }
    function dealMenuBanner() {
        var menuBanner = $(".mrec-banner"),
            menuRandom = $.trim(menuBanner.attr("data-rand"));
        if (menuRandom == "true") {
            menuBanner.hide();
            var randNum = Math.random() * 10;
            if (randNum < 5) {
                menuBanner.show();
            }
        }
    }

    //function 处理 dealSideFeed added by hzhou 2019-04-02
    var sideScrollBar;

    //处理侧边栏菜单图片的切换
    function dealFixedMenuImage(menuEle) {
        var imgList = menuEle.find(".imglist:eq(0)");
        if (imgList.length) {
            var sideImages = imgList.find("a"),
                imgLen = sideImages.length;
            if (imgLen > 1) {
                var smIndex = 0;
                var smTimer = setInterval(function () {
                    smIndex = smIndex + 1 > imgLen - 1 ? 0 : smIndex + 1;
                    sideImages.eq(smIndex).css({ display: "block" }).siblings().hide();
                }, 10000);
            }
        }
    }
    //添加广告域名和非域名统计
    function addPromoteTrace() {
        try {
            var topLoc = window.top.location,
                topHost = topLoc.hostname,
                hostArr = topHost.split(".");
            if (hostArr && hostArr.length) {
                hostArr.splice(0, 1);
                var topDomain = hostArr.join(".");
                if (topDomain == "firefoxchina.cn") {
                    TraceWidget.addTrace("域名访问", "javascript:;", "visit_domain");
                }
            }
        } catch (e) {
            TraceWidget.addTrace("非域名访问", "javascript:;", "visit_nodomain");
        }
    }
    //处理底部百度广告，替换为google
    function dealSideBottomAds() {
        var bottomAdBaidu = $(".side-promote-baidu iframe"),
            bottomAdGoogle = $(".side-promote-google iframe"),
            repType = bottomAdGoogle.length ? "google" : "baidu",
            bottomAd = repType == "google" ? bottomAdGoogle : bottomAdBaidu;
        if (!bottomAd.length) return;
        var dataURL = $.trim(bottomAd.attr("data-url")),
            backUp = $.trim(bottomAd.attr("data-backup")),
            backCheck = $.trim(bottomAd.attr("data-check"));
        try {
            var topLoc = window.top.location;
            if (backCheck) {
                repType == "google" && bottomAd.attr("src", dataURL);
                /*if(repType == "google"){
                            //交换淘宝和谷歌的位置
                            var bottomFrameWrap = bottomAd.parent(),
                                taoFrameWrap = $(".side-promote-taobao"),
                                taoFrame = taoFrameWrap.find("iframe:eq(0)"),
                                taoFrameHtm = taoFrameWrap.html();
                            taoFrame.replaceWith(bottomAd);
                           (bottomAd.attr("src",dataURL));
                            bottomFrameWrap.html(taoFrameHtm);

                      }*/
                /* $.ajax({
                        url: backCheck,
                        dataType: "script",
                        timeout:  15000,
                        error:function(){  //默认谷歌-失败-替换成百度
                              (repType == "google") && backUp && bottomAd.attr("src",backUp);
                        },
                        success:function(){
                            if(repType == "baidu"){  //默认百度-成功-替换成google
                                
                                 bottomAdd.attr("src",backUp);
                            }
                        }
                      });*/
            }
        } catch (e) {
            //about:cehome
            if (repType == "google" && backUp) {
                bottomAd.attr("src", backUp);
            } else {
                bottomAd.attr("src", dataURL);
            }
            return;
        }
    }
    //处理sideMenu的点击行为

    //处理IE浏览器下search内容保存的情况
    function dealEmailHint() {
        var emailEle = $("#ipt-email"),
            pwdEle = $("#ipt-pwd");
        if (emailEle.length) {
            var emailLabel = emailEle.parent().find("label");
            if (emailEle.val()) {
                emailLabel.hide();
            } else {
                emailLabel.show();
            }
        }
        if (pwdEle.length) {
            var pwdLabel = pwdEle.parent().find("label");
            if (pwdEle.val()) {
                pwdLabel.hide();
            } else {
                pwdLabel.show();
            }
        }
    }

    var mozillaMain = new MozillaMain();
});
