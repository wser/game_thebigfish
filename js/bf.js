class KAPI {
  constructor() {
    this._appID = 0;
    this._unit = null;
    this._initResp = null;
    this._scoreResp = null;
    this._savedResp = null;
    this._loginWindow = null;
    this._user = null;
    this._spublic = !0;
    this._resendTO = 0;
    this.getScore = null;
    this.user = function () {
      return this._user;
    };
    this._scoresLoaded = function (t) {
      var e = JSON.parse(t.target.response);
      this._scoreResp(e.scores);
    };
    this._receiveMessage = function (t) {
      var e = t.data.split(',');
      'kapi_logged_in' == e[0] &&
        ((localStorage[this._appID + '_uid'] = e[1]),
        this._setToken(e[2]),
        (localStorage[this._appID + '_provider'] = e[3]),
        this._loginWindow.close(),
        location.reload());
    };
    this._setToken = function (t) {
      var e = localStorage[this._appID + '_token'];
      (null != e && parseInt(t.split('-')[0]) < parseInt(e.split('-')[0])) ||
        ((localStorage[this._appID + '_token'] = t),
        clearTimeout(this._resendTO),
        (this._resendTO = setTimeout(
          this._resend,
          1e3 * parseInt(t.split('-')[0]) - Date.now() - 2e4
        )));
    };
    this._openURL = function (t) {
      var e = document.createElement('a');
      e.setAttribute('href', t), e.setAttribute('target', '_new');
      var i = document.createEvent('MouseEvents');
      //prettier-ignore
      i.initMouseEvent('click', !0,!0, document.defaultView, 1, 0, 0, 0, 0, !1, !1, !1,!1, 0, null ),
        e.dispatchEvent(i);
    };
  }
  GetScorePublic = function () {
    return this._spublic;
  };
  SetScorePublic = function (t, e) {
    this._spublic = t;
    this._savedResp = e;
    this.SaveRecord(this.GetRecord());
  };
  LoadScores = function (t, e, i) {
    this._scoreResp = i;
    var s = new XMLHttpRequest();
    s.open(
      'GET',
      '//kapi.ivank.net/scores.php?app=' +
        KAPI._appID +
        '&since=' +
        t +
        '&limit=' +
        e,
      !0
    ),
      (s.onload = this._scoresLoaded),
      s.send();
  };
}

class Model {
  constructor() {
    this.nof = 20;
    this.ffr = 10;
    this.acoeff = 4e3;
    this.area = 0;
    this.bArea = 0;
    this.w2h = 1;
    this.maprx = 0;
    this.mapry = 0;
    this.over = !1;
    this.sizeChanged = !1;
    this.mfish = new MFish();
    this.fishes = [];
    this.around = (t) => t * (0.75 + 1.2 * Math.random());

    for (var t = 0; t < this.nof; t++) this.fishes.push(new MFish());
  }
  Reset = function () {
    (this.area = this.bArea = this.ffr * this.ffr * this.acoeff),
      this.updateMapSize(),
      this.mfish.SetRad(this.ffr),
      (this.mfish.x = this.mfish.y = 0);
    for (var t = 0; t < this.nof; t++) this.ResetFish(t);
  };
  IsOver = function () {
    var t = this.over;
    return (this.over = !1), t;
  };
  SizeChanged = function () {
    var t = this.sizeChanged;
    return (this.sizeChanged = !1), t;
  };
  SetFishPos = function (t, e) {
    (this.mfish.x = t), (this.mfish.y = e);
  };
  Step = function (t) {
    this.mfish.x, this.mfish.y;
    var e = this.mfish.rad,
      i = 4 * this.mfish.rad;
    (e * e * this.acoeff) / this.bArea > 4 &&
      ((this.bArea *= 4),
      (this.area *= 2),
      this.updateMapSize(),
      (this.sizeChanged = !0));
    for (var s = 0; s < this.fishes.length; s++) {
      var h = this.fishes[s],
        n = 0.14 * e * (0.5 + 0.5 * Math.random()),
        o = 0.14 * e * (0.5 + 0.5 * Math.random()),
        a = Math.random() > 0.5 ? 1 : -1;
      h.x < -this.maprx - i
        ? (h.SetDir(n, a * o), h.SetRad(this.around(e)))
        : h.x > this.maprx + i &&
          (h.SetDir(-n, a * o), h.SetRad(this.around(e))),
        h.y < -this.mapry - i
          ? (h.SetDir(a * n, o), h.SetRad(this.around(e)))
          : h.y > this.mapry + i &&
            (h.SetDir(a * n, -o), h.SetRad(this.around(e))),
        Point.distance(this.mfish, h) < e + h.rad &&
          (h.rad > e
            ? (this.over = !0)
            : (this.mfish.AddToRad(0.08 * h.rad), this.ResetFish(s))),
        (h.x += t * h.dir.x),
        (h.y += t * h.dir.y);
    }
  };
  ResetFish = function (t) {
    var e = this.fishes[t];
    e.SetRad(this.around(this.mfish.rad));
    var i = this.mfish.rad,
      s = 0.14 * i * (0.5 + 0.5 * Math.random()),
      h = 0.14 * i * (0.5 + 0.5 * Math.random());
    Math.random() < 0.5 ? (e.x = -this.maprx) : (e.x = this.maprx),
      e.SetDir(s, h),
      (e.y = -this.mapry + 2 * Math.random() * this.mapry);
  };
  SetSizeRatio = function (t) {
    (this.w2h = t), this.updateMapSize();
  };
  updateMapSize = function () {
    (this.mapry = 0.5 * Math.sqrt(this.area / this.w2h)),
      (this.maprx = this.w2h * this.mapry);
  };
}

