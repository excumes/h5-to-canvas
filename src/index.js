import './css/main.css'
import axios from 'axios'
import cheerio from 'cheerio'
import { Scene, Sprite, Gradient, Path, Label, Group, Arc } from 'spritejs';


const container = document.getElementById('adaptive');
const scene = new Scene({
  container,
  width: 320,
  height: 480,
});
const layer = scene.layer();

async function getScene() {
  const scene = await axios.get("https://service.91suke.com/scene/270501");
  draw(scene.data.obj.list[0]);
}


async function draw(pageInfo) {
  console.log(pageInfo);
  // const bgImg = pageInfo.bgImg.slice(pageInfo.bgImg.indexOf("h"), pageInfo.bgImg.indexOf('")'))
  const bgImg = pageInfo.bgImg.replace(/url[("]|[")]/g, "")


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
  await group.transition(0.5, "ease").attr({
    pos: [0, 0]
  })

  pageInfo.elements.forEach(item => {
    if (item.type == 1) { //文本
      const width = parseInt(item.css.width),
        height = parseInt(item.css.height),
        x = parseInt(item.css.left),
        y = parseInt(item.css.top)
      const oCss = analyzeTxetDom(item.content);
      const label = new Label({
        ...oCss,
        width,
        height,
        x,
        y
      });
      group.append(label);
    }
    if (item.type == 2) { //图片

    }
  })
}

/**
 * 获取文本样式和内容
 * @param {string} html 
 */
function analyzeTxetDom(html) {
  const $ = cheerio.load(html);
  return {
    fontSize: parseInt($("p").css('fontSize')) || 14,
    text: $("p").text(),
    textAlign: $("p").css("textAlign"),
    lineHeight: $(".txtFilterContent").css("lineHeight"),
    fontWeight: $("b").length === 0 ? "normal" : "bold",
    fillColor: $("font").attr("color")
  }
}
getScene();





