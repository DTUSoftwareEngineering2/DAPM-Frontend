import axios from "axios";

export default axios.create({
  baseURL: "localhost:5001",
  //baseURL: "se2-c.compute.dtu.dk:5000",
});
