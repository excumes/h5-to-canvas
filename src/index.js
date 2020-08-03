import './css/main.css'
import axios from 'axios'
import cheerio from 'cheerio'
import { Scene, Sprite, Gradient, Path, Label, Group, Arc } from 'spritejs'


const container = document.getElementById('adaptive');
const scene = new Scene({
  container,
  width: 320,
  height: 480,
});
const layer = scene.layer();

async function getScene() {
  layer.forceUpdate(); //强制重绘画布
  let scene = await axios.get("https://service.91suke.com/scene/270501");
  scene = scene.data.obj.list
  let index = 0;
  draw(scene[index]);
  const timer = setInterval(() => {
    if(index === scene.length - 1){
      clearInterval(timer);
    }
    index++
    draw(scene[index]);
  }, 3000)
}


async function draw(pageInfo) {
  const bgImg = pageInfo.bgImg.replace(/url[("]|[")]/g, "")
  // 一组是一页课件
  const group = new Group();
  group.attr({
    anchor: [0, 0],
    size: [320, 480],
    pos: [0, 480],
    bgcolor: pageInfo.bgColor
  })
  layer.append(group);



  const bgImgSprite = new Sprite({
    texture: bgImg,
    size: [320, 480]
  });
  group.append(bgImgSprite);
  group.transition(0.5, "ease").attr({
    pos: [0, 0]
  })

  pageInfo.elements.forEach(item => {
    if (item.type == 1) { //文本
      const width = parseInt(item.css.width),
        height = parseInt(item.css.height),
        x = parseInt(item.css.left),
        y = parseInt(item.css.top) + 8;// 制作工具有默认8 padding
      const oCss = analyzeTextDom(item.content);
      const label = new Label({
        ...oCss,
        width,
        height,
        pos: [x, y]
      });
      group.append(label);
    }
    if (item.type == 2) { //图片
      const width = parseInt(item.css.width),
        height = parseInt(item.css.height),
        x = parseInt(item.css.left),
        y = parseInt(item.css.top)
      const imgSprite = new Sprite({
        width,
        height,
        pos: [x, y],
        texture: item.url
      });
      group.append(imgSprite);
      //元素动画
      if (item.anim) {
        const animObj = item.anim[0];
        playAnimate(imgSprite, animObj);
        console.log(item.anim[0])
        // if (animObj.type == 1) { //淡入
        //   imgSprite.transition(0).attr({ opacity: 0 }).then(() => {
        //     setTimeout(() => {
        //       imgSprite.transition(1).attr({ opacity: 1 });
        //     }, 500)
        //   });
        // }
      }
    }
  })
}

/**
 * 获取文本样式和内容
 * @param {string} html 
 */
function analyzeTextDom(html) {
  const $ = cheerio.load(html);
  // 字号
  const fontSizeMap = [12, 13, 16, 18, 24, 32, 48]
  return {
    fontSize: fontSizeMap[$("font").attr('size')],
    text: $("p").text(),
    textAlign: $("p").css("text-align"),
    lineHeight: $(".txtFilterContent").css("lineHeight"),
    fontWeight: $("b").length === 0 ? "normal" : "bold",
    fillColor: $("font").attr("color")
  }
}

/**
 * 处理动画
 */
function playAnimate(spriteEle, animObj){
  const duration = animObj.duration * 1;
  const delay = animObj.delay * 1;
  if(animObj.type == 1){
    spriteEle.transition(0).attr({ opacity: 0 }).then(() => {
      setTimeout(() => {
        spriteEle.transition(duration).attr({ opacity: 1 });
      }, delay)
    });
  }
  if(animObj.type == 2){
    
  }
}

const obtn = document.querySelectorAll("button")[0];
obtn.addEventListener("click", () => {
  getScene();
  toVideo();
});


// 转成video
function toVideo() {
  //Canvas2Video from  index.html
  const canvas2videoInstance = new Canvas2Video({  
    canvas: document.querySelector("canvas"),
    outVideoType: "webm",
  });
  canvas2videoInstance.startRecord();
  setTimeout(() => {
    canvas2videoInstance.stopRecord();
  }, 10000);
  canvas2videoInstance
    .getStreamURL()
    .then((url) => {
      console.log("url", url);
      document.querySelector("#videoContainer").style.display = "block";
      document.querySelector("video").src = url;
    })
    .catch((err) => console.error(err));
}