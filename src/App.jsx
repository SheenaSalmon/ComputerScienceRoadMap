import { useState } from 'react'
import Header from './Header'
import Roadmap from './RoadMap'
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("frontend");

  return (
   <>
   
   <div className="container"><Header />
   <select className="custom-select mr-sm-2" onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
        <option value="frontend">Frontend</option>
        <option value="backend">Backend</option>
        <option value="ai">AI & Machine Learning</option>
        <option value="cloud">Cloud & DevOps</option>
      </select>
      <Roadmap category={selectedCategory} />
   
    </div>
   </>
  )
}

export default App
