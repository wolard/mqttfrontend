import { RgbaColorPicker } from "react-colorful";
import {useState} from 'react'

 

function App() {
  const handleSetColor=   async() =>
{
  console.log(color)
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(color)
};
 await fetch('http://192.168.1.201:3005/setleds', requestOptions)
    .then (response=> {
    return response;
  })

}
  const [color, setColor] = useState({ r: 50, g: 100, b: 150 });

  return(
  <div>
  <RgbaColorPicker color={color} onChange={setColor} />;
  <button onClick={handleSetColor}>Näytä Väri</button>
  </div>
  )
};

export default App;
