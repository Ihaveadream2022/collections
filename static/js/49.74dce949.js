"use strict";(self["webpackChunk"]=self["webpackChunk"]||[]).push([[49],{49:function(s,e,o){o.r(e),o.d(e,{default:function(){return d}});var t=function(){var s=this,e=s._self._c;return e("div",{staticClass:"login-container"},[e("el-form",{ref:"loginForm",staticClass:"login-form",attrs:{model:s.loginForm,rules:s.loginRules,"label-position":"left"}},[e("div",{staticClass:"login-title"},[e("h3",[s._v("通用后台管理系统")])]),e("el-form-item",{attrs:{prop:"email"}},[e("span",{staticClass:"svg-container"},[e("svg-icon",{attrs:{"symbol-id-suffix":"user"}})],1),e("el-input",{ref:"email",attrs:{tabindex:"1",name:"email",type:"text",placeholder:"请输入email"},model:{value:s.loginForm.email,callback:function(e){s.$set(s.loginForm,"email","string"===typeof e?e.trim():e)},expression:"loginForm.email"}})],1),e("el-tooltip",{attrs:{manual:"",effect:"dark",content:"开启了大写状态",placement:"right"},model:{value:s.capsTooltip,callback:function(e){s.capsTooltip=e},expression:"capsTooltip"}},[e("el-form-item",{attrs:{prop:"password"}},[e("span",{staticClass:"svg-container"},[e("svg-icon",{attrs:{"symbol-id-suffix":"password"}})],1),e("el-input",{ref:"password",attrs:{type:s.passwordType,tabindex:"2",name:"password","auto-complete":"on",placeholder:"请输入密码"},on:{blur:function(e){s.capsTooltip=!1}},nativeOn:{keyup:function(e){return s.checkCapsLock.apply(null,arguments)}},model:{value:s.loginForm.password,callback:function(e){s.$set(s.loginForm,"password","string"===typeof e?e.trim():e)},expression:"loginForm.password"}}),e("span",{staticClass:"svg-container eye",on:{click:s.switchShowIcon}},[e("svg-icon",{attrs:{"symbol-id-suffix":s.passwordShowIcon}})],1)],1)],1),e("el-form-item",[e("el-button",{attrs:{loading:s.submitLoading,type:"primary"},nativeOn:{click:function(e){return e.preventDefault(),s.onSubmit.apply(null,arguments)}}},[s._v("登 录")])],1)],1)],1)},i=[],a=(o(5988),o(5502)),r=(o(4810),o(5997)),n=o(5478),l={name:"ViewsLoginIndex",data(){return{loginForm:{email:"123@gmail.com",password:"123000"},loginRules:{email:[{required:!0,validator:(s,e,o)=>{const t=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;t.test(e)?o():o(new Error("请输入正确的email"))}}],password:[{required:!0,validator:(s,e,o)=>{e.length<6?o(new Error("请输入密码, 最少6位")):o()}}]},capsTooltip:!1,passwordType:"password",submitLoading:!1,window:null}},computed:{passwordShowIcon(){return"password"===this.passwordType?"eye-open":"eye"}},created(){console.log(n.Z.state.user.ID_INFO)},methods:{onSubmit(){this.$refs.loginForm.validate((s=>{if(!s)return(0,r.Message)({message:"请输入正确的邮箱和密码",type:"error",duration:2e3}),!1;r.Message.closeAll(),this.submitLoading=!0,this.$store.dispatch("user/login",this.loginForm).then((()=>{this.submitLoading=!1,(0,r.Message)({message:"登录成功",type:"success",duration:2e3,onClose:()=>{this.$router.push({path:"/"})}})}),(s=>{this.submitLoading=!1,s instanceof a.Z.AxiosError?(0,r.Message)({message:`${s.response.status} - ${s.response.statusText}`,type:"error",duration:2e3}):(0,r.Message)({message:`${s.code} - ${s.msg}`,type:"error",duration:2e3})}))}))},close1(){this.window.close()},checkCapsLock(s){const{key:e}=s;this.capsTooltip=e&&1===e.length&&e>="A"&&e<="Z"},switchShowIcon(){this.passwordType="password"===this.passwordType?"":"password",this.$nextTick().then(function(){this.$refs.password.focus()}.bind(this))}}},p=l,c=o(9917),u=(0,c.Z)(p,t,i,!1,null,null,null),d=u.exports}}]);