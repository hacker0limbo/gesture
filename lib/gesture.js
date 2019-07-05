/**
 * 基本事件为: tap, long tap, double tap, swipe(left, right, up, down)
 */
export default class Gesture {
  constructor(el) {
    if (typeof el === 'string') {
      this.element = document.querySelector(el)
    } else {
      this.element = el
    }
    this.handlers = {
      touchstart: [],
      touchend: [],
      touchmove: [],
      tap: [],
      longtap: [],
      doubletap: [],
      pinch: [],
      rotate: [],
      swipe: [],
      swipeleft: [],
      swiperight: [],
      swipeup: [],
      swipedown: [],
    }

    // 滑动时间差
    this.delta = null
    // 初始时间
    this.last = null
    // 结束时间
    this.now = null
    this.tapTimeout = null
    this.longTapTimeout = null
    // x1, y1 为 touchstart 时候手指坐标, x2, y2 为 touchmove 移动以后手指的坐标
    this.x1 = this.x2 = this.y1 = this.y2 = null
    // 存储了前一次 touch 时候的坐标(类似于 preX1, preX2)
    this.preTapPosition = { 
      x: null, 
      y: null 
    }

    // 配置, 可以自定义数据
    this.config = {
      // 移动后单指之前与之后的距离限制, 超过 30 为 swipe
      distance: 30,
      // long tap 的触发时间
      longTapInterval: 800,
      // 普通 tap 的触发时间 300
      tapInterval: 300,
    }

    // 是否是双击
    this.isDoubleTap = false

    // 修改 this 的引用
    this._touchStart = this._touchStart.bind(this)
    this._touchMove = this._touchMove.bind(this)
    this._touchEnd = this._touchEnd.bind(this)

    this.bind()
  }

  dispatch(type, evt) {
    // 由于一个事件可以绑定多个回调函数, 同时需要注意, 这里保证回调函数里面的 this 为 this.element, 即监听的元素
    this.handlers[type].forEach(handler => handler.call(this.element, evt))
  }

  bind() {
    // 绑定基本事件
    this.element.addEventListener('touchstart', this._touchStart, false)
    this.element.addEventListener('touchmove', this._touchMove, false)
    this.element.addEventListener('touchend', this._touchEnd, false)
  }

  _touchStart(evt) {
    // 阻止长按发生的弹出菜单效果
    if (evt.cancelable) {
      event.preventDefault()
    }
    // 执行原生 
    this.dispatch('touchstart', evt)

    this.x1 = evt.touches[0].pageX
    this.y1 = evt.touches[0].pageY
    // 强行更新, 防止出现直接跳过 touchmove 事件而造成的 x2, y2 仍旧为上一次 touch 时候的值
    this.x2 = null
    this.y2 = null
    // 获取触发的时间
    this.now = Date.now()

    // 如果非第一次 tap, 设置与之前一次的时间间隔
    if (this.last) {
      this.delta = this.now - this.last
    } else {
      this.delta = 0
    }

    // 由于会有多次触摸的情况, 单击事件和双击针对单次触摸，故先清空定时器
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout)
    }

    if (this.longTapTimeout) {
      clearTimeout(this.longTapTimeout)
    }

    this.longTapTimeout = setTimeout(() => {
      // 手指触摸后立即开启长按定时器，800ms后执行
      this.isDoubleTap = false
      this.dispatch('longtap', evt)
      // 阻止默认事件的触发
    }, this.config.longTapInterval)

    if (this.preTapPosition !== null) {
      // 双击是两次独立单击的行为, 满足两次单机时间间隔不超过 tapInterval(300), 两次单机距离不超过distance(30)
      this.isDoubleTap = (this.delta > 0 && this.delta <= this.config.tapInterval
        && Math.abs(this.x1 - this.preTapPosition.x) < this.config.distance
        && Math.abs(this.y1 - this.preTapPosition.y) < this.config.distance)
      if (this.isDoubleTap) {
        clearTimeout(this.tapTimeout)
        clearTimeout(this.longTapTimeout)
      }

    }

    // 将数据更新为之前数据
    this.preTapPosition.x = this.x1
    this.preTapPosition.y = this.y1

    this.last = this.now
  }

  _touchMove(evt) {
    this.dispatch('touchmove', evt)
        
    this.x2 = evt.touches[0].pageX
    this.y2 = evt.touches[0].pageY

    if (this._moved(this.x1, this.x2, this.y1, this.y2)) {
        // 判断是否有大距离的拖动, 有则清除 tap 和 longtap 事件
        clearTimeout(this.tapTimeout)
        clearTimeout(this.longTapTimeout)
        this.isDoubleTap = false
    }
  }

  _touchEnd(evt) {
    // 手指离开了, 取消长按事件
    if (this.longTapTimeout) {
      clearTimeout(this.longTapTimeout)
    }        

    if (this._moved(this.x1, this.x2, this.y1, this.y2)) {
      if (Math.abs(this.x1 - this.x2) >= Math.abs(this.y1 - this.y2)) {
        // 左右移动距离更大
        if (this.x1 - this.x2 > 0) {
          evt.direction = 'Left'
          this.dispatch('swipeleft', evt)
        } else {
          evt.direction = 'Right'
          this.dispatch('swiperight', evt)
        }
      } else {
        // 上下移动距离更大
        if (this.y1 - this.y2 > 0) {
          evt.direction = 'Up'
          this.dispatch('swipeup', evt)
        } else {
          evt.direction = 'Down'
          this.dispatch('swipedown', evt)
        }
      }
      this.dispatch('swipe', evt)
      return
    } 

    if (!this.isDoubleTap) {
      // 短 tap 时间必须在 300 ms 以内
      if (Date.now() - this.now < this.config.tapInterval) {
        this.tapTimeout = setTimeout(() => {
          this.dispatch('tap', evt)
        }, this.config.tapInterval)  
      }
    }

    if (this.isDoubleTap) {
      this.dispatch('doubletap', evt)
      this.isDoubleTap = false
    }
  }

  on(type, handler) {
    if (this.handlers[type]) {
      this.handlers[type].push(handler)
    }
    // 支持链式调用
    return this
  }

  off(type, handler) {
    if (!handler) {
      this.handlers[type] = []
    } else if (this.handlers[type] && this.handlers[type].indexOf(handler) !== -1) {
      this.handlers[type].splice(this.handlers[type].indexOf(handler), 1)
    }
  }

  destroy() {
    if (this.longTapTimeout) {
      clearTimeout(this.longTapTimeout)
    }
    
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout)
    }
    // 在销毁对象时需要销毁所有的绑定事件，使用removeEventListenner时，需要传入原绑定函数的引用，而bind方法本身会返回一个新的函数
    this.element.removeEventListener('touchstart', this._touchStart, false)
    this.element.removeEventListener('touchmove', this._touchMove, false)
    this.element.removeEventListener('touchend', this._touchEnd, false)
    // 清空所有数据
    this.delta = null
    this.last = null
    this.now = null
    this.tapTimeout = null
    this.longTapTimeout = null
    this.x1 = this.x2 = this.y1 = this.y2 = null
    this.preTapPosition = { 
      x: null, 
      y: null 
    }
    return false
  }

  set(config) {
    // 对属性进行配置更新
    this.config = Object.assign(this.config, config)
    return this
  }

  _moved(x1, x2, y1, y2) {
    return (x2 && Math.abs(x1 - x2) > this.config.distance) || (y2 && Math.abs(y1 - y2) > this.config.distance)
  }
}