class MFish {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.rad = 0;
    this.dir = new Point(1, 1);
  }
  SetRad = function (t) {
    this.rad = t;
  };
  AddToRad = function (t) {
    this.rad += t;
  };
  SetDir = function (t, e) {
    (this.dir.x = t), (this.dir.y = e);
  };
}
class View extends Sprite {
  constructor(t) {
    super(t);
    this.model = t;
    this.mfish = new Fish();
    this.addChild(this.mfish);
    this.fishes = [];
    for (var e = 0; e < t.nof; e++) {
      var i = new Fish();
      this.fishes.push(i), this.addChild(i);
    }
  }
  Update = function () {
    var t = this.model;
    (this.mfish.x = t.mfish.x),
      (this.mfish.y = t.mfish.y),
      this.mfish.UpdateRadDir(t.mfish.rad, 1),
      this.mfish.update();
    for (var e = 0; e < t.fishes.length; e++) {
      var i = this.fishes[e];
      i.update();
      var s = t.fishes[e];
      (i.x = s.x), (i.y = s.y), i.UpdateRadDir(s.rad, s.dir.x);
    }
  };
}
class Controller extends Resizable {
  constructor(t, e) {
    super(t);

    this.w = t;
    this.h = e;
    this.paused = !0;
    this.bg = new Background(t, e);
    this.addChild(this.bg);
    this.model = null;
    this.view = null;
    this.mcont = null;
    this.time = Date.now();
    KAPI.init(
      4,
      'Length (cm)',
      function (t) {
        return t.tlength;
      },
      this.apiInit.bind(this)
    );
  }
  apiInit = function () {
    (this.model = new Model()),
      (this.view = new View(this.model)),
      this.addChild(this.view),
      (this.mcont = new MarginCont(1024, 24)),
      this.addChild(this.mcont),
      (this.topLength = 10),
      null != KAPI.GetRecord()
        ? (this.topLength = KAPI.GetRecord().tlength)
        : null != readCookie('topLength') &&
          (KAPI.SaveRecord({ tlength: Math.floor(readCookie('topLength')) }),
          (this.topLength = KAPI.GetRecord().tlength)),
      (this.tln = new FlipNum(28, 16777215, 'Top length: ', ' cm')),
      this.mcont.add(this.tln, 0),
      this.tln.SetDirectly(this.topLength),
      (this.cln = new FlipNum(42, 16777215, '', ' cm')),
      this.mcont.add(this.cln, 0);
    var t = new KAPI.UI.Panel();
    (t.scaleX = t.scaleY = 0.75),
      this.mcont.add(t, 2),
      this.addEventListener2(Event.ENTER_FRAME, this.onEF, this),
      this.resize(this.w, this.h);
  };
  Start = function () {
    this.model.Reset(),
      this.cln.SetDirectly(this.model.mfish.rad),
      this.UpdateViewScale(),
      (this.paused = !1);
  };
  resize = function (t, e) {
    Resizable.prototype.resize.call(this, t, e),
      this.bg.resize(t, e),
      null != this.model &&
        (this.model.SetSizeRatio(t / e),
        (this.view.x = 0.5 * t),
        (this.view.y = 0.5 * e),
        this.mcont.resize(t, e),
        this.UpdateViewScale());
  };
  UpdateViewScale = function () {
    if (0 != this.model.mapry) {
      this.w;
      var t = (0.5 * this.h) / this.model.mapry;
      Tweener.addTween(this.view, {
        scaleX: t,
        scaleY: t,
        transition: 'easeInOutSine',
        time: 1,
      }),
        this.bg.UpdateScale(t);
    }
  };
  onEF = function (t) {
    if (!this.paused) {
      var e = Math.min(Date.now() - this.time, 500);
      (this.time = Date.now()),
        this.model.SetFishPos(this.view.mouseX, this.view.mouseY),
        this.model.Step(e / 17),
        this.view.Update();
      var i = this.model.mfish.rad;
      this.cln.SetNum(i),
        i > this.topLength &&
          ((this.topLength = Math.floor(i)),
          KAPI.SaveRecord({ tlength: this.topLength }),
          this.tln.SetNum(i)),
        this.model.IsOver() &&
          ((this.paused = !0), this.dispatchEvent(new Event('over'))),
        this.model.SizeChanged() && this.UpdateViewScale();
    }
  };
}

