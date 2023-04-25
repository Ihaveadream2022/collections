"use strict";(self["webpackChunk"]=self["webpackChunk"]||[]).push([[894],{9894:function(e,t,s){s.r(t),s.d(t,{default:function(){return z}});var i=function(){var e=this,t=e._self._c;return t("div",{staticClass:"app-wrapper"},[t("el-container",[t("el-aside",{attrs:{width:"auto"}},[t("keep-alive",[t("sectionSidebar")],1)],1)],1)],1)},o=[],a=function(){var e=this,t=e._self._c;return t("div",{staticClass:"sidebar-container"},[t("el-scrollbar",{attrs:{"wrap-class":"scrollbar-wrapper"}},[t("el-menu",{attrs:{"default-active":"/index/dashboard/index",collapse:e.sidebarCollapse,"unique-opened":!1,mode:"vertical","collapse-transition":!0,router:!0,"background-color":"#343a40","text-color":"#bfcbd9","active-text-color":"#409EFF"}},[e._l(e.is_menus,(function(s){return[s.children&&!s.meta.is_same_as_child?[t("el-submenu",{key:s.path,attrs:{index:s.path}},[t("template",{slot:"title"},[t("svg-icon",{attrs:{"symbol-id-suffix":s.meta.icon}}),t("span",[e._v(e._s(s.meta.title))])],1),e._l(s.children,(function(i){return t("el-menu-item",{key:i.path,attrs:{index:`${s.path}/${i.path}`}},[e._v(" "+e._s(i.meta.title)+" ")])}))],2)]:[s.meta.is_same_as_child?t("el-menu-item",{key:s.redirect,attrs:{index:s.redirect}},[t("svg-icon",{attrs:{"symbol-id-suffix":s.meta.icon}}),t("span",{attrs:{slot:"title"},slot:"title"},[e._v(e._s(s.meta.title))])],1):t("el-menu-item",{key:s.path,attrs:{index:s.path}},[t("svg-icon",{attrs:{"symbol-id-suffix":s.meta.icon}}),t("span",{attrs:{slot:"title"},slot:"title"},[e._v(e._s(s.meta.title))])],1)]]}))],2)],1)],1)},r=[],l=s(3183),n=s(1920),A=function(){var e=this,t=e._self._c;return t("div",{staticClass:"sidebar-logo-container"},[t("transition",{attrs:{name:"logo"}},[e.collapse?t("router-link",{key:"collapse",class:["sidebar-logo-link",e.collapse?"collapse":""],attrs:{to:"/"}},[t("img",{staticClass:"sidebar-logo",attrs:{src:s(6794),alt:""}})]):t("router-link",{key:"expand",staticClass:"sidebar-logo-link",attrs:{to:"/"}},[t("img",{staticClass:"sidebar-logo",attrs:{src:s(6794),alt:""}})])],1)],1)},d=[],c={name:"ViewsLayoutSidebarLogo",props:{collapse:{type:Boolean,require:!0}}},m=c,p=s(9917),u=(0,p.Z)(m,A,d,!1,null,"7d45edff",null),v=u.exports,h={name:"viewsLayoutSidebar",components:{viewLayoutSidebarLogo:v},data(){return{menus:n._}},created(){console.log(this.is_menus)},computed:{...(0,l.Se)({sidebarCollapse:["app/sidebarCollapse"],authorities:["user/authorities"]}),is_menus(){return this.menus.filter((e=>!(!e.meta||!e.meta.is_menu)&&(e.meta.is_same_as_child?!!this.authorities.includes(e.redirect):!!this.authorities.includes(e.path)&&(e.children&&(e.children=e.children.filter((t=>t.meta&&t.meta.is_menu&&this.authorities.includes(`${e.path}/${t.path}`)))),!0))))}},methods:{test(){console.log(this.is_menus),this.$store.dispatch("app/toggleSidebarCollapse")}}},C=h,g=(0,p.Z)(C,a,r,!1,null,"181a7bc0",null),f=g.exports;const{body:b}=document,E=992;var w={watch:{$route(){"mobile"===this.device&&this.sidebar.opened&&this.$store.commit("app/TOGGLE_SIDEBAR_COLLAPSE",!0)}},beforeMount(){window.addEventListener("resize",this.$_resizeHandler)},beforeDestroy(){window.removeEventListener("resize",this.$_resizeHandler)},mounted(){const e=this.$_isMobile();e&&(this.$store.commit("app/TOGGLE_DEVICE","mobile"),this.$store.commit("app/TOGGLE_SIDEBAR_COLLAPSE",!0))},methods:{$_isMobile(){const e=b.getBoundingClientRect();return e.width-1<E},$_resizeHandler(){if(!document.hidden){const e=this.$_isMobile();e?(this.$store.commit("app/TOGGLE_DEVICE","mobile"),this.$store.commit("app/TOGGLE_SIDEBAR_COLLAPSE",!0)):(this.$store.commit("app/TOGGLE_DEVICE","desktop"),this.$store.commit("app/TOGGLE_SIDEBAR_COLLAPSE",!1))}}}},D={name:"ViewsLayoutIndex",components:{sectionSidebar:f},mixins:[w],data(){return{}}},L=D,P=(0,p.Z)(L,i,o,!1,null,null,null),z=P.exports},6794:function(e){e.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAACslBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v79/f37+/v5+fn////+/v74+PjR0dGioqJ6enpdXV1aWlpbW1uhoaHQ0ND4+Pj6+vq0tLRNTU0AAAAAAAAODg4oKCgpKSlKSkqxsbHe3t5QUFAxMTFDQ0NAQEA9PT06Ojo6OjpAQEAyMjJQUFDc3NzNzc0AAAArKytEREQ5OTk2NjY3NzdEREQqKioAAADFxcXS0tIAAAA+Pj49PT08PDxBQUEAAADMzMzt7e0MDAw4ODg7OzsAAADo6Oj///+CgoI/Pz8LCwt2dnb////a2tpFRUXR0dGSkpI+Pj6FhYX39/dFRUUzMzM5OTkuLi7v7+/e3t4AAABCQkLU1NTKysoAAAA/Pz+8vLy/v7+tra3///+/v783NzeKioqWlpaTk5OUlJSXl5eEhIQuLi6urq43Nzf29vbr6+s3Nzfv7+/8/Pzl5eXw8PDn5+fm5ub////////////////w8PDy8vJxcXF6enp4eHhsbGwyMjIZGRkKCgoPDw8ICAgeHh48PDw7Ozv///////84ODhBQUHAwMBISEg+Pj7x8fEQEBCvr6////+9vb0AAAAdHR0AAADw8PDl5eUAAAAPDw8aGhqrq6v19fXn5+fp6eno6Ojp6en8/Pzo6Ojn5+fz8/P////////////e2BDzAAAA5nRSTlMAAQMEDCpNcI+qwNHh8Pn+JFmSw+j/Ag1Kk9L8+/0HpOmL4ka1Usn6BUfKtolD3pEp1FuMsg7NF90b5BjlzrNcRIor///3+0j+9fDx9PT5+fHx9PPs9v3/////9ejr7////v/+////8uzw+P///v///v/65e38//7+//nr7vX//vfv9+3+//D27f/r7v7y9Pb///j08fv/7/D+//H4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"}}]);