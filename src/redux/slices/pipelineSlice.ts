import { addEdge as addFlowEdge, applyEdgeChanges, applyNodeChanges, Connection, Edge, EdgeChange, MarkerType, Node, NodeChange } from "reactflow";
import { v4 as uuidv4 } from 'uuid';

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { EdgeData, NodeData, NodeState, PipelineData, PipelineState } from "../states/pipelineState";

export const initialState: PipelineState = {
  pipelines: [],
  activePipelineId: "",
  dataSinks: [],
}

const takeSnapshot = (state: PipelineState) => {
  var activePipeline = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)
  if (!activePipeline) return
  activePipeline?.history?.past?.push({nodes: activePipeline.pipeline.nodes, edges: activePipeline.pipeline.edges})
}

const pipelineSlice = createSlice({
  name: 'pipelines',
  initialState: initialState,
  reducers: {
    addNewPipeline: (state, { payload }: PayloadAction<{ id: string, flowData: NodeState }>) => {
      state.pipelines.push({ id: payload.id, name: 'unnamed pipeline', pipeline: payload.flowData, history: { past: [], future: []}, imgData: '' } as PipelineData)
      state.activePipelineId = payload.id
    },
    setActivePipeline: (state, { payload }: PayloadAction<string>) => {
      state.activePipelineId = payload
    },
    setImageData: (state, { payload }: PayloadAction<{ id: string, imgData: string }>) => {
      var pipeline = state.pipelines.find(pipeline => pipeline.id === payload.id)
      if (!pipeline) return
      pipeline.imgData = payload.imgData
    },
    deletePipeline: (state, { payload }: PayloadAction<string>) => {
      state.pipelines = state.pipelines.filter(pipeline => pipeline.id !== payload);
      // Reset activePipelineId if the deleted pipeline was active
      if (state.activePipelineId === payload) {
        state.activePipelineId = '';
      }
    },
    duplicatePipeline: (state, action: PayloadAction<string>) => {
      const pipelineToDuplicate = state.pipelines.find(pipeline => pipeline.id === action.payload);
      if (pipelineToDuplicate) {
        // Create a duplicate pipeline with the same flowData, but a new name and id
        const newPipeline = {
          ...pipelineToDuplicate,
          id: `pipeline-${uuidv4()}`, // Generate a new ID
          name: `${pipelineToDuplicate.name} COPY` // Append "COPY" to the name
        };
        state.pipelines.push(newPipeline);
      }
    },

    // actions for undo and redo

    undo(state){
      var activePipeline = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)
      if (!activePipeline) return
      const pastState = activePipeline?.history?.past?.pop()
      if (!pastState) return

      activePipeline.history.future.push({nodes: activePipeline.pipeline.nodes, edges: activePipeline.pipeline.edges})
      activePipeline.pipeline.nodes = pastState.nodes
      activePipeline.pipeline.edges = pastState.edges
    },
    redo(state){
      var activePipeline = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)
      if (!activePipeline) return
      const futureState = activePipeline?.history?.future?.pop()
      if (!futureState) return

      activePipeline.pipeline.nodes = futureState.nodes
      activePipeline.pipeline.edges = futureState.edges
    },
    createSnapShot(state){
      takeSnapshot(state)
    },
    
    // actions for the active pipeline
    
    updatePipelineName: (state, { payload }: PayloadAction<string>) => {
      var activePipeline = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)
      if (!activePipeline) return
      activePipeline!.name = payload
    },
    addHandle: (state, { payload }: PayloadAction<string>) => {
      var activeFlowData = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)?.pipeline
      activeFlowData?.nodes.find(node => node.id === payload)?.data?.templateData?.sourceHandles.push({ type: 'source', id: "1" })
    },
    updateSourceHandle: (state, { payload }: PayloadAction<{ nodeId?: string, handleId?: string, newType?: string }>) => {
      const { nodeId, handleId, newType } = payload;
      // Find the active pipeline based on the activePipelineId
      var activeFlowData = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)?.pipeline
      
      if (!activeFlowData) return; // Early exit if no active pipeline is found
    
      // Find the node within the active pipeline's flowData that matches the nodeId
      const targetNode = activeFlowData.nodes.find(node => node.id === nodeId);

      if (!targetNode) return; // Early exit if no matching node is found
    
      // Initialize templateData and sourceHandles if they are not defined
      if (!targetNode.data.templateData?.sourceHandles) return; // Early exit if templateData or sourceHandles are not defined
    
      // Find the handle to update within the sourceHandles
      const handleToUpdate = targetNode.data.templateData.sourceHandles.find(handle => handle.id === handleId);
    
      if (!handleToUpdate) return; // Early exit if no matching handle is found

      // Update the handle's type
      handleToUpdate.type = newType;
    },
    updateTargetHandle: (state, { payload }: PayloadAction<{ nodeId?: string, handleId?: string, newType?: string }>) => {
      const { nodeId, handleId, newType } = payload;
      // Find the active pipeline based on the activePipelineId
      var activeFlowData = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)?.pipeline
      
      if (!activeFlowData) return; // Early exit if no active pipeline is found
    
      // Find the node within the active pipeline's flowData that matches the nodeId
      const targetNode = activeFlowData.nodes.find(node => node.id === nodeId);

      if (!targetNode) return; // Early exit if no matching node is found
    
      // Initialize templateData and sourceHandles if they are not defined
      if (!targetNode.data.templateData?.targetHandles) return; // Early exit if templateData or sourceHandles are not defined
    
      // Find the handle to update within the sourceHandles
      const handleToUpdate = targetNode.data.templateData.targetHandles.find(handle => handle.id === handleId);
    
      if (!handleToUpdate) return; // Early exit if no matching handle is found

      // Update the handle's type
      handleToUpdate.type = newType;
    },
    updateInfo: (state, { payload }: PayloadAction<{ pipId?: string, orgId?: string, repoId?: string, execId?: string }>) => {
      const activePipeline = state.pipelines.find(pipeline => pipeline.id === payload.pipId);
      if (activePipeline) {
        if (payload.orgId) activePipeline.orgId = payload.orgId;
        if (payload.repoId) activePipeline.repoId = payload.repoId;
        if (payload.execId) activePipeline.excecId = payload.execId;
      } else {
        console.error("Pipeline not found for ID:", payload.pipId);
      }
    },
    
    updateNode: (state, { payload }: PayloadAction<Node<NodeData> | undefined>) => {
      if (!payload) return
      var activeFlowData = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)?.pipeline
      if (!activeFlowData) return
      const index = activeFlowData?.nodes.findIndex(node => node.id === payload.id)
      activeFlowData.nodes[index] = payload
    },
    addNode: (state, { payload }: PayloadAction<Node>) => {
      var activeFlowData = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)?.pipeline
      if (!activeFlowData) return
      
      activeFlowData.nodes.push(payload)
    },
    removeNode: (state, { payload }: PayloadAction<Node<NodeData>>) => {
      var activeFlowData = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)?.pipeline
      if (!activeFlowData) return
      //takeSnapshot(state)

      activeFlowData.nodes = activeFlowData.nodes.filter(node => node.id !== payload.id && node.parentNode !== payload.id)
      activeFlowData.edges = activeFlowData.edges.filter(edge =>
        !payload.data?.templateData?.sourceHandles.find(data => data.id === edge.sourceHandle) &&
        !payload.data?.templateData?.targetHandles.find(data => data.id === edge.targetHandle))
    },
    removeEdge: (state, { payload }: PayloadAction<Edge>) => {
      var activeFlowData = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)?.pipeline
      if (!activeFlowData) return
      //takeSnapshot(state)

      activeFlowData!.edges = activeFlowData?.edges.filter(edge => edge.id !== payload.id)
    },
    updateEdge: (state, { payload }: PayloadAction<Edge<EdgeData> | undefined>) => {
      if (!payload) return
      var activeFlowData = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)?.pipeline
      if (!activeFlowData) return
      const index = activeFlowData.edges.findIndex(edge => edge.id === payload.id)
      const strokeColor = payload.data?.filename === undefined || payload.data?.filename === '' || payload.data?.filename === null ? 'red' : 'white'
      activeFlowData.edges[index] = { ...payload }
    },
    // From react flow example
    onNodesChange: (state, { payload }: PayloadAction<NodeChange[]>) => {
      var activeFlowData = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)?.pipeline
      if (!activeFlowData) return

      activeFlowData.nodes = applyNodeChanges(payload, activeFlowData.nodes);
    },
    onEdgesChange: (state, { payload }: PayloadAction<EdgeChange[]>) => {
      var activeFlowData = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)?.pipeline
      if (!activeFlowData) return

      activeFlowData.edges = applyEdgeChanges(payload, activeFlowData.edges);
    },
    onConnect: (state, { payload }: PayloadAction<Connection>) => {
      var activeFlowData = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)?.pipeline
      if (!activeFlowData) return
      takeSnapshot(state)

      const strokeColor = activeFlowData.nodes.find(node => node.id == payload.target)?.type === 'dataSink' ? 'red' : 'white'

      activeFlowData.edges = addFlowEdge({ ...payload, type: 'default'}, activeFlowData.edges);
    },
    setNodes: (state, { payload }: PayloadAction<Node[]>) => {
      var activeFlowData = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)?.pipeline
      if (!activeFlowData) return

      activeFlowData.nodes = payload;
    },
    setEdges: (state, { payload }: PayloadAction<Edge[]>) => {
      var activeFlowData = state.pipelines.find(pipeline => pipeline.id === state.activePipelineId)?.pipeline
      if (!activeFlowData) return

      activeFlowData.edges = payload;
    },
    setDataSinks(state, action: PayloadAction<any[]>) {
      state.dataSinks = action.payload;
    },
  },
})


export const { 
  //actions for all pipelines
  addNewPipeline, 
  setActivePipeline, 
  setImageData, 
  deletePipeline,
  duplicatePipeline,
  // actions for undo and redo
  undo,
  redo,
  createSnapShot,

  // actions for the active pipeline
  updateSourceHandle,
  updateTargetHandle,
  updatePipelineName, 
  updateInfo,
  addHandle, 
  updateNode, 
  addNode, 
  removeNode, 
  removeEdge, 
  updateEdge, 
  onNodesChange, 
  onEdgesChange, 
  onConnect, 
  setNodes, 
  setEdges, 
  setDataSinks
} = pipelineSlice.actions

export default pipelineSlice.reducer 
