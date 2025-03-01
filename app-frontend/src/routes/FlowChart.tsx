import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  getConnectedEdges,
  useEdgesState,
  applyEdgeChanges,
  applyNodeChanges,
  useNodesState, useReactFlow,
} from "@xyflow/react";
import Dagre from '@dagrejs/dagre';

import "@xyflow/react/dist/style.css";
import "@/styles/FlowNode.css";

const r = document.querySelector(":root");
const rs = getComputedStyle(r);

import { ClassNode, getClasses } from "@/components/FlowNodes.tsx";
import { getEdges } from "@/components/FlowEdges.tsx";
import { Legend } from "@/components/Legend.tsx";

const obj = {
  name: "Object Oriented Design",
  id: "CS 2102",
  professor: "Mathew Ahrens",
  time: "M-T-R-F 12:00PM-12:50PM",
  taken: "uncompleted",
  prereq: [],
};

const advObj = {
  name: "Accelerated Object Oriented Design Concepts",
  id: "CS 2103",
  professor: "Joshua Cuneo",
  time: "M-T-R-F 12:00PM-12:50PM",
  taken: "unconfirmed",
  prereq: [],
};

const discrete = {
  name: "Discrete Mathematics",
  id: "CS 2022",
  professor: "Herman Servatius",
  time: "M-T-R-F 4:00PM-4:50PM",
  taken: "completed",
  prereq: [],
};

const algo = {
  name: "Algorithms",
  id: "CS 2223",
  professor: "Michael Engling",
  time: "M-T-R-F 10:00AM-11:50AM",
  taken: "confirmed",
  prereq: [
    [
      { id: "CS 2102", req: "prereq" },
      { id: "CS 2103", req: "concurrent" },
    ],
    [{ id: "CS 2022", req: "recomended" }],
  ],
};

const objApp = {
  name: "Application Building With Object-Oriented Concept",
  id: "CS 2119",
  professor: "Shubbhi Taneja",
  time: "T-F 11:00AM-12:50PM",
  taken: "confirmed",
  prereq: [],
};

const os = {
  name: "Operating Systems",
  id: "CS 3013",
  professor: "Craig Wills",
  time: "T-F 12:00PM-1:50PM",
  taken: "confirmed",
  prereq: [],
};

const webware = {
  name: "Webware: Computational Technology For Network Information Systems",
  id: "CS 4241",
  professor: "Joshua Cuneo",
  time: "T-F 3:00PM-4:50 PM",
  taken: "confirmed",
  prereq: [
    [
      { id: "CS 2102", req: "prereq" },
      { id: "CS 2103", req: "prereq" },
      { id: "CS 2119", req: "prereq" },
    ],
    [{ id: "CS 3013", req: "prereq" }],
  ],
};

const foundations = {
  name: "Foundations Of Computer Science",
  id: "CS 3133",
  professor: "Hanmeng Zhan",
  time: "M-R 3:00PM-4:50PM",
  taken: "confirmed",
  prereq: [
    [{ id: "CS 2022", req: "prereq" }],
    [{ id: "CS 2223", req: "prereq" }],
  ],
};

const introAI = {
  name: "Introduction To Artificial Intelligence",
  id: "CS 4341",
  professor: "Unconfirmed",
  time: "T-F 1:00PM-2:50PM",
  taken: "confirmed",
  prereq: [
    [
      { id: "CS 2102", req: "prereq" },
      { id: "CS 2103", req: "prereq" },
    ],
    [{ id: "CS 2223", req: "prereq" }],
    [{ id: "CS 3133", req: "prereq" }],
  ],
};

const classNodes = [
  obj,
  advObj,
  discrete,
  algo,
  webware,
  os,
  objApp,
  foundations,
  introAI,
];

const getLayoutedElements = (nodes, edges, options) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
      g.setNode(node.id, {
        ...node,
        width: rs.getPropertyValue("--node-width").replace("px", ""),
        height: rs.getPropertyValue("--node-height").replace("px", ""),
      }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

export const FlowChart = () => {
  const [edges, setEdges] = useState(getEdges(classNodes));
  const [nodes, setNodes] = useState(getClasses(classNodes, edges));
  const [fit, setFit] = useState(false);
  //const initialNodes = getClasses(classNodes, getEdges(classNodes));

  const nodeTypes = {
    custom: ClassNode,
  };

  const onNodeClick = (event, node) => {
    console.log(node);
    let newEdges = edges.slice(0);
    for (let newEdge of newEdges) {
      newEdge.animated = false;
    }
    const connectedEdges = getConnectedEdges([node], newEdges);
    console.log(connectedEdges);

    for (let i = 0; i < connectedEdges.length; i++) {
      const index = edges.indexOf(connectedEdges[i]);
      newEdges[index].animated = true;
    }

    console.log(edges);
    setEdges(newEdges);
    console.log(edges);
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onLayout = useCallback(
      (direction) => {
        const layouted = getLayoutedElements(nodes, edges, { direction });

        setNodes([...layouted.nodes]);
        setEdges([...layouted.edges]);

        setFit(true);
      },
      [nodes, edges],
  );

  window.onload = (event) => {
    onLayout('TB');
  };

  return (
    <div style={{ width: "100vw", height: "calc(100vh - 37px)" }}>
      <Legend />
      <ReactFlow
        edges={edges}
        nodes={nodes}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView={fit}
        proOptions={{ hideAttribution: true }}
        //onNodeClick={onNodeClick}
      >
        <MiniMap nodeStrokeWidth={30} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
