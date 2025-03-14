import BaseService from "@/core/BaseService";
import { WindowToService } from "@/models/WindowToService";
import { Service } from "typedi";

@Service()
export class WindowToServiceService extends BaseService<WindowToService> {
  constructor() {
    super(WindowToService);
  }
}
