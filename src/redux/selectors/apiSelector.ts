import { RootState } from "../states";

export const getOrganizations = (state: RootState) => state.apiState.organizations
export const getRepositories = (state: RootState) => state.apiState.repositories
export const getResources = (state: RootState) => state.apiState.resources
export const getDataSinks = (state: RootState) => state.pipelineState.dataSinks;
export const getPipelineState = (state: RootState) => state.pipelineState