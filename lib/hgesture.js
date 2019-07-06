/**
 * 内置的事件会由浏览器根据某些操作进行触发，自定义的事件就需要人工触发, dispathEvent 用于触发该事件
 * 
 * HGesture 支持使用原生事件的方式调用移动端事件, 比如 addEventListener('swipe', func)
 * 选择器也支持一次性选择多个元素, 绑定同一个事件
 */

import Gesture from "./gesture.js"

const HGesture = (() => {
  // 形成一个闭包
  const gestures = []

  const init = (selectors) => {
    // 得到所有选中的元素
    const elms = [...document.querySelectorAll(selectors)]
    // 根据对应的元素注册出所有的 gestures 对象
    const hGestures = elms.map(elm => new Gesture(elm))
    hGestures.forEach(gesture => {
      const handler = function(eventType) {
        return function() {
          // 向 gesture 元素派发事件, 元素可以自己触发自定义的事件, 由程序控制(由于是自定义事件, 手动触发)
          gesture.element.dispatchEvent(new CustomEvent(eventType, { detail: arguments[0] }))
        }
      }
      // 绑定事件, handler('tap') 实际就是 return function(){...}, 当调用到时手动触发自定义的这个事件
      gesture.handlers.tap = [handler('tap')]
      gesture.handlers.doubletap = [handler('doubletap')]
      gesture.handlers.longtap = [handler('longtap')]
      gesture.handlers.swipe = [handler('swipe')]
      gesture.handlers.swipeleft = [handler('swipeleft')]
      gesture.handlers.swiperight = [handler('swiperight')]
      gesture.handlers.swipeup = [handler('swipeup')]
      gesture.handlers.swipedown = [handler('swipedown')]
      gesture.handlers.pinch = [handler('pinch')]
      gesture.handlers.rotate = [handler('rotate')]

    })
    gestures.push(...hGestures)
  }

  const list = () => {
    return gestures
  }

  return {
    init, 
    list,
  }
})()

export default HGesture