/* PRO ART analytics — opt-in, no form values, no false purchases */
(function(){
'use strict';
var cfg=window.PAAnalyticsConfig||{},ga=/^G-[A-Z0-9]+$/.test(cfg.ga4||'')?cfg.ga4:'',meta=/^\d{8,25}$/.test(cfg.metaPixel||'')?cfg.metaPixel:'';
var key='pa_tracking_choice_v1',choice='',gOn=false,mOn=false,last='';
try{choice=localStorage.getItem(key)||''}catch(e){}
if(!['all','analytics','none'].includes(choice))choice='';
function pageURL(){var u=new URL(location.href);return u.origin+u.pathname+(/^#cat-(our|abs|isl|hand|print|wall|parts|big)$/.test(u.hash)?u.hash:'')}
function load(url){var s=document.createElement('script');s.async=true;s.src=url;document.head.appendChild(s)}
var names={collection:['collection_view','ViewCollection',1],add:['add_to_cart','AddToCart',0],checkout:['begin_checkout','InitiateCheckout',0],whatsapp:['whatsapp_click','Contact',0],quote:['quote_request_intent','QuoteRequestIntent',1],visualizer:['visualizer_open','VisualizerOpen',1],calculator:['calculator_open','CalculatorOpen',1],order:['order_request_intent','OrderRequestIntent',1],email:['email_click','EmailClick',1],phone:['phone_click','Contact',0]};
function event(name,d){try{
 var def=names[name];if(!def||(!gOn&&!mOn))return;d=d||{};
 var g={page_location:pageURL(),send_to:ga},m={},v=Number(d.value),q=Number(d.quantity),id=String(d.id||'');
 if(d.value!=null&&Number.isFinite(v)&&v>=0&&v<=1e8){g.value=m.value=v;g.currency=m.currency='EGP'}
 if(Number.isInteger(q)&&q>0&&q<=10000){g.item_count=m.num_items=q}
 if(/^[A-Za-z0-9_-]{1,80}$/.test(id)){g.items=[{item_id:id,quantity:1}];if(g.value!=null)g.items[0].price=g.value;m.content_ids=[id];m.content_type='product'}
 if(/^(our|abs|isl|hand|print|wall|parts|big|home|engineers|visualizer|checkout|products|other)$/.test(d.section||''))g.section=m.section=d.section;
 if(gOn)window.gtag('event',def[0],g);if(mOn)window.fbq(def[2]?'trackCustom':'track',def[1],m);
}catch(e){}}
window.PAAnalytics={event:event,status:function(){return {configured:{ga4:!!ga,meta:!!meta},choice:choice,active:{ga4:gOn,meta:mOn}}}};
if(!ga&&!meta)return;
function page(){var p=pageURL();if(p===last)return;last=p;
 if(gOn){var g={page_location:p,page_title:document.title,send_to:ga},u=new URL(location.href),map={utm_source:'campaign_source',utm_medium:'campaign_medium',utm_campaign:'campaign_name',utm_id:'campaign_id',utm_content:'campaign_content',utm_term:'campaign_term'};Object.keys(map).forEach(function(k){var v=u.searchParams.get(k);if(v&&/^[A-Za-z0-9_.-]{1,80}$/.test(v))g[map[k]]=v});window.gtag('event','page_view',g)}
 if(mOn)window.fbq('track','PageView');
 if(/^#cat-/.test(location.hash))event('collection',{section:location.hash.slice(5)});
}
function activate(){
 var changed=false;
 if(ga&&(choice==='all'||choice==='analytics')&&!gOn){window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
 window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 window.gtag('js',new Date());window.gtag('config',ga,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:pageURL()});gOn=true;changed=true;load('https://www.googletagmanager.com/gtag/js?id='+ga)}
 if(meta&&choice==='all'&&!mOn){if(!window.fbq){var n=window.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};window._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[]}
 window.fbq('set','autoConfig',false,meta);window.fbq('init',meta);mOn=true;changed=true;load('https://connect.facebook.net/en_US/fbevents.js')}
 if(changed){last='';page()}
}
function save(next){try{localStorage.setItem(key,next)}catch(e){}
 var downgrade=(mOn&&next!=='all')||(gOn&&next==='none');choice=next;
 if(downgrade){
  if(mOn)try{window.fbq('consent','revoke')}catch(e){}
  if(gOn)try{window['ga-disable-'+ga]=true;window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'})}catch(e){}
  document.cookie.split(';').forEach(function(v){var n=v.split('=')[0].trim();if(/^(_ga($|_)|_fbp$|_fbc$)/.test(n)){[location.hostname,'.'+location.hostname].forEach(function(d){document.cookie=n+'=; Max-Age=0; Path=/; Domain='+d});document.cookie=n+'=; Max-Age=0; Path=/'}});
  location.reload();return;
 }
 if(next!=='none')activate();var panel=document.getElementById('pa-privacy-panel');if(panel)panel.hidden=true;
}
function ui(){
 var style=document.createElement('style');style.textContent='#pa-privacy-panel{position:fixed;bottom:12px;left:12px;right:12px;max-width:480px;margin:auto;z-index:10000;background:#231912;color:#f3e9dc;border:1px solid #c9a46a;border-radius:14px;padding:16px;font:15px/1.6 system-ui,sans-serif;text-align:right;direction:rtl;box-shadow:0 8px 28px #0005}#pa-privacy-panel[hidden]{display:none!important}#pa-privacy-panel p{margin:0 0 12px}#pa-privacy-panel button,#pa-privacy-settings{font:inherit;cursor:pointer;border:1px solid #c9a46a;border-radius:8px;padding:7px 10px;margin:3px;background:#231912;color:#f3e9dc}#pa-privacy-settings{display:block;margin:12px auto;font-size:12px}';document.head.appendChild(style);
 var panel=document.createElement('aside');panel.id='pa-privacy-panel';panel.hidden=!!choice;panel.setAttribute('aria-label','خيارات الخصوصية');
 var p=document.createElement('p');p.textContent='نستخدم أدوات اختيارية لقياس الزيارات وفعالية الإعلانات. يمكنك رفضها أو تغيير اختيارك في أي وقت. لا نرسل بيانات نماذج الطلب إلى أدوات القياس.';panel.appendChild(p);
 var options=ga&&meta?[['all','قبول الإحصائيات والإعلانات'],['analytics','الإحصائيات فقط']]:ga?[['analytics','قبول الإحصائيات']]:[['all','قبول قياس الإعلانات']];options.push(['none','رفض']);
 options.forEach(function(o){var b=document.createElement('button');b.type='button';b.textContent=o[1];b.addEventListener('click',function(){save(o[0])});panel.appendChild(b)});
 document.body.appendChild(panel);var b=document.createElement('button');b.id='pa-privacy-settings';b.type='button';b.textContent='إعدادات الخصوصية';b.addEventListener('click',function(){panel.hidden=false;panel.querySelector('button').focus()});(document.querySelector('footer')||document.body).appendChild(b);
}
if(choice&&choice!=='none')activate();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ui,{once:true});else ui();
window.addEventListener('hashchange',function(){if(gOn||mOn)page()});
document.addEventListener('click',function(e){try{
 var t=e.target.closest&&e.target.closest('a[href],button[data-open]');if(!t)return;
 if(t.getAttribute('data-open')==='sh-calc'){event('calculator');return}
 if(t.tagName!=='A')return;
 var u=new URL(t.href,location.href),s=location.pathname.split('/').pop().replace('.html','')||'home';if(s==='index')s='home';if(/^products\d+$/.test(s))s='products';if(!/^(home|engineers|visualizer|checkout|products)$/.test(s))s='other';
 if(u.hostname==='wa.me'||u.hostname==='api.whatsapp.com'){event('whatsapp',{section:s});if(t.id==='csend'||(s==='visualizer'&&t.id==='order'))event('order',{section:s})}
 else if(u.protocol==='tel:')event('phone',{section:s});else if(u.protocol==='mailto:')event('email',{section:s});else if(u.origin===location.origin&&/\/visualizer\.html$/.test(u.pathname))event('visualizer');
}catch(e){}},true);
})();
