import http from "../../utils/Api";

class HelpService {
  getHelp(functionId: number) {
    return http.get(`/api/trans/help/${functionId}`);
  }
}

export default new HelpService();
