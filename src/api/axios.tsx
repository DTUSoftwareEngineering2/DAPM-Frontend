import axios from "axios";

export default axios.create({
  baseURL: "http://se2-c.compute.dtu.dk:5000",
});
