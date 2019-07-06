import Gesture from "./lib/gesture.js"

class DivDemo {
  constructor(id, color, position) {
    this.elm = this.init(id, color, position)
    this.isDraggable = false
    this.touchPosition = [0, 0]
  }

  init(id, color, position) {
    const div = document.createElement('div')
    div.style.display = 'inline-block'
    div.style.border = '1px solid black'
    div.style.backgroundColor = color
    div.style.height = '100px'
    div.style.width = '100px'
    div.style.position = 'absolute'
    div.style.top = (position.top === 0) ? position.top : position.top + 'px'
    div.style.left = (position.left === 0) ? position.left : position.left + 'px'
    div.id = id 
    document.body.insertBefore(div, document.querySelector('.log'))
    return div
  }

  start() {
    this.isDraggable = true
    this.touchPosition = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]
  }

  move(event) {
    if (this.isDraggable) {
      const deltaX = event.changedTouches[0].clientX - this.touchPosition[0]
      const deltaY = event.changedTouches[0].clientY - this.touchPosition[1]
      const top = parseInt(this.elm.style.top, 10) || 0
      const left = parseInt(this.elm.style.left, 10) || 0
      this.elm.style.top = top + deltaY + 'px'
      this.elm.style.left = left + deltaX + 'px'
      this.touchPosition = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]  
    }
  }

  end() {
    this.fisDraggable = false
  }

  insertLog(eventName) {
    document.querySelector('.log').innerHTML = `
      触发了<span class="red">${eventName}</span>事件
    `
  }
}


const blueDiv = new DivDemo('#blue', 'blue', { top: 0, left: 0 })
const gesture1 = new Gesture(blueDiv.elm)

gesture1.on('touchstart', function(event){
  blueDiv.start()
  blueDiv.insertLog('touchstart')
}).on('touchmove', function(event){
  // 使用 touchmove 可以顺畅移动
  blueDiv.move(event)
  blueDiv.insertLog('touchmove')
}).on('touchend', function(event){
  blueDiv.end()
})

const greenDiv = new DivDemo('#red', 'green', { top: 0, left: 200 })
const gesture2 = new Gesture(greenDiv.elm)

gesture2.on('touchstart', function(event){
  greenDiv.start()
  greenDiv.insertLog('touchstart')
}).on('swipe', function(event){
  // swipe 无法追踪 touch 的移动
  greenDiv.move(event)
  greenDiv.insertLog('swipe')
}).on('touchend', function(event){
  greenDiv.end()
}).on('doubletap', function(){
  greenDiv.insertLog('doubletap')
}).on('longtap', function(){
  greenDiv.insertLog('longtap')
})

const gesture3 = new Gesture('.log')
gesture3.on('tap', function(event){
  this.innerHTML = '触发了<span class="red">tap</span>事件'
})
