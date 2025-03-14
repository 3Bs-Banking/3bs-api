import BaseService from "@/core/BaseService";
import { Setting } from "@/models/Setting";
import { Service } from "typedi";

@Service()
export class SettingService extends BaseService<Setting> {
  constructor() {
    super(Setting);
  }
}