function createCookie(t, e, i) {
  if (i) {
    var s = new Date();
    s.setTime(s.getTime() + 24 * i * 60 * 60 * 1e3);
    var h = '; expires=' + s.toGMTString();
  } else h = '';
  document.cookie = t + '=' + e + h + '; path=/';
}
function readCookie(t) {
  for (
    var e = t + '=', i = document.cookie.split(';'), s = 0;
    s < i.length;
    s++
  ) {
    for (var h = i[s]; ' ' == h.charAt(0); ) h = h.substring(1, h.length);
    if (0 == h.indexOf(e)) return h.substring(e.length, h.length);
  }
  return null;
}
function eraseCookie(t) {
  createCookie(t, '', -1);
}

class BFMain extends Resizable {
  constructor(t, e) {
    super(t);
    this.w = t;
    this.h = e;
    BDFac.load('intro', 'bf_pics/intro.png');
    BDFac.addEventListener2(Event.COMPLETE, this.showIntro, this);
  }
  showIntro = function (t) {
    var e = BDFac.get('intro');
    (this.icont = new RectCont(e.width, e.height, !1)),
      this.addChild(this.icont);
    var i = new Bitmap(e);
    (i.alpha = 0),
      Tweener.addTween(i, { alpha: 1, time: 1, transition: 'easeInOutSine' }),
      Tweener.addTween(i, {
        alpha: 0,
        time: 0.5,
        delay: 2,
        transition: 'easeInOutSine',
      }),
      this.icont.add(i),
      this.resize(this.w, this.h),
      setTimeout(this.init.bind(this), 2500);
  };
  init = function () {
    this.removeChild(this.icont),
      (this.game = new Controller(100, 100)),
      this.game.addEventListener2('over', this.over, this),
      this.addChild(this.game),
      (this.cont = new RectCont(1024, 1024)),
      this.addChild(this.cont),
      (this.panel = new Panel()),
      this.panel.pbtn.addEventListener2(MouseEvent.CLICK, this.goPlay, this),
      this.cont.add(this.panel),
      this.resize(this.w, this.h),
      this.panel.Show(300);
  };
  resize = function (t, e) {
    Resizable.prototype.resize.call(this, t, e),
      this.icont && this.icont.resize(t, e),
      this.game && this.game.resize(t, e),
      this.cont && this.cont.resize(t, e),
      this.panel &&
        (this.panel.hidden ? (this.panel.y = 1200) : (this.panel.y = 300));
  };
  over = function (t) {
    this.panel.Show(300);
  };
  goPlay = function (t) {
    this.panel.Hide(1200), this.game.Start();
  };
}

