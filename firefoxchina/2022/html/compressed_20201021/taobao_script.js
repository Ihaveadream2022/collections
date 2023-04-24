(function(){
                    var checkWebp = function(){
						    try{
						        return (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0);
						    }catch(err) {
						        return  false;
						    }
						};
                    var isWebP = checkWebp();
           			var MozillaPromote = function(){
                        var that  = this;
                        that.init();
                        that.bindEvents();
           			};
           			MozillaPromote.prototype = {
                        switchInterval: null,
                        switchTime: 5000,
                        init:function(){
                        	 var that = this;
                           $.ajax({
                               url:"https://api2.firefoxchina.cn/home/chome_tb_pmt_scroll_test.json",
                               dataType:"json",
                                    //jsonpCallback:"get_pmt_list",
                               error:function(){},
                               success:function(res){
                                      if(res && res.data && res.data.data){
                                           //生成menu
                                           var menuHTM = "<ul>",
                                               tabHTM = "",
                                               pageSize = 4,
                                               pageMaxSize = 20,
                                               result = loopMeta(res.data,"meta"),
                                               results = result.data,
                                               resList = [];
                                           $.each(results,function(i,n){
                                               menuHTM += "<li for='tab-mod-"+n.track_key+"' class='menu' >"+n.title+"</li>";
                                           });
                                           menuHTM += "</ul>";
                                           $(".tab-menu").html(menuHTM);

                                           //生成Tab
                                           $.each(results,function(j,tab){
                                                var resList = [],
                                                    dotHTM = "<div class='dot-list'>";
                                                 tabHTM += "<div class='tab-mod' trace-key='side_frame_"+tab.track_key+"' id='tab-mod-"+tab.track_key+"'>";
                                                 
                                                 tabHTM += "<div class='scroll-wrapper'><div class='scroller'>";
                                                //生成resList

                                                if(tab.data && tab.data.length){
                                                    var start = 0;

                                                    $.each(tab.data,function(ti,inner){
                                                     
                                                          var innerList = inner.data;
                                                          if(innerList && innerList.length){
                                                                $.each(innerList,function(mi,mod){
                                                                      ++start;
                                                                     if(start<=pageMaxSize){
                                                                         if(start%pageSize == 1){
                                                                             dotHTM += "<span class='dot"+(start == 1 ? " on" : "")+"'></span>";
                                                                             tabHTM += "<div class='mod page'>";
                                                                         }
                                                                         //处理图片
                                                                         var imgURL = mod.imgurl,
                                                                             newImgURL = imgURL.replace(/\/jfs\//,"/s150x150_jfs/");
                                                                         tabHTM += "<div class='inner-mod'>";
                                                                         tabHTM += "<a href='"+mod.url+"' title='"+mod.title+"' target='_blank'>";
                                                                         tabHTM += "<p class='cover'><img src='' class='img-load-delay'  data-url='"+newImgURL+"' alt='"+mod.title+"'> </p>";
                                                                         tabHTM += "<p class='title'>"+mod.title+"</p>";
                                                                         if(mod.intro){
                                                                             tabHTM += "<p class='price'>￥"+(mod.intro)+"</p>";
                                                                         }else if(mod.meta&&mod.meta.zk_final_price){
                                                                             tabHTM += "<p class='price'>￥"+(mod.meta.zk_final_price)+"</p>";
                                                                         }
                                                                         tabHTM += "</a></div>";
                                                                         if(start%pageSize == 0){
                                                                              tabHTM += "</div>";
                                                                         }
                                                                     } 
                                                                });
                                                             
                                                            /*
                                                                var total = tab.data;
                                                                 var innerList = inner.data.length,
                                                                     pageSize = 4,
                                                                     page =  Math.ceil(total/pageSize);
                                                                 for(var p=0; p<page; p++){
                                                                      tabHTM += "<div class='mod focus-page'>";
                                                                      for(var pi=0; pi<pageSize*page; pi++){
                                                                          if(pi < total){
                                                                               var inner = k.data[p*page+pi];
                                                                               if(inner){
                                                                                     tabHTM += "<div class='inner-mod'>";
                                                                                     tabHTM += "<a href='"+inner.url+"' title='"+inner.title+"'>";
                                                                                     tabHTM += "<p class='cover'><img src='"+inner.imgurl+"' alt='"+inner.title+"'> </p>";
                                                                                     tabHTM += "<p class='title'>"+inner.title+"</p>";
                                                                                     if(inner.meta && (inner.meta.itemFinalPrice || inner.meta.itemPrice) ){
                                                                                         tabHTM += "<p class='price'>"+(inner.meta.itemFinalPrice ? inner.meta.itemFinalPrice : inner.meta.itemPrice)+"</p>";
                                                                                     }
                                                                                     tabHTM += "</a></div>";
                                                                               }
                                                                               
                                                                          }else{
                                                                             break;
                                                                          }
                                                                         
                                                                      }
                                                                      
                                                                      tabHTM += "</div>";
                                                                     
                                                                 }*/
                                                          }
                                                    });
                                                }

                                              
                                               //生成list
                                                 //生成page

                                               dotHTM += "</div>"; 
                                               tabHTM += "</div>";
                                               tabHTM += dotHTM;
                                               tabHTM += "</div></div>";
                                           });
                                           $(".tab-detail").html(tabHTM);
                                           //生成slide
                                           var scrollerList = $(".scroll-wrapper");
                                           var tabScrollList = {};
                                           TabWidget.build($(".tab-menu"),function(tab){  
                                              if(tabScrollList[tab]){
                                                tabScrollList[tab].showPage(0);
                                                return;
                                              }
                                              
                                              var tabEle = $("#"+tab);
                                              var mozFPic = MozillaFPic.build({
                                                   container:  tabEle.find(".scroller"),
                                                   dotEle: tabEle.find(".dot-list"),
                                                   auto: false         //是否自动轮播
                                              });
                                              tabScrollList[tab] = mozFPic;
                                           });
                                           TabWidget.randSwitch($(".tab-menu"),function(tab){
                                              
                                              if(tabScrollList[tab]){
                                                
                                                return;
                                              }
                                             
                                              var tabEle = $("#"+tab);
                                              MozillaTool.loadDelayResource(tabEle);
                                              var mozFPic = MozillaFPic.build({
                                                   container:  tabEle.find(".scroller"),
                                                   dotEle: tabEle.find(".dot-list"),
                                                   auto: false         //是否自动轮播
                                              });
                                              tabScrollList[tab] = mozFPic;



                                           });
                                           TraceWidget.build();
                                          /* $.each(scrollerList,function(si,sc){
                                                
                                           });*/
                                      }
                               }
                           });

                        	 
                                     
                        },
                        generateTabContent:function(resEle,resList){
                            var that = this;
                            
                            if(!(resEle && resList && resList.length)) return;
                            if(resEle.getAttribute("data-loaded")) return;
                            resEle.setAttribute("data-loaded","true");
                            var tKey = resEle.getAttribute("track-key");
                              var start=0,
                                  lineSize = 8,  //6列
                                  pageLine = 1,  //2行
                                  sizeNum = resList.length,
                                  defaultHtm = "",
                                  defaultEle = null,
                                  thumbHtm = "",
                                  //thumbEle = document.getElementById("thumb-list"),
                                  thumbEle = resEle,
                                  switchEle = document.getElementById("thumb-switch");
                                  //productEle = document.getElementById("product-info");
                                  if(sizeNum){
                                         //打乱数组顺序
                                         resList.sort(function(){
                                              return Math.random() > 0.5 ? 1 : -1;
                                         });
                                         //计算分成多少页
                                         var fragmentEle = document.createDocumentFragment();
                                         var pageNum =  Math.ceil(sizeNum/(lineSize*pageLine));
                                         for(var p=0; p<pageNum; p++){
                                                var thumbPage = document.createElement("div"),  //page
                                                    lineEle1 = document.createElement("p"),   //page line
                                                    lineEle2 = document.createElement("p");   //page line
                                                    thumbPage.className = "page";
                                                    lineEle1.className = "line";
                                                    lineEle2.className = "line";

                                                for(start=p*lineSize*pageLine;start<(p+1)*lineSize*pageLine; start++){
                                                     var item = resList[start],
                                                         isCurrent = false,
                                                         itemEle =document.createElement("div"),
                                                         coverEle = document.createElement("a"),
                                                         titleEle = document.createElement("a"),
                                                         extraEle = document.createElement("p"),
                                                         couponEle = document.createElement("a"),
                                                         priceEle = document.createElement("span"),
                                                         oldPriceEle = document.createElement("del"),
                                                         saleEle = document.createElement("span");
                                                     
                                                     if(item && item.meta){
                                                            if(!defaultEle){
                                                                 isCurrent = true;
                                                                 defaultEle = itemEle;
                                                            }
                                                           
                                                            var price= item.meta.zk_final_price || item.meta.itemFinalPrice || item.meta.price,
                                                                oldPrice = item.meta.reserve_price,
                                                                sale = item.meta.sales ? (parseInt(item.meta.sales) >100 ? item.meta.sales : "") : "",
                                                                imgStr = 'https://'+item.imgurl || item.imgurl_https,
                                                                newImgStr =  imgStr.replace(/\s+/,""),
                                                                imgURL = ((newImgStr.indexOf(".alicdn.") != -1) ? newImgStr+"_140x140" : (newImgStr.indexOf("/jfs/")!=-1 ?  newImgStr.replace(/\/jfs\//,"/s140x140_jfs/") : newImgStr));
                                                                imgSRC = (p==0 ? imgURL : "");
                                                                imgClass = (p!=0 ? "img-load-delay" : ""),
                                                                linkURL = item.meta.click_url || item.meta.sale_link ||  item.url,
                                                                couponLink = item.meta.coupon_link ||item.meta.coupon_click_url,
                                                                title = item.title,  
                                                                newTitle = getByteString(title,34);
                                                           
                       
                                                            //cover
                                                            var coverHTML = "<img src='"+imgSRC+"' alt='"+title+"'  data-img='"+imgURL+"' class='"+imgClass+"'/>" ;
                                                            coverEle.className = "cover";
                                                            coverEle.href = linkURL;
                                                            coverEle.title = title;
                                                            coverEle.innerHTML = coverHTML;

                                                            //title
                                                            titleEle.className = "title";
                                                            titleEle.href = linkURL;
                                                            titleEle.innerHTML = newTitle;
                                                            titleEle.title = title;

                                                            itemEle.className = "mod";
                                                            itemEle.appendChild(coverEle);
                                                            itemEle.appendChild(titleEle);

                                                            item.showPrice = "";
                                                            //extra
                                                            extraEle.className = "extra";

                                                            
                                                             /*if(couponLink){
                                                                   couponEle.className="coupon";
                                                                   couponEle.innerHTML =  "优惠券";
                                                                   couponEle.href = couponLink;
                                                                   couponEle.title = "领取优惠券";
                                                                   extraEle.appendChild(couponEle);
                                                             }*/

                                                             if(price){
                                                                priceEle.className = "price";
                                                                priceEle.innerHTML = "￥"+price;
                                                                extraEle.appendChild(priceEle);
                                                             }
                                                             if(oldPrice){
                                                                oldPriceEle.innerHTML = "￥"+oldPrice;
                                                                extraEle.appendChild(oldPriceEle);
                                                             }
                                                             /*
                                                              if(sale){
                                                                saleEle.className = "sale";
                                                                saleEle.innerHTML = "销量:"+sale;
                                                                extraEle.appendChild(saleEle);
                                                             }*/

                                                            itemEle.appendChild(extraEle);
                                                            
                                                            coverEle.onclick = function(){
                                                                 addLinkTrace(this,tKey);
                                                            }
                                                            titleEle.onclick = function(){
                                                                 addLinkTrace(this,tKey);
                                                            }
                                                            
                                                            if(couponLink){
                                                                  couponEle.onclick = function(){
                                                                       addLinkTrace(this,tKey);
                                                                  }
                                                            }
                                                                 
                                                         
                                                          
                                                           if(pageLine > 1){
                                                                  if(start < p*lineSize*pageLine+lineSize){
                                                                        lineEle1.appendChild(itemEle);
                                                                  }else if(start < (p+1)*lineSize*pageLine){
                                                                        lineEle2.appendChild(itemEle);
                                                                  }
                                                           }else{
                                                               if(start < p*lineSize*pageLine+lineSize){
                                                                        lineEle1.appendChild(itemEle);
                                                               }
                                                           }
                                                           if(start == (p+1)*lineSize*pageLine-1  || start == sizeNum-1){
                                                               thumbPage.appendChild(lineEle1);
                                                              
                                                               fragmentEle.appendChild(thumbPage);

                                                           }
                                                     }
                                                     
                                                }

                                         }
                                         resEle.appendChild(fragmentEle);
                                         /*if(pageNum > 1){
                                             switchEle.style.display = "inline";

                                         }*/
                                  }
                          
                    
                          
                        },
                        bindEvents:function(){
                        	var that = this,
                              switchEle = document.getElementById("thumb-switch"),
                              thumbEle = document.getElementById("thumb-list");
                          
                        
                        
                      }

           			};
       			    var mozillaPromote = new MozillaPromote();

               
                function getByteString(str,bSize){
                       var newStr = str,
                           bsize = bSize ? bSize : 40;
                       if(newStr){
                          var index = 0,
                            tempChar,
                            len = 0,
                            tempStr = "",
                            endFlag = false;
                            
                            
                          while((tempChar = newStr.charAt(index))){
                               index++;
                             //中文和全角字符
                               if(/[^\x00-\xff]/.test(tempChar)){
                                 len = len +2;
                                 if(len <= bsize-2){
                                  
                                  tempStr = tempStr + tempChar;
                                 }
                               }else{
                                 if(len < bsize){
                                    tempStr = tempStr + tempChar;
                                 }
                                 len = len +1;
                               }
                          }
                        
                          newStr = tempStr + (len > bsize ? "..."  : "");
                       }
                       return newStr;
                    } 


                function addLinkTrace(btn,tkey){
                     var href = btn["href"],
                         title = btn["title"] || "无关键字",
                         key = tkey ? tkey : "ad_frame_crack";
                      if(href) {
                          var image = new Image(),
                              cid = "";
                          image.src = 'https://home.firefoxchina.cn/2019/img/trace_2014.gif' + '?r=' + Math.random() + '&d=' + encodeURIComponent(document.location.host) + '&c=' + encodeURIComponent(key) + '&a=' + encodeURIComponent("") + '&u=' + encodeURIComponent(href) + '&cid=' + encodeURIComponent(cid) + '&t=' + encodeURIComponent(title);
                      }
                }
                function getNextElement(element){
                    var e = element.nextSibling;
                    if(e == null){//测试同胞节点是否存在，否则返回空
                        return null;
                    }
                    if(e.nodeType==3){//如果同胞元素为文本节点
                        var two = getNextElement(e);
                        if(two.nodeType == 1)
                            return two;
                    }else{
                        if(e.nodeType == 1){//确认节点为元素节点才返回
                            return e;
                        }else{
                            return false;
                        }
                    }
                }

                function dealMinusFixed(num1,num2){
                      if(!num2) num2 = 0;
                      var str1 = num1.toString(),
                          str2 = num2.toString(),
                          arr1 = str1.split("."),
                          arr2 = str2.split("."),
                          len1 = arr1[1] ? arr1[1].length : 0,
                          len2 = arr2[1] ? arr2[1].length : 0,
                          len = Math.max(len1,len2),
                          minus = parseFloat(str1) - parseFloat(str2),
                          res = minus.toFixed(len);
                      return res;

                }
                function dealAddFixed(num1,num2){
                      if(!num2) num2 = 0;
                      if( !num1) return "";
                      var str1 = num1.toString(),
                          str2 = num2.toString(),
                          arr1 = str1.split("."),
                          arr2 = str2.split("."),
                          len1 = arr1[1] ? arr1[1].length : 0,
                          len2 = arr2[1] ? arr2[1].length : 0,
                          len = Math.max(len1,len2),
                          minus = parseFloat(str1) + parseFloat(str2),
                          res = minus.toFixed(len);
                      return res;

                }
                function ajax(obj){
                    var defaults = {
                        type:'get',
                        url:'#',
                        dataType:'text',
                        jsonp:'callback',
                        data:{},
                        async:true,
                        success:function(data){}
                    };
                    for(var k in obj){
                        defaults[k] = obj[k];
                    }
                    if(defaults.dataType == 'jsonp') {
                        //调用jsonp
                        ajaxForJsonp(defaults);
                    }else {
                        //调用ajax json
                        ajaxForJson(defaults);
                    }
                }

                //json数据格式
                function ajaxForJson(defaults){
                      //1、创建XMLHttpRequset对象
                      var xhr = null;
                      if(window.XMLHttpRequest){
                         xhr = new XMLHttpRequest();
                      }
                      else {
                          xhr = new ActiveXObject("Microsoft.XMLHTTP");
                      }
                      var param = '';
                      for(var key in defaults.data) {
                          param += key + '='+ defaults.data[key] + '&';
                      }
                      if(param){
                          param = param.slice(0, param.length-1);
                      }
                      // 处理get请求参数并且处理中文乱码问题
                      if(defaults.type == 'get') {
                          defaults.url += '?' + encodeURI(param);
                      }
                      //2、准备发送（设置发送的参数）
                      xhr.open(defaults.type,defaults.url,defaults.async);
                      // 处理post请求参数并且设置请求头信息（必须设置）
                      var data = null;
                      if(defaults.type == 'post') {
                          data = param;
                          //设置请求头
                          xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                      }
                      // 3、执行发送动作
                      xhr.send(data);
                      //处理同步请求，不会调用回调函数
                      if(!defaults.async) {
                          if(defaults.dataType == 'json'){
                                return JSON.parse(xhr.responseText);
                          }
                          else {
                                return xhr.responseText;
                          }
                      }
                      //// 4、指定回调函数（处理服务器响应数据）
                      xhr.onreadystatechange = function() {
                          if(xhr.readyState == 4){
                              if(xhr.status == 200){
                                  var data = xhr.responseText;
                                  if(defaults.dataType == 'json'){
                                      data = JSON.parse(data);
                                  }
                                  defaults.success(data);
                              }
                          }
                      }
                }

                //跨域jsonp
                function ajaxForJsonp(defaults){
                      //cbName默认的是回调函数名称
                      var cbName = 'jQuery' + ('1.12.2' + Math.random()).replace(/\D/g,'') + '_' + (new Date().getTime());
                      if(defaults.jsonpCallback) {
                          cbName = defaults.jsonpCallback;
                      }
                      //这里就是回调函数，调用方式：服务器响应内容来调用
                      //向window对象中添加一个方法，方法名是变量cname的值
                      window[cbName] = function(data) {
                           defaults.success(data);//这里success的data是实参
                      }
                      var param = '';
                      for(var key in defaults.data){
                          param += key + '=' + defaults.data[key] + '&'; 
                      }
                      if(param){
                          param = param.slice(0, param.length-1);
                          param = '&' + param;
                      }
                      var script = document.createElement('script');
                      script.src = defaults.url + '?' + defaults.jsonp + '=' + cbName + param;
                      var head = document.getElementsByTagName('head')[0];
                      head.appendChild(script);
                }


                function loopMeta(res,pName){
                          //处理根节点
                         var newMeta = dealMeta(res,pName);
                         /*if(newMeta){
                             res[pName] = newMeta;
                         }*/
                         newMeta && (res = newMeta);
                         if(res.data){
                            var len = res.data.length;
                            if(len>0){
                               for(var i=0; i<len; i++){
                                 res["data"][i] = loopMeta(res["data"][i],pName);
                               }
                            }
                         }
                         return res;
                  }
                  function  dealMeta(res,pName){
                        var newMeta = "";
                        var metaStr = res[pName],
                            newMeta = metaStr;
                        if(metaStr && typeof(metaStr) == "string"){
                           newMeta = JSON.parse(metaStr);
                        }
                        res[pName] = newMeta;
                        return res;
                  }
       		})();