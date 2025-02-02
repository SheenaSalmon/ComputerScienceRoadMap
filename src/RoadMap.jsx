import React, { useEffect, useState } from "react";
import roadmapData from "./assets/roadmap.json";

const Roadmap = ({category}) => {
  const [roadmap, setRoadmap] = useState(null);

  useEffect(() => {
    setRoadmap(roadmapData[category]);
  }, [category]);



  return (
    <div className="card ">
        
      <h2 className="card-title">{roadmap?.title}</h2>
      {roadmap?.levels.map((level, index) => (
        <div key={index} className="mx-5 card-body">
          <h3>{level.level}</h3>
          <ul className="list-group">
            {level.skills.map(skill => (
              <li key={skill.id} className="list-group-item">
                
                {skill.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Roadmap;