class Background extends Resizable {
  constructor(t, e) {
    super(t);
    this.w = t;
    this.h = e;
    this.bg, (this.bubbles = []);
    this.corals = [];
    this.t = 0;
    this.mouseChildren = !1;
    this.mouseEnabled = !1;
    var i = new BitmapData('bf_pics/blue_bg.jpg');
    i.loader.addEventListener2(Event.COMPLETE, this.onBDLoaded, this),
      (this.bg = new Bitmap(i)),
      this.addChild(this.bg),
      (this.stuff = new Sprite()),
      this.addChild(this.stuff);
    for (var s = new BitmapData('bf_pics/bubble.png'), h = 0; h < 20; h++) {
      var n = new Bitmap(s);
      this.bubbles.push(n),
        this.stuff.addChild(n),
        (n.x = -t / 2 + Math.random() * t),
        (n.y = -e / 2 + Math.random() * e),
        (n.scaleX = n.scaleY = 0.14 + 0.4 * Math.random()),
        (n.alpha = 0.1 + 0.5 * n.scaleX);
    }
    var o = new BitmapData('bf_pics/coral.png');
    for (h = 0; h < 10; h++) {
      n = new Bitmap(o);
      this.corals.push(n),
        this.stuff.addChild(n),
        (n.y = 140 + (h % 4) * 80),
        (n.alpha = 0.4 + (h % 2 == 0 ? 0 : 0.25)),
        (n.scaleX = n.scaleY = 1.4 + Math.random() * (h % 2 == 0 ? 0.7 : 0.4));
    }
    this.addEventListener2(Event.ENTER_FRAME, this.onEF, this);
  }
  resize = function (t, e) {
    this.w;
    Resizable.prototype.resize.call(this, t, e),
      (this.bg.scaleX = t / 800),
      (this.bg.scaleY = e / 600),
      (this.stuff.x = t / 2),
      (this.stuff.y = e / 2);
  };
  onBDLoaded = function (t) {
    this.resize(this.w, this.h);
  };
  UpdateScale = function (t) {
    Tweener.addTween(this.stuff, {
      scaleX: t,
      scaleY: t,
      transition: 'easeInOutSine',
      time: 1,
    });
  };
  onEF = function (t) {
    var e = t.target;
    ++e.t;
    for (var i, s = 1 / this.stuff.scaleX, h = 0; h < e.bubbles.length; h++) {
      ((o = e.bubbles[h]).y -= 10 * o.scaleX * o.scaleX),
        o.y < -0.5 * this.h * s &&
          ((o.y = 0.5 * this.h * s),
          (o.x = (-0.5 * e.w + Math.random() * e.w) * s));
    }
    var n = 0.1 * e.w * 1.05;
    for (h = 0; h < e.corals.length; h++) {
      var o = e.corals[h];
      (i = -0.7 * this.w + h * n),
        (o.x = i + 50 * Math.sin(0.02 * (0.15 * i + e.t)));
    }
  };
}

class Panel extends Sprite {
  constructor() {
    super();
    this.hidden = !1;
    var t = new Bitmap(new BitmapData('bf_pics/title.png'));
    this.addChild(t);
    var e = new CText('Eat fish that are smaller than you.', 4),
      i = new CText('Avoid fish that are bigger than you.', 4);
    (e.x = (1024 - e.width) / 2),
      (i.x = (1024 - i.width) / 2),
      (e.y = 205),
      (i.y = 280);
    this.addChild(e);
    this.addChild(i);
    this.pbtn = new Button('Play');
    this.pbtn.x = (1024 - this.pbtn.width) / 2;
    this.pbtn.y = 380;
    this.addChild(this.pbtn);
  }
  Show = function (t) {
    (this.hidden = !1), Tweener.addTween(this, { y: t, time: 0.5 });
  };
  Hide = function (t) {
    (this.hidden = !0), Tweener.addTween(this, { y: t, time: 0.5 });
  };
}

