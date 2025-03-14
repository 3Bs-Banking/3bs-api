import BaseService from "@/core/BaseService";
import { Service as ServiceModel } from "@/models/Service";
import { Service } from "typedi";

@Service()
export class ServiceService extends BaseService<ServiceModel> {
  constructor() {
    super(ServiceModel);
  }
}
