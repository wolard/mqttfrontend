import { useState, useEffect, } from 'react';
import { Circle, Layer, Stage,Rect } from 'react-konva';
import socketIOClient from "socket.io-client";
const apiIp=process.env.REACT_APP_API_IP||'http://docker.lan:3006'
console.log(apiIp)
let socket;
let tempLeds=[]
function isIntersect(point, led) {

  return Math.sqrt((point.x-(led.posX)) ** 2 + (point.y - (led.posY)) ** 2) < led.radius-5;
  
}



const dragBound=(x,xMin,xMax)=>{
  if (x<=xMin)
  {
    x=xMin
    return x
  }
  if(x>=xMax)
    {
    x=xMax
    return x
    }
    else return x
}

const initiateSocketConnection =  () => {
  socket = socketIOClient(apiIp);
  
  console.log(`Connecting socket...`);
  console.log(socket)
 }

 
 const disconnectSocket = () => {
  console.log('Disconnecting socket...');
  if(socket) socket.disconnect();
}
function App() {
  const [leds , setLeds] = useState([]);
 // const [tempLeds , setTempLeds] = useState([]);
  const[alarm,setAlarn]=useState(false)
  const [effect , setEffect] = useState(0);
  const [color, setColor] = useState({ r: 128, g: 128, b: 128, a:128});
  const [pickColor, setPickColor] = useState({ r: 128, g: 128, b: 128, a:128});
  
 
 
  const handleSetColor=   async() =>
{
 
  //console.log('colorbefore',pickColor)
  const sendcolor={...pickColor}
  sendcolor.a=255-pickColor.a
  let newleds=[...leds]
  newleds.forEach(led=>{
                //set number to -1 to handle all colors
    led.r=pickColor.r
    led.g=pickColor.g
    led.b=pickColor.b
    led.a=pickColor.a
  })
 
setLeds(newleds)

console.log(newleds)
socket.emit("colorAll",{n:-1,r:pickColor.r,g:pickColor.g,b:pickColor.b,a:pickColor.a})
/* 
const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(sendcolor)
};
await fetch(apiIp+'/setallleds',requestOptions)
    .then (response=> {
    return response;
  })
  */
}
const handleColor=(color)=>{


color.a=parseInt(color.a*255)
color.a=(color.a>0)?color.a:color.a=1
setColor(color)
console.log(color)

}
  const handleEffect=async()=>{
    let effe
    effe=!effe
    setEffect(!effe) 
    if (effe===false)
    {
      effe=0;
    }
    else
    {
      effe=1
    }
console.log(effe)
    socket.emit("effect", effe);
  }
  const handleLedChangeMouseOver= (id)=>{
    
    let emitColor={...color}
    emitColor.num=parseInt(id)
    let newleds=[...leds]
    let currled=newleds.findIndex(x => x.n === id);
    console.log(currled)
    newleds[currled].r=color.r
    newleds[currled].g=color.g
    newleds[currled].b=color.b
    newleds[currled].a=color.a
   
    setLeds(newleds);
 
   //socket.emit("ledwall", emitColor);
 
 
 
  }
 const handleLedChange= (e)=>{
   console.log(e.attrs.id)
    let newleds=[...leds]
   let currled=newleds.findIndex(x => x.n === e.attrs.id);
  // console.log('led number',e.n)
   newleds[currled].r=pickColor.r
   newleds[currled].g=pickColor.g
   newleds[currled].b=pickColor.b
   newleds[currled].a=pickColor.a

   setLeds(newleds);

  //socket.emit("ledwall", emitColor);
}
const handleKukkaAlarm = ()=>{
  console.log('newleds',leds)
  let al =!alarm
  setAlarn(!alarm)
  console.log(alarm)

 
  
  if (al)
  {
    tempLeds=leds.map(({r,g,b,a,n})=>({r,g,b,a,n}))

    console.log('alarm set')
  let newLeds=[...leds]   //4 red, 4 white
  
   console.log('templeds',tempLeds)

let r=0
let red=1
for (let i=0;i<newLeds.length;i++)
{


if (r>3){
red=!red
r=0
}
if (!red)
{
  newLeds[i].r=255
  newLeds[i].g=0
  newLeds[i].b=0
  newLeds[i].a=0
}
else
{
  newLeds[i].r=255
  newLeds[i].g=255
  newLeds[i].b=255
  newLeds[i].a=1
}
r++
}
setLeds(newLeds)


setColorChange()
handleEffect()
  }
  else
  {
   console.log('alarm off')
   let originleds=[...leds]
   console.log('set old leds back',originleds)
   originleds.forEach((l,i)=>{
     l.r=tempLeds[i].r
     l.g=tempLeds[i].g
     l.b=tempLeds[i].b
     l.a=tempLeds[i].a
   })
   console.log('originleds',originleds)
   setLeds(originleds)
   
    setColorChange()
    handleEffect()
  }
}
 const handleMouseOver= async (e)=>{
  e.evt.preventDefault()
  handleLedChangeMouseOver(e.target.attrs.id)


}
const handleTouchMove2= async (e)=>{
  e.evt.preventDefault()
  
  let circle = e.target;
  console.log(circle)
  handleLedChange(circle)

}

const getColMouse =  (e)=> {
 // console.log(e)
  let rgb=e.currentTarget
.getLayer()
.getContext('2d')
.getImageData(e.evt.clientX,e.evt.clientY, 1, 1).data
console.log(rgb[0])
console.log(rgb[1])
console.log(rgb[2])
}
const getColTouch =  (e)=> {
 console.log(e)
  const rgb=e.target.getLayer()
  .getContext('2d')
 .getImageData(e.evt.changedTouches[0].pageX*(e.currentTarget.parent.canvas.pixelRatio),e.evt.changedTouches[0].pageY*(e.currentTarget.parent.canvas.pixelRatio), 1, 1).data 
 
 console.log(rgb)
   console.log(color)
   
  
  
 
  let newCol={...color}
  newCol.r=rgb[0]
  newCol.g=rgb[1]
  newCol.b=rgb[2]

  // setColor({r:rgb[0],g:rgb[1],b:rgb[2],a:rgb[3]})
  
  setColor(newCol)
  console.log(color)
  //const rgbaCol='rgba('+newCol.r+','+newCol.g+','+newCol.b+','+newCol.a/255+')'
  


}
const getColAlpha  =  (e)=> {
  //console.log(e)
   let data=e.target.getLayer()
   .getContext('2d')
   .getImageData(e.evt.changedTouches[0].pageX*(e.currentTarget.parent.canvas.pixelRatio),e.evt.changedTouches[0].pageY*(e.currentTarget.parent.canvas.pixelRatio), 1, 1).data //*2 to fix canvas size
 
   let newCol={...pickColor}
   newCol.r=data[0]
   newCol.g=data[1]
   newCol.b=data[2]
   newCol.a=255-data[3]
 setPickColor(newCol)
 socket.emit("colorAll",{n:-1,r:newCol.r,g:newCol.g,b:newCol.b,a:newCol.a})
 let newleds=[...leds]
 newleds.forEach(led=>{
               //set number to -1 to handle all colors
   led.r=data[0]
   led.g=data[1]
   led.b=data[2]
   led.a=255-data[3]
 })
 setLeds(newleds)
  console.log('pickcolor',pickColor)
    return newCol

 }
const setColorChange = async ()=> {
  console.log('leds on colorchange',leds)
const rgbArray=leds.map(({r,g,b,a,n})=>({r,g,b,a,n}))
console.log('rgbarr',rgbArray)
socket.emit("colorSelected",rgbArray)


}
  const getLeds = async () => {
   
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
 
   
  };
  
  const initLeds= await fetch(apiIp+'/getleds',requestOptions);
 
  let initialLeds= await initLeds.json();
  setLeds(initialLeds)
   console.log(initialLeds)

} 

  useEffect(  ()=>{
  getLeds()
  
  initiateSocketConnection()
  return()=>{

   console.log('clearing')
   
   disconnectSocket();
    
  
   
   }
},[]

  
  
  
  )

  
  
 // console.log('leds',leds)
 
  return(
   
    
    <>
    
    <Stage  width={window.innerWidth} height={window.innerWidth-1} >      
    <Layer name='gradients'>
    <Rect
          x={(window.innerWidth/100)*10}
          y={(window.innerWidth/100)*30}
          width={(window.innerWidth)/100*80}
          height={(window.innerWidth)/100*15}
        stroke="black"
         fillLinearGradientStartPoint= {{ x: (window.innerWidth/100), y: (window.innerWidth/100)*20}}
         fillLinearGradientEndPoint= {{ x: (window.innerWidth/100)*80, y: (window.innerWidth/100)*20 }}
          fillLinearGradientColorStops={ [0, 'rgba(255,0,0,1)', 
          0.1, 'rgba(255,165,0,1)',0.2,'rgba(255,255,0,1)',
          0.3,'rgba(0,255,0,1',0.4,'rgba(0,255,255,1)',
          0.5,'rgba(0,0,255,1)',0.6,'rgba(255,0,255,1)',
          0.7,'rgba(255,192,203,1)',0.8,'rgba(255,255,255,1)',
          0.9,'rgba(165,42,42,1)',1,'rgba(0,0,0,1)']}
      
         
        onTouchStart={getColTouch}
        onMouseUp={getColMouse}
    
        />
  <Rect
        
        x={(window.innerWidth/100)*20}
        y={(window.innerWidth/100)*50}
        width={(window.innerWidth)/100*35}
        height={(window.innerWidth)/100*35}
        stroke="black"
       fillLinearGradientStartPoint= {{ x: (window.innerWidth/100), y: (window.innerWidth/100)}}
       fillLinearGradientEndPoint= {{ x: (window.innerWidth/100), y: (window.innerWidth/100)*35 }}
       
       
      fillLinearGradientColorStops={ [0, 'rgba(0,0,0,0)',1,'rgba(0,0,0,1)']}
      
      onMouseUp={getColMouse}
  
      />      
        <Rect
        
          x={(window.innerWidth/100)*20}
          y={(window.innerWidth/100)*50}
          width={(window.innerWidth)/100*35}
          height={(window.innerWidth)/100*35}
          stroke="black"
        
          fillLinearGradientStartPoint= {{ x: (window.innerWidth/100), y: (window.innerWidth/100)*35}}
         fillLinearGradientEndPoint= {{ x: (window.innerWidth/100)*35, y: (window.innerWidth/100)*35 }}
         
         
          fillLinearGradientColorStops={ [0, 'rgba('+color.r+','+color.g+','+color.b+',0)',
          0.2, 'rgba('+color.r+','+color.g+','+color.b+',0.2)',
          0.4, 'rgba('+color.r+','+color.g+','+color.b+',0.4)',
          0.6, 'rgba('+color.r+','+color.g+','+color.b+',0.8)',
          0.8, 'rgba('+color.r+','+color.g+','+color.b+',1)',
          1,'rgba('+color.r+','+color.g+','+color.b+',1)']}
        
      
          onTouchMove={getColAlpha}
          onTouchStart={getColAlpha}
        onMouseUp={getColMouse}
    
        />
   <Rect
        
        x={(window.innerWidth/100)*70}
        y={(window.innerWidth/100)*70}
        width={(window.innerWidth)/100*15}
        height={(window.innerWidth)/100*15}
        stroke="black"
        //fill={rgba}    
        fill={'rgba('+pickColor.r+','+pickColor.g+','+pickColor.b+','+(1-pickColor.a/255)+')'}
        onTouchStart={handleSetColor}
  
      />
      </Layer>
      <Layer name='cursor'>

   {/*    <Circle
        
        x={(window.innerWidth/100)*10}
        y={(window.innerWidth/100)*30}
        radius={20}
        draggable
        onDragMove={(e)=>{         
          e.target.attrs.y=((window.innerWidth/100)*30)
          e.target.attrs.x=dragBound((e.target.attrs.x),(window.innerWidth/100*10),(window.innerWidth/100*10)+(window.innerWidth/100*80)-(window.innerWidth)/100*3)
        console.log(e)
          
          let a=e.target.parent.parent.children[0].getLayer()
          .getContext('2d')
          .getImageData(e.evt.changedTouches[0].pageX*2,e.evt.changedTouches[0].pageY*2, 1, 1).data[3] 
          //console.log(a)
        console.log(e.target.parent.parent.children[0].getLayer())
        console.log(a)
        }
      }
          stroke={'black'}    
          fill={'black'}    
  
      /> */}
    </Layer>

      <Layer onTouchMove={handleTouchMove2}>
      
      
       
      {leds.map((led) => (
          <Circle
            key={led._id}
            id={led.n}
             x={(((window.innerWidth)/100)*led.posX)}
            y={(((window.innerWidth)/100)*led.posY)}
            radius={led.radius}
            
            fill={'rgba('+led.r+','+led.g+','+led.b+','+(1-led.a/255)+')'}
            //stroke="black"
            //fill={ConvertRGBtoHex(led.r,led.g,led.b)}
            //fill="#89b717"
            //opacity={0.3}      
            //shadowColor="black"
            //shadowBlur={0}
            //shadowOpacity={0.5}
            onMouseOver={handleMouseOver}   
           
          />
        ))}
        
      </Layer>

    </Stage>
   
     <div id='controls'>
 
  <button onClick={setColorChange}>Näytä Väri</button>
  <button onClick={handleEffect}>pyöritä</button>
  <button onClick={handleKukkaAlarm}>kukkahälytys</button>
  <button onClick={()=>socket.emit("fullLight",1)}>täysi valaistus</button>
  <button onClick={()=>socket.emit("fullLight",0)}>valot pois</button>
  </div> 
    </>
  )
};

export default App;