class Fish extends Sprite {
  constructor() {
    super();
    this.mouseEnabled = !1;

    this.mouseChildren = !1;
    this.t = 0;
    this.v = 0;
    this.rad = 100;
    null == Fish.bodyTex &&
      ((Fish.bodyTex = new BitmapData('bf_pics/fish/body.png')),
      (Fish.eyesTex = new BitmapData('bf_pics/fish/eye.png')),
      (Fish.flipTex = new BitmapData('bf_pics/fish/flip.png')));
    this.body = new Bitmap(Fish.bodyTex);
    this.body.x = -180;
    this.body.y = -140;
    this.addChild(this.body);
    this.flip = new Bitmap(Fish.flipTex);
    this.flip.x = 20;
    this.flip.y = 45;
    this.addChild(this.flip);
    this.leye = new MBitmap(Fish.eyesTex, 5);
    this.reye = new MBitmap(Fish.eyesTex, 5);
    this.leye.x = 55;
    this.leye.y = -75;
    this.leye.scaleX = this.leye.scaleY = 0.8;
    this.reye.x = 10;
    this.reye.y = -65;
    this.addChild(this.leye), this.addChild(this.reye), (this.blinking = !1);
    this.blinkI = 0;
  }
  update = function () {
    if (
      (++this.t,
      (this.flip.rotation = 60 + 40 * Math.sin((this.v * this.t) / this.rad)),
      this.blinking)
    ) {
      var t = this.blinkI < 5 ? this.blinkI : 9 - this.blinkI;
      this.leye.gotoAndStop(t),
        this.reye.gotoAndStop(t),
        ++this.blinkI,
        10 == this.blinkI && ((this.blinking = !1), (this.blinkI = 0));
    } else this.blinking = Math.random() < 0.02;
  };
  UpdateRadDir = function (t, e) {
    if (t != this.rad) {
      (this.v = (40 * e) / t), (this.rad = t);
      var i = 0.01 * this.rad;
      Tweener.addTween(this, {
        scaleX: (e < 0 ? -1 : 1) * i,
        scaleY: i,
        transition: 'easeOutElastic',
        time: 0.5,
      });
    }
  };
}

class CText extends Sprite {
  constructor(t, e, i) {
    super();
    this.mouseChildren = !1;
    e || (e = 2), i || (i = 44);
    this.tfr = new TextFormat('Trebuchet MS', i, 16777215);
    this.tf = new TextField();
    this.tf.setTextFormat(this.tfr);
    this.tf.text = t;
    this.tf.width = this.tf.textWidth;
    this.tf.height = this.tf.textHeight;
    this.tf.x = this.tf.y = e;
    this.addChild(this.tf);
    this.pad = e;
    this.graphics.beginFill(0, 0.4);
    this.graphics.drawRect(0, 0, this.tf.width + 2 * e, this.tf.height + 2 * e);
  }
  SetText = function (t) {
    this.tf.setText(t);
  };
}

class FlipNum extends Sprite {
  constructor(t, e, i, s) {
    super();
    null == t && (t = 26);
    null == e && (e = 16777215);
    null == i && (i = '');
    null == s && (s = '');
    this.prefix = i;
    this.suffix = s;
    this.cnum = -1;
    this.tnum = -1;
    this.tfr = new TextFormat('Trebuchet MS', t, e, !0);
    this.tf = new TextField();
    this.tf.selectable = !1;
    this.tf.setTextFormat(this.tfr);
    this.SetDirectly(0);
    this.addChild(this.tf);
  }
  SetNum = function (t) {
    t != this.tnum &&
      ((this.tnum = t),
      (this.tf.text = this.prefix + t + this.suffix),
      (this.tf.width = this.tf.textWidth),
      (this.tf.height = this.tf.textHeight),
      Tweener.addTween(this, { cnum: t, time: 0.6, transition: 'easeOutSine' }),
      this.addEventListener2(Event.ENTER_FRAME, this.onEF, this));
  };
  SetDirectly = function (t) {
    t != this.tnum &&
      ((this.tnum = this.cnum = t),
      (this.tf.text = this.prefix + t + this.suffix),
      (this.tf.width = this.tf.textWidth),
      (this.tf.height = this.tf.textHeight));
  };
  onEF = function (t) {
    this.cnum == this.tnum &&
      this.removeEventListener(Event.ENTER_FRAME, this.onEF, this);
    var e = this.prefix + Math.floor(this.cnum) + this.suffix;
    e != this.tf.text &&
      ((this.tf.text = e),
      (this.tf.width = this.tf.textWidth),
      (this.tf.height = this.tf.textHeight));
  };
}

