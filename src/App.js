import { useState, useEffect, } from 'react';
import { Circle, Layer, Stage,Rect } from 'react-konva';
import socketIOClient from "socket.io-client";
const apiIp=process.env.REACT_APP_API_IP||'http://docker.lan:3006'
console.log(apiIp)
let socket;
function isIntersect(point, led) {

  return Math.sqrt((point.x-(led.posX)) ** 2 + (point.y - (led.posY)) ** 2) < led.radius-5;
  
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
  const [effect , setEffect] = useState(0);
  const [alpha , setAlpha] = useState(170);
  const [color, setColor] = useState({ r: 50, g: 100, b: 150, a:0});
  const handleSetColor=   async() =>
{
 
  console.log(color)
  color.a=255-color.a
  let newleds=[...leds]
  newleds.forEach(led=>{
    led.r=color.r
    led.g=color.g
    led.b=color.b
    led.a=color.a
  })
setLeds(newleds)

console.log(newleds)
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(color)
};
await fetch(apiIp+'/setallleds',requestOptions)
    .then (response=> {
    return response;
  })
}
const handleColor=(color)=>{


color.a=parseInt(color.a*255)
color.a=(color.a>0)?color.a:color.a=1
setColor(color)
console.log(color)

}
  const handleEffect=async()=>{
    
    setEffect(!effect)
    

  
    let effe
    if (effect===false)
    {
      effe=0;
    }
    else
    {
      effe=1
    }
console.log(effe)
    socket.emit("ledwall", effe);
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
   //console.log(e)
   let emitColor={...color}
   emitColor.num=parseInt(e.n)
   let newleds=[...leds]
   let currled=newleds.findIndex(x => x.n === e.n);
  // console.log('led number',e.n)
   newleds[currled].r=color.r
   newleds[currled].g=color.g
   newleds[currled].b=color.b
   newleds[currled].a=color.a
  console.log(newleds[currled])
   setLeds(newleds);

  //socket.emit("ledwall", emitColor);



 }
 const handleMouseOver= async (e)=>{
  e.evt.preventDefault()
  handleLedChangeMouseOver(e.target.attrs.id)


}
 const handleTouchMove= async (e)=>{
  e.evt.preventDefault()
  let stage = e.currentTarget;
  
  let touchPos = stage.getPointerPosition();
  
  const pos={
            
    x:touchPos.x,
    y:touchPos.y
    }
   
  //  console.log('before',pos.x)
  //  console.log('before',pos.y)
   pos.y=(pos.y/((window.innerWidth)/100))
  pos.x=(pos.x/((window.innerWidth)/100))

  leds.forEach(led => {
       

    if (isIntersect(pos,led)) {
      
      handleLedChange(led)

/*
      if(rgbColor!==led.color)
      {
        led.color=rgbColor
        handleChangeLed(rgbColor,led.num,ctx,x,y)
      
        
        //console.log('change color',led.num
  }
  */   
    }
  });


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
 //console.log(e)
  let rgb=e.target.getLayer()
  .getContext('2d')
  .getImageData(e.evt.changedTouches[0].pageX*2,e.evt.changedTouches[0].pageY*2, 1, 1).data //*2 to fix canvas size

  setColor({r:rgb[0],g:rgb[1],b:rgb[2],a:alpha})
  console.log(rgb)
  console.log(color)
}
const getAlphaTouch =  (e)=> {
  //console.log(e)
   let a=e.target.getLayer()
   .getContext('2d')
   .getImageData(e.evt.changedTouches[0].pageX*2,e.evt.changedTouches[0].pageY*2, 1, 1).data[0] //*2 to fix canvas size
 console.log(255-a)
   setAlpha(255-a)
 }
const setColorChange = async ()=> {
//  console.log(color)
const rgbArray=leds.map(({r,g,b,a,n})=>({r,g,b,a,n}))
console.log('rgbarr',rgbArray)
const requestOptions = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({rgbArray})


};

const response= await fetch(apiIp+'/setleds',requestOptions);
const resp=await response
console.log(resp)





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
    
    <Stage width={window.innerWidth} height={window.innerWidth-70} onTouchMove={(e)=>handleTouchMove(e)}>
    <Layer>
    <Rect
          x={(window.innerWidth/100)*10}
          y={(window.innerWidth/100)*10}
          width={(window.innerWidth)/100*80}
          height={(window.innerWidth)/100*15}
        stroke="black"
         fillLinearGradientStartPoint= {{ x: (window.innerWidth/100), y: (window.innerWidth/100)*20}}
         fillLinearGradientEndPoint= {{ x: (window.innerWidth/100)*80, y: (window.innerWidth/100)*20 }}
          fillLinearGradientColorStops={ [0, 'rgba(255,0,0,'+alpha/255+')', 
          0.1, 'rgba(255,165,0,'+alpha/255+')',0.2,'rgba(255,255,0,'+alpha/255+')',
          0.3,'rgba(0,255,0,'+alpha/255+')',0.4,'rgba(0,255,255,'+alpha/255+')',
          0.5,'rgba(0,0,255,'+alpha/255+')',0.6,'rgba(255,0,255,'+alpha/255+')',
          0.7,'rgba(255,192,203,'+alpha/255+')',0.8,'rgba(255,255,255,'+alpha/255+')',
          0.9,'rgba(165,42,42,'+alpha/255+')',1,'rgba(0,0,0,'+alpha/255+')']}
      
        
        onTouchStart={getColTouch}
        onMouseUp={getColMouse}
    
        />
        <Rect
        
          x={(window.innerWidth/100)*10}
          y={(window.innerWidth/100)*30}
          width={(window.innerWidth)/100*80}
          height={(window.innerWidth)/100*15}
          stroke="black"
         fillLinearGradientStartPoint= {{ x: (window.innerWidth/100), y: (window.innerWidth/100)*20}}
         fillLinearGradientEndPoint= {{ x: (window.innerWidth/100)*80, y: (window.innerWidth/100)*20 }}
         
         
          fillLinearGradientColorStops={ [0, 'white',1,'black']}
        
        onTouchStart={getAlphaTouch}
        onMouseUp={getColMouse}
    
        />

    </Layer>

      <Layer>
      
      
       
      {leds.map((led) => (
          <Circle
            key={led._id}
            id={led.n}
             x={(((window.innerWidth)/100)*led.posX)}
            y={(((window.innerWidth)/100)*led.posY)}
            radius={led.radius}
            fill={'rgba('+led.r+','+led.g+','+led.b+','+led.a/255+')'}
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
  <button onClick={handleSetColor}>värjää</button>
  </div> 
    </>
  )
};

export default App;
