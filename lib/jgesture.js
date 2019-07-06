/**
 * JGesture 相比普通 gesture 允许一次性绑定多个元素, 使用相同回调事件
 */ 
import Gesture from "./gesture.js"

const JGesture = (() => {
  const gestures = []

  const applyAll = (selectors, callback) => {
    let newGestures = [...document.querySelectorAll(selectors)].map(node => new Gesture(node))
    newGestures.forEach(gesture => {
      callback(gesture)
    })
  }

  const on = (type, selectors, handler) => {
    applyAll(selectors, function(gesture){
      gesture.on(type, handler)
    })
  }

  const off = (type, selectors, handler) => {
    applyAll(selectors, function(gesture){
      gesture.off(type, handler)
    })
  }

  const destroy = (selectors) => {
    applyAll(selectors, function(gesture){
      gesture.destroy()
    })
  }

  const set = (selectors, config) => {
    applyAll(selectors, function(gesture){
      gesture.set(config)
    })
  }

  return {
    on,
    off,
    destroy,
    set,
  }
})() 

export default JGesture