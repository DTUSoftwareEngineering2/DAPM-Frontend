import { RootState } from "../states";

export const getOrganizations = (state: RootState) => state.apiState.organizations
export const getRepositories = (state: RootState) => state.apiState.repositories
export const getResources = (state: RootState) => state.apiState.resources
// s242147 and s241747 : Implementing the selectors for dataSinks
export const getDataSinks = (state: RootState) => state.pipelineState.dataSinks;