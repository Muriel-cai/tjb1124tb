/**
 * @author {徐勇强}({WB114848})
 * @version 0.0.1
 */
define(function(require) { // eslint-disable-line no-unused-vars
  var itemTpl = require('./item.jst.html');
  var lazy = require('kg/km-lazyload');
  var XCtrl = require('kg/m-xctrl');
  var mtop = require('kg/km-mtop');
  var login = require('mtb/lib-login');
  var Toast = require('kg/km-toast');
  // var toast = require('kg/km-toast');
  // var XCtrl = require('kg/xctrl');
  function Mod() {
    this.init.apply(this, arguments);
  }

  Mod.prototype = {
    /**
    * 入口
    * @param dom 模块根节点
    * @param conf 数据描述，为空说明已渲染
    */
    init: function(container, conf) {
      var self = this;
      self._node = $(container);
      if (!conf) {
        conf = $.parseJSON(self._node.find('.J_ModuleData').html());
      }
      self._conf = conf;
           
      self._node.find('.J_LazyLoad').lazyload({
        offsetY: 100
      }); 
      if (location.href.indexOf('tms.alibaba-inc.com') < 0) {
        if (!lib.login.isLogin()) { // eslint-disable-line
          lib.login.goLogin(); // eslint-disable-line
        } else { 
          var name = 'userid';
          var md = self.getname(name);
          var name2 = 'username';
          var usename = self.getname(name2);
          var name3 = 'amds';
          var amds = self.getname(name3);
          console.log(md, amds);
          function play() { 
                lib.mtop.request({ // eslint-disable-line
                  'api': 'mtop.user.getUserSimple',
                  'v': '1.0',
                  'ecode': 1,
                },
                 function(res) {
                   self._node.find('.kjalert').attr('data-info', res.data.userNumId);

                   if (md != null && md.toString().length > 1 && md != res.data.userNumId) {
                    
                     console.log(md, res.data.userNumId);
                     console.log(amds);
                       // window.location.hash = '#' + amds;
                     self._node.find('.list').attr('data-show', '1');
                     self.loadData(conf, md, amds); 
                     self.getkj( md, usename); 
                       // self._node.find('.btkj').show();                      
                   } else {
                   
                     console.log('565656', res);
                     var user_id = res.data.userNumId;
                     var username = res.data.nick;
                     var img = '//wwc.alicdn.com/avatar/getAvatar.do?userId=' + user_id + '&width=160&height=160&type=sns';
                      // self._node.find('.lq_top_pic').attr('src', img);
                     self._node.find('.list').attr('data-show', '0');
                     self.loadData(conf, user_id);
                     self.getkj(user_id, username);
                   };
                 },
                 function(res) {
                 }); 
            clearInterval(time);      
          }
          var time = setInterval(play, 500);    
        };
                   
      }
      self.comId = []; 
      
      self.getclose();
    },
    getname: function(name) {
      var self = this;
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'); // 构造一个含有目标参数的正则表达式对象
      var r = window.location.search.substr(1).match(reg);  // 匹配目标参数
      if (r != null) return unescape(r[2]); return null; // 返回参数值           
    },
    // 加载数据
    loadData: function(conf, userid, amds) {
      var self = this;
      function data_fixed(data, conf) {

        var newData = {data: []};
        var d = data.data, items = '';
        var isPostFree1 = '';
        console.log(d, 'd');
        var by = self._conf.moduleinfo.by;// 是否包邮
        for (var i = 0; i < d.length; i++) {

          // if (by === true || by === 'true') {
          //   isPostFree1 = '[包邮]';
          // }
          newData.data[i] = {
            postage: self._conf.moduleinfo.postage,
            itemId: d[i].itemId, // ##商品id，去detail页的连接请自行拼装
            item_title: d[i].title, // ##商品标题
            item_price: d[i].reservePrice, // ##商品原价
            item_pic: d[i].activityPicUrl, // ##商品活动图片相对路径
            decreaseCoin: d[i].decreaseCoin, // ##金币抵扣金币数
            item_current_price: d[i].discountPrice, // 商品现价
            isPostFree: isPostFree1,
            quantity: d[i].quantity, // 原始报名库存
            item_num: d[i].currentSellOut, // 销量
            leftCount: d[i].leftCount, // 当前库存
            status: d[i].status,
            shopId: 'https://shop' + d[i].shopId + '.taobao.com',
            allid: '1' + d[i].itemId.slice(6) + userid
          };
          self.comId.push('1' + d[i].itemId.slice(6) + userid);
        }          
        return newData; 
      }

      function get_data(param, callback, error) {                
        $.jsonp({
          url: '//zhi.taobao.com/json/fantomasItems.htm',
          dataType: 'jsonp',
          data: param,
          success: function(data) {
            callback(data);                                 
          },
          error: function() {
          }
        });
      }
      var PreItemUIs = self._node.find('.J_CommodityWrap');
      var param = {};
      var PreItemUl = null;

      _render(PreItemUIs);

      function _render(PreItemUl) {
          
        PreItemUl = $(PreItemUl);
        param.success = true;
        param.startRow = 0;
        param.haveActivityItems = false;
        param.src = 'coin-tms';
        param.flowId = '36';
        param.appId = '10';
        param.bucketId = 1;
        param.pageSize = self._conf.moduleinfo.pagesize;
        param.blockId = self._conf.moduleinfo.blockId;
        param.viewId = self.getnumbers();
        param.requestId = self.getnumbers();
        param.discountTime = '';
        param.parentActivityIds = self._conf.moduleinfo.parentActivityIds;
        param.activityIds = self._conf.moduleinfo.activityIds;
        param.extQuery = self._conf.moduleinfo.extQuery;
        param.itemIds = self._conf.moduleinfo.itemIds;
        param.tbCat1Ids = self._conf.moduleinfo.tbCat1Ids;
        param.tbCat2Ids = self._conf.moduleinfo.tbCat2Ids;

        get_data(param, function(data) {
          var a = data_fixed(data);
          var arr = [];
          var arr = a.data;
               // console.log(arr,"11")
                
          var sxtj = self._node.find('.km-tab-wrapper').attr('data-sx');
          if (sxtj == 'sales_s') {
                            // 销量升序排序
            arr.sort(function(a, b) {
              return a.item_num - b.item_num; 
            });
          } else if (sxtj == 'sales_x') {
                            // 销量降序排序
            arr.sort(function(a, b) {
              return b.item_num - a.item_num; 
            });
          } else if (sxtj == 'price_s') {
                            // 价格升序
            arr.sort(function(a, b) {
              return a.item_current_price - b.item_current_price; 
            });

          } else if (sxtj == 'price_x') {
                            // 价格降序
            arr.sort(function(a, b) {
              return b.item_current_price - a.item_current_price; 
            });
          } else if (sxtj == 'jinbi_s') {
                            // 抵扣金币数升序排序
            arr.sort(function(a, b) {
              return a.item_jb - b.item_jb; 
            });
          } else if (sxtj == 'jinbi_x') {
                            // 抵扣金币数降序排序
            arr.sort(function(a, b) {
              return b.item_jb - a.item_jb; 
            });
          }
          console.log(amds, 'd看开点开导开导');
          if (amds) {
            for (var i = 0; i < arr.length; i++) {
              if (arr[i].itemId === amds) {
                var toparr = arr[i];
                console.log(toparr, '454588888888');
                arr.splice(i, 1); // 如果数据组存在该元素，则把该元素删除
                // console.log(arr, arr[i].itemId, amds, '哈市哈');
                break;
              }
            } 
            arr.unshift(toparr);
            console.log(arr.length, arr, 'jgddddd');   
          
          }
           
                              
          var newdata = {items: arr}; 
                          
          PreItemUl.html(
            itemTpl(newdata)
          );
          if (self._node.find('.list').attr('data-show') === '1' || self._node.find('.list').attr('data-show') === 1) {
            self._node.find('.btkj').show();
          } 
          console.log(self.comId, 'llll');
          self.getcommentNum(self.comId);  
         // self.zanNum(self.comId);
          self._node.find('.j_lazy').lazyload({
            offsetY: 100
          });



        }, function(data) {
          PreItemUl.html('该活动已下线！');
        });
      }
     
      self._node.find('.j_lazy').lazyload({
        offsetY: 100
      });

    },
    getnumbers: function() {
      var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
      function generateMixed(n, j, k, h, g) {
        var res = '';
        var gh = [n, j, k, h, g];
        for (var p = 0; p < 5; p++) {
          var kk = gh[p];
          for (var i = 0; i < kk; i ++) {
            var id = Math.ceil(Math.random() * 35);
            res += chars[id];
          }
          res += '-';
        }   
        return res;
      }
      var num = generateMixed(8, 4, 4, 4, 8);
      var newstr = num.substring(0, num.length - 1);
      return newstr;
    },
    // 事件绑定
    bindEvent: function() {
      var self = this;
      console.log('22');
      lib.mtop.request({ // eslint-disable-line
        'api': 'mtop.taobao.tejia.fantomas.items',
        'v': '1.0',
        ecode: 0,
        data: {
          appId: 10,
          blockId: 1050,
          startRow: 0,
          pageSize: 30,
          bucketId: 1,
          haveActivityItems: false,
          viewId: self.getnumbers(),
          requestId: self.getnumbers(),
          discountTime: '',
          parentActivityIds: '',
          activityIds: '',
          extQuery: '',
          itemIds: '',
          tbCat1Ids: '',
          tbCat2Ids: ''

        }
      },
      function(res) {
      
      },
      function(res) {
        // console.log(res);
      });
    },
    getkj: function( userid, username) {
      var self = this;
      var userids = userid;
      self._node.on('click', '.lqkj', function(e) {     
        var dataidss = $(e.currentTarget).attr('data-id'); 
        console.log(dataidss, 'lfjfhj');
        self._node.find('.mcbox').show();
        self._node.find('.kjalert').attr('data-amds', dataidss);
        self._node.find('.kjbox').show();  
        self.addzan(dataidss, userids, $(e.currentTarget), username, '1');  
      });
      self._node.on('click', '.kjalert', function(e) {
        var userids = $(e.currentTarget).attr('data-info');
        var amds = $(e.currentTarget).attr('data-amds');
        self.getshare(userids, username, amds);
      });
      self._node.on('click', '.btkj', function(e) {
        var dataid = $(e.currentTarget).attr('dataid');
        // console.log(dataid, 456988);       
        if ($(e.currentTarget).attr('data-num') === '0' || $(e.currentTarget).attr('data-num') === 0) {
          self.addzan(dataid, userids, $(e.currentTarget), username, '2');
        } else {
          new Toast('您已经成功砍价啦！', 2000);
        }
       
      });
    },
    getshare: function( option, username, amds) {
      var self = this;
      var shareurl = self._node.find('.kjalert').attr('data-url') + '&userid=' + option + '&amds=' + amds;
      var title = self._node.find('.kjalert').attr('data-title');
      var text = self._node.find('.kjalert').attr('data-text');
      console.log(shareurl, title, text);
      window.WindVane.call('TBSharedModule', 'showSharedMenu', {
        'title': title,
        'text': text,
        'image': '//gtms01.alicdn.com/tps/i1/TB1_HicKVXXXXbXXFXX289R_VXX-240-240.png',
        'url': shareurl
      },
      function(e) {                                    
        // alert('success: ' + JSON.stringify(e));
      },
      function(e) {
        // alert('failure: ' + JSON.stringify(e));
      });
     
    },
    getclose: function() {
      var self = this;
      self._node.find('.close1').on('click', function() {
        self._node.find('.mcbox').hide();
        self._node.find('.kjbox').hide();
      });
      self._node.find('.close2').on('click', function() {
        self._node.find('.mcbox').hide();
        self._node.find('.okbox').hide();
      });
      // self._node.find('.okalert').on('click', function() {
      //   self._node.find('.mcbox').hide();
      //   self._node.find('.okbox').hide();
      // });
      self._node.find('.okalert1').on('click', function() {
        self._node.find('.mcbox').hide();
        self._node.find('.okbox').hide();
      });
    },
    // 获取点赞情况以及人数
    getcommentNum: function(option) {
      var self = this;
      console.log(option);

      mtop.request({
        api: 'mtop.taobao.social.aggregation.countandstatus',
        v: '1.0',
        ecode: '1',
        data: {
          targetIds: '[' + option.join() + ']',
          likeNamespace: '1007',
          isLikeStatus: true,
          isLikeCount: true
        }
      }, function(res) {
        console.log(res.data);
        // alert('success: ' + JSON.stringify(res));
        for (var i in option) {
          if (res.data[option[i]] && res.data[option[i]][1007].count && res.data[option[i]][1007].count > 0) {
            self._node.find('.ren' + option[i]).show();
            for (var bb = 0; bb < res.data[option[i]][1007].count; bb++) {
              self._node.find('.all' + option[i]).find('.tgz').eq(bb).show();
              if (bb > 3) {
                break;
              }

            }            
          };
          if (res.data[option[i]] && res.data[option[i]][1007].link === 'true' || res.data[option[i]][1007].link === true) {
            self._node.find('.all' + option[i]).attr('data-num', '1');
          };
          if (self._node.find('.list').attr('data-show') === '0' || self._node.find('.list').attr('data-show') === 0) {
            if (res.data[option[i]] && res.data[option[i]][1007].count && res.data[option[i]][1007].count > 2) {   
              var href = self._node.find('.a' + option[i]).attr('data-href');  
              self._node.find('.a' + option[i]).attr('href', href);
              self._node.find('.buy' + option[i]).show();
              self._node.find('.lq' + option[i]).hide(); 
              self._node.find('.shop' + option[i]).show();          
                  // $('.all' + option[i]).find('.tgz').eq(bb).show();                  
            } 
          }
              
        }

        // console.log(res.data, 4444);
        // $.each(res.data, function(k, v) {
        //   console.log(k, v);
        //   var count = v['1007'].count;
        //   var dislick = v['1007'].link; 
        //   console.log(count, dislick, $('.a' + k));
        //   if (self._node.find('.list').attr('data-show') === '0' || self._node.find('.list').attr('data-show') === 0) {
        //     if (v['1007'].count > 11) {
        //       var href = $('.a' + k).attr('data-href');
        //       $('.a' + k).attr('href', href);
        //       self._node.find('.buybtn').show();
        //       self._node.find('.lqkj').hide();
        //     }
        //       $('.all' + k).append('<img src="https://gw.alicdn.com/tps/i3/TB1yeWeIFXXXXX5XFXXuAZJYXXX-210-210.png_80x80.jpg"/>'); 
            
                    
        //   }          
        //   // if(dislick === "true" || dislick === true){            
        //   //   self.$container.find('.follow' + k).removeClass("unfollow").addClass("isfollow");                    
        //   // }
        // });
      });
      
    },
    // 点赞
    addzan: function(userid, userids, elm, username, iffirst) {
      var self = this;
      var params1 = {
        namespace: '1007',
        origin: 'shequ|topic',
        targetId: userid
      };
      window.WindVane.call('WVSocialPlugin', 'like', params1, function(e) {
       // alert('success' + JSON.stringify(e));  
        elm.attr('data-num', '1');
        
        // self._node.find('.getwho').html('您的好友');
        if (iffirst === '2' || iffirst === 2 ) {
          self._node.find('.okbox').show();
          self._node.find('.mcbox').show();
        }        
        self.getcommentNum(self.comId);
      }, function(e) {
        // alert('failure' + JSON.stringify(e));   
          
      });
     
    },
      
  };

  return Mod;

});