class Button extends Sprite {
  constructor(t) {
    super();
    this.mouseChildren = !1;
    this.buttonMode = !0;
    this.tf = new TextField();
    this.tf.setTextFormat(Button.tfr);
    this.tf.text = t;
    this.tf.width = this.tf.textWidth;
    this.tf.height = this.tf.textHeight;
    this.tf.x = 8;
    this.tf.y = 4;
    this.addChild(this.tf);
    this.graphics.beginFill(4294932224);
    this.graphics.drawRect(0, 0, this.tf.width + 16, this.tf.height + 8);
  }
}

(KAPI.online = function () {
  return null != KAPI._getToken();
}),
  (KAPI.init = function (t, e, i, s) {
    (KAPI._appID = t),
      (KAPI._unit = e),
      (KAPI._initResp = s),
      (KAPI.getScore = i),
      window.addEventListener('message', KAPI._receiveMessage, !1),
      KAPI._getToken() ? KAPI._loadNetRecord() : KAPI._initResp();
  }),
  (KAPI.login = function () {
    var t =
      '//kapi.ivank.net/login.php?redirect=' +
      encodeURIComponent(window.location.href);
    KAPI._loginWindow = window.open(t, '_blank');
  }),
  // (KAPI),
  (KAPI._getToken = function () {
    var t = localStorage[KAPI._appID + '_token'];
    return null != t && 0.001 * Date.now() + 10 < parseInt(t.split('-')[0])
      ? t
      : null;
  }),
  //(KAPI.),
  (KAPI._resend = function () {
    var t = new XMLHttpRequest();
    t.open('POST', '//kapi.ivank.net/record.php', !0),
      (t.onload = KAPI._recordResent);
    var e = KAPI._netRecordParams() + '&read=2';
    t.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'),
      t.send(e);
  }),
  (KAPI._loadNetRecord = function () {
    var t = new XMLHttpRequest();
    t.open('POST', '//kapi.ivank.net/record.php', !0),
      (t.onload = KAPI._recordLoaded);
    var e = KAPI._netRecordParams() + '&read=1';
    t.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'),
      t.send(e);
  }),
  (KAPI._saveNetRecord = function (t) {
    var e = new XMLHttpRequest();
    e.open('POST', '//kapi.ivank.net/record.php', !0),
      (e.onload = KAPI._recordSaved);
    var i =
      KAPI._netRecordParams() +
      '&read=0&score=' +
      KAPI.getScore(t) +
      '&spublic=' +
      KAPI._spublic +
      '&record=' +
      encodeURIComponent(JSON.stringify(t));
    e.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'),
      e.send(i);
  }),
  (KAPI._recordLoaded = function (t) {
    var e = JSON.parse(t.target.response);
    if (e.error);
    else {
      KAPI._user = e.user;
      var i = KAPI._getLocalRecord(),
        s = e.record;
      e.record
        ? ((KAPI._spublic = e.spublic),
          null == i || KAPI.getScore(s) >= KAPI.getScore(i)
            ? KAPI._saveLocalRecord(s)
            : KAPI._saveNetRecord(i))
        : i && KAPI._saveNetRecord(i);
    }
    KAPI._setToken(e.token), KAPI._initResp();
  }),
  (KAPI._recordResent = function (t) {
    var e = JSON.parse(t.target.response);
    KAPI._setToken(e.token);
  }),
  (KAPI._recordSaved = function (t) {
    var e = JSON.parse(t.target.response);
    KAPI._setToken(e.token),
      KAPI._savedResp && (KAPI._savedResp(), (KAPI._savedResp = null));
  }),
  (KAPI._netRecordParams = function () {
    return (
      'app=' +
      KAPI._appID +
      '&uid=' +
      localStorage[KAPI._appID + '_uid'] +
      '&token=' +
      localStorage[KAPI._appID + '_token']
    );
  }),
  (KAPI.GetRecord = function () {
    return KAPI._getLocalRecord();
  }),
  (KAPI.SaveRecord = function (t) {
    KAPI._saveLocalRecord(t), KAPI.online() && KAPI._saveNetRecord(t);
  }),
  (KAPI._getLocalRecord = function () {
    var t,
      e = localStorage[KAPI._appID + '_stateLocal'],
      i = localStorage[KAPI._appID + '_hashLocal'];
    if (null == e || md5(e + 'x62a1fz-3vb') != i) return null;
    try {
      t = JSON.parse(e);
    } catch (t) {
      return null;
    }
    return t;
  }),
  (KAPI._saveLocalRecord = function (t) {
    var e = JSON.stringify(t);
    (localStorage[KAPI._appID + '_stateLocal'] = e),
      (localStorage[KAPI._appID + '_hashLocal'] = md5(e + 'x62a1fz-3vb'));
  }),
  (KAPI._queryParam = function (t) {
    t = t.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var e = new RegExp('[\\?&]' + t + '=([^&#]*)').exec(location.search);
    return null === e ? null : decodeURIComponent(e[1].replace(/\+/g, ' '));
  }),
  //(KAPI),
  (KAPI.UI = {}),
  (KAPI.UI.Panel = function () {
    var t;
    Sprite.call(this),
      (this.stagePointer = null),
      KAPI.online()
        ? (t = new KAPI.UI.Button('Hi ' + KAPI.user().name + '!', 8, 40))
        : (t = new KAPI.UI.Button('Log in')).addEventListener(
            MouseEvent.CLICK,
            KAPI.login
          ),
      this.addChild(t),
      (this.scoreCont = new RectCont(1024, 1024)),
      (this.sp = new KAPI.UI.ScorePanel()),
      this.sp.cross.addEventListener2(MouseEvent.CLICK, this.hideScores, this),
      (this.sp.x = (1024 - this.sp.width) / 2),
      (this.sp.y = (1024 - this.sp.height) / 2),
      this.scoreCont.add(this.sp),
      (this.scoreBTN = new KAPI.UI.Button('Top Scores')),
      this.scoreBTN.addEventListener2(MouseEvent.CLICK, this.showScores, this),
      this.addChild(this.scoreBTN),
      (this.scoreBTN.y = t.height + 20),
      this.addEventListener2(Event.ADDED_TO_STAGE, this.onATS, this);
  }),
  Sprite && (KAPI.UI.Panel.prototype = new Sprite()),
  (KAPI.UI.Panel.prototype.onATS = function (t) {
    (this.stagePointer = this.stage),
      this.removeEventListener(Event.ADDED_TO_STAGE, this.onATS),
      this.stage.addEventListener2(Event.RESIZE, this.onResize, this),
      this.scoreCont.resize(this.stage.stageWidth, this.stage.stageHeight);
  }),
  (KAPI.UI.Panel.prototype.onResize = function (t) {
    this.scoreCont.resize(
      t.currentTarget.stageWidth,
      t.currentTarget.stageHeight
    );
  }),
  (KAPI.UI.Panel.prototype.showScores = function () {
    this.stage.contains(this.scoreCont) ||
      (this.stage.addChild(this.scoreCont), this.sp.Update());
  }),
  (KAPI.UI.Panel.prototype.hideScores = function () {
    this.stagePointer.removeChild(this.scoreCont);
  }),
  (KAPI.UI.ScorePanel = function () {
    Sprite.call(this),
      this.graphics.beginFill(11184810),
      this.graphics.drawRect(0, 0, 900, 80),
      this.graphics.beginFill(16777215),
      this.graphics.drawRect(0, 80, 900, 820),
      (this.rect = new Sprite()),
      this.rect.graphics.beginFill(16755200),
      this.rect.graphics.drawRect(0, 0, 270, 80),
      this.addChild(this.rect),
      (this.cpanel = 1),
      (this.waiting = !1),
      (this.tbtns = []),
      (this.titems = []);
    for (var t = ['All Time', 'This Week', 'Today'], e = 0; e < 3; e++) {
      var i = new KAPI.UI.Button(t[e], 0, 42, !1);
      (i.x = 270 * e + (270 - i.width) / 2),
        (i.y = (80 - i.height) / 2),
        this.addChild(i),
        this.tbtns.push(i),
        i.addEventListener2(MouseEvent.CLICK, this.timeClick, this);
    }
    (this.cross = new KAPI.UI.Button('✖', 0, 60, !1)),
      (this.cross.x = this.width - 90 + (90 - this.cross.width) / 2),
      (this.cross.y = (80 - this.cross.height) / 2),
      this.addChild(this.cross),
      (this.publishBTN = new KAPI.UI.Button('Publish', 6, 34)),
      (this.publishBTN.x = 20),
      (this.publishBTN.y = this.height - this.publishBTN.height - 20),
      this.publishBTN.addEventListener2(
        MouseEvent.CLICK,
        this.switchPublishing,
        this
      ),
      this.addChild(this.publishBTN);
  }),
  Sprite && (KAPI.UI.ScorePanel.prototype = new Sprite()),
  (KAPI.UI.ScorePanel.prototype.switchPublishing = function (t) {
    this.waiting ||
      ((this.waiting = !0),
      KAPI.SetScorePublic(!KAPI.GetScorePublic(), this.Update.bind(this)));
  }),
  (KAPI.UI.ScorePanel.prototype.timeClick = function (t) {
    if (!this.waiting) {
      var e = this.tbtns.indexOf(t.currentTarget);
      (this.cpanel = e), this.Update();
    }
  }),
  (KAPI.UI.ScorePanel.prototype.Update = function () {
    (this.waiting = !0), (this.rect.x = 270 * this.cpanel);
    var t = 0;
    1 == this.cpanel && (t = Math.round(Date.now() / 1e3) - 604800),
      2 == this.cpanel && (t = Math.round(Date.now() / 1e3) - 86400),
      KAPI.LoadScores(t, 10, this.scoresLoaded.bind(this));
  }),
  (KAPI.UI.ScorePanel.prototype.scoresLoaded = function (t) {
    for (this.waiting = !1; this.titems.length > 0; )
      this.removeChild(this.titems.pop());
    t.unshift([-1, 'Name', KAPI._unit]);
    for (var e = 0; e < t.length; e++) {
      var i = 100 + 65 * e,
        s =
          0 == e
            ? 0
            : t[e][0] == localStorage[KAPI._appID + '_uid']
            ? 26367
            : 3355443,
        h = new KAPI.UI.Button(e + '.', 0, 40, !1, s, !1);
      (h.x = 110 - h.width),
        (h.y = i),
        e > 0 && (this.addChild(h), this.titems.push(h));
      var n = new KAPI.UI.Button(t[e][1], 0, 40, !1, s, !1);
      (n.x = 150), (n.y = i), this.addChild(n), this.titems.push(n);
      var o = new KAPI.UI.Button(t[e][2], 0, 40, !1, s, !1);
      (o.x = 840 - o.width),
        (o.y = i),
        this.addChild(o),
        this.titems.push(o),
        (h.buttonMode = n.buttonMode = o.buttonMode = !1);
    }
    (this.publishBTN.visible = KAPI.online()),
      KAPI.online() &&
        this.publishBTN.SetText(
          KAPI.GetScorePublic() ? "Don't publish my score" : 'Publish my score'
        );
  }),
  (KAPI.UI.Button = function (t, e, i, s, h, n) {
    Sprite.call(this),
      (this.mouseChildren = !1),
      null == e && (e = 12),
      null == i && (i = 52),
      null == s && (s = !0),
      null == h && (h = 16777215),
      null == n && (n = !0),
      (this.sbg = s),
      this.sbg && ((this.bg = new Sprite()), this.addChild(this.bg)),
      (this.buttonMode = !0),
      (this.tf = new TextField()),
      this.addChild(this.tf),
      (KAPI.UI.Button.tfr.size = i),
      (KAPI.UI.Button.tfr.color = h),
      (KAPI.UI.Button.tfr.bold = n),
      this.tf.setTextFormat(KAPI.UI.Button.tfr),
      (this.tf.x = 1.7 * e),
      (this.tf.y = e),
      (this.pad = e),
      this.SetText(t);
  }),
  Sprite && (KAPI.UI.Button.prototype = new Sprite()),
  null != TextFormat &&
    (KAPI.UI.Button.tfr = new TextFormat('Trebuchet MS', 25, 16777215, !0)),
  (KAPI.UI.Button.prototype.SetText = function (t) {
    if (t != this.tf.text) {
      this.tf.text = t;
      var e = this.pad,
        i = this.tf.textWidth,
        s = this.tf.textHeight + 1;
      (this.tf.width = i), (this.tf.height = s);
      var h = i + 3.4 * e,
        n = s + 2 * e;
      this.sbg &&
        (this.bg.graphics.clear(),
        this.bg.graphics.beginFill(1713022),
        this.bg.graphics.drawRoundRect(0, 0, h, n, n / 2, n / 2));
    }
  }),
  (Button.prototype = new Sprite()),
  (Button.tfr = new TextFormat('Trebuchet MS', 50, 16777215, !0));
